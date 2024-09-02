import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Carousel from "react-material-ui-carousel";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import AddShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import MaximizeIcon from "@material-ui/icons/Maximize";
import MDEditor from "@uiw/react-md-editor";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { getPrice } from "../shoppingCart/pricesFunctions.js";
import { getPVPtext, getPVMtext } from "../shoppingCart/pricesFunctions.js";

export default function ProductCard(props) {

    const {
        tile,
        iProd,
        productsArr,
        setTiles,
        width,
        height,
        showFullDescription,
        toggleDescription,
        setProductAtts,
        setSecondProductAtts,
        addingToCart,
        utils,
        classes,
        currency,
        discountList 
    } = props;

    // useEffect(() => {
    //     if(iProd == 0) {
    //         console.log("tileESTA", tile);
    //     }
    // }, [tile]);

    const priceSelect = (item) => {
        if (item.selectedVariant) getPrice(item);
        // if (
        // JSON.parse(localStorage.getItem("token")) &&
        // JSON.parse(localStorage.getItem("token"))?.username
        // ) {
        // return getPVMtext(item, currency, props.dollarValue, discountList);
        // } else {
        // return getPVPtext(item, currency, props.dollarValue, discountList);
        // }
    };

    //VOY POR AQUII!!!! FALTA VER SI LA IMAGEN FUNCIONA + DESCOMENTAR Y ACOMODAR LOS ATRIBUTOS.
    //AL ELEGIR ATRIBUTOS, SE DEBE LLAMAR AL BACK PARA TRAER LA VARIANTE CORRECTA, con el price.
    //EL DROPDOWN DE ATRIBUTOS DEBERIA ESTAR EN OTRO ARCHIVO.
    return (
        <Card
            className={classes.root}
            id={tile.name}
            style={{
                transition:
                tile.name === props.pointedProduct &&
                "box-shadow 0.3s ease-in-out",
                boxShadow:
                tile.name === props.pointedProduct &&
                " 0 0 10px 3px #d33f49",
            }}
        >
            <CardMedia style={{ width: "110%" }}>
                <Carousel
                autoPlay={false}
                stopAutoPlayOnHover={true}
                animation="slide"
                duration={500}
                fullHeightHover={true}
                IndicatorIcon={<MaximizeIcon />}
                NextIcon={<ArrowForwardIosIcon />}
                PrevIcon={<ArrowBackIosIcon />}
                activeIndicatorIconButtonProps={{
                    style: {
                    color: "#d33f49",
                    },
                }}
                navButtonsProps={{
                    style: {
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    color: "#d33f49",
                    width: "98%",
                    height: "100vh",
                    marginTop: "-50vh",
                    borderRadius: "0",
                    marginLeft: "1px",
                    },
                }}
                indicatorContainerProps={{
                    style: {
                    position: "absolute",
                    marginTop: "-17px",
                    },
                }}
                >
                {/* {
                typeof tile.selection[0] === "string" &&
                typeof tile.variants[0]?.variantImage === "object" &&
                //Alguna vez entra acá? Siento que nunca entra porque tile.selection siempre es un string
                //Entonces al agarrar tile.selection[0] toma la primera letra.
                tile.variants.find(
                    ({ name }) => name === tile.selection[0]
                ) ? (
                    tile.variants
                    .find(({ name }) => name === tile.selection[0])
                    .variantImage.map((img, key_id) =>
                        img.type === "images" ? (
                        <img
                            key={key_id}
                            src={img.url} 
                            className={classes.img}
                            alt="variant"
                            style={{ borderRadius: 30 }}
                        />
                        ) : (
                        img.type === "video" &&
                        img.url !== null && (
                            <span
                            key={"video"}
                            style={{ width: "100%", borderRadius: 30 }}
                            dangerouslySetInnerHTML={{
                                __html: img.url,
                            }}
                            />
                        )
                        )
                    )
                ) : tile.sources.images &&
                    tile.sources.images[0] !== undefined ? (
                    tile?.sources?.images?.map((img, i) =>
                    img.url !== null && img.type === "images" ? (
                        <img
                        key={i}
                        src={img.url?.replace(/[,]/gi, "") || tile.thumbUrl}
                        className={classes.img}
                        alt="product.png"
                        style={{ borderRadius: 30 }}
                        />
                    ) : (
                        img.type === "video" &&
                        img.url !== null && (
                        <span
                            key={"video"}
                            style={{ width: "100%", borderRadius: 30 }}
                            dangerouslySetInnerHTML={{
                            __html: img.url,
                            }}
                        />
                        )
                    )
                    )
                ) : (
                    <img
                    src={tile.thumbUrl}
                    className={classes.img}
                    alt="*"
                    style={{ borderRadius: 30 }}
                    />
                )} */}
                </Carousel>
            </CardMedia>

            <CardContent
                data-color-mode="light"
                style={{ alignContent: "space-between" }}
            >
                <Typography
                gutterBottom
                style={{ padding: 0, marginBotom: 12, width: 10 }}
                variant="h5"
                component="h2"
                >
                {tile.name}
                </Typography>
                <Typography
                gutterBottom
                style={{ fontSize: 15, padding: 0, marginBottom: 15 }}
                variant="h5"
                component="h2"
                >
                {tile.priceRange && "Precio: $" + tile?.priceRange?.from + " - " + tile?.priceRange?.to}
                </Typography>
                <MDEditor.Markdown
                source={
                    showFullDescription[iProd]
                    ? tile.description
                    : tile.description.split("\r\n")[0].length > 130
                    ? `${tile.description
                        .split("\r\n")[0]
                        .slice(0, 130)}...`
                    : `${tile.description.split("\r\n")[0]}`
                }
                style={{ whiteSpace: "pre-wrap" }}
                />
                {tile.description.length > 130 && (
                <Button
                    style={{
                    color: "dimgray",
                    }}
                    onClick={() => toggleDescription(iProd)}
                >
                    {showFullDescription[iProd] ? "Ver menos" : "Ver más"}
                </Button>
                )}

                {tile.productionTime && (
                <div
                    style={{
                    fontFamily:
                        "apple-system, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
                    fontSize: 16,
                    lineHeight: 1.5,
                    wordWrap: "break-word",
                    }}
                >
                    Tiempo de producción estimado: {tile.productionTime}{" "}
                    {tile.productionTime == 1 ? "día." : "días."}
                </div>
                )}
            </CardContent>
            {/* {tile.attributes &&
                tile.attributes.map((att, iAtt, attributesArr) =>
                iAtt === 0 ? (
                    <CardActions key={iAtt} style={{ width: "50%" }}>
                    <Grid item xs={12} sm={12} md={12}>
                        <FormControl
                        variant="outlined"
                        className={classes.form}
                        xs={12}
                        sm={12}
                        md={12}
                        >
                        <InputLabel required id="att.name">
                            {att.name}
                        </InputLabel>
                        <Select
                            value={tile.selection && tile.selection[0]}
                            onChange={async (e) => {
                                console.log("e.target.value", e.target.value);
                                console.log("tile.variants", tile.variants);
                            const selectedVariant = tile.variants.find((v)=>{ return v.attributes[0].value == e.target.value});
                            console.log("LOCO", selectedVariant);
                            const pAtts = await setProductAtts(
                                e.target.value,
                                attributesArr,
                                iProd,
                                iAtt,
                                productsArr,
                                width,
                                height,
                                selectedVariant
                            );
                            if (pAtts) {
                                setTiles(
                                pAtts.pAtt
                                    ? [...pAtts.pAtt]
                                    : [...pAtts.att]
                                );
                            }
                            }}
                            label={att.selection}
                        >
                            <MenuItem value={undefined}>
                            <em></em>
                            </MenuItem>
                            {att.value &&
                            att.value.map((n, i) => (
                                <MenuItem key={n} value={n}>
                                {n}
                                </MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                    </Grid>
                    </CardActions>
                ) : (
                    tile.selection[0] !== undefined && (
                    <CardActions key={1} style={{ width: "50%" }}>
                        <Grid item xs={12} sm={12} md={12}>
                        <FormControl
                            variant="outlined"
                            className={classes.form}
                            xs={12}
                            sm={12}
                            md={12}
                        >
                            <InputLabel required id="att.name">
                            {att.name}
                            </InputLabel>
                            <Select
                            value={tile.selection[1] && tile.selection[1]}
                            onChange={async (e) => {
                                const pAtts = await setSecondProductAtts(
                                e.target.value,
                                attributesArr,
                                iProd,
                                iAtt,
                                productsArr,
                                width,
                                height
                                );
                                if (pAtts) {
                                setTiles(
                                    pAtts.pAtt
                                    ? [...pAtts.pAtt]
                                    : [...pAtts.att]
                                );
                                }
                            }}
                            label={att.selection}
                            >
                            <MenuItem value={undefined}>
                                <em></em>
                            </MenuItem>
                            {tile.variants?.map(
                                (variant) =>
                                (variant?.attributes[0].value ===
                                    tile.selection ||
                                    variant?.attributes[0].value ===
                                    tile.selection[0]) && (
                                    <MenuItem
                                    key={variant?._id}
                                    value={variant?.attributes[1]?.value}
                                    >
                                    {variant?.attributes[1]?.value}
                                    </MenuItem>
                                )
                            )}
                            </Select>
                        </FormControl>
                        </Grid>
                    </CardActions>
                    )
                )
                )} */}

            {/* <CardActions>
                {tile.variants &&
                tile.variants.map((v) => {
                    if (v.attributes) {
                    const test = v.attributes.reduce((r, a) => {
                        return a.name in tile.attributes === true;
                    }, true);
                    }
                })}
            </CardActions> */}
            <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                xl={12}
                style={{ display: "flex", justifyContent: "space-between" }}
            >
                <Button
                disabled={
                    (tile.attributes[0] !== undefined &&
                    tile.selection[0] === undefined) ||
                    (tile.attributes.length === 2 &&
                    typeof tile.selection === "string")
                    ? true
                    : false
                }
                size="small"
                color="primary"
                onClick={(e) => {
                    addingToCart(e, tile);
                }}
                >
                <AddShoppingCartIcon />
                Agregar
                </Button>
                <CardActions>
                <Button
                    size="small"
                    color="primary"
                    onClick={(e) => {
                    window.open(
                        utils.generateWaProductMessage(tile),
                        "_blank"
                    );
                    }}
                >
                    Información <WhatsAppIcon />
                </Button>
                </CardActions>
            </Grid>
        </Card>)
}