import mammoth from 'mammoth';
import { extractText } from 'unpdf';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ParsedResumeFile {
  text: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSizeBytes: number;
}

function validateFileMagicBytes(buffer: Buffer, ext: 'pdf' | 'docx' | 'txt'): void {
  if (ext === 'pdf') {
    const header = buffer.subarray(0, 5).toString('ascii');
    if (!header.startsWith('%PDF-')) {
      throw new Error('Invalid PDF file signature. Please upload a valid PDF document.');
    }
  } else if (ext === 'docx') {
    // DOCX files are ZIP archives starting with PK\x03\x04
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      throw new Error('Invalid DOCX file signature. Please upload a valid Word (.docx) document.');
    }
  }
}

export function resolveAllowedExtension(fileName: string, mimeType: string): 'pdf' | 'docx' | 'txt' {
  const lower = fileName.trim().toLowerCase();
  if (
    lower.endsWith('.pdf') &&
    (!mimeType || mimeType === 'application/pdf' || mimeType === 'application/octet-stream')
  ) {
    return 'pdf';
  }
  if (
    lower.endsWith('.docx') &&
    (!mimeType ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/octet-stream')
  ) {
    return 'docx';
  }
  if (lower.endsWith('.txt') && (!mimeType || mimeType === 'text/plain')) {
    return 'txt';
  }
  throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT resume under 5 MB.');
}

export async function extractResumeTextFromBase64(params: {
  fileName: string;
  mimeType: string;
  base64Data: string;
}): Promise<ParsedResumeFile> {
  const fileType = resolveAllowedExtension(params.fileName, params.mimeType);
  const cleanBase64 = params.base64Data.includes(',')
    ? params.base64Data.split(',')[1]
    : params.base64Data;

  if (!cleanBase64 || cleanBase64.length > Math.ceil((MAX_RESUME_BYTES * 4) / 3) + 64) {
    throw new Error('Resume file exceeds the 5 MB limit or is empty.');
  }

  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.length === 0 || buffer.length > MAX_RESUME_BYTES) {
    throw new Error('Resume file size must be between 1 byte and 5 MB.');
  }

  validateFileMagicBytes(buffer, fileType);

  let text = '';
  if (fileType === 'pdf') {
    const uint8 = new Uint8Array(buffer);
    const extracted = await extractText(uint8, { mergePages: true });
    text = Array.isArray(extracted.text) ? extracted.text.join('\n') : String(extracted.text || '');
  } else if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || '';
  } else {
    text = buffer.toString('utf8');
  }

  const normalized = text.trim();
  if (normalized.length < 30) {
    throw new Error(
      'Could not extract readable text from this file. If this is a scanned image PDF, export a text-based PDF or DOCX.'
    );
  }

  return {
    text: normalized,
    fileType,
    fileSizeBytes: buffer.length,
  };
}
