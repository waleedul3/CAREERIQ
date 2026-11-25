import mongoose from 'mongoose';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __careerIqMongoose: CachedConnection | undefined;
}

const cached: CachedConnection = globalThis.__careerIqMongoose || {
  conn: null,
  promise: null,
};
globalThis.__careerIqMongoose = cached;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: 'careeriq',
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  return cached.promise;
}
