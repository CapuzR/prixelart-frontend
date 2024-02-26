import React from "react";
import { Icon } from "./icon.jsx";

export const Map = ({ icons, setSelectedIcon }) => {
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
        style={{ width: "100%", height: "auto" }}
      />
      {icons.map((icon, index) => {
        return (
          <Icon
            key={index}
            icon={icon}
            rawMapRef={rawMapRef}
            calculateIconRelation={calculateIconRelation}
            setSelectedIcon={setSelectedIcon}
          />
        );
      })}
    </div>
  );
};
