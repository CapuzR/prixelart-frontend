import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import PerformanceTable, { PerformanceData } from "./PerformanceTable";
import PerformanceBarChart from "./PerformanceBarChart";
import SearchIcon from "@mui/icons-material/Search";

interface PerformanceWidgetProps {
  title: string;
  data: PerformanceData[];
  loading: boolean;
  isProductData?: boolean;
  isPrixer?: boolean;
  isArt?: boolean;
}

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({
  title,
  data,
  loading,
  isProductData = false,
  isPrixer = false,
  isArt = false,
}) => {
  const [metric, setMetric] = useState<"sales" | "units">("sales");
  const [searchTerm, setSearchTerm] = useState("");

  const handleMetricChange = (
    _: React.MouseEvent<HTMLElement>,
    newMetric: "sales" | "units" | null,
  ) => {
    if (newMetric) setMetric(newMetric);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data;
    }
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        {title}
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={2}
        flexWrap="wrap"
        gap={2}
      >
        <TextField
          label="Buscar..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup
          value={metric}
          exclusive
          onChange={handleMetricChange}
          size="small"
        >
          <ToggleButton value="sales">Ventas ($)</ToggleButton>
          <ToggleButton value="units">Unidades</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <PerformanceBarChart
        data={filteredData}
        metric={metric}
        loading={loading}
        title={`Top 10 por ${metric === "sales" ? "Ingresos" : "Unidades"}`}
      />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ flexGrow: 1 }}>
        <PerformanceTable
          data={filteredData}
          metric={metric}
          loading={loading}
          isProduct={isProductData}
          isPrixer={isPrixer}
          isArt={isArt}
        />
      </Box>
    </Paper>
  );
};

export default PerformanceWidget;
