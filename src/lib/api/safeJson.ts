/** Strip BSON/Mongoose values so NextResponse.json never throws on serverless. */
export function toJsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
