import React from "react";
import { Icon } from "./icon.jsx";
import useMediaQuery from "@material-ui/core/useMediaQuery";

export const Map = ({ icons, setSelectedIcon, setOpenSelected }) => {
  let rawMapRef = React.useRef(document.getElementById("rawMap"));
  let base = React.useRef(document.getElementById("base"));
  const isMobile = useMediaQuery("(max-width:1090px)");
  console.log(base);
  // let miss =
  const calculateIconRelation = (mapOriginal, iconOriginal, adapted) => {
    return {
      x: (iconOriginal.x * adapted.x) / mapOriginal.x + 10,
      y: (iconOriginal.y * adapted.y) / mapOriginal.y + 10,
    };
  };

  return (
    <div
      id="base"
      ref={base}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        // justifyContent: isMobile ? "end" : "start",
        marginTop: isMobile && "-200px",
      }}
    >
      <img
        alt="icon"
        ref={rawMapRef}
        src="/LPG/rawMap.png"
        style={{
          margin: 10,
          width: "auto",
          maxHeight: "70vh",
          maxWidth: "95%",
        }}
      />
      {icons.map((icon, index) => {
        return (
          <Icon
            key={index}
            icon={icon}
            rawMapRef={rawMapRef}
            calculateIconRelation={calculateIconRelation}
            setOpenSelected={setOpenSelected}
            setSelectedIcon={setSelectedIcon}
          />
        );
      })}
    </div>
  );
};
