// src/apps/admin/sections/surcharges/views/ReadSurcharges.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Toolbar,
  TablePagination,
  TableSortLabel, // Added components
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"; // For overrides/recipients indicator
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined"; // For recipients indicator

// Hooks, Types, Context, API
import { useSnackBar } from "@prixpon/context/GlobalContext";
// Make sure Surcharge type includes ObjectId if it comes from MongoDB
import {
  Surcharge,
  AdjustmentMethod,
  ApplicableEntity,
} from "@prixpon/types/surcharge.types"; // Use Surcharge type & related types
import { getSurcharges, deleteSurcharge } from "@prixpon/api-client/surcharge.api"; // Use Surcharge API functions
import Title from "@apps/admin/components/Title";
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog";
import { ObjectId } from "bson"; // Assuming BSON ObjectId is used

// --- Sorting Helper Functions (Copied from ReadDiscounts) ---

function descendingComparator<T>(
  a: T,
  b: T,
  orderBy: keyof T | string,
): number {
  const bValue = getNestedValue(b, orderBy as string);
  const aValue = getNestedValue(a, orderBy as string);

  // Handle different types for comparison
  if (typeof aValue === "string" && typeof bValue === "string") {
    return bValue.localeCompare(aValue);
  }
  if (typeof aValue === "number" && typeof bValue === "number") {
    return bValue - aValue;
  }
  if (typeof aValue === "boolean" && typeof bValue === "boolean") {
    return bValue === aValue ? 0 : bValue ? 1 : -1;
  }
  // Fallback for dates or mixed types (treat null/undefined as lowest)
  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

// Adjusted to handle dateRange.start potentially being null/undefined or needing Date conversion
function getNestedValue(obj: any, path: string): any {
  if (path.startsWith("dateRange.")) {
    const key = path.split(".")[1] as keyof Surcharge["dateRange"];
    const dateVal = obj?.dateRange?.[key];
    // Convert to Date object first for robustness before getTime()
    try {
      return dateVal ? new Date(dateVal).getTime() : null; // Compare timestamps, nulls sort first/last
    } catch {
      return null; // Handle invalid date strings gracefully
    }
  }
  // Direct property access for other fields
  const value = obj[path];
  // Provide consistent fallback for null/undefined during comparison
  return value === null || typeof value === "undefined"
    ? typeof value === "number"
      ? -Infinity
      : ""
    : value;
}

type Order = "asc" | "desc";

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1]; // Maintain original order if comparison is equal
  });
  return stabilizedThis.map((el) => el[0]);
}

// --- Formatting Helper Functions (Adjusted for Surcharge context and consistency) ---
const formatAdjustmentValue = (
  value: number,
  method: AdjustmentMethod,
): string => {
  if (method === "percentage") return `${(value * 100).toFixed(0)}%`; // Assuming value is decimal like 0.10 for 10%
  return `$${value.toFixed(2)}`; // Assuming absolute value is in dollars
};

// Refined formatApplicability to match Discount logic and handle overrides/recipients
const formatApplicability = (surcharge: Surcharge): string => {
  const parts: string[] = [];
  if (surcharge.appliesToAllProducts) parts.push("Todos Productos");
  else if (
    surcharge.applicableProducts &&
    surcharge.applicableProducts.length > 0
  )
    parts.push(`${surcharge.applicableProducts.length} Prod.`);

  if (surcharge.appliestoAllArts) parts.push("Todas Artes");
  else if (surcharge.applicableArts && surcharge.applicableArts.length > 0)
    parts.push(`${surcharge.applicableArts.length} Arte(s)`);

  // Check if *only* entity-specific rules apply (overrides or recipients)
  const onlyEntities =
    parts.length === 0 &&
    ((surcharge.entityOverrides && surcharge.entityOverrides.length > 0) ||
      (surcharge.recipients && surcharge.recipients.length > 0));

  if (onlyEntities) return "Solo Entidades";
  if (parts.includes("Todos Productos") && parts.includes("Todas Artes"))
    return "Todo";
  if (parts.length === 0) return "N/A"; // No products/arts specified, and no entity rules either (or they are additional)

  return parts.join(" + ");
};

// Added try-catch for potentially invalid date strings from backend
const formatDateRange = (range?: {
  start: Date | string;
  end: Date | string;
}): string => {
  if (!range?.start || !range?.end) return "Siempre"; // Consistent label
  try {
    const startDate = new Date(range.start).toLocaleDateString();
    const endDate = new Date(range.end).toLocaleDateString();
    // Check for Invalid Date
    if (startDate === "Invalid Date" || endDate === "Invalid Date") {
      return "Fechas Inválidas";
    }
    return `${startDate} - ${endDate}`;
  } catch (e) {
    console.error("Error formatting date range:", e);
    return "Fechas Inválidas";
  }
};

// --- Component ---
const ReadSurcharges: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [surcharges, setSurcharges] = useState<Surcharge[]>([]); // Original full list
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [surchargeToDelete, setSurchargeToDelete] = useState<Surcharge | null>(
    null,
  );

  // Client-side processing state (Copied from ReadDiscounts)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all', 'active', 'inactive'
  const [filterMethod, setFilterMethod] = useState<AdjustmentMethod | "all">(
    "all",
  ); // 'all', 'percentage', 'absolute'
  const [filterCurrentlyActive, setFilterCurrentlyActive] =
    useState<string>("all"); // 'all', 'yes', 'no'
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Surcharge | string>("name"); // Default sort column

  // Debouncer for search input (Copied from ReadDiscounts)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 300); // Reset page on search
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // --- Fetch Data ---
  const loadSurcharges = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setError(null); // Reset error before fetching
      try {
        // Fetch raw data
        const fetchedSurcharges = (await getSurcharges()) as Surcharge[];
        // Optional: Client-side validation or logging
        if (fetchedSurcharges.some((s) => !s._id)) {
          console.warn(
            "Some fetched surcharges are missing '_id'. Ensure API returns it.",
          );
        }
        setSurcharges(fetchedSurcharges); // Set the original, unsorted, unfiltered data
      } catch (err: any) {
        const message = err.message || "Error al cargar recargos.";
        setError(message);
        showSnackBar(message);
        console.error("Error fetching surcharges:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [showSnackBar],
  ); // Dependency array includes showSnackBar

  // Initial data load
  useEffect(() => {
    loadSurcharges();
  }, [loadSurcharges]);

  // --- Client-Side Processing Pipeline (Copied & Adapted from ReadDiscounts) ---

  // 1. Filtering
  const filteredSurcharges = useMemo(() => {
    const now = new Date().getTime(); // Get current time once for efficient filtering
    return surcharges.filter((surcharge) => {
      const searchLower = debouncedSearchTerm.toLowerCase();

      // Status Filter (active field)
      const statusMatch =
        filterStatus === "all" ||
        (surcharge.active ? "active" : "inactive") === filterStatus;

      // Adjustment Method Filter
      const methodMatch =
        filterMethod === "all" || surcharge.adjustmentMethod === filterMethod;

      // Currently Active Filter (based on dateRange and current time)
      let currentlyActiveMatch = true; // Assume true unless filter is 'yes' or 'no'
      if (filterCurrentlyActive !== "all") {
        const hasDateRange =
          !!surcharge.dateRange?.start && !!surcharge.dateRange?.end;
        if (!hasDateRange) {
          // If no date range, it's considered always active for filtering purposes
          currentlyActiveMatch = filterCurrentlyActive === "yes";
        } else {
          try {
            // Use getTime() for reliable comparison, handle potential string dates
            const startTime = new Date(surcharge.dateRange!.start).getTime();
            const endTime = new Date(surcharge.dateRange!.end).getTime();
            // Check for NaN from invalid dates
            if (isNaN(startTime) || isNaN(endTime)) {
              currentlyActiveMatch = false; // Treat invalid range as not matching
            } else {
              const isActiveNow = now >= startTime && now <= endTime;
              currentlyActiveMatch =
                (filterCurrentlyActive === "yes" && isActiveNow) ||
                (filterCurrentlyActive === "no" && !isActiveNow);
            }
          } catch (e) {
            console.error(
              "Error parsing date for filter:",
              surcharge.dateRange,
              e,
            );
            currentlyActiveMatch = false; // Treat parsing errors as not matching
          }
        }
      }

      // Search Filter (check name and description)
      const searchMatch =
        !searchLower ||
        surcharge.name?.toLowerCase().includes(searchLower) ||
        surcharge.description?.toLowerCase().includes(searchLower);
        // Add more fields to search here

      // Combine all filters
      return statusMatch && methodMatch && currentlyActiveMatch && searchMatch;
    });
  }, [
    surcharges,
    debouncedSearchTerm,
    filterStatus,
    filterMethod,
    filterCurrentlyActive,
  ]);

  // 2. Sorting
  const sortedSurcharges = useMemo(() => {
    const comparator = (a: Surcharge, b: Surcharge): number => {
      // Use the nested value getter for potentially nested or complex fields like dates
      const comp = descendingComparator(a, b, orderBy);
      return order === "desc" ? comp : -comp; // Apply ascending or descending order
    };
    // Use stableSort to maintain relative order when values are equal
    return stableSort(filteredSurcharges, comparator);
  }, [filteredSurcharges, order, orderBy]);

  // 3. Pagination
  const paginatedSurcharges = useMemo(() => {
    const startIndex = page * rowsPerPage;
    // Slice the sorted array based on current page and rows per page
    return sortedSurcharges.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedSurcharges, page, rowsPerPage]);

  // --- Handlers (Copied & Adapted from ReadDiscounts) ---

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Debouncer will trigger state update and page reset
  };

  // Generic handler for filter dropdowns
  const handleFilterChange = (
    event: ChangeEvent<{ name?: string; value: unknown }>,
    filterSetter: React.Dispatch<React.SetStateAction<any>>,
  ) => {
    filterSetter(event.target.value as string); // Update specific filter state
    setPage(0); // Reset to first page when filters change
  };

  // Handler for column header click to change sorting
  const handleRequestSort = (property: keyof Surcharge | string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc"); // Toggle order direction
    setOrderBy(property); // Set the column to sort by
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage); // Update page number
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Update rows per page
    setPage(0); // Reset to first page
  };

  // Handler for the refresh button
  const handleRefresh = () => {
    loadSurcharges(false); // Re-fetch data without showing main loader
    showSnackBar("Lista actualizada.");
  };

  // --- Delete Handling (Adjusted to reload data) ---
  const handleOpenDeleteDialog = (surcharge: Surcharge) => {
    if (!surcharge._id) {
      showSnackBar("Error: Falta ID del recargo.");
      return;
    }
    setSurchargeToDelete(surcharge);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    if (isDeleting) return; // Prevent closing while delete is in progress
    setDialogOpen(false);
    // Delay resetting surchargeToDelete slightly for dialog fade-out
    setTimeout(() => setSurchargeToDelete(null), 150);
  };
  const handleConfirmDelete = async () => {
    if (!surchargeToDelete?._id) {
      showSnackBar("Error: Recargo no seleccionado para eliminar.");
      handleCloseDialog();
      return;
    }
    setIsDeleting(true);
    try {
      await deleteSurcharge(surchargeToDelete._id.toString()); // Ensure _id is string
      showSnackBar(`Recargo "${surchargeToDelete.name}" eliminado.`);
      handleCloseDialog(); // Close dialog first
      loadSurcharges(false); // <<<< Reload data to refresh the client-side filtered/sorted list
    } catch (err: any) {
      console.error("Error deleting surcharge:", err);
      showSnackBar(err.message || "Error al eliminar el recargo.");
      handleCloseDialog(); // Close dialog even on error
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Update & Create Navigation ---
  const handleUpdate = (surchargeId: ObjectId | string | undefined) => {
    if (!surchargeId) {
      showSnackBar("Error: Falta ID para editar.");
      return;
    }
    // Ensure ID is string for URL
    navigate(`/admin/surcharges/update/${surchargeId.toString()}`);
  };
  const handleCreate = () => {
    navigate("/admin/surcharges/create");
  };

  // --- Render Logic (Structured like ReadDiscounts) ---
  return (
    <>
      <Title title="Gestionar Recargos" />

      {/* Toolbar (Copied & Adapted from ReadDiscounts) */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Toolbar
          disableGutters
          sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}
        >
          {/* Search Input */}
          <TextField
            sx={{
              flexBasis: { xs: "100%", sm: "auto" },
              flexGrow: 1,
              minWidth: "200px",
            }}
            variant="outlined"
            size="small"
            placeholder="Buscar Nombre, Descripción..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* Filter Dropdowns */}
          <FormControl
            size="small"
            sx={{ flexBasis: { xs: "45%", sm: "auto" }, minWidth: 120 }}
          >
            <InputLabel id="status-filter-label">Estado</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Estado"
              name="status"
              value={filterStatus}
              onChange={(e) => handleFilterChange(e as any, setFilterStatus)} // Cast needed for generic handler
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activo</MenuItem>
              <MenuItem value="inactive">Inactivo</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={{ flexBasis: { xs: "45%", sm: "auto" }, minWidth: 120 }}
          >
            <InputLabel id="method-filter-label">Método</InputLabel>
            <Select
              labelId="method-filter-label"
              label="Método"
              name="method"
              value={filterMethod}
              onChange={(e) => handleFilterChange(e as any, setFilterMethod)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="percentage">Porcentaje</MenuItem>
              <MenuItem value="absolute">Absoluto</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={{ flexBasis: { xs: "45%", sm: "auto" }, minWidth: 140 }}
          >
            <InputLabel id="active-now-filter-label">Activo Ahora</InputLabel>
            <Select
              labelId="active-now-filter-label"
              label="Activo Ahora"
              name="activeNow"
              value={filterCurrentlyActive}
              onChange={(e) =>
                handleFilterChange(e as any, setFilterCurrentlyActive)
              }
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="yes">Sí</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </Select>
          </FormControl>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexBasis: { xs: "100%", sm: "auto" },
              justifyContent: "flex-end",
              ml: "auto",
            }}
          >
            <Tooltip title="Refrescar Lista">
              {/* Disable refresh if loading or deleting */}
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={isLoading || isDeleting}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={isLoading || isDeleting}
            >
              Crear Recargo
            </Button>
          </Box>
        </Toolbar>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error States */}
      {/* Error when loading and no data is present */}
      {error && !isLoading && filteredSurcharges.length === 0 && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button onClick={() => loadSurcharges()} size="small" sx={{ ml: 1 }}>
            Reintentar
          </Button>
        </Alert>
      )}
      {/* Error during refresh when data *is* present */}
      {error && !isLoading && filteredSurcharges.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudo actualizar la lista: {error}
        </Alert>
      )}

      {/* No Results State */}
      {!isLoading && !error && filteredSurcharges.length === 0 && (
        <Alert severity="info" sx={{ m: 2 }}>
          No se encontraron recargos que coincidan con los criterios de búsqueda
          y filtros.
        </Alert>
      )}

      {/* Table Display (only when not loading and data exists) */}
      {!isLoading && filteredSurcharges.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 800 }} aria-label="surcharges table">
            {/* Table Header with Sorting */}
            <TableHead
              sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
            >
              <TableRow>
                <TableCell sx={{ width: "25%", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: "10%", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "defaultValue"}
                    direction={orderBy === "defaultValue" ? order : "asc"}
                    onClick={() => handleRequestSort("defaultValue")}
                  >
                    Valor
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: "20%", fontWeight: "bold" }}>
                  Aplica A
                </TableCell>{" "}
                {/* Not sortable by default */}
                <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "dateRange.start"} // Sort by start date
                    direction={orderBy === "dateRange.start" ? order : "asc"}
                    onClick={() => handleRequestSort("dateRange.start")}
                  >
                    Rango Fechas
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: "10%", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "active"}
                    direction={orderBy === "active" ? order : "asc"}
                    onClick={() => handleRequestSort("active")}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ width: "10%", fontWeight: "bold" }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            {/* Table Body with Paginated Data */}
            <TableBody>
              {paginatedSurcharges.map((surcharge) => (
                <TableRow
                  hover
                  key={surcharge._id?.toString()}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {surcharge.name}
                      {/* Overrides Indicator */}
                      {surcharge.entityOverrides &&
                        surcharge.entityOverrides.length > 0 && (
                          <Tooltip
                            title={`Tiene ${surcharge.entityOverrides.length} excepción(es) de entidad`}
                          >
                            <InfoOutlinedIcon
                              color="action"
                              sx={{ fontSize: "1rem", verticalAlign: "middle" }}
                            />
                          </Tooltip>
                        )}
                      {/* Recipients Indicator */}
                      {surcharge.recipients &&
                        surcharge.recipients.length > 0 && (
                          <Tooltip
                            title={`Tiene ${surcharge.recipients.length} receptor(es) específico(s)`}
                          >
                            {/* Use a different icon for recipients */}
                            <PeopleAltOutlinedIcon
                              color="action"
                              sx={{
                                fontSize: "1rem",
                                verticalAlign: "middle",
                                ml: 0.2,
                              }}
                            />
                          </Tooltip>
                        )}
                    </Box>
                    <Tooltip
                      title={surcharge.description || "Sin descripción"}
                      placement="bottom-start"
                    >
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 300 }}
                      >
                        {surcharge.description || ""}{" "}
                        {/* Show empty string if no description */}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {formatAdjustmentValue(
                      surcharge.defaultValue,
                      surcharge.adjustmentMethod,
                    )}
                  </TableCell>
                  <TableCell>{formatApplicability(surcharge)}</TableCell>
                  <TableCell>{formatDateRange(surcharge.dateRange)}</TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        surcharge.active ? <CheckCircleIcon /> : <CancelIcon />
                      }
                      label={surcharge.active ? "Activo" : "Inactivo"}
                      color={surcharge.active ? "success" : "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <Tooltip title="Editar Recargo">
                        {/* Disable edit if ID missing or currently deleting */}
                        <span>
                          {" "}
                          {/* Span needed for tooltip on disabled button */}
                          <IconButton
                            aria-label="edit"
                            color="primary"
                            size="small"
                            onClick={() => handleUpdate(surcharge._id)}
                            disabled={!surcharge._id || isDeleting}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Eliminar Recargo">
                        {/* Disable delete if ID missing or this specific item is being deleted */}
                        <span>
                          {" "}
                          {/* Span needed for tooltip on disabled button */}
                          <IconButton
                            aria-label="delete"
                            color="error"
                            size="small"
                            onClick={() => handleOpenDeleteDialog(surcharge)}
                            disabled={
                              !surcharge._id ||
                              (isDeleting &&
                                surchargeToDelete?._id === surcharge._id)
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredSurcharges.length} // Count based on filtered results
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            // Spanish labels for pagination
            labelRowsPerPage="Filas por pág:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </TableContainer>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={
          <>
            ¿Estás seguro de que deseas eliminar el recargo{" "}
            <strong>{surchargeToDelete?.name || ""}</strong>?
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isPerformingAction={isDeleting} // Show loading indicator on confirm button
      />
    </>
  );
};

export default ReadSurcharges;
