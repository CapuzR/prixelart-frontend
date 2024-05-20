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
        attributes: {
          color: ["Negro", "Azul", "Verde"],
          talla: ["S", "M", "L", "XL"],
        },
        description:
          "Fresca e ideal para las cualquier momento en regiones cálidas. Viste al mejor estilo Chigüire.",
        finalPrice: 25,
        count: 0,
        points: 4.7,
        id: "CBfr01",
        name: "Franela",
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Independizar",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        images: [
          { color: "Negro", img: franelaIndependizarFront1 },
          { color: "Negro", img: franelaIndependizarFront2 },
          { color: "Azul", img: franelaIndependizarFront3 },
          { color: "Azul", img: franelaIndependizarBack1 },
          { color: "Verde", img: franelaIndependizarBack2 },
          { color: "Verde", img: franelaIndependizarBack3 },
        ],
      },
      product: {
        attributes: {
          color: ["Negro", "Azul", "Verde"],
          talla: ["S", "M", "L", "XL"],
        },
        description:
          "Fresca e ideal para las cualquier momento en regiones cálidas. Viste al mejor estilo Chigüire.",
        finalPrice: 25,
        id: "CBfr02",

        name: "Franela",
        count: 0,
        points: 4.7,
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Sobreviví",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        images: [
          { color: "Negro", img: franelaSobreviviFront1 },
          { color: "Negro", img: franelaSobreviviFront2 },
          { color: "Azul", img: franelaSobreviviFront3 },
          { color: "Azul", img: franelaSobreviviBack1 },
          { color: "Verde", img: franelaSobreviviBack2 },
          { color: "Verde", img: franelaSobreviviBack3 },
        ],
      },
      product: {
        attributes: {
          color: ["Negro", "Azul", "Verde"],
          talla: ["S", "M", "L", "XL"],
        },
        name: "Franela",
        description:
          "Fresca e ideal para las cualquier momento en regiones cálidas. Viste al mejor estilo Chigüire.",
        finalPrice: 25,
        count: 0,
        points: 4.7,
        id: "CBfr03",
        productionTime: "3",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Cafecito",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        images: [
          { color: "Negro", img: peltreCafecito1 },
          { color: "Azul", img: peltreCafecito2 },
          { color: "Verde", img: peltreCafecito3 },
        ],
      },
      product: {
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
        name: "Taza de Peltre",
        description:
          "Tu café sabe mejor en tu taza de peltre al estilo Chigüire.",
        finalPrice: 25,
        count: 0,
        points: 4.7,
        id: "CBtp01",
      },
      quantity: 1,
    },
    {
      art: {
        title: "Independizar",
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
        images: [
          { color: "Negro", img: peltreIndependizar1 },
          { color: "Azul", img: peltreIndependizar2 },
          { color: "Verde", img: peltreIndependizar3 },
        ],
      },
      product: {
        id: "CBtp02",
        name: "Taza de Peltre",
        description:
          "Tu café sabe mejor en tu taza de peltre al estilo Chigüire.",
        finalPrice: 25,
        count: 0,
        points: 4.7,
        productionTime: "3",
        attributes: {
          color: ["Negro", "Azul", "Verde"],
        },
      },
      quantity: 1,
    },
    {
      art: {
        title: "Pasante1",
        images: [
          { color: "Negro", img: peltrePasante1 },
          { color: "Azul", img: peltrePasante2 },
          { color: "Verde", img: peltrePasante3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        id: "CBtp03",
        name: "Taza de Peltre",
        description:
          "Tu café sabe mejor en tu taza de peltre al estilo Chigüire.",
        finalPrice: 15,
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
        title: "Pasante2",
        images: [
          { color: "Negro", img: peltrePasante21 },
          { color: "Azul", img: peltrePasante22 },
          { color: "Verde", img: peltrePasante23 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        id: "CBtp04",
        name: "Taza de Peltre",
        description:
          "Tu café sabe mejor en tu taza de peltre al estilo Chigüire.",
        finalPrice: 15,
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
        title: "Pasante3",
        images: [
          { color: "Negro", img: peltrePasante31 },
          { color: "Azul", img: peltrePasante32 },
          { color: "Verde", img: peltrePasante33 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        id: "CBtp05",
        name: "Taza de Peltre",
        description:
          "Tu café sabe mejor en tu taza de peltre al estilo Chigüire.",
        finalPrice: 15,
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
        title: "Cafecito",
        images: [
          { color: "Negro", img: peltreSobrevivi1 },
          { color: "Azul", img: peltreSobrevivi2 },
          { color: "Verde", img: peltreSobrevivi3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        id: "CBtp06",
        name: "Taza de Peltre",
        description:
          "Tu café sabe mejor en tu taza de peltre al estilo Chigüire.",
        finalPrice: 15,
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
        id: "CBbr01",
        name: "Botella Rock",
        description:
          "Ligero y cómodo. Ideal para la excursión e ir al gimnasio.",
        finalPrice: 20,
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
        id: "CBbr02",
        name: "Botella Rock",
        description:
          "Ligero y cómodo. Ideal para la excursión e ir al gimnasio.",
        finalPrice: 20,
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
        title: "Pasante",
        images: [
          { color: "Negro", img: thermoPasante1 },
          { color: "Azul", img: thermoPasante2 },
          { color: "Verde", img: thermoPasante3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        id: "CBbr03",
        name: "Botella Rock",
        description:
          "Ligero y cómodo. Ideal para la excursión e ir al gimnasio.",
        finalPrice: 20,
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
        id: "CBtb01",
        name: "Tote Bag",
        description:
          "Tote bag resistente. Ideal para un vivir cada día al mejor estilo Chigüire.",
        finalPrice: 15,
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
        id: "CBtb02",
        name: "Tote Bag",
        description:
          "Tote bag resistente. Ideal para un vivir cada día al mejor estilo Chigüire.",
        finalPrice: 15,
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
        id: "CBtb03",
        name: "Tote Bag",
        description:
          "Tote bag resistente. Ideal para un vivir cada día al mejor estilo Chigüire.",
        finalPrice: 15,
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
        title: "Pasante Subpagado 2",
        images: [
          // { color: "Negro", img: thermoPasante1 },
          { color: "Azul", img: bagPasanteSubpagado2 },
          { color: "Verde", img: bagPasanteSubpagado3 },
        ],
        owner: "ChiguireBipolar",
        prixerUsername: "ChiguireBipolar",
      },
      product: {
        id: "CBtb04",
        name: "Tote Bag",
        description:
          "Tote bag resistente. Ideal para un vivir cada día al mejor estilo Chigüire.",
        finalPrice: 15,
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
        id: "CBtb05",
        name: "Tote Bag",
        title: "Sobreviví",
        description:
          "Tote bag resistente. Ideal para un vivir cada día al mejor estilo Chigüire.",
        finalPrice: 15,
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
