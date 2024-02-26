import React from "react";
import { Icon } from "./icon.jsx";

export const Map = ({ icons, setSelectedIcon, setOpenSelected }) => {
  let rawMapRef = React.useRef(document.getElementById("rawMap"));

  const calculateIconRelation = (mapOriginal, iconOriginal, adapted) => {
    return {
      x: (iconOriginal.x * adapted.x) / mapOriginal.x,
      y: (iconOriginal.y * adapted.y) / mapOriginal.y,
    };
  };

  return (
    <div style={{ position: "relative" }}>
      <img
        alt="icon"
        ref={rawMapRef}
        src="/LPG/rawMap.png"
        style={{ width: "auto", height: "65vh" }}
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
