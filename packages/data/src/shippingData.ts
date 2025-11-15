const shippingData = [
  {
    "country": "Argentina",
    "cities": [
      { "name": "Buenos Aires", "zip": "C1010AB (Centro)" },
      {
        "name": "Rosario",
        "zip": "S2000 (Centro)"
      }
    ],
    "deliveryTime": "10-17",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 12,
    "cupTax": 0,
    "cupExtra": 6,
    "shirtExtra": 6
  },
  {
    "country": "Chile",
    "cities": [
      { "name": "Santiago de Chile", "zip": "8320000 (Santiago Centro)" }
    ],
    "deliveryTime": "10-17",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 12,
    "cupTax": 0,
    "cupExtra": 6,
    "shirtExtra": 6
  },
  {
    "country": "Brasil",
    "cities": [
      { "name": "Río de Janeiro", "zip": "20000-000 (Centro)" },
      { "name": "Sao Paolo", "zip": "01001-000 (Centro)" }
    ],
    "deliveryTime": "12",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 4.5,
    "cupTax": 0,
    "cupExtra": 2.5,
    "shirtExtra": 6
  },
  {
    "country": "Perú",
    "cities": [{ "name": "Lima", "zip": "15001 (Lima Centro)" }],
    "deliveryTime": "10-17",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 12,
    "cupTax": 0,
    "cupExtra": 6,
    "shirtExtra": 6
  },
  {
    "country": "Ecuador",
    "cities": [{ "name": "Quito", "zip": "170101 (Centro Histórico)" }],
    "deliveryTime": "10-17",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 12,
    "cupTax": 0,
    "cupExtra": 6,
    "shirtExtra": 6
  },
  {
    "country": "Colombia",
    "cities": [
      { "name": "Bogotá", "zip": "110211 (Centro)" },
      { "name": "Medellín", "zip": "050004 (Centro)" }
    ],
    "deliveryTime": "10-17",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 12,
    "cupTax": 0,
    "cupExtra": 6,
    "shirtExtra": 6
  },
  {
    "country": "Panamá",
    "cities": [{ "name": "Panamá", "zip": "08080 (Ciudad de Panamá)" }],
    "deliveryTime": "10-18",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 12,
    "cupTax": 0,
    "cupExtra": 6,
    "shirtExtra": 6
  },
  {
    "country": "Dominicana",
    "cities": [{ "name": "Santo Domingo", "zip": "10101 (Zona Colonial)" }],
    "deliveryTime": "7-15",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 12,
    "cupTax": 0,
    "cupExtra": 6,
    "shirtExtra": 6
  },
  {
    "country": "México",
    "cities": [
      {
        "name": "Ciudad de México",
        "zip": "06000 (Centro Histórico)"
      },
      {
        "name": "Monterrey",
        "zip": "64000 (Centro)"
      }
    ],
    "deliveryTime": "8-10",
    "shirtCost": 12,
    "shirtTax": 0,
    "cupCost": 12,
    "cupTax": 0,
    "cupExtra": 6,
    "shirtExtra": 6
  },
  {
    "country": "EEUU",
    "cities": [
      {
        "name": "Miami",
        "zip": "33131 (Downtown Miami)"
      },
      { "name": "Los Ángeles", "zip": "90012 (Downtown Los Ángeles)" },
      { "name": "Nueva York", "zip": "10001 (Lower Manhattan)" }
    ],
    "deliveryTime": "6-9",
    "shirtCost": 4.69,
    "shirtTax": 2,
    "cupCost": 4,
    "cupTax": 0,
    "cupExtra": 2,
    "shirtExtra": 2.2
  },
  {
    "country": "Canadá",
    "cities": [
      { "name": "Toronto", "zip": "M5V 2E6 (Downtown Toronto)" },
      { "name": "Vancuber", "zip": "V6B 2V2 (Downtown Vancouver)" }
    ],
    "deliveryTime": "6-9",
    "shirtCost": 8.3,
    "shirtTax": 2.66,
    "cupCost": 7,
    "cupTax": 0,
    "cupExtra": 2,
    "shirtExtra": 2
  },
  {
    "country": "España",
    "cities": [
      { "name": "Barcelona", "zip": "08001 (Ciutat Vella)" },
      { "name": "Madrid", "zip": "28001 (Centro)" }
    ],
    "deliveryTime": "2-3",
    "shirtCost": 4.79,
    "shirtTax": 3.18,
    "cupCost": 4.6,
    "cupTax": 3.18,
    "cupExtra": 1.5,
    "shirtExtra": 1.5
  },
  {
    "country": "Portugal",
    "cities": [{ "name": "Lisboa", "zip": "1100-001 (Baixa-Chiado)" }],
    "deliveryTime": "4-5",
    "shirtCost": 4.79,
    "shirtTax": 3.47,
    "cupCost": 4.6,
    "cupTax": 3.47,
    "cupExtra": 1.5,
    "shirtExtra": 1.5
  },
  {
    "country": "Francia",
    "cities": [{ "name": "Paris", "zip": "75001 (Louvre)" }],
    "deliveryTime": "4-7",
    "shirtCost": 4.79,
    "shirtTax": 3.02,
    "cupCost": 4.6,
    "cupTax": 3.02,
    "cupExtra": 1.5,
    "shirtExtra": 1.5
  },
  {
    "country": "Italia",
    "cities": [{ "name": "Roma", "zip": "00186 (Centro Storico)" }],
    "deliveryTime": "3-5",
    "shirtCost": 4.79,
    "shirtTax": 3.32,
    "cupCost": 4.6,
    "cupTax": 3.32,
    "cupExtra": 1.5,
    "shirtExtra": 1.5
  },
  {
    "country": "Reino Unido",
    "cities": [{ "name": "Londres", "zip": "EC4A 1HQ" }],
    "deliveryTime": "5-7",
    "shirtCost": 4.59,
    "shirtTax": 3.48,
    "cupCost": 4.39,
    "cupTax": 3.48,
    "cupExtra": 1.5,
    "shirtExtra": 1.5
  }
]

export default shippingData;