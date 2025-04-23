import React, { useEffect, useState } from "react";
import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import { Theme, useTheme } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Img from "react-cool-img";
import Tooltip from "@mui/material/Tooltip";
import oS from "../services";
import StarOutline from "@mui/icons-material/StarOutline";

import {
  UnitPrice,
  UnitPriceSug,
  getComission,
  getPVPtext,
  getPVMtext,
} from "../../../../consumer/checkout/pricesFunctions";
import { makeStyles } from "tss-react/mui";
import {
  useConversionRate,
  useCurrency,
  useSnackBar,
} from "@context/GlobalContext";
import { Discount } from "../../../../../types/discount.types";
import { Prixer } from "../../../../../types/prixer.types";
import { Art, PickedArt } from "../../../../../types/art.types";
import { Organization as BaseOrganization } from "../../../../../types/organization.types";
import {
  PickedProduct,
  Product,
  Selection,
} from "../../../../../types/product.types";
import { Surcharge } from "../../../../../types/surcharge.types";
import { Variant } from "aws-sdk/clients/iotsitewise";
import { useOrder } from "@context/OrdersContext";
import { getArts, getProducts } from "../api";
import { nanoid } from "nanoid";
import { OrderLine } from "@apps/consumer/checkout/interfaces";
import { Item } from "../../../../../types/item.types";
import { formatPriceForUI } from "@utils/formats";
import { checkPermissions } from "apps/consumer/flow/services";
import { getSelectedVariant } from "apps/consumer/products/services";
import { fetchVariantPrice } from "apps/consumer/products/api";
import { parsePrice } from "utils/formats";
import {
  Organization as PriceFunctionsOrg,
  OrgAgreementProduct,
  OrgAgreementProductVariant,
} from "../../../../consumer/checkout/pricesFunctions";
import { calculateFinalPrice } from "../../../utils/priceCalculations";

interface CartProps {
  discounts: Discount[];
  selectedPrixer: Prixer;
  orgs: BaseOrganization[];
  consumerType: string;
  surcharges: Surcharge[];
}

const drawerWidth = 240;

const useStyles = makeStyles()((theme: Theme) => {
  return {
    formControl: {
      minWidth: 120,
    },

    textField: {
      marginRight: "8px",
    },
  };
});

export default function ShoppingCart() {
  const { classes } = useStyles();

  const theme = useTheme();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const adminToken = localStorage.getItem("adminToken");
  const adminData = adminToken ? JSON.parse(adminToken) : null;
  const { showSnackBar } = useSnackBar();
  const { state, dispatch } = useOrder();
  const {
    order,
    surcharges,
    discounts,
    organizations,
    selectedConsumer,
    selectedPrixer,
  } = state;
  const { lines, consumerDetails } = order;
  const { type } = consumerDetails;
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [productList, setProductList] = useState<Product[]>([]);
  const [artist, setArtist] = useState<string[]>([]);
  const [artList, setArtList] = useState<Art[]>([]);
  const [artList0, setArtList0] = useState<Art[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string[]>([]);
  const [filteredArtList, setFilteredArtList] = useState<Art[]>([]);
  const [prices, setPrices] = useState<number[]>([]);

  let customArt: Art = {
    crops: [],
    points: 0,
    tags: [],
    visible: true,
    _id: "0000",
    artId: "none",
    title: "Personalizado",
    description: "",
    category: "",
    imageUrl: "/apple-touch-icon-180x180.png",
    largeThumbUrl: "/apple-touch-icon-180x180.png",
    squareThumbUrl: "/apple-touch-icon-180x180.png",
    userId: "",
    prixerUsername: "",
    status: "visble",
    artType: "Diseño",
    comission: 10,
    exclusive: "",
    owner: "",
    createdOn: new Date().toString(),
  };

  const readProducts = async () => {
    try {
      let products: Product[] = await getProducts();
      setProductList(products);
    } catch (error) {
      console.log(error);
    }
  };

  const readArts = async () => {
    try {
      const arts: Art[] = await getArts();
      arts.unshift(customArt);

      let artist: string[] = [];

      arts.map((art) => {
        if (artist.includes(art.prixerUsername)) {
          return;
        } else {
          artist.push(art.prixerUsername);
          let customv2 = customArt;
          customv2.owner = art.prixerUsername;
          customv2.prixerUsername = art.prixerUsername;
          arts.push(customv2);
          setArtList(arts);
          setArtList0(arts);
        }
      });
      setArtist(artist);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const readData = async () => {
      try {
        let products: Product[] = await getProducts();
        setProductList(products);

        const arts: Art[] = await getArts();
        arts.unshift(customArt);

        // Extraer usernames únicos de artistas
        const uniqueArtists = Array.from(
          new Set(arts.map((art) => art.prixerUsername))
        ).filter(Boolean);

        setArtist(uniqueArtists);
        setArtList(arts);
        setFilteredArtList(arts);
      } catch (error) {
        console.error(error);
        showSnackBar("Error al cargar productos y artes");
      }
    };

    readData();
  }, []);

  const changeArtistFilter = (artistUsername: string, lineIndex: number) => {
    const newSelectedArtists = [...selectedArtist];
    newSelectedArtists[lineIndex] = artistUsername;
    setSelectedArtist(newSelectedArtists);

    if (artistUsername) {
      const filtered = artList.filter(
        (art) => art.prixerUsername === artistUsername
      );
      setFilteredArtList(filtered);
    } else {
      setFilteredArtList(artList);
    }
  };

  const removePrixer = (index: number) => {
    let artists = selectedArtist;
    artists.splice(index, 1);
    setSelectedArtist(artists);
  };

  const checkOrgs = (art: PickedArt): PriceFunctionsOrg | undefined => {
    if (art) {
      const org = organizations.find((el) => el.username === art.owner);
      if (org) {
        return {
          agreement: {
            base: org.agreement.base as "pvprixer" | "pvm" | "pvp",
            appliedProducts: org.agreement.appliedProducts,
            considerations: org.agreement.considerations,
          },
        };
      }
    }
    return undefined;
  };

  const getCporg = (item: Item) => {
    if (item.art) {
      const org = organizations.find((el) => el.username === item.art?.owner);

      const applied = org?.agreement.appliedProducts.find(
        (el) => el.id === item.product._id
      );
      const varApplied = applied?.variants?.find(
        (v) => v.name === item.product.selection?.name
      );
      let percentage =
        item.product.selection !== undefined &&
        typeof item.product.selection === "string"
          ? varApplied?.cporg
          : applied?.cporg;

      return percentage;
    }
  };

  const modifyPrice = (id: string, newPrice: string) => {
    let existingLine = lines.find((line) => line.id === id);
    if (!existingLine) return;

    existingLine.pricePerUnit = Number(newPrice.replace(/[,]/gi, "."));
  };

  const calculateLinePrice = (
    product: Product,
    art?: Art,
    quantity: number = 1
  ) => {
    const basePrice = product.price;
    const artCommission = art ? art.comission || 0 : 0;
    const finalPrice = calculateFinalPrice(basePrice, artCommission);
    return {
      pricePerUnit: finalPrice,
      subtotal: finalPrice * quantity,
    };
  };

  const handleProduct = async (selectedProduct: Product) => {
    if (!selectedProduct) return;

    const newItem: Item = {
      sku: nanoid(6),
      product: {
        ...selectedProduct,
        selection: undefined,
      },
      price: selectedProduct.price,
    };

    const lineId = nanoid(6);
    const { pricePerUnit, subtotal } = calculateLinePrice(selectedProduct);

    dispatch({
      type: "ADD_ORDER_LINE",
      payload: {
        id: lineId,
        item: newItem,
        quantity: 1,
        pricePerUnit,
        subtotal,
      },
    });
  };

  const handleVariantSelect = async (
    event: SelectChangeEvent<string>,
    lineId: string
  ) => {
    const selectedVariantName = event.target.value;
    const existingLine = lines.find((line) => line.id === lineId);

    if (!existingLine || !existingLine.item.product) {
      showSnackBar("Error: Línea de orden no encontrada");
      return;
    }

    const product = existingLine.item.product;
    const selectedVariant = product.variants?.find(
      (v: {
        name: string;
        attributes: Array<{ name: string; value: string }>;
      }) => v.name === selectedVariantName
    );

    if (!selectedVariant) {
      showSnackBar("Error: Variante no encontrada");
      return;
    }

    try {
      const price = await fetchVariantPrice(selectedVariant._id, product._id);
      const parsedPrice = parsePrice(price);

      const updatedItem: Item = {
        ...existingLine.item,
        product: {
          ...existingLine.item.product,
          selection: {
            name: selectedVariant.name,
            value: selectedVariant.name,
            attributes: {
              name: selectedVariant.attributes[0].name,
              value: [selectedVariant.attributes[0].value],
            },
          },
          price: parsedPrice,
        },
        price: parsedPrice,
      };

      dispatch({
        type: "UPDATE_ORDER_LINE",
        payload: {
          ...existingLine,
          item: updatedItem,
          pricePerUnit: parsedPrice,
          subtotal: parsedPrice * existingLine.quantity,
        },
      });
    } catch (error) {
      console.error("Error al actualizar la variante:", error);
      showSnackBar("Error al actualizar la variante");
    }
  };

  const removeOrderLine = (id: string, index: number) => {
    dispatch({
      type: "REMOVE_ORDER_LINE",
      payload: id,
    });
    removePrixer(index);
  };

  const copyItem = (id: string) => {
    dispatch({
      type: "DUPLICATE_ORDER_LINE",
      payload: id,
    });
    showSnackBar("Item duplicado correctamente.");
  };

  const changeProduct = (
    event: SelectChangeEvent<string>,
    id: string,
    art?: PickedArt
  ) => {
    let selectedProduct = productList.find(
      (result) => result.name === event.target.value
    );
    if (!selectedProduct) return;

    const existingLine = lines.find((line) => line.id === id);
    if (!existingLine) return;

    if (existingLine.item.art || existingLine.item.product?.selection) {
      const confirmed = window.confirm(
        "Cambiar el producto eliminará el arte y la variante seleccionada. ¿Desea continuar?"
      );
      if (!confirmed) return;
    }

    const updatedLine = {
      ...existingLine,
      item: {
        sku: existingLine.item.sku,
        product: {
          ...selectedProduct,
          selection: undefined,
        },
        art: undefined,
        price: selectedProduct.price,
      },
      pricePerUnit: selectedProduct.price,
      subtotal: selectedProduct.price * existingLine.quantity,
    };

    dispatch({
      type: "UPDATE_ORDER_LINE",
      payload: updatedLine,
    });
  };

  const handleArtSelect = async (selectedArt: string, lineId: string) => {
    const art = artList.find((a) => a.artId === selectedArt);
    if (!art) {
      showSnackBar("No se encontró el arte seleccionado");
      return;
    }

    const existingLine = lines.find((line) => line.id === lineId);
    if (!existingLine) return;
    // const canUpdate = checkPermissions(existingLine.item.product, art);
    // if (!canUpdate) {
    //   showSnackBar("Por favor complete la selección del producto primero");
    //   return;
    // }

    const updatedItem = {
      ...existingLine.item,
      art: art,
    };

    dispatch({
      type: "UPDATE_ORDER_LINE",
      payload: {
        ...existingLine,
        item: updatedItem,
      },
    });
  };

  const changeQuantity = (id: string, quantity: string) => {
    const existingLine = lines.find((line) => line.id === id);
    if (!existingLine) return;

    const updatedLine = {
      ...existingLine,
      ...{ quantity: Number(quantity.replace(/[,]/gi, ".")) },
    };

    dispatch({
      type: "UPDATE_ORDER_LINE",
      payload: updatedLine,
    });
  };

  const getFinalPrice = (line: OrderLine) => {
    if (!line.item.product || !line.item.art) return undefined;

    const price = line.item.product.selection
      ? UnitPriceSug(
          line.item.product,
          line.item.art,
          currency,
          conversionRate,
          discounts,
          selectedPrixer?.username,
          checkOrgs(line.item.art),
          type
        )
      : UnitPrice(
          line.item.product,
          line.item.art,
          currency === "Bs",
          conversionRate,
          discounts,
          selectedPrixer?.username
        );

    return formatPriceForUI(
      Number(price) * line.quantity,
      currency,
      conversionRate
    );
  };

  const updateLinePrice = (
    lineId: string,
    product: Product,
    art?: Art,
    quantity?: number
  ) => {
    const existingLine = lines.find((line) => line.id === lineId);
    if (!existingLine) return;

    const { pricePerUnit, subtotal } = calculateLinePrice(
      product,
      art,
      quantity || existingLine.quantity
    );

    dispatch({
      type: "UPDATE_ORDER_LINE",
      payload: {
        ...existingLine,
        id: lineId,
        pricePerUnit,
        subtotal,
      },
    });
  };

  return (
    <Grid2
      container
      style={{ display: "flex", justifyContent: "center", gap: 24 }}
    >
      {lines.length > 0 &&
        lines.map((line, index) => {
          return (
            <Grid2
              key={index}
              style={{
                width: "100%",
              }}
            >
              <Paper
                style={{
                  padding: 12,
                  marginTop: "2px",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                }}
                elevation={3}
              >
                <Grid2 size={{ xs: 5 }}>
                  <div
                    style={{
                      display: "flex",
                      height: 120,
                      marginRight: 20,
                    }}
                  >
                    <Img
                      placeholder="/imgLoading.svg"
                      style={{
                        backgroundColor: "#eeeeee",
                        height: 120,
                        borderRadius: "10px",
                        marginRight: "20px",
                      }}
                      src={
                        (line.item.product?.sources?.images &&
                          line.item.product?.sources?.images[0]?.url) ||
                        line.item.product?.thumbUrl ||
                        ""
                      }
                      debounce={1000}
                      cache
                      error="/imgError.svg"
                      alt={line.item.product && line.item.product.name}
                      id={index}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <FormControl
                        className={classes.formControl}
                        style={{
                          minWidth: 200,
                          marginBottom: 10,
                        }}
                      >
                        <InputLabel style={{ paddingLeft: 15 }}>
                          {line.item.product
                            ? "Producto"
                            : "Agrega un producto"}
                        </InputLabel>
                        <Select
                          id={"product " + index}
                          variant="outlined"
                          value={line.item.product?.name || ""}
                          onChange={(e) =>
                            changeProduct(e, line.id, line.item?.art)
                          }
                        >
                          {productList.map((product) => (
                            <MenuItem key={product._id} value={product.name}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {line.item.product?.variants &&
                        line.item.product.variants.length > 0 && (
                          <FormControl className={classes.formControl}>
                            <InputLabel style={{ paddingLeft: 15 }}>
                              {line.item.product?.attributes?.[0]?.name ||
                                "Variante"}
                            </InputLabel>
                            <Select
                              id={"variant " + index}
                              variant="outlined"
                              value={line.item.product?.selection?.name || ""}
                              onChange={(e) => handleVariantSelect(e, line.id)}
                            >
                              {line.item.product.variants.map((variant) => (
                                <MenuItem
                                  key={variant._id}
                                  value={variant.name}
                                >
                                  {variant.attributes[1] !== undefined
                                    ? `${variant.name} ${variant.attributes[1].value}`
                                    : variant.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}

                      {selectedPrixer?.username === undefined &&
                        typeof line.item.product.discount === "string" && (
                          <Typography
                            style={{ paddingTop: 5, fontSize: "12px" }}
                            color="secondary"
                          >
                            Este producto tiene aplicado un descuento de
                            {discounts?.find(
                              ({ _id }) => _id === line.item.product.discount
                            )?.type === "Porcentaje"
                              ? " %" +
                                discounts?.find(
                                  ({ _id }) =>
                                    _id === line.item.product.discount
                                )?.value
                              : discounts?.find(
                                  ({ _id }) =>
                                    _id === line.item.product.discount
                                )?.type === "Monto" &&
                                " $" +
                                  discounts?.find(
                                    ({ _id }) =>
                                      _id === line.item.product.discount
                                  )?.value}
                          </Typography>
                        )}

                      {line.item.art &&
                        surcharges.map((sur) => {
                          const prixerUsername = line.item?.art?.prixerUsername;
                          const owner = line.item?.art?.owner;

                          if (
                            (prixerUsername &&
                              sur.appliedUsers.includes(prixerUsername)) ||
                            (owner && sur.appliedUsers.includes(owner))
                          ) {
                            return (
                              <Typography
                                style={{ paddingTop: 5, fontSize: "12px" }}
                                color="secondary"
                              >
                                Este arte tiene aplicado un recargo de
                                {sur.type === "Porcentaje" &&
                                  " " + sur.value + "%"}
                                {sur.type === "Monto" && " $" + sur.value}
                                {sur.appliedPercentage === "ownerComission" &&
                                  " sobre la comisión del Prixer/Org"}
                              </Typography>
                            );
                          }
                        })}
                    </div>
                  </div>
                </Grid2>
                <Grid2 size={{ xs: 6 }} style={{ display: "flex" }}>
                  <div
                    style={{
                      backgroundColor: "#eeeeee",
                      width: 120,
                      height: 120,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 20,
                    }}
                  >
                    {line.item.art && (
                      <Img
                        placeholder="/imgLoading.svg"
                        style={{
                          backgroundColor: "#eeeeee",
                          maxWidth: 120,
                          maxHeight: 120,
                          borderRadius: 10,
                        }}
                        src={
                          line.item.art
                            ? line.item.art.title === "Personalizado"
                              ? "/apple-touch-icon-180x180.png"
                              : line.item.art?.squareThumbUrl
                            : ""
                        }
                        debounce={1000}
                        cache
                        error="/imgError.svg"
                        alt={line.item.art && line.item.art.title}
                        id={line.item.art && line.item.art?.artId}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <FormControl
                        className={classes.formControl}
                        style={{
                          marginBottom: 10,
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <InputLabel style={{ paddingLeft: 15 }}>
                          {line.item.art ? "Prixer" : "Selecciona un Prixer"}
                        </InputLabel>
                        <Select
                          value={selectedArtist[index] || ""}
                          variant="outlined"
                          onChange={(e) =>
                            changeArtistFilter(e.target.value as string, index)
                          }
                          style={{ width: 180, marginRight: 10 }}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          {artist.map((username) => (
                            <MenuItem key={username} value={username}>
                              {username}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{
                          marginBottom: 10,
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <InputLabel style={{ paddingLeft: 15 }}>
                          {line.item.art ? "Arte" : "Agrega un arte"}
                        </InputLabel>
                        <Select
                          value={line.item?.art?.title?.substring(0, 22) || ""}
                          id={"Art " + index}
                          variant="outlined"
                          onChange={(e) =>
                            handleArtSelect(e.target.value, line.id)
                          }
                          style={{ width: 210 }}
                        >
                          {(selectedArtist[index]
                            ? filteredArtList
                            : artList
                          ).map((art) => (
                            <MenuItem key={art.artId} value={art.artId}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Img
                                  placeholder="/imgLoading.svg"
                                  style={{
                                    backgroundColor: "#eeeeee",
                                    maxWidth: 40,
                                    maxHeight: 40,
                                    borderRadius: 3,
                                    marginRight: 10,
                                  }}
                                  src={art?.squareThumbUrl}
                                  debounce={1000}
                                  cache
                                  error="/imgError.svg"
                                  alt={art.title}
                                  id={art?.artId}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                  }}
                                >
                                  {art.title.substring(0, 22)}
                                  {art.comission > 10 && (
                                    <StarOutline
                                      style={{
                                        color: "#d33f49",
                                        marginLeft: "10px",
                                      }}
                                      fontSize="large"
                                    />
                                  )}
                                </div>
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    {line.item.art &&
                      line.item.art.title !== "Personalizado" && (
                        <p
                          style={{
                            fontSize: "12px",
                            marginBottom: 10,
                            marginTop: -2,
                          }}
                        >
                          Arte: {line.item.art?.artId}
                        </p>
                      )}
                    {typeof line.item.product?.discount === "string" && (
                      <Typography
                        style={{
                          fontSize: "12px",
                          marginBottom: 10,
                          marginTop: -2,
                        }}
                        color="secondary"
                      >
                        {(type === "Prixer" &&
                          line.item.art &&
                          selectedConsumer?.username ===
                            line.item.art.prixerUsername) ||
                        (type === "Prixer" &&
                          line.item.art &&
                          selectedConsumer?.username === line.item.art.owner &&
                          line.item.art !== undefined &&
                          line.item.product !== undefined)
                          ? "El cliente es el autor o propietario del arte, su comisión ha sido omitida."
                          : line.item.art !== undefined &&
                            line.item.product !== undefined &&
                            `Este arte tiene una comisión de 
                            ${checkOrgs(line.item.art) ? getCporg(line.item) : line.item.art.comission}% equivalente a $${"XX"}`}
                      </Typography>
                    )}
                    {line.item.product && line.item.art && (
                      <Grid2
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            {/* TO DO: Add price from backend call */}
                            {line.item.product?.priceRange
                              ? getPVPtext(
                                  line.item.product,
                                  currency === "Bs",
                                  conversionRate,
                                  discounts
                                )
                              : formatPriceForUI(
                                  line.item.product?.price || 0,
                                  currency,
                                  conversionRate
                                )}
                          </Typography>
                          <Typography variant="h6">
                            {getFinalPrice(line)}
                          </Typography>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "end",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "25px",
                            }}
                          >
                            Cantidad:
                            <input
                              style={{
                                width: 80,
                                padding: "10px",
                                borderRadius: 4,
                              }}
                              type="number"
                              defaultValue={1}
                              value={line.quantity}
                              min="1"
                              onChange={(e) => {
                                changeQuantity(line.id, e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </Grid2>
                    )}
                  </div>
                </Grid2>
                <Grid2
                  size={{
                    xs: 1,
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "end",
                  }}
                >
                  <Tooltip
                    title="Duplicar item"
                    style={{ height: 40, width: 40 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => copyItem(line.id)}
                      sx={{ color: "gainsboro" }}
                    >
                      <FilterNoneIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title="Eliminar item"
                    style={{ height: 40, width: 40 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        removeOrderLine(line.id, index);
                      }}
                      sx={{ color: "gainsboro" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Grid2>
              </Paper>
            </Grid2>
          );
        })}
      <Grid2
        style={{
          width: "50%",
        }}
      >
        <Paper
          style={{
            padding: 10,
            marginTop: "2px",
            display: "flex",
            justifyContent: "center",
            flexDirection: isMobile ? "column" : "row",
          }}
          elevation={3}
        >
          <FormControl
            className={classes.formControl}
            style={{ width: "100%" }}
          >
            <InputLabel
              id="demo-simple-select-label"
              style={{ paddingLeft: 15 }}
            >
              Agrega un producto
            </InputLabel>
            <Select
              variant="outlined"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={""}
              onChange={(e) => {
                const selectedProduct = productList.find(
                  (p) => p.name === e.target.value
                );
                if (selectedProduct) {
                  handleProduct(selectedProduct);
                }
              }}
            >
              {productList.map((product) => (
                <MenuItem key={product._id} value={product.name}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </Grid2>
    </Grid2>
  );
}
