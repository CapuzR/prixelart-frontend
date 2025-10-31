import { useState, useEffect } from "react";
import axios from "axios";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryLabel,
  VictoryTheme,
} from "victory";
import ArtsGrid from "@apps/consumer/art/components/ArtsGrid/ArtsGrid";
import { useSnackBar, useLoading } from "@context/GlobalContext";
import { Art } from "../../../../../types/art.types";
import { getArtBestSellers, getArtBestSellers2, getArts } from "../api";
import { ObjectId } from "mongodb";

export default function ArtBestSellers() {
  const { showSnackBar } = useSnackBar();
  const { setLoading } = useLoading();

  const [arts, setArts] = useState<Art[]>([]);
  const [bestSellers, setBestSellers] = useState<Art[]>([]);
  const [mostSellers, setMostSellers] = useState<Art[]>([]);

  const addMostSellerToBestSeller = (selectedMostSeller: string) => {
    const artv1 =
      arts && arts.find((art: Art) => art.title === selectedMostSeller);
    if (
      (artv1 !== undefined && bestSellers?.length === 0) ||
      (artv1 !== undefined && bestSellers === undefined)
    ) {
      setBestSellers([artv1]);
    } else if (bestSellers?.some((art) => art.title === selectedMostSeller)) {
      const withoutArt = bestSellers.filter(
        (art) => art.title !== selectedMostSeller,
      );
      setBestSellers(withoutArt);
      showSnackBar("Arte eliminado del banner.");
    } else if (bestSellers && bestSellers.length === 9) {
      showSnackBar("Has alcanzado el máximo de Artes a mostrar (9 artes).");
    } else if (artv1) {
      setBestSellers([...bestSellers, artv1]);
    }
  };

  const getAllArts = async () => {
    try {
      const artsResponse = await getArts();
      setArts(artsResponse);
    } catch (error) {
      console.log(error);
    }
  };

  const getMostSellers = async () => {
    try {
      const mostSellersResponse = await getArtBestSellers2();
      setMostSellers(mostSellersResponse);
    } catch (error) {
      console.log(error);
    }
  };

  const getBestSellers = async () => {
    try {
      const bestSellersResponse = await getArtBestSellers();
      if (bestSellersResponse && bestSellersResponse.data) {
        setBestSellers(bestSellersResponse.data.arts);
      } else {
        setBestSellers([]);
      }
    } catch (error) {
      console.log(error);
      setBestSellers([]);
    }
  };

  useEffect(() => {
    let isMounted = true; // Flag to check if component is still mounted

    const fetchData = async () => {
      setLoading(true);
      try {
        // Perform all fetches concurrently
        await Promise.all([getAllArts(), getMostSellers(), getBestSellers()]);
      } catch (error) {
        console.error("Error fetching data in useEffect: ", error);
        // Optionally show a snackbar message for general fetch errors
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup function to set flag to false when component unmounts
    };
  }, [setLoading]); // Added setLoading to dependency array as it's used
  // Consider if getAllArts, getMostSellers, getBestSellers should be memoized with useCallback
  // if they were defined inside the component and used in deps. Here they are stable.

  const updateBestSellers = async () => {
    setLoading(true); // Indicate loading state
    let data: ObjectId[] = [];
    bestSellers.forEach((art) => {
      if (art._id) {
        data.push(art._id);
      }
    });
    const base_url = import.meta.env.VITE_BACKEND_URL + "/updateArtBestSellers";
    try {
      const response = await axios.put(base_url, { data: data });
      showSnackBar(response.data.message);
    } catch (error) {
      console.error("Error updating best sellers:", error);
      showSnackBar("Error al actualizar. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box // Changed from div to Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center", // Added to center children like Paper and VictoryChart container
        width: "100%", // Ensure Box takes full width for centering its content
        "& .MuiTextField-root": {
          margin: 1,
          width: "100%",
          height: "100%",
        },
      }}
    >
      {mostSellers &&
        mostSellers.length > 0 && ( // Check if mostSellers has data
          <Box // Changed from div to Box for consistency, can also be Paper or styled div
            sx={{
              // Using sx for styling this container
              width: "90%",
              maxWidth: "800px", // Optional: constrain max width for very large screens
              height: 350, // Keep height or make it 'auto' based on content
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid gainsboro",
              borderRadius: "10px",
              mb: 1.25,
              alignSelf: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "#404e5c", mt: 3.75, mb: 1 }}>
              {" "}
              {/* mt: 30px -> 3.75, mb for spacing */}
              Artes más vendidos en el último año
            </Typography>
            <VictoryChart
              theme={VictoryTheme.material}
              padding={{ top: 20, bottom: 60, left: 40, right: 40 }} // Adjusted padding for better axis label visibility
              // horizontal // Keeping horizontal as per original
              // width={600} // Consider setting explicit width/height for chart if needed
              // height={300}
              domainPadding={{ x: 20 }} // Add some padding to the domain
            >
              <VictoryAxis
                tickFormat={(t) =>
                  typeof t === "string" && t.length > 15
                    ? `${t.substring(0, 15)}...`
                    : t
                } // Truncate long labels
                style={{
                  tickLabels: { fontSize: 8, angle: -35, textAnchor: "end" },
                }} // Style tick labels for readability
              />
              <VictoryAxis dependentAxis />
              <VictoryBar
                data={mostSellers}
                x="name"
                y="quantity"
                style={{
                  data: { fill: "#d33f49", width: 20 }, // Adjusted width
                }}
                alignment="middle" // Changed from start for better centering if multiple bars
                animate={{
                  duration: 2000,
                  onLoad: { duration: 1000 },
                }}
                labels={({ datum }) => datum.quantity}
                labelComponent={
                  <VictoryLabel
                    dx={0} // Adjust dx, dy for label positioning on horizontal bars
                    dy={-10} // Example adjustment
                    style={[{ fill: "white", fontSize: 12 }]} // Adjusted fontSize
                  />
                }
                events={[
                  {
                    target: "data",
                    eventHandlers: {
                      onClick: (event, { datum }) => {
                        // Pass event and datum correctly
                        return [
                          {
                            target: "data", // Ensure target is 'data' or 'labels' as appropriate
                            mutation: () => {
                              // Simpler mutation syntax
                              addMostSellerToBestSeller(datum.name);
                            },
                          },
                        ];
                      },
                    },
                  },
                ]}
              />
            </VictoryChart>
          </Box>
        )}
      <Paper
        sx={{
          padding: 2,
          margin: "auto",
          height: "auto", // Changed to auto to accommodate content
          minHeight: 160, // Use minHeight if a minimum is desired
          width: "90%",
          maxWidth: "800px", // Optional: constrain max width
          backgroundColor: "gainsboro",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          mt: 2, // Add some margin top for separation
        }}
        elevation={3}
      >
        <Typography variant="h6" sx={{ color: "#404e5c", mb: 1.5 }}>
          {" "}
          {/* mb for spacing */}
          Banner de la pantalla principal
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1.25,
          }}
        >
          {" "}
          {/* gap for spacing, flexWrap */}
          {bestSellers !== undefined && bestSellers.length > 0 ? (
            bestSellers.map(
              (
                art, // Removed index i as key if art._id is reliable
              ) => (
                <Box
                  key={art._id?.toString()}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      backgroundImage:
                        (art.largeThumbUrl &&
                          `url(${art.largeThumbUrl.replace(" ", "_")})`) ||
                        (art.thumbnailUrl &&
                          `url(${art.thumbnailUrl.replace(" ", "_")})`) ||
                        "none", // Fallback background
                      width: 100,
                      height: 100,
                      backgroundSize: "cover",
                      backgroundPosition: "center", // Ensure image is centered
                      borderRadius: "10px", // Or theme.shape.borderRadius
                      cursor: "pointer",
                      border:
                        art.largeThumbUrl || art.thumbnailUrl
                          ? "none"
                          : "1px dashed grey", // Placeholder if no image
                      "&:hover": {
                        // Add hover effect
                        opacity: 0.8,
                      },
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      addMostSellerToBestSeller(art.title);
                    }}
                    aria-label={`Select ${art.title}`} // Accessibility
                    role="button"
                  />
                  <Typography
                    variant="caption" // Smaller text for titles
                    sx={{
                      color: "#404e5c",
                      textAlign: "center",
                      width: 100,
                      mt: 0.5, // Margin top for spacing from image
                      overflowWrap: "break-word",
                      lineHeight: 1.2, // Adjust line height for multi-line
                      maxHeight: "2.4em", // Limit to two lines (approx)
                      overflow: "hidden", // Hide overflow text
                      textOverflow: "ellipsis", // Show ellipsis (might need display block/inline-block)
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {art.title}{" "}
                    {/* Display full title, CSS will handle truncation */}
                  </Typography>
                </Box>
              ),
            )
          ) : (
            <Typography
              variant="h4"
              sx={{
                color: "#404e5c",
                textAlign: "center",
                p: 2, // Add some padding
              }}
              fontWeight="bold"
            >
              No tienes artes seleccionados aún
            </Typography>
          )}
        </Box>
      </Paper>
      <Grid2 sx={{ mt: 2.5, width: "90%", maxWidth: "800px" }}>
        {" "}
        {/* Ensure ArtsGrid is also centered/constrained */}
        <ArtsGrid />
      </Grid2>

      {/* Assuming 'permissions' is a state or prop:
      {permissions?.modifyBestSellers && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
          <Button // Make sure Button is imported from @mui/material
            variant="contained"
            color="primary"
            // type="submit" // Not a form submit, onClick is used
            size="small"
            onClick={updateBestSellers}
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </Box>
      )}
      */}
    </Box>
  );
}
