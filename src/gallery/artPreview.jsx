import React, { useState, useEffect } from "react";
import Img from "react-cool-img";

import WarpImage from "../admin/productCrud/warpImage";

export default function ArtPreview({
  buy,
  index,
  selectedArt,
  randomArt,
  selectedProductToAssociate,
}) {
  console.log(randomArt);
  console.log(selectedArt);
  if (buy.product?.mockUp !== undefined && buy.art !== undefined) {
    return (
      <div
        style={{
          width: 220,
          height: 220,
          position: "relative",
          borderRadius: 15,
          border: "2px",
          borderStyle: "solid",
          borderColor:
            selectedProductToAssociate?.index === index
              ? "#d33f49"
              : "gainsboro",
          opacity: selectedProductToAssociate?.index === index ? "1" : "0.6",
        }}
      >
        <WarpImage
          warpPercentage={buy.product.mockUp.warpPercentage}
          warpOrientation={buy.product.mockUp.warpOrientation}
          invertedWrap={buy.product.mockUp.invertedWrap}
          randomArt={selectedArt}
          topLeft={buy.product.mockUp.topLeft}
          width={buy.product.mockUp.width}
          height={buy.product.mockUp.height}
          perspective={buy.product.mockUp.perspective}
          rotate={buy.product.mockUp.rotate}
          rotateX={buy.product.mockUp.rotateX}
          rotateY={buy.product.mockUp.rotateY}
          skewX={buy.product.mockUp.skewX}
          skewY={buy.product.mockUp.skewY}
          translateX={buy.product.mockUp.translateX}
          translateY={buy.product.mockUp.translateY}
        />
        <div
          style={{
            backgroundImage: "url(" + buy.product.mockUp.mockupImg + ")",
            width: 210,
            height: 210,
            backgroundSize: "cover",
            borderRadius: 20,
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: "2",
          }}
        />
      </div>
    );
  } else {
    return (
      <>
        <Img
          placeholder="/imgLoading.svg"
          style={{
            backgroundColor: "#eeeeee",
            height: 180,
            width: 180,
            borderRadius: 15,
            border: "2px",
            borderStyle: "solid",
            borderColor:
              selectedProductToAssociate?.index === index
                ? "#d33f49"
                : "gainsboro",
            opacity: selectedProductToAssociate?.index === index ? "1" : "0.6",
          }}
          src={
            buy.product
              ? buy.product.sources.images[0]?.url || buy.product.thumbUrl
              : ""
          }
          debounce={1000}
          cache
          error="/imgError.svg"
          sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
          alt={buy.product && buy.product.name}
          id={index}
        />
      </>
    );
  }
}
