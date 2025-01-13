import React from "react";
import { Tooltip, IconButton, Typography, Button } from "@material-ui/core";
import { Search } from "@material-ui/icons";


export const ProductImageContainer = ({ i, image, size }) => {

    return (
        <div
            key={i}
            style={{
                borderRadius: 40,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                // height: "auto",
                backgroundColor: "transparent",
                padding: 0,
                margin: 0,
                height: "100%",
            }}
        >
            <div
                style={{
                    position: "relative",
                    // marginTop: 5,
                    width: "100%",
                    height: "100%",
                    flexGrow: 1,
                    backgroundImage: `url(${image})`,
                    backgroundColor: "transparent",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    paddingTop: "56.25%",
                    objectFit: "contain",  // Change to "contain" if you prefer
                    borderRadius: "40px",
                }}
            />
        </div>
    )
}