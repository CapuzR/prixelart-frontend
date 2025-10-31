import React, { useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import world from "world-atlas/countries-110m.json";
import { Order } from "types/order.types";

const countryCentroids: Record<string, [number, number]> = {
  Venezuela: [-66.9, 10.48],
  "United States": [-95.71, 37.09],
  Colombia: [-74.07, 4.71],
  Spain: [-3.7, 40.41],
  Panama: [-80.78, 8.53],
  Chile: [-71.54, -35.67],
  Mexico: [-99.13, 19.43],
  Peru: [-77.04, -12.04],
  Argentina: [-63.61, -38.41],
};

interface GeoChartProps {
  orders: Order[];
  loading: boolean;
}

const GeoChart: React.FC<GeoChartProps> = ({ orders, loading }) => {
  const geoData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((order) => {
      const country = order.shipping?.address?.address?.country;
      if (country) {
        const name = country.trim();
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => {
        const coords = countryCentroids[name];
        return coords ? { name, count, coordinates: coords } : null;
      })
      .filter(Boolean) as {
      name: string;
      count: number;
      coordinates: [number, number];
    }[];
  }, [orders]);

  const maxCount = Math.max(...geoData.map((d) => d.count), 0);

  return (
    <Box sx={{ height: 500, display: "flex", flexDirection: "column" }}>
      {loading ? (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <ComposableMap
          projection="geoMercator"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={[-65, 15]} zoom={2.5}>
            <Geographies geography={world}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEC"
                    stroke="#D6D6DA"
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#F53", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {geoData.map(({ name, count, coordinates }) => {
              const size = 5 + (count / maxCount) * 20;
              return (
                <Marker key={name} coordinates={coordinates}>
                  <g
                    fill="rgba(255, 83, 83, 0.8)"
                    stroke="#D13B3B" // Darker stroke for contrast
                    strokeWidth="1"
                    transform={`translate(-${size / 2}, -${size / 2})`}
                  >
                    <circle cx={size / 2} cy={size / 2} r={size / 2} />
                    <text
                      textAnchor="middle"
                      x={size / 2}
                      y={size / 2 + 4}
                      style={{
                        fontFamily: "system-ui",
                        fill: "#FFFFFF", // Changed to white
                        fontSize: size / 1.8, // Slightly smaller to fit better
                        fontWeight: "bold",
                        pointerEvents: "none",
                      }}
                    >
                      {count}
                    </text>
                  </g>
                  <text
                    textAnchor="middle"
                    y={-size / 2 - 5}
                    style={{
                      fontFamily: "system-ui",
                      fill: "#5D5A6D",
                      fontSize: 10,
                    }}
                  >
                    {name}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      )}
    </Box>
  );
};

export default GeoChart;
