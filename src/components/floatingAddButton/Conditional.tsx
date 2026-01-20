import React from "react";
import { useLocation, matchPath } from "react-router-dom";
import FloatingAddButton from "./index";
import { useUser } from "@context/GlobalContext";

const ConditionalFB = () => {
  const location = useLocation();
  const { pathname } = location;
  const { user } = useUser();
  const isCreator = user?.prixer;

  const routes = [
    "/productos",
    "/galeria",
    "/prixers",
    "/carrito",
    "/servicios",
    "/servicio/:id",
    "/testimonios",
    "/arte/:artId",
    "/prixer/:username",
    "/org/:username",
    "/crear-prix",
    "/producto/:id",
    "/",
  ];

  const showMe = routes.some((path) => {
    return matchPath(path, pathname) !== null;
  });

  if (showMe && isCreator) {
    return <FloatingAddButton />;
  }

  return null;
};

export default ConditionalFB;
