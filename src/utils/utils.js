const generateWaMessage = (tile = "") => {
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

const generateWaProductMessage = (tile = "") => {
  const waNumber = "584126377748";
  const welcomeMessage =
    "Holaa, cuéntame más. Quiero asesoría y conocer sus productos.";
  const message =
    tile !== "" ? generateProductMessage(tile, "wa") : welcomeMessage;

  const url = "https://wa.me/" + waNumber + "?text=" + message;

  return url;
};

const generateProductMessage = (tile, type) => {
  let lineBreak = "";

  type === "wa" ? (lineBreak = "%0D%0A") : (lineBreak = "");

  const productMainMessage = "Holaa, este es uno de los Prix que me gustan:";
  const productMessage =
    productMainMessage + lineBreak + " *Modelo:* " + tile.name + lineBreak + " *Enlace:* prixelart.com/producto=" +
    tile._id;

  return productMessage;
};

const generateServiceMessage = (tile, phone) => {
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

const generateLikeServiceMessage = (tile) => {
  let lineBreak = "%0D%0A";
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
    tile.prixer +
    lineBreak +
    " *Enlace:* prixelart.com/service=" +
    tile._id;

  const url = "https://wa.me/" + "?text=" + message;
  return url;
};

const generateArtMessage = (tile, type) => {
  let lineBreak = "";

  type === "wa" ? (lineBreak = "%0D%0A") : (lineBreak = "");

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

const generateWaBuyMessage = (buy) => {
  const waNumber = "584126377748";
  const message =
    "Hola, quiero conocer el proceso para continuar con la compra de los items que seleccioné: " +
    buy.map(
      (item, index) =>
        item.art &&
        item.product &&
        "*Item " +
          `${index + 1}* %0D%0A
          Arte: ${item.art.title} del Prixer: ${
            item.art.prixerUsername
          }, %0D%0A Producto: ${
            item.product.name
          }, ${item.product.attributes.map((a, i) => {
            return "- " + a.name + ": " + item.product.selection[i];
          })}, %0D%0A Cantidad: ${item.quantity}
          ` +
          "%0D%0A"
    );

  const url = "https://wa.me/" + waNumber + "?text=" + message;

  return url;
};

const maxPrintCalc = (width, height, ppi, iso) => {
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

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const util = {
  generateArtMessage,
  generateWaMessage,
  maxPrintCalc,
  shuffle,
  generateWaProductMessage,
  generateWaBuyMessage,
  generateServiceMessage,
  generateLikeServiceMessage,
};

export default util;
