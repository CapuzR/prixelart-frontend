import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImageSize = (
  url: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (error) => {
      console.error(`Failed to load image ${url}`, error);
      reject(error);
    };
    img.src = url;
  });
};

export const getUrlParams = (
  excludedParams: string[] = [],
): URLSearchParams => {
  const originalSearchParams = new URLSearchParams(window.location.search);
  const filteredParams = new URLSearchParams();

  originalSearchParams.forEach((value, key) => {
    if (!excludedParams.includes(key)) {
      filteredParams.append(key, value);
    }
  });

  return filteredParams;
};

import { CustomImage } from "@prixpon/types/order.types";
import { PickedArt } from "@prixpon/types/art.types";
import { PickedProduct } from "@prixpon/types/product.types";

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number,
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
}

export const generateWaMessage = (tile?: any) => {
  // const waNumber = "584126377748";
  const welcomeMessage =
    "Holaa, cuéntame más. Quiero asesoría y conocer sus productos.";
  const message = tile !== "" ? generateArtMessage(tile, "wa") : welcomeMessage;

  const url =
    "https://wa.me/" +
    //  waNumber +
    "?text=" +
    message;

  return url;
};

export const generateWaProductMessage = (
  tile: PickedProduct | PickedArt | CustomImage,
  url: string,
) => {
  const waNumber = "584126377748";
  const welcomeMessage =
    "Holaa, cuéntame más. Quiero asesoría y conocer sus productos.";

  const message =
    tile !== null
      ? "Holaa, este es uno de los Prix que me gustan: \n" +
        " *Modelo:* " +
        ("name" in tile ? tile.name : tile.title) +
        "\n *Enlace:* " +
        url
      : welcomeMessage;

  return "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(message);
};

const generateServiceMessage = (tile: any, phone: string) => {
  if (phone.startsWith("0")) {
    phone = phone.substring(1);
  }
  const waNumber = "58" + phone;
  const message =
    "Hola, quiero solicitar el servicio de " +
    `*${tile.title}*` +
    " del prixer " +
    `*${tile.prixer}*`;

  const url = "https://wa.me/" + waNumber + "?text=" + message;
  return url;
};

const generateLikeServiceMessage = (tile: any) => {
  let lineBreak = "\n";
  const waNumber = "584126377748";

  const artMainMessage =
    "Holaa, este es uno de los servicios que me interesan:";
  const message =
    artMainMessage +
    lineBreak +
    " *Servicio:* " +
    tile.title +
    lineBreak +
    " *Prixer:* " +
    tile.prixer;
  //  +
  // lineBreak +
  // " *Enlace:* prixelart.com/service=" +
  // tile._id

  const url = "https://wa.me/" + waNumber + "?text=" + message;
  return url;
};

const generateArtMessage = (tile: any, type: string) => {
  let lineBreak = "";

  type === "wa" ? (lineBreak = "%0D%0A") : (lineBreak = "\n");

  const artMainMessage = "Holaa, este es uno de los artes que me gustan:";
  const artMessage =
    artMainMessage +
    lineBreak +
    " *Título del Arte:* " +
    tile.title +
    lineBreak +
    " *Prixer:* " +
    tile.prixerUsername +
    lineBreak +
    " *Enlace:* prixelart.com/art=" +
    tile.artId;

  return artMessage;
};

const maxPrintCalc = (width: number, height: number, ppi: any, iso: string) => {
  let widthCm = 0;
  let heightCm = 0;
  const pxToCmConversionRate = 2.54;
  if (iso === "100" || iso === "200") {
    widthCm = (width * pxToCmConversionRate) / 100;
    heightCm = (height * pxToCmConversionRate) / 100;
  } else if (iso === "400") {
    widthCm = (width * pxToCmConversionRate) / 150;
    heightCm = (height * pxToCmConversionRate) / 150;
  }

  return [Math.trunc(widthCm), Math.trunc(heightCm)];
};

function shuffle(array: any) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export const format = (input: string | number) => {
  let num = 0;
  if (typeof input === "string") {
    num = Number(input.replace(",", "."));
  } else {
    num = input;
  }
  if (typeof num !== "number" || isNaN(num)) return "";
  return num.toFixed(2).replace(".", ",");
};

const util = {
  generateArtMessage,
  generateWaMessage,
  maxPrintCalc,
  shuffle,
  generateWaProductMessage,
  generateServiceMessage,
  generateLikeServiceMessage,
  format,
};

export default util;
