import React from "react";
import { Icon } from "./icon.jsx";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useHistory, useLocation } from "react-router-dom";

export const Map = ({ icons, setSelectedIcon, setOpenSelected }) => {
  const history = useHistory();

  let rawMapRef = React.useRef(document.getElementById("rawMap"));
  const isMobile = useMediaQuery("(max-width:1090px)");
  const calculateIconRelation = (mapOriginal, iconOriginal, adapted) => {
    return {
      x: (iconOriginal.x * adapted.x) / mapOriginal.x + 10,
      y: (iconOriginal.y * adapted.y) / mapOriginal.y + 10,
    };
  };

  return (
    <div style={{ display: "Flex", flexDirection: "column" }}>
      <div
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
      {/* <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "end",
          marginTop: isMobile ? "-170px" : "-100px",
          zIndex: "2",
        }}
      >
        <img
          alt="icon"
          src="/LPG/logocolor.jpg"
          style={{
            width: "auto",
            maxHeight: "140px",
          }}
          onClick={(e) => history.push({ pathname: "/LPG" })}
        />
      </div> */}
    </div>
  );
};
