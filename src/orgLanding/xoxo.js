import franelaPasanteBack1 from "./assets/TshirtsAssets/franelaPasanteBack1.png";
import franelaPasanteFront1 from "./assets/TshirtsAssets/franelaPasanteFront1.png";
import franelaPasanteFront2 from "./assets/TshirtsAssets/franelaPasanteFront2.png";
import franelaPasanteBack2 from "./assets/TshirtsAssets/franelaPasanteBack2.png";
import franelaPasanteFront3 from "./assets/TshirtsAssets/franelaPasanteFront3.png";
import franelaPasanteBack3 from "./assets/TshirtsAssets/franelaPasanteBack3.png";
import franelaIndependizarFront1 from "./assets/TshirtsAssets/franelaIndependizarFront1.png";
import franelaIndependizarFront2 from "./assets/TshirtsAssets/franelaIndependizarFront2.png";
import franelaIndependizarFront3 from "./assets/TshirtsAssets/franelaIndependizarFront3.png";
import franelaIndependizarBack1 from "./assets/TshirtsAssets/franelaIndependizarBack1.png";
import franelaIndependizarBack2 from "./assets/TshirtsAssets/franelaIndependizarBack2.png";
import franelaIndependizarBack3 from "./assets/TshirtsAssets/franelaIndependizarBack3.png";
import franelaSobreviviFront1 from "./assets/TshirtsAssets/franelaSobreviviFront1.png";
import franelaSobreviviFront2 from "./assets/TshirtsAssets/franelaSobreviviFront2.png";
import franelaSobreviviFront3 from "./assets/TshirtsAssets/franelaSobreviviFront3.png";
import franelaSobreviviBack1 from "./assets/TshirtsAssets/franelaSobreviviBack1.png";
import franelaSobreviviBack2 from "./assets/TshirtsAssets/franelaSobreviviBack2.png";
import franelaSobreviviBack3 from "./assets/TshirtsAssets/franelaSobreviviBack3.png";
import peltreCafecito1 from "./assets/PeltreAssets/peltreCafecito1.png";
import peltreCafecito2 from "./assets/PeltreAssets/peltreCafecito2.png";
import peltreCafecito3 from "./assets/PeltreAssets/peltreCafecito3.png";
import peltreIndependizar1 from "./assets/PeltreAssets/peltreIndependizar1.png";
import peltreIndependizar2 from "./assets/PeltreAssets/peltreIndependizar2.png";
import peltreIndependizar3 from "./assets/PeltreAssets/peltreIndependizar3.png";
import peltrePasante1 from "./assets/PeltreAssets/peltrePasante1.png";
import peltrePasante2 from "./assets/PeltreAssets/peltrePasante2.png";
import peltrePasante3 from "./assets/PeltreAssets/peltrePasante3.png";
import peltrePasante21 from "./assets/PeltreAssets/peltrePasanteSubpagado1.png";
import peltrePasante22 from "./assets/PeltreAssets/peltrePasanteSubpagado2.png";
import peltrePasante23 from "./assets/PeltreAssets/peltrePasanteSubpagado3.png";
import peltrePasante31 from "./assets/PeltreAssets/peltrePasanteSubpagado21.png";
import peltrePasante32 from "./assets/PeltreAssets/peltrePasanteSubpagado22.png";
import peltrePasante33 from "./assets/PeltreAssets/peltrePasanteSubpagado23.png";
import peltreSobrevivi1 from "./assets/PeltreAssets/peltreSobrevivi1.png";
import peltreSobrevivi2 from "./assets/PeltreAssets/peltreSobrevivi2.png";
import peltreSobrevivi3 from "./assets/PeltreAssets/peltreSobrevivi3.png";
import thermoCafecito1 from "./assets/ThermoAssets/thermoCafecito1.png";
import thermoCafecito2 from "./assets/ThermoAssets/thermoCafecito2.png";
import thermoCafecito3 from "./assets/ThermoAssets/thermoCafecito3.png";
import thermoIndependizar1 from "./assets/ThermoAssets/thermoIndependizar1.png";
import thermoIndependizar2 from "./assets/ThermoAssets/thermoIndependizar2.png";
import thermoIndependizar3 from "./assets/ThermoAssets/thermoIndependizar3.png";
import thermoPasante1 from "./assets/ThermoAssets/thermoPasante1.png";
import thermoPasante2 from "./assets/ThermoAssets/thermoPasante2.png";
import thermoPasante3 from "./assets/ThermoAssets/thermoPasante3.png";
import bagCartoon1 from "./assets/BagAssets/bagCartoon1.png";
import bagCartoon2 from "./assets/BagAssets/bagCartoon2.png";
import bagCartoon3 from "./assets/BagAssets/bagCartoon3.png";
import bagIndependizar1 from "./assets/BagAssets/bagIndependizar1.png";
import bagIndependizar2 from "./assets/BagAssets/bagIndependizar2.png";
import bagIndependizar3 from "./assets/BagAssets/bagIndependizar3.png";
import bagPasante1 from "./assets/BagAssets/bagPasante1.png";
import bagPasante2 from "./assets/BagAssets/bagPasante2.png";
import bagPasante3 from "./assets/BagAssets/bagPasante3.png";
import bagPasanteSubpagado1 from "./assets/BagAssets/bagPasanteSubpagado1.jpg";
import bagPasanteSubpagado2 from "./assets/BagAssets/bagPasanteSubpagado2.png";
import bagPasanteSubpagado3 from "./assets/BagAssets/bagPasanteSubpagado3.png";
import bagSobrevivi1 from "./assets/BagAssets/bagSobrevivi1.png";
import bagSobrevivi2 from "./assets/BagAssets/bagSobrevivi2.png";
import bagSobrevivi3 from "./assets/BagAssets/bagSobrevivi3.png";

const getProducts = () => {
  let fullProducts = [
    {
      art: {
        title: "Pasante Subpagado",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        images: [
          { color: "Negro", img: franelaPasanteFront1 },
          { color: "Negro", img: franelaPasanteBack1 },
          { color: "Azul", img: franelaPasanteFront2 },
          { color: "Azul", img: franelaPasanteBack2 },
          { color: "Verde", img: franelaPasanteFront3 },
          { color: "Verde", img: franelaPasanteBack3 },
        ],
      },
      product: {
        thumbUrl: undefined,
        _id: "6413349c2657ac0012046477",
        attributes: {
          corte: ["Caballero", "Dama"],
          color: ["Negro", "Azul", "Verde"],
          talla: ["S", "M", "L", "XL", "XXL"],
        },
        description:
          "Todos hemos sido alguna vez el Pasante Subpagado. Ahora puedes verte como él con esta franela. ¡Aprovecha!",
        finalPrice: 25,
        basePrice: 9.8,
        count: 0,
        points: 4.7,
        item: "CBfr01",
        name: "Franela",
        productionTime: "4",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Independizar",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        squareThumbUrl: undefined,
        artId: 2,
        comission: 60,
        images: [
          { color: "Negro", img: franelaIndependizarFront1 },
          { color: "Negro", img: franelaIndependizarBack1 },
          { color: "Azul", img: franelaIndependizarFront2 },
          { color: "Azul", img: franelaIndependizarBack2 },
          { color: "Verde", img: franelaIndependizarFront3 },
          { color: "Verde", img: franelaIndependizarBack3 },
        ],
      },
      product: {
        thumbUrl: undefined,
        _id: "6413349c2657ac0012046477",
        attributes: {
          corte: ["Caballero", "Dama"],

          color: ["Negro", "Azul", "Verde"],
          talla: ["S", "M", "L", "XL", "XXL"],
        },
        description:
          "Independizarse es algo difícil de alcanzar. Comprar esta franela, en cambio, es sencillísimo.",
        finalPrice: 25,
        basePrice: 9.8,

        item: "CBfr02",
        name: "Franela",
        count: 0,
        points: 4.7,
        productionTime: "4",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Sobreviví",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        squareThumbUrl: undefined,
        artId: 3,
        comission: 60,
        images: [
          { color: "Negro", img: franelaSobreviviFront1 },
          { color: "Negro", img: franelaSobreviviBack1 },
          { color: "Azul", img: franelaSobreviviFront2 },
          { color: "Azul", img: franelaSobreviviBack2 },
          { color: "Verde", img: franelaSobreviviFront3 },
          { color: "Verde", img: franelaSobreviviBack3 },
        ],
      },
      product: {
        thumbUrl: undefined,
        _id: "6413349c2657ac0012046477",
        attributes: {
          corte: ["Caballero", "Dama"],

          color: ["Negro", "Azul", "Verde"],
          talla: ["S", "M", "L", "XL"],
        },
        name: "Franela",
        description:
          "Si estos últimos años te dejaron muerto por dentro, al menos puedes lucir fresco y elegante por fuera con esta franela.",
        finalPrice: 25,
        basePrice: 9.8,

        count: 0,
        points: 4.7,
        item: "CBfr03",
        productionTime: "4",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Cafecito",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        images: [
          { color: "Negro", img: peltreCafecito1 },
          { color: "Azul", img: peltreCafecito2 },
          { color: "Verde", img: peltreCafecito3 },
        ],
      },
      product: {
        thumbUrl: undefined,
        _id: "6177f8697404fa0011b10417",
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        name: "Taza de Peltre",
        description:
          "Tu café sabrá mucho mejor en esta taza de peltre al estilo Chigüire, ideal para leer las noticias cada mañana.",
        finalPrice: 15,
        basePrice: 7,

        count: 0,
        points: 4.7,
        item: "CBtp01",
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Independizar",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        images: [
          { color: "Negro", img: peltreIndependizar1 },
          { color: "Azul", img: peltreIndependizar2 },
          { color: "Verde", img: peltreIndependizar3 },
        ],
      },
      product: {
        thumbUrl: undefined,
        _id: "6177f8697404fa0011b10417",
        item: "CBtp02",
        name: "Taza de Peltre",
        description:
          "Ahora tú también podrás tomar café en la misma taza que usa el Rey de Inglaterra para tomar té por las mañanas.",
        finalPrice: 15,
        basePrice: 7,

        count: 0,
        points: 4.7,
        productionTime: "3",
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Pasante Subpagado",
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        images: [
          { color: "Negro", img: peltrePasante1 },
          { color: "Azul", img: peltrePasante2 },
          { color: "Verde", img: peltrePasante3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        _id: "6177f8697404fa0011b10417",
        item: "CBtp03",
        name: "Taza de Peltre",
        description:
          "Añade a tu colección de tazas increíbles este modelo de taza, antes de que Iker Casillas la agote.",
        finalPrice: 15,
        basePrice: 7,
        count: 0,
        points: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Pasante Subpagado 2",
        images: [
          { color: "Negro", img: peltrePasante21 },
          { color: "Azul", img: peltrePasante22 },
          { color: "Verde", img: peltrePasante23 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        _id: "6177f8697404fa0011b10417",
        item: "CBtp04",
        name: "Taza de Peltre",
        description:
          "Esta taza es una réplica legítima de las tazas que usa el Pasante Subpagado para servirnos café cada mañana.",
        finalPrice: 15,
        basePrice: 7,
        count: 0,
        points: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Pasante Subpagado 3",
        images: [
          { color: "Negro", img: peltrePasante31 },
          { color: "Azul", img: peltrePasante32 },
          { color: "Verde", img: peltrePasante33 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        _id: "6177f8697404fa0011b10417",
        item: "CBtp05",
        name: "Taza de Peltre",
        description:
          "Todo el mundo lo sabe: por cada taza de arroz, dos de agua. Y si es esta taza, mejor aún.",
        finalPrice: 15,
        basePrice: 7,
        count: 0,
        points: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Sobreviví",
        images: [
          { color: "Negro", img: peltreSobrevivi1 },
          { color: "Azul", img: peltreSobrevivi2 },
          { color: "Verde", img: peltreSobrevivi3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        _id: "6177f8697404fa0011b10417",
        item: "CBtp06",
        name: "Taza de Peltre",
        description:
          "La señora María Alejandra López asegura que esta taza es la mejor para darle a la cacerola. Descubre por qué.",
        finalPrice: 15,
        basePrice: 7,
        count: 0,
        points: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Cafecito",
        images: [
          { color: "Negro", img: thermoCafecito1 },
          { color: "Azul", img: thermoCafecito2 },
          { color: "Verde", img: thermoCafecito3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        id: "6360260eaf8bc30011a35f02",
        item: "CBbr01",
        name: "Botella Rock",
        description:
          "Con estos calorones que están haciendo, no olvides tomar agua de tu flamante botella.",
        finalPrice: 20,
        basePrice: 11.2,
        count: 0,
        point: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Independizar",
        images: [
          { color: "Negro", img: thermoIndependizar1 },
          { color: "Azul", img: thermoIndependizar2 },
          { color: "Verde", img: thermoIndependizar3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        _id: "6360260eaf8bc30011a35f02",
        id: "CBbr02",
        name: "Botella Rock",
        description:
          "¿De excursión, al gimnasio o a tomar curda con los panas? Esta botella sirve para todo eso y más.",
        finalPrice: 20,
        basePrice: 11.2,
        count: 0,
        point: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Pasante Subpagado",
        images: [
          { color: "Negro", img: thermoPasante1 },
          { color: "Azul", img: thermoPasante2 },
          { color: "Verde", img: thermoPasante3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        id: "6360260eaf8bc30011a35f02",
        item: "CBbr03",
        name: "Botella Rock",
        description:
          "Si buscas algo ligero, cómodo y que apoye la explotación laboral a los pasantes, esta botella es ideal para ti.",
        finalPrice: 20,
        basePrice: 11.2,
        count: 0,
        point: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Cartoon",
        images: [
          { color: "Negro", img: bagCartoon1 },
          { color: "Azul", img: bagCartoon2 },
          { color: "Verde", img: bagCartoon3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        id: undefined,
        item: "CBtb01",
        name: "Tote Bag",
        description:
          "Salva al planeta con este tote bag del Chigüire, ideal para llevar lo que sea. Hasta las penas y los traumas.",
        finalPrice: 15,
        basePrice: 4.9,
        count: 0,
        point: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Independizar",
        images: [
          { color: "Negro", img: bagIndependizar1 },
          { color: "Azul", img: bagIndependizar2 },
          { color: "Verde", img: bagIndependizar3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        id: undefined,
        item: "CBtb02",
        name: "Tote Bag",
        description:
          "Demuéstrale al mundo que tú llevas tus cargas con dignidad y estilo. Lúcete con tu tote bag.",
        finalPrice: 15,
        basePrice: 4.9,
        count: 0,
        point: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Pasante Subpagado 1",
        images: [
          { color: "Negro", img: bagPasante1 },
          { color: "Azul", img: bagPasante2 },
          { color: "Verde", img: bagPasante3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        id: undefined,
        item: "CBtb03",
        name: "Tote Bag",
        description:
          "Fun fact: el pasante usa un tote bag como este cuando lo mandamos a hacernos las compras.",
        finalPrice: 15,
        basePrice: 4.9,
        count: 0,
        point: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Pasante Subpagado 2",
        images: [
          { color: "Negro", img: bagPasanteSubpagado1 },
          { color: "Azul", img: bagPasanteSubpagado2 },
          { color: "Verde", img: bagPasanteSubpagado3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        _id: "6360260eaf8bc30011a35f02",
        item: "CBtb04",
        name: "Tote Bag",
        description:
          "¿Todavía usando bolsas de plástico para la compra? Compra tu tote bag y haz que Greta Thumberg sonría de nuevo.",
        finalPrice: 15,
        basePrice: 4.9,
        count: 0,
        point: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        squareThumbUrl: undefined,
        artId: 1,
        comission: 60,
        title: "Sobreviví",
        images: [
          { color: "Negro", img: bagSobrevivi1 },
          { color: "Azul", img: bagSobrevivi2 },
          { color: "Verde", img: bagSobrevivi3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        thumbUrl: undefined,
        id: undefined,
        item: "CBtb05",
        name: "Tote Bag",
        title: "Sobreviví",
        description:
          "Si algo nos enseñaron estos años es que se podrá estar muerto por dentro, pero siempre con estilo",
        finalPrice: 15,
        basePrice: 4.9,
        count: 0,
        point: 4.7,
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        productionTime: "3",
      },
      quantity: 1,
    },
  ];
  return fullProducts;
};

export { getProducts };
