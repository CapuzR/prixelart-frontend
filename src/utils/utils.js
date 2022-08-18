

const generateWaMessage = (tile = '')=> {

    const waNumber = '584126377748';
    const welcomeMessage = 'Holaa, cuéntame más. Quiero asesoría y conocer sus productos.';
    const message = tile!==''?generateArtMessage(tile, 'wa'):welcomeMessage;

    const url = 'https://wa.me/' +  
    waNumber +
    '?text=' +
    message;

    return url;
}

const generateWaProductMessage = (tile = '')=> {

    const waNumber = '584126377748';
    const welcomeMessage = 'Holaa, cuéntame más. Quiero asesoría y conocer sus productos.';
    const message = tile!==''?generateProductMessage(tile, 'wa'):welcomeMessage;

    const url = 'https://wa.me/' +  
    waNumber +
    '?text=' +
    message;

    return url;
}

const generateProductMessage = (tile, type)=> {

    let lineBreak = '';

    type==='wa'?lineBreak='%0D%0A':lineBreak='';

    const productMainMessage = 'Holaa, este es uno de los Prix que me gustan:';
    const productMessage = productMainMessage +
    lineBreak +
    ' *Modelo:* ' + 
    tile.name;
    
    return productMessage;
}


const generateArtMessage = (tile, type)=> {

    let lineBreak = '';

    type==='wa'?lineBreak='%0D%0A':lineBreak='';

    const artMainMessage = 'Holaa, este es uno de los artes que me gustan:';
    const artMessage = artMainMessage +
    lineBreak +
    ' *Título del Arte:* ' + 
    tile.title +
    lineBreak +
    ' *Prixer:* ' +
    tile.prixerUsername +
    lineBreak +
    ' *Enlace:* prixelart.com/' + 
    tile.prixerUsername +
    '/art/' +
    tile.artId;  
    
    return artMessage;
}

const maxPrintCalc = (width, height, ppi, iso)=> {
    let widthCm = 0;
    let heightCm = 0;
    const pxToCmConversionRate = 2.54;
    if (iso === '100' || iso === '200') {
        widthCm = width*pxToCmConversionRate/100;
        heightCm = height*pxToCmConversionRate/100;
    } else if (iso === '400') {
        widthCm = width*pxToCmConversionRate/150;
        heightCm = height*pxToCmConversionRate/150;
    }

    return [Math.trunc(widthCm), Math.trunc(heightCm)]
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
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

const util = { generateArtMessage, generateWaMessage, maxPrintCalc, shuffle, generateWaProductMessage };

export default util;
