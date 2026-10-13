import { connectDB, mongoose } from "@/lib/db";
import { GridFSBucket, ObjectId } from "mongodb";

export async function uploadToGridFS(params: {
  filename: string;
  mime: string;
  buffer: Buffer;
  bucketName?: string;
}): Promise<{ gridFsId: string; size: number }> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB not connected");

  const bucket = new GridFSBucket(db, {
    bucketName: params.bucketName ?? "uploads",
  });

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(params.filename, {
      metadata: { contentType: params.mime },
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({
        gridFsId: String(uploadStream.id),
        size: params.buffer.length,
      });
    });
    uploadStream.end(params.buffer);
  });
}

export async function deleteFromGridFS(
  gridFsId: string,
  bucketName = "uploads",
): Promise<boolean> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) return false;

  const bucket = new GridFSBucket(db, { bucketName });
  try {
    await bucket.delete(new ObjectId(gridFsId));
    return true;
  } catch {
    return false;
  }
}

export async function readFromGridFS(
  gridFsId: string,
  bucketName = "uploads",
): Promise<{ buffer: Buffer; filename: string; mime: string } | null> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) return null;

  const bucket = new GridFSBucket(db, { bucketName });
  const _id = new ObjectId(gridFsId);
  const files = await db.collection(`${bucketName}.files`).findOne({ _id });
  if (!files) return null;

  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    bucket
      .openDownloadStream(_id)
      .on("data", (chunk: Buffer) => chunks.push(chunk))
      .on("error", reject)
      .on("end", () =>
        resolve({
          buffer: Buffer.concat(chunks),
          filename: String(files.filename ?? "file"),
          mime: String(
            (files.metadata as { contentType?: string } | undefined)
              ?.contentType ??
              files.contentType ??
              "application/octet-stream",
          ),
        }),
      );
  });
}
