import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./i18n.js";
import { Desktop } from "./views/desktop.jsx";
import { Mobile } from "./views/mobile.jsx";
import AppBar from "components/appBar/appBar.jsx";

const Konecta = () => {
  const isMobile = useMediaQuery("(max-width:1090px)");

  return (
    <React.Suspense fallback="...loading">
      <AppBar />

      {isMobile ? <Mobile /> : <Desktop />}
    </React.Suspense>
  );
};

export default Konecta;
// ReactDOM.render(<Konecta />, document.getElementById("root"));
