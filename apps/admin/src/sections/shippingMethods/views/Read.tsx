// src/apps/admin/sections/shipping/views/ReadShippingMethods.tsx
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
  Toolbar,
  TextField,
  Select,
  MenuItem, // Added Toolbar, TextField, Select, MenuItem
  FormControl,
  InputLabel,
  TablePagination,
  TableSortLabel, // Added FormControl, InputLabel, TablePagination, TableSortLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh"; // Added

// Hooks and Context
import { useSnackBar } from "@prixpon/context/GlobalContext";
import { ShippingMethod } from "@prixpon/types/order.types";
import { fetchShippingMethods, deleteShippingMethod } from "@prixpon/api-client/order.api";

import Title from "@apps/admin/components/Title";
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog";
import { visuallyHidden } from "@mui/utils";

// --- Helper Types & Functions ---

type Order = "asc" | "desc";

// Define sortable columns explicitly
type ShippingMethodSortableColumns = "name" | "price" | "active" | "createdOn";

interface FilterState {
  status: "all" | "active" | "inactive";
}

// Sorting helper - handles string, boolean, date, and price (string as number)
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  let bValue = b[orderBy];
  let aValue = a[orderBy];

  // Special handling for price string comparison
  if (orderBy === "price") {
    bValue = parseFloat(bValue as string) as any; // Convert string to number for comparison
    aValue = parseFloat(aValue as string) as any;
    if (isNaN(bValue as number)) bValue = -Infinity as any; // Handle potential NaN
    if (isNaN(aValue as number)) aValue = -Infinity as any;
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

// Stable sort helper
function getComparator<Key extends ShippingMethodSortableColumns>(
  order: Order,
  orderBy: Key,
): (a: ShippingMethod, b: ShippingMethod) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// --- Component ---

const ReadShippingMethods: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]); // Original fetched list
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [methodToDelete, setMethodToDelete] = useState<ShippingMethod | null>(
    null,
  );

  // State for Filtering, Sorting, Pagination
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({ status: "all" });
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<ShippingMethodSortableColumns>("name");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // --- Fetch Data ---
  const loadMethods = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setError(null);
      try {
        const fetchedMethods =
          (await fetchShippingMethods()) as ShippingMethod[];
        if (fetchedMethods.some((method) => !method._id)) {
          /* ... error handling ... */ console.error("Missing _id.");
          throw new Error("Incomplete data.");
        }
        setShippingMethods(
          fetchedMethods.map((m) => ({
            ...m,
            createdOn: new Date(m.createdOn),
          })),
        ); // Ensure createdOn is Date object
      } catch (err: any) {
        /* ... error handling ... */ const message =
          err.message || "Error al cargar.";
        setError(message);
        showSnackBar(message);
        console.error("Error fetching:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [showSnackBar],
  );

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  // --- Processing Pipeline ---
  const processedMethods = useMemo(() => {
    let filteredMethods = [...shippingMethods];

    // Apply Search Query (by name)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredMethods = filteredMethods.filter((method) =>
        method.name.toLowerCase().includes(lowerQuery),
      );
    }

    // Apply Filters (by status)
    if (filters.status !== "all") {
      filteredMethods = filteredMethods.filter(
        (method) =>
          (filters.status === "active" && method.active) ||
          (filters.status === "inactive" && !method.active),
      );
    }

    // Apply Sorting
    const sortedMethods = filteredMethods.sort(getComparator(order, orderBy));

    // Apply Pagination
    return sortedMethods.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [
    shippingMethods,
    searchQuery,
    filters,
    order,
    orderBy,
    page,
    rowsPerPage,
  ]);

  // Calculate total count *after* filtering for pagination
  const totalFilteredCount = useMemo(() => {
    let filteredMethods = [...shippingMethods];
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredMethods = filteredMethods.filter((method) =>
        method.name.toLowerCase().includes(lowerQuery),
      );
    }
    if (filters.status !== "all") {
      filteredMethods = filteredMethods.filter(
        (method) =>
          (filters.status === "active" && method.active) ||
          (filters.status === "inactive" && !method.active),
      );
    }
    return filteredMethods.length;
  }, [shippingMethods, searchQuery, filters]);

  // --- Handlers ---
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset page when search changes
  };

  const handleFilterChange = (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>,
  ) => {
    const { name, value } = event.target;
    if (name === "status") {
      // Only handling status filter here
      setFilters((prev) => ({
        ...prev,
        status: value as FilterState["status"],
      }));
      setPage(0); // Reset page when filters change
    }
  };

  const handleRequestSort = (property: ShippingMethodSortableColumns) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    loadMethods(false); // Fetch without global loading indicator
  };

  // --- Delete Handling --- (Keep existing logic)
  const handleOpenDeleteDialog = (method: ShippingMethod) => {
    /* ... */ if (!method._id) {
      showSnackBar("Falta ID.");
      return;
    }
    setMethodToDelete(method);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    /* ... */ if (isDeleting) return;
    setDialogOpen(false);
    setMethodToDelete(null);
  };
  const handleConfirmDelete = async () => {
    /* ... */ if (!methodToDelete?._id) {
      showSnackBar("Error: ID faltante.");
      setIsDeleting(false);
      handleCloseDialog();
      return;
    }
    setIsDeleting(true);
    try {
      await deleteShippingMethod(methodToDelete._id.toString());
      showSnackBar(`Método "${methodToDelete.name}" eliminado.`);
      setShippingMethods((prev) =>
        prev.filter((m) => m._id !== methodToDelete._id),
      );
      handleCloseDialog();
    } catch (err: any) {
      console.error("Error deleting:", err);
      const message = err.message || "Error al eliminar.";
      showSnackBar(message);
      handleCloseDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Update & Create Handling --- (Keep existing logic)
  const handleUpdate = (methodId: string) => {
    /* ... */ if (!methodId) {
      showSnackBar("Falta ID.");
      return;
    }
    navigate(`/admin/shipping-method/update/${methodId}`);
  }; // Adjust route
  const handleCreate = () => {
    /* ... */ navigate("/admin/shipping-method/create");
  }; // Adjust route

  // --- Table Head Configuration ---
  interface HeadCell {
    id: ShippingMethodSortableColumns;
    label: string;
    numeric: boolean;
    disablePadding: boolean;
    width?: string;
  }
  const headCells: readonly HeadCell[] = [
    {
      id: "name",
      numeric: false,
      disablePadding: false,
      label: "Nombre",
      width: "35%",
    },
    {
      id: "price",
      numeric: true,
      disablePadding: false,
      label: "Precio",
      width: "15%",
    }, // Mark as numeric for alignment
    {
      id: "active",
      numeric: false,
      disablePadding: false,
      label: "Estado",
      width: "15%",
    }, // Sortable via 'active' boolean
    {
      id: "createdOn",
      numeric: false,
      disablePadding: false,
      label: "Creado el",
      width: "20%",
    }, // New column
  ];

  // --- Render Logic ---
  return (
    <>
      <Title title="Gestionar Métodos de Envío" />

      {/* Toolbar for Search, Filters, Actions */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Toolbar
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          }}
        >
          <Box sx={{ flex: "1 1 40%" }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                name="status"
                label="Estado"
                value={filters.status}
                onChange={handleFilterChange as any}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refrescar Lista">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={isLoading || isDeleting}
              size="small"
            >
              Crear
            </Button>
          </Box>
        </Toolbar>
      </Paper>

      {/* Loading / Error Display */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && !isLoading && shippingMethods.length === 0 && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button onClick={() => loadMethods()} size="small">
            Reintentar
          </Button>
        </Alert>
      )}
      {!isLoading &&
        totalFilteredCount === 0 &&
        (shippingMethods.length > 0 ||
          searchQuery ||
          filters.status !== "all") && (
          <Alert severity="info" sx={{ m: 2 }}>
            No hay métodos que coincidan con la búsqueda o filtros aplicados.
          </Alert>
        )}
      {!isLoading &&
        shippingMethods.length === 0 &&
        !error &&
        !searchQuery &&
        filters.status === "all" && (
          <Alert severity="info" sx={{ m: 2 }}>
            No se encontraron métodos de envío.
          </Alert>
        )}

      {/* Table Display */}
      {!isLoading && totalFilteredCount > 0 && (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer>
            <Table
              stickyHeader
              sx={{ minWidth: 750 }}
              aria-label="shipping methods table"
            >
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      backgroundColor: (theme) => theme.palette.action.hover,
                      fontWeight: "bold",
                    },
                  }}
                >
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? "right" : "left"}
                      padding={headCell.disablePadding ? "none" : "normal"}
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{ width: headCell.width }}
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                        {orderBy === headCell.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {" "}
                            {order === "desc"
                              ? "sorted descending"
                              : "sorted ascending"}{" "}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ width: "15%" }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedMethods.map((method) => (
                  <TableRow
                    hover
                    key={method._id?.toString()}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {method.name}
                    </TableCell>
                    <TableCell align="right">
                      $
                      {!isNaN(parseFloat(method.price))
                        ? parseFloat(method.price).toFixed(2)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {" "}
                      <Chip
                        icon={
                          method.active ? <CheckCircleIcon /> : <CancelIcon />
                        }
                        label={method.active ? "Activo" : "Inactivo"}
                        color={method.active ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />{" "}
                    </TableCell>
                    {/* Created On Date */}
                    <TableCell>
                      {method.createdOn instanceof Date
                        ? method.createdOn.toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Editar">
                          <IconButton
                            aria-label="edit"
                            color="primary"
                            onClick={() => handleUpdate(method._id!.toString())}
                            disabled={!method._id || isDeleting}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(method)}
                            disabled={
                              !method._id ||
                              (isDeleting && methodToDelete?._id === method._id)
                            }
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalFilteredCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por pág:"
          />
        </Paper>
      )}

      {/* Confirmation Dialog (Keep existing logic) */}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={
          <>
            ¿Estás seguro de eliminar el método{" "}
            <strong>{methodToDelete?.name || ""}</strong>?
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isPerformingAction={isDeleting}
      />
    </>
  );
};

export default ReadShippingMethods;
