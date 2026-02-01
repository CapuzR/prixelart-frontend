import { useTheme } from "@mui/material/styles";

import Grid2 from "@mui/material/Grid";
import Link from "@mui/material/Link";
import useMediaQuery from "@mui/material/useMediaQuery";

import { IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Copyright from "@components/Copyright/copyright";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import footerBg from "../../../assets/images/footer-bg-desk.jpg";
import prixBox from "../../../assets/images/prix-box.png";
import tiktok from "../../../assets/images/tiktok.svg";
import {generateWaMessage} from "utils/utils";

export default function FooterSection() {
  const navigate = useNavigate();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const allLinks = [
    [
      {
        text: "Productos",
      },
      // {
      //   text: "Nosotros",
      //   url: "/nosotros",
      // },
      // {
      //   text: "Categorías",
      //   url: "/productos/categorias",
      // },
      {
        text: "Productos",
        url: "/productos",
      },
      // {
      //   text: "Colecciones",
      //   url: "/productos/colecciones",
      // },
      {
        text: "Lo último",
        url: "/productos",
      },
    ],
    // [
    //   {
    //     text: "Nosotros",
    //   },
    //   {
    //     text: "Filosofía",
    //     url: "/nosotros/filosofía",
    //   },
    //   {
    //     text: "Proceso",
    //     url: "/nosotros/proceso",
    //   },
    //   {
    //     text: "Trayectoria",
    //     url: "/nosotros/trayectoria",
    //   },
    //   {
    //     text: "Prixers",
    //     url: "/nosotros/prixers",
    //   },
    // ],
    [
      {
        text: "Galería",
      },
      {
        text: "Prixers",
        url: "/prixers",
      },
      {
        text: "Artes",
        url: "/galeria",
      },
      {
        text: "Inscríbete",
        url: "/registrar",
      },
    ],
    // [
    //   {
    //     text: "Tienda",
    //   },
    //   {
    //     text: "Productos",
    //     url: "/productos",
    //   },
    // {
    //   text: "Especificaciones",
    // },
    // {
    //   text: "Personaliza",
    // },
    // {
    //   text: "Relacionados",
    // },
    // ],
    [
      {
        text: "Contacto",
        url: "/contacto",
      },
      {
        text: "Horario",
        // url: "/horario",
      },
      {
        text: "Ubicación",
        url: "https://maps.app.goo.gl/LWti7YfsPFkWVaLd8",
      },
    ],
  ];

  const handleLinkClick = (url: any) => (event: any) => {
    event.preventDefault();
    if (url) {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        navigate(url);
      }
    }
  };

  return (
    <Grid2
      container
      padding={isMobile ? 2 : 16}
      spacing={isMobile ? 1 : 8}
      sx={{
        height: "max-content",
        background: isMobile
          ? `url(${footerBg}) top right / cover no-repeat transparent`
          : `url(${footerBg}) top / cover no-repeat transparent`,
        "& p": {
          color: "white",
        },
        paddingTop: isMobile ? 2 : 15,
        // gap: isMobile ? 2 :
        // paddingBottom: isMobile ? 3 : 0,
      }}
    >
      <Grid2
        size={{ xs: 12, sm: 3 }}
        sx={{ height: "min-content", marginTop: isMobile ? 2 : 0 }}
      >
        <img
          style={{
            width: "100%",
            height: isMobile ? "100px" : "auto",
            objectFit: "contain",
          }}
          src={prixBox}
          alt="Box"
        />
      </Grid2>
      <Grid2
        size={{ xs: 12, sm: 8.5 }}
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          height: "auto",
          flexDirection: "column",
        }}
      >
        <Grid2
          container
          sx={{
            display: "flex",
            gap: isMobile ? 0 : 1,
            height: "fit-content",
            justifyContent: isMobile ? "center" : "space-between",
          }}
        >
          {allLinks.map((columnLinks, colIndex) => (
            <Grid2
              size={{ xs: 4, sm: 2.4 }}
              key={colIndex}
              sx={{
                gap: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {columnLinks.map((link, linkIndex) => (
                <Typography
                  key={`${colIndex}-${linkIndex}`}
                  variant={linkIndex === 0 ? "h6" : "body2"}
                  sx={{
                    color: linkIndex === 0 ? "white" : "inherit",
                    fontWeight: linkIndex === 0 ? "400" : "300",
                    // marginBottom: linkIndex === 0 ? 1 : 0,
                    marginTop:
                      isMobile && linkIndex === 1 ? 1 : linkIndex === 1 ? 2 : 0,
                    textTransform: "uppercase",
                    justifyContent: "center",
                    fontFamily: "Ubuntu, sans-serif",
                  }}
                >
                  <Link
                    href={link.url}
                    onClick={handleLinkClick(link.url)}
                    color="inherit"
                    sx={{
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {link.text}
                  </Link>
                </Typography>
              ))}
            </Grid2>
          ))}
        </Grid2>
        <Grid2
          sx={{
            padding: isMobile ? 0 : 3,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            margin: isMobile ? "auto" : 0,
          }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.0137146357715!2d-66.79591852237525!3d10.499584637532607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a57720849cba1%3A0xcde4fd59e5307907!2sPrixelart%20C.A.!5e0!3m2!1ses!2sve!4v1751474653621!5m2!1ses!2sve"
            width={isMobile ? "320" : "60%"}
            height="100%"
            style={{
              border: 0,
              borderRadius: 20,
              minHeight: isMobile ? 150 : 250,
            }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <Grid2
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: isMobile ? "center" : "end",
              // marginTop: isMobile ? 2 : 0,
              margin: isMobile ? "2rem 0" : 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "normal",
                marginBottom: 1,
                textTransform: "uppercase",
                justifyContent: "center",
                fontFamily: "Ubuntu, sans-serif",
              }}
            >
              ¡Síguenos para más!
            </Typography>
            <Grid2>
            {/*    <IconButton
                href="https://instagram.com/prixelart"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={tiktok}
                  style={{ color: "#fff", height: "2.5rem", width: "2.5rem" }}
                />
              </IconButton> */}
              <IconButton
                href="https://instagram.com/prixelart"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon
                  sx={{ color: "white", height: "2.5rem", width: "2.5rem" }}
                />
              </IconButton>
              <IconButton
                onClick={() => {
                  window.open(generateWaMessage(), "_blank",);
                }}
              >
                <WhatsAppIcon
                  sx={{ color: "white", height: "2.5rem", width: "2.5rem" }}
                />
              </IconButton>
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
      <Grid2
        sx={{
          width: "100%",
          justifyContent: "center",
          color: "white",
          height: "fit-content",
          mb: isMobile ? "2rem" : 0,
        }}
      >
        <Copyright />
      </Grid2>
    </Grid2>
  );
}
