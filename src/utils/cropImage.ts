const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.setAttribute("crossOrigin", "anonymous") // needed to avoid cross-origin issues
      image.src = url
    })
  
  function getRadianAngle(degreeValue: number): number {
    return (degreeValue * Math.PI) / 180
  }
  
  interface PixelCrop {
    x: number
    y: number
    width: number
    height: number
  }
  
  interface CroppedImageResult {
    croppedImg: string
    croppedImgFile: Blob | null
  }
  
  export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: PixelCrop,
    rotation: number = 0
  ): Promise<CroppedImageResult> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
  
    if (!ctx) throw new Error("Could not get canvas context")
  
    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))
  
    // Set canvas size to the safe area for rotation
    canvas.width = safeArea
    canvas.height = safeArea
  
    // Translate and rotate canvas
    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate(getRadianAngle(rotation))
    ctx.translate(-safeArea / 2, -safeArea / 2)
  
    // Draw the image
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )
  
    const data = ctx.getImageData(0, 0, safeArea, safeArea)
  
    // Resize canvas to crop size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
  
    // Paste the cropped image data
    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )
  
    return new Promise((resolve) => {
      canvas.toBlob((file) => {
        resolve({ croppedImg: file ? URL.createObjectURL(file) : "", croppedImgFile: file })
      }, "image/jpeg")
    })
  }
  