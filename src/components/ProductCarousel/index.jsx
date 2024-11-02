import React from "react";
import { Grid } from "@material-ui/core";
import WarpImage from "../../admin/productCrud/warpImage.js";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { makeStyles } from "@material-ui/core/styles";
import Img from "react-cool-img";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import "./productCarousel.css";
import { ProductImageContainer } from "components/ProductImageContainer";

const useStyles = makeStyles(() => ({
    dotsContainer: {
      position: "relative",
      display: "flex !important",
      justifyContent: "center",
      padding: "unset",
    },
  }));
  
export const ProductCarousel = ({ product, selectedArt, type, size }) => {
    const theme = useTheme();
    const classes = useStyles();
    const isTab = useMediaQuery(theme.breakpoints.down("sm"));
    
    const settings = {
        customPaging: function (i) {
            let image = product?.sources?.images[i]?.url;
            if (type === "withImages") {
                return (
                    <li>
                        <a>
                            <img src={image}/>
                        </a>
                    </li>
                )
            } else {
                return <button />
            }
        },
        dots: true,
        dotsClass: type === "withImages" ? 'slick-dots custom-dots-images' : 'slick-dots custom-dots',
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        infinite: true,
        pauseOnHover: true,
    };

    return (
        <div>
        {
            product?.mockUp !== undefined && selectedArt !== undefined ? (
                <div
                style={{
                    width: 210,
                    height: 210,
                    position: "relative",
                    margin: "0 auto",
                }}
                >
                <WarpImage
                    warpPercentage={product.mockUp.warpPercentage}
                    warpOrientation={product.mockUp.warpOrientation}
                    invertedWrap={product.mockUp.invertedWrap}
                    randomArt={selectedArt}
                    topLeft={product.mockUp.topLeft}
                    width={product.mockUp.width}
                    height={product.mockUp.height}
                    perspective={product.mockUp.perspective}
                    rotate={product.mockUp.rotate}
                    rotateX={product.mockUp.rotateX}
                    rotateY={product.mockUp.rotateY}
                    skewX={product.mockUp.skewX}
                    skewY={product.mockUp.skewY}
                    translateX={product.mockUp.translateX}
                    translateY={product.mockUp.translateY}
                    setOpen={props.setOpen}
                    setMessage={props.setMessage}
                />
                <div
                    style={{
                    backgroundImage: "url(" + product.mockUp.mockupImg + ")",
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
            ) : product?.mockUp === undefined && selectedArt !== undefined ? ( //Si no hay mockup, mostrar solo el arte
                <Grid
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                }}
                >
                <div
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "fit-content",
                    width: "40%",
                    }}
                >
                    <Img
                    placeholder="/imgLoading.svg"
                    style={{
                        backgroundColor: "#eeeeee",
                        height: "auto",
                        borderRadius: "10px",
                    }}
                    src={product?.sources?.images[0]?.url || product?.thumbUrl || ""}
                    debounce={1000}
                    // cache
                    error="/imgError.svg"
                    alt={product && product.name}
                    id={product?.id}
                    />
                </div>
                <div
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "40%",
                    justifyContent: "center",
                    height: "100%",
                    }}
                >
                    <Img
                    placeholder="/imgLoading.svg"
                    style={{
                        backgroundColor: "#eeeeee",
                        height: "auto",
                        width: "auto",
                    }}
                    src={
                        selectedArt
                        ? selectedArt.largeThumbUrl
                        : selectedArt.squareThumbUrl || ""
                    }
                    debounce={1000}
                    cache
                    error="/imgError.svg"
                    alt={selectedArt && selectedArt.title}
                    id={selectedArt && selectedArt.artId}
                    />
                </div>
                </Grid>
            ) : (
                <Slider {...settings}>
                    {product &&
                    product?.sources?.images?.map((art, i) => (
                        <ProductImageContainer i={i} image={art.url} size={size}  />
                    ))}
                </Slider>
            )
        }
        </div>
    );

}