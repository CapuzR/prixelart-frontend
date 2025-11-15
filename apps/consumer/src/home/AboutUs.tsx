import { useTheme } from "@mui/material/styles";

import Grid2 from "@mui/material/Grid";
import useMediaQuery from "@mui/material/useMediaQuery";

import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import aboutUsBg from "@public/images/about-us-bg.jpg";
import aboutUs1 from "@public/images/about-us-1.png";
import aboutUs2 from "@public/images/about-us-2.png";
import aboutUs3 from "@public/images/about-us-3.png";

export default function AboutUs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const allImgs = [aboutUs1, aboutUs2, aboutUs3];

  return (
    <Grid2
      container
      padding={isMobile ? 4 : 10}
      spacing={isMobile ? 1 : 5}
      sx={{
        height: "min-content",
        minHeight: "100vh",
        width: "100vw",
        background: isMobile
          ? `url(${aboutUsBg}) top left / cover no-repeat transparent`
          : `url(${aboutUsBg}) top / 100% 100% no-repeat transparent`,
        "& p": {
          color: "white",
        },
      }}
    >
      <Grid2
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          gap: isMobile ? 4 : 8,
        }}
      >
        <Grid2
          size={{ xs: 12, md: 7 }}
          sx={{
            display: "flex",
            gap: isMobile ? 1 : 3,
            height: "min-content",
            order: isMobile ? 2 : 1,
          }}
        >
          {allImgs.map((img, i) => (
            <img
              style={{
                width: "100%",
                height: isMobile ? "30vh" : "55vh",
                objectFit: "cover",
                borderRadius: "1rem",
                objectPosition: "right",
                marginTop: i % 2 === 0 ? "0" : isMobile ? "20px" : "4rem",
              }}
              src={img}
              alt="Box"
            />
          ))}
        </Grid2>
        <Grid2
          size={{ xs: 12, md: 5 }}
          sx={{
            order: isMobile ? 1 : 2,
            display: "flex",
            justifyContent: "center",
            gap: isMobile ? 4 : 10,
            height: "fit-content",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: "700",
              textTransform: "uppercase",
              fontFamily: "Futura, sans-serif",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            ¿Qué es Prixelart?
          </Typography>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              p: isMobile ? 0 : "0 1rem",
              color: "white",
              fontWeight: "400",
              textAlign: "center",
              fontFamily: "Ubuntu, sans-serif",
            }}
          >
            Prixelart es una empresa dedicada a impulsar el talento nacional de
            artistas plásticos, fotógrafos y diseñadores. Vendiendo artículos
            decorativos y utilitarios con las artes de nuestros prixers.{" "}
          </Typography>
          <Button
            variant="outlined"
            size="large"
            sx={{
              color: "#fff",
              textAlign: "center",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderColor: "white",
              fontFamily: "Futura, sans-serif",
              fontStyle: "italic",
              fontWeight: "700",
            }}
          >
            Nosotros
          </Button>
        </Grid2>
      </Grid2>
    </Grid2>
  );
}
