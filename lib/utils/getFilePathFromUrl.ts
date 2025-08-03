export default function getFilePathFromUrl(url: string): string {
  const path = url.replace(/^.*\/storage\/v1\/object\/public\/expenses\//, "");
  if (!path) {
    throw new Error("Invalid Supabase file URL");
  }
  return path;
}
