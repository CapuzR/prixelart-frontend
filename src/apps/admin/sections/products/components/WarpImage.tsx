import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react"
import axios from "axios"

interface WarpImageProps {
  randomArt: { artId: string }
  warpPercentage: number
  warpOrientation: "horizontal" | "vertical"
  width: number
  height: number
  topLeft: { x: number; y: number }
  perspective: number
  rotate: number
  rotateX: number
  skewX: number
  skewY: number
  translateX: number
  translateY: number
  rotateY: number
}

interface WarpImageRef {
  getCanvas: () => HTMLCanvasElement | null
}

const WarpImage = forwardRef<WarpImageRef, WarpImageProps>((props, ref) => {
  const warpCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [url, setUrl] = useState<string | null>(null)

  const getImgUrl = async () => {
    const url2 = `${import.meta.env.VITE_BACKEND_URL}/images/${props.randomArt.artId}`
    try {
      const response = await axios.get(url2, { responseType: "blob" })
      const imageUrl = URL.createObjectURL(response.data)
      if (response.data.size >= 1250) {
        setUrl(imageUrl)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getImgUrl()
  }, [props.randomArt])

  useEffect(() => {
    if (!url) return

    const warpCanvas = warpCanvasRef.current
    if (!warpCanvas) return

    const warpContext = warpCanvas.getContext("2d")
    if (!warpContext || warpContext === null) return

    function getQuadraticBezierXYatT(
      startPoint: { x: number; y: number },
      controlPoint: { x: number; y: number },
      endPoint: { x: number; y: number },
      T: number
    ) {
      const pow1minusTsquared = Math.pow(1 - T, 2)
      const powTsquared = Math.pow(T, 2)
      return {
        x:
          pow1minusTsquared * startPoint.x +
          2 * (1 - T) * T * controlPoint.x +
          powTsquared * endPoint.x,
        y:
          pow1minusTsquared * startPoint.y +
          2 * (1 - T) * T * controlPoint.y +
          powTsquared * endPoint.y,
      }
    }

    function warpHorizontally(
      imageToWarp: HTMLImageElement,
      invertCurve: boolean
    ) {
      const imageWidth = imageToWarp.width
      const imageHeight = imageToWarp.height
      const warpPercentage = Math.abs(props.warpPercentage)
      const warpXOffset = warpPercentage * imageWidth

      if (!warpCanvas) return
      warpCanvas.width = imageWidth + Math.ceil(warpXOffset * 2)
      warpCanvas.height = imageHeight

      const startPoint = { x: 0, y: 0 }
      const controlPoint = {
        x: invertCurve ? warpXOffset : -warpXOffset,
        y: imageHeight / 2,
      }
      const endPoint = { x: 0, y: imageHeight }

      const offsetXPoints: number[] = []
      for (let t = 0; t < imageHeight; t++) {
        const xyAtT = getQuadraticBezierXYatT(
          startPoint,
          controlPoint,
          endPoint,
          t / imageHeight
        )
        offsetXPoints.push(Math.floor(xyAtT.x))
      }
      if (warpContext === null) return
      warpContext.clearRect(0, 0, warpCanvas.width, warpCanvas.height)
      for (let y = 0; y < imageHeight; y++) {
        warpContext.drawImage(
          imageToWarp,
          0,
          y,
          imageWidth + warpXOffset,
          1,
          warpXOffset + offsetXPoints[y],
          y,
          imageWidth + warpXOffset,
          1
        )
      }
    }

    function warpVertically(
      imageToWarp: HTMLImageElement,
      invertCurve: boolean
    ) {
      const imageWidth = imageToWarp.width
      const imageHeight = imageToWarp.height
      const warpPercentage = Math.abs(props.warpPercentage)
      const warpYOffset = warpPercentage * imageHeight

      if (warpCanvas === null) return

      warpCanvas.width = imageWidth
      warpCanvas.height = imageHeight + Math.ceil(warpYOffset * 2)

      const startPoint = { x: 0, y: 0 }
      const controlPoint = {
        x: imageWidth / 2,
        y: invertCurve ? warpYOffset : -warpYOffset,
      }
      const endPoint = { x: imageWidth, y: 0 }

      const offsetYPoints: number[] = []
      for (let t = 0; t < imageWidth; t++) {
        const xyAtT = getQuadraticBezierXYatT(
          startPoint,
          controlPoint,
          endPoint,
          t / imageWidth
        )
        offsetYPoints.push(Math.floor(xyAtT.y))
      }
      if (warpContext === null) return

      warpContext.clearRect(0, 0, warpCanvas.width, warpCanvas.height)
      for (let x = 0; x < imageWidth; x++) {
        warpContext.drawImage(
          imageToWarp,
          x,
          0,
          1,
          imageHeight + warpYOffset,
          x,
          warpYOffset + offsetYPoints[x],
          1,
          imageHeight + warpYOffset
        )
      }
    }

    function warpImage() {
      const inverted = props.warpPercentage < 0
      const image = new Image()
      if (url === null) return
      image.src = url
      image.onload = () => {
        if (props.warpOrientation === "horizontal") {
          warpHorizontally(image, inverted)
        } else {
          warpVertically(image, inverted)
        }
      }
      image.onerror = (error) => {
        console.error("Error al cargar la imagen:", error)
      }
    }

    warpImage()
  }, [props.warpPercentage, props.warpOrientation, url])

  useImperativeHandle(ref, () => ({
    getCanvas: () => warpCanvasRef.current,
  }))

  return (
    <canvas
      ref={warpCanvasRef}
      style={{
        position: "absolute",
        width: `${props.width}px`,
        height: `${props.height}px`,
        top: `${props.topLeft.y}px`,
        left: `${props.topLeft.x}px`,
        transformOrigin: "top left",
        transform: `perspective(${props.perspective}px) rotate(${props.rotate}deg) rotateX(${props.rotateX}deg) skew(${props.skewX}deg, ${props.skewY}deg) translateX(${props.translateX}px) translateY(${props.translateY}px) rotateY(${props.rotateY}deg)`,
      }}
    />
  )
})

export default WarpImage
