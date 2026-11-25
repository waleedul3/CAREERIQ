import * as ort from 'onnxruntime-web';
import type { ModelFeatureInput } from '../types/index.ts';
import { encodeFeaturesToFloat32 } from './mlPreprocessing.ts';

let sessionPromise: Promise<ort.InferenceSession> | null = null;

export interface OnnxInferenceResult {
  predictedClass: 'Placed' | 'Not Placed';
  probability: number;
  inferenceEngine: 'onnxruntime-web';
  inputVector: number[];
}

export async function getOnnxSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    ort.env.wasm.wasmPaths = import.meta.env.DEV
      ? '/node_modules/onnxruntime-web/dist/'
      : '/ort/';
    // Keep single-threaded WASM so iframe/Vercel environments without COOP/COEP headers run reliably
    ort.env.wasm.numThreads = 1;
    sessionPromise = ort.InferenceSession.create('/models/employability_model.onnx', {
      executionProviders: ['wasm'],
    }).catch((err) => {
      sessionPromise = null;
      throw err;
    });
  }
  return sessionPromise;
}

export async function runEmployabilityOnnxInference(
  features: ModelFeatureInput
): Promise<OnnxInferenceResult> {
  const vector = encodeFeaturesToFloat32(features);
  const session = await getOnnxSession();

  const inputName = session.inputNames[0] || 'float_input';
  const tensor = new ort.Tensor('float32', vector, [1, vector.length]);
  const outputs = await session.run({ [inputName]: tensor });

  const labelTensor = outputs.label || outputs[session.outputNames[0]];
  const probTensor = outputs.probabilities || outputs[session.outputNames[1]];

  const rawLabel = labelTensor?.data?.[0];
  const probData = probTensor?.data as Float32Array | number[] | undefined;

  // Binary classifier outputs [P(Not Placed), P(Placed)]
  const pPlaced =
    probData && probData.length >= 2
      ? Number(probData[1])
      : Number(rawLabel) === 1
        ? 0.75
        : 0.25;

  const clampedProb = Math.max(0, Math.min(1, Number.isFinite(pPlaced) ? pPlaced : 0.5));
  const predictedClass =
    Number(rawLabel) === 1 || clampedProb >= 0.5 ? 'Placed' : 'Not Placed';

  return {
    predictedClass,
    probability: Number(clampedProb.toFixed(4)),
    inferenceEngine: 'onnxruntime-web',
    inputVector: Array.from(vector),
  };
}
