// warpimage.tsx
import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import axios from 'axios';

interface WarpImageProps {
  warpPercentage: number;
  warpOrientation: string;
  invertedWrap: boolean;
  randomArt: any;
  // Note: Adjust the type of topLeft based on your needs.
  // The WarpImage component expects an object with x and y.
  topLeft: number;
  width: number;
  height: number;
  perspective: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  translateX: number;
  translateY: number;
}

const WarpImage = forwardRef<HTMLCanvasElement, WarpImageProps>(
  (props, ref) => {
    const warpCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [url, setUrl] = useState<string | null>(null);

    const getImgUrl = async () => {
      const url2 =
        import.meta.env.VITE_BACKEND_URL + '/images/' + props.randomArt.artId;
      try {
        const response = await axios.get(url2, { responseType: 'blob' });
        const imageUrl = URL.createObjectURL(response.data);
        if (response.data.size < 1250) {
          // Handle error if needed
        } else {
          setUrl(imageUrl);
        }
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
      getImgUrl();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.randomArt]);

    useEffect(() => {
      if (!url) return;
      const warp_canvas = warpCanvasRef.current;
      if (!warp_canvas) return;
      const warp_context = warp_canvas.getContext('2d');
      if (!warp_context) return;

      function getQuadraticBezierXYatT(
        start_point: { x: number; y: number },
        control_point: { x: number; y: number },
        end_point: { x: number; y: number },
        T: number
      ) {
        const pow1minusTsquared = Math.pow(1 - T, 2),
          powTsquared = Math.pow(T, 2);
        const x =
          pow1minusTsquared * start_point.x +
          2 * (1 - T) * T * control_point.x +
          powTsquared * end_point.x,
          y =
            pow1minusTsquared * start_point.y +
            2 * (1 - T) * T * control_point.y +
            powTsquared * end_point.y;
        return { x, y };
      }

      function warpHorizontally(
        image_to_warp: HTMLImageElement,
        invert_curve: boolean
      ) {
        const image_width = image_to_warp.width,
          image_height = image_to_warp.height,
          warp_percentage = Math.abs(props.warpPercentage),
          warp_x_offset = warp_percentage * image_width;

        warp_canvas.width = image_width + Math.ceil(warp_x_offset * 2);
        warp_canvas.height = image_height;

        const start_point = { x: 0, y: 0 };
        const control_point = {
          x: invert_curve ? warp_x_offset : -warp_x_offset,
          y: image_height / 2,
        };
        const end_point = { x: 0, y: image_height };

        const offset_x_points: number[] = [];
        for (let t = 0; t < image_height; t++) {
          const xyAtT = getQuadraticBezierXYatT(
            start_point,
            control_point,
            end_point,
            t / image_height
          );
          offset_x_points.push(parseInt(xyAtT.x.toString(), 10));
        }

        warp_context.clearRect(0, 0, warp_canvas.width, warp_canvas.height);

        for (let y = 0; y < image_height; y++) {
          warp_context.drawImage(
            image_to_warp,
            0,
            y,
            image_width + warp_x_offset,
            1,
            warp_x_offset + offset_x_points[y],
            y,
            image_width + warp_x_offset,
            1
          );
        }
      }

      function warpVertically(
        image_to_warp: HTMLImageElement,
        invert_curve: boolean
      ) {
        const image_width = image_to_warp.width,
          image_height = image_to_warp.height,
          warp_percentage = Math.abs(props.warpPercentage),
          warp_y_offset = warp_percentage * image_height;

        warp_canvas.width = image_width;
        warp_canvas.height = image_height + Math.ceil(warp_y_offset * 2);

        const start_point = { x: 0, y: 0 };
        const control_point = {
          x: image_width / 2,
          y: invert_curve ? warp_y_offset : -warp_y_offset,
        };
        const end_point = { x: image_width, y: 0 };

        const offset_y_points: number[] = [];
        for (let t = 0; t < image_width; t++) {
          const xyAtT = getQuadraticBezierXYatT(
            start_point,
            control_point,
            end_point,
            t / image_width
          );
          offset_y_points.push(parseInt(xyAtT.y.toString(), 10));
        }

        warp_context.clearRect(0, 0, warp_canvas.width, warp_canvas.height);

        for (let x = 0; x < image_width; x++) {
          warp_context.drawImage(
            image_to_warp,
            x,
            0,
            1,
            image_height + warp_y_offset,
            x,
            warp_y_offset + offset_y_points[x],
            1,
            image_height + warp_y_offset
          );
        }
      }

      function warpImage() {
        const inverted = props.warpPercentage > 0 ? false : true;
        const image = new Image();
        image.src = url;
        image.onload = function () {
          if (props.warpOrientation === 'horizontal') {
            warpHorizontally(image, inverted);
          } else {
            warpVertically(image, inverted);
          }
        };
        image.onerror = (error) => {
          console.error('Error loading image:', error);
        };
      }

      warpImage();
    }, [props.warpPercentage, props.warpOrientation, url]);

    useImperativeHandle(ref, () => ({
      getCanvas: () => warpCanvasRef.current,
    }));

    return (
      <canvas
        ref={warpCanvasRef}
        style={{
          position: 'absolute',
          width: `${props.width}px`,
          height: `${props.height}px`,
          top: `${props.topLeft.y}px`,
          left: `${props.topLeft.x}px`,
          transformOrigin: 'top left',
          transform: `perspective(${props.perspective}px) rotate(${props.rotate}deg) rotateX(${props.rotateX}deg) skew(${props.skewX}deg, ${props.skewY}deg) translateX(${props.translateX}px) translateY(${props.translateY}px) rotateY(${props.rotateY}deg)`,
        }}
      />
    );
  }
);

export default WarpImage;
