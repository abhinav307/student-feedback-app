export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas size to match the desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Resize if it's too big to save space in the database (e.g. max 256x256)
  const MAX_SIZE = 256;
  if (pixelCrop.width > MAX_SIZE) {
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = MAX_SIZE;
    resizedCanvas.height = MAX_SIZE;
    const resizedCtx = resizedCanvas.getContext('2d');
    resizedCtx.drawImage(canvas, 0, 0, MAX_SIZE, MAX_SIZE);
    return resizedCanvas.toDataURL('image/jpeg', 0.85); // base64 string
  }

  // Return Base64 string directly
  return canvas.toDataURL('image/jpeg', 0.85);
}
