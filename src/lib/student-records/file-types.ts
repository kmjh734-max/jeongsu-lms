const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function isPdfUpload(file: { type: string; name: string }): boolean {
  const type = file.type.toLowerCase();
  if (type === "application/pdf" || type === "application/x-pdf") return true;
  return file.name.toLowerCase().endsWith(".pdf");
}

export function isImageUpload(file: { type: string }): boolean {
  return IMAGE_TYPES.has(file.type);
}
