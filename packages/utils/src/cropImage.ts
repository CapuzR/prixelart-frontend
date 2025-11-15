export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CroppedImage {
  croppedImg: string;
  croppedImgFile: Blob;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // avoid CORS issues
    image.src = url;
  });

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
): Promise<CroppedImage> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to get 2D context");
  }

  // Calculate safe area to rotate without clipping
  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  // Move origin to center of canvas for rotation
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Draw the rotated image
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5,
  );

  // Extract the image data from the rotated context
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Resize canvas to the desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paste the extracted image data at the correct offset
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
  );

  // Return a Blob and object URL for the cropped image
  return new Promise<CroppedImage>((resolve, reject) => {
    canvas.toBlob((file) => {
      if (!file) {
        return reject(new Error("Canvas is empty"));
      }
      resolve({
        croppedImg: URL.createObjectURL(file),
        croppedImgFile: file,
      });
    }, "image/jpeg");
  });
}
