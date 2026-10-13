/** Safe path / query segment for booking ids (hyphen UUIDs, nano ids, etc.). */
export function isSafePublicId(id: string | undefined): id is string {
  if (!id || id.length > 128) return false;
  return /^[a-zA-Z0-9._:-]+$/.test(id);
}
