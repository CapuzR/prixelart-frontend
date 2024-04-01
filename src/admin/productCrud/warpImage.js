import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const WarpImage = (props) => {
  const warpedImageRef = useRef(null);
  const [url, setUrl] = useState();

  const getImgUrl = async () => {
    const url2 =
      process.env.REACT_APP_BACKEND_URL + "/images/" + props.randomArt.artId;
    await axios.get(url2, { responseType: "blob" }).then((response) => {
      setUrl(URL.createObjectURL(response.data));
    });
  };

  useEffect(() => {
    getImgUrl();
  }, []);

  useEffect(() => {
    const warp_canvas = document.createElement("canvas");
    const warp_context = warp_canvas.getContext("2d");

    function getQuadraticBezierXYatT(start_point, control_point, end_point, T) {
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

      return {
        x: x,
        y: y,
      };
    }

    function warpHorizontally(image_to_warp, invert_curve) {
      const image_width = image_to_warp.width,
        image_height = image_to_warp.height,
        warp_percentage = parseFloat(Math.abs(props.warpPercentage), 10),
        warp_x_offset = warp_percentage * image_width;

      warp_canvas.width = image_width + Math.ceil(warp_x_offset * 2);
      warp_canvas.height = image_height;

      const start_point = {
        x: 0,
        y: 0,
      };
      const control_point = {
        x: invert_curve ? warp_x_offset : -warp_x_offset,
        y: image_height / 2,
      };
      const end_point = {
        x: 0,
        y: image_height,
      };

      const offset_x_points = [];
      let t = 0;
      for (; t < image_height; t++) {
        const xyAtT = getQuadraticBezierXYatT(
            start_point,
            control_point,
            end_point,
            t / image_height
          ),
          x = parseInt(xyAtT.x);

        offset_x_points.push(x);
      }

      warp_context.clearRect(0, 0, warp_canvas.width, warp_canvas.height);

      let y = 0;
      for (; y < image_height; y++) {
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

    function warpVertically(image_to_warp, invert_curve) {
      const image_width = image_to_warp.width,
        image_height = image_to_warp.height,
        warp_percentage = parseFloat(Math.abs(props.warpPercentage), 10),
        warp_y_offset = warp_percentage * image_height;
      warp_canvas.width = image_width;
      warp_canvas.height = image_height + Math.ceil(warp_y_offset * 2);
      const start_point = {
        x: 0,
        y: 0,
      };
      const control_point = {
        x: image_width / 2,
        y: invert_curve ? warp_y_offset : -warp_y_offset,
      };
      const end_point = {
        x: image_width,
        y: 0,
      };

      const offset_y_points = [];
      let t = 0;
      for (; t < image_width; t++) {
        const xyAtT = getQuadraticBezierXYatT(
            start_point,
            control_point,
            end_point,
            t / image_width
          ),
          y = parseInt(xyAtT.y);

        offset_y_points.push(y);
      }

      warp_context.clearRect(0, 0, warp_canvas.width, warp_canvas.height);

      let x = 0;
      for (; x < image_width; x++) {
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
      const warped_image = warpedImageRef.current;
      const inverted = props.warpPercentage > 0 ? false : true;
      const image = new Image();
      image.src = url;
      image.onload = function () {
        if (props.warpOrientation === "horizontal") {
          warpHorizontally(image, inverted);
        } else {
          warpVertically(image, inverted);
        }
        const dataURL = warp_canvas.toDataURL();
        warped_image.src = dataURL;
      };
      image.onerror = (error) => {
        console.error("Error al cargar la imagen:", error);
      };
    }
    warpImage();
  }, [props.warpPercentage, props.warpOrientation, url]);

  return (
    <div
      style={{
        position: "absolute",
        width: 250,
        height: 250,
        top: "0",
        left: "0",
        zIndex: "1",
      }}
    >
      <img
        ref={warpedImageRef}
        alt="Warped Image"
        style={{
          position: "relative",
          width: `${props.width}px`,
          height: `${props.height}px`,

          top: `${props.topLeft.y}px`,
          left: `${props.topLeft.x}px`,
          transformOrigin: "top left",
          objectFit: "cover",
          transform: `perspective(${props.perspective}px) rotate(${props.rotate}deg) rotateX(${props.rotateX}deg) skew(${props.skewX}deg, ${props.skewY}deg) translateX(${props.translateX}px) translateY(${props.translateY}px) rotateY(${props.rotateY}deg)`,
        }}
      />
    </div>
  );
};

export default WarpImage;
