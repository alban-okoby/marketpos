/**
 * Reads an image file and returns it as a JPEG data URL, scaled down so that its longest side is `maxSide` pixels.
 * Small pictures keep local storage light.
 */
export async function imageFileToDataUrl(file: File, maxSide: number, quality = 0.8): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier choisi n’est pas une image.');
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Le traitement de l’image n’est pas disponible.');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}
