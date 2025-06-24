//--- File: src/apps/admin/sections/dashboard/components/GeoChart.tsx ---

import React, { useMemo } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
// You already correctly identified this as the right package.
import world from 'world-atlas/countries-110m.json'; 
import { Order } from 'types/order.types';

// Pre-calculated country centroids for placing markers.
const countryCentroids: Record<string, [number, number]> = {
  Venezuela: [-66.9, 10.48],
  'United States': [-95.71, 37.09],
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
    orders.forEach(order => {
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
      .filter(Boolean) as { name: string; count: number; coordinates: [number, number] }[];
  }, [orders]);

  const maxCount = Math.max(...geoData.map(d => d.count), 0);

  return (
    // --- INCREASED THE HEIGHT FOR MORE IMPACT ---
    <Paper sx={{ p: 2, height: 600, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Rendimiento Geográfico por Órdenes
      </Typography>

      {loading ? (
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <ComposableMap projection="geoMercator" style={{ width: '100%', height: '100%' }}>
          {/* --- ADJUSTED CENTER AND ZOOM PROPS --- */}
          <ZoomableGroup center={[-65, 15]} zoom={2.5}>
            <Geographies geography={world}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEC"
                    stroke="#D6D6DA"
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#F53', outline: 'none' },
                      pressed: { outline: 'none' },
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
                    fill="rgba(255, 83, 83, 0.7)"
                    stroke="#FF5353"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform={`translate(-${size / 2}, -${size / 2})`}
                  >
                    <circle cx={size / 2} cy={size / 2} r={size / 2} />
                    <text
                      textAnchor="middle"
                      x={size / 2}
                      y={size / 2 + 4}
                      style={{
                        fontFamily: 'system-ui',
                        fill: '#fff',
                        fontSize: size / 2,
                        fontWeight: 'bold',
                      }}
                    >
                      {count}
                    </text>
                  </g>
                  <text
                    textAnchor="middle"
                    y={-size / 2 - 5}
                    style={{ fontFamily: 'system-ui', fill: '#5D5A6D', fontSize: 10 }}
                  >
                    {name}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      )}
    </Paper>
  );
};

export default GeoChart;