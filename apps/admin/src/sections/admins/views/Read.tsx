import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  TablePagination,
  TableSortLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import Grid2 from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { visuallyHidden } from "@mui/utils";

import { Admin } from "@prixpon/types/admin.types";
import { PermissionsV2 } from "@prixpon/types/permissions.types";
import { useSnackBar } from "@prixpon/context/GlobalContext";
import Title from "@apps/admin/components/Title";
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog";
import { deleteAdmin, getAdmins } from "@prixpon/api/admin.api";
import { getRoles } from "@prixpon/api/admin.api";

// --- Helper Types & Constants ---
interface DeletionTarget {
  username: string;
  displayName: string;
}

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Admin | "actions";
  label: string;
  numeric: boolean;
  sortable: boolean;
  minWidth?: number;
}

// Define table headers
const headCells: readonly HeadCell[] = [
  {
    id: "username",
    numeric: false,
    label: "Nombre de Usuario",
    sortable: true,
  },
  { id: "firstname", numeric: false, label: "Nombre", sortable: true },
  { id: "email", numeric: false, label: "Email", sortable: true },
  { id: "area", numeric: false, label: "Rol/Área", sortable: true },
  { id: "isSeller", numeric: false, label: "Es Vendedor?", sortable: true },
  {
    id: "actions",
    numeric: false,
    label: "Acciones",
    sortable: false,
    minWidth: 120,
  },
];

// --- Sorting Helper Functions ---
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  let valA = a[orderBy];
  let valB = b[orderBy];

  if (valA === undefined && valB === undefined) return 0;
  if (valA === undefined) return 1;
  if (valB === undefined) return -1;

  if (
    valA &&
    typeof valA === "object" &&
    typeof (valA as any).toHexString === "function"
  ) {
    valA = (valA as any).toHexString();
  }
  if (
    valB &&
    typeof valB === "object" &&
    typeof (valB as any).toHexString === "function"
  ) {
    valB = (valB as any).toHexString();
  }

  const compA = typeof valA === "string" ? valA.toLowerCase() : valA;
  const compB = typeof valB === "string" ? valB.toLowerCase() : valB;

  if (compB < compA) {
    return -1;
  }
  if (compB > compA) {
    return 1;
  }
  return 0;
}

function getComparator<T, Key extends keyof T>(
  order: Order,
  orderBy: Key,
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// --- Component ---
export default function ReadAdmins() {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [originalAdmins, setOriginalAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [deletionTarget, setDeletionTarget] = useState<DeletionTarget | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterArea, setFilterArea] = useState<string>("");
  const [filterIsSeller, setFilterIsSeller] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Admin>("username");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // --- Data Fetching ---
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAdmins = await getAdmins();
      setOriginalAdmins(fetchedAdmins);
    } catch (err: any) {
      const message = err.message || "Fallo al cargar administradores.";
      setError(message);
      showSnackBar(message);
      console.error("Error fetching admins:", err);
    } finally {
      setIsLoading(false);
    }
  }, [showSnackBar]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const permissionsList: PermissionsV2[] = await getRoles();
        const areas: string[] = permissionsList.map((p) => p.area).sort();
        setAvailableAreas(areas);
      } catch (err: any) {
        const message = err.message || "Fallo al cargar las áreas disponibles.";
        console.error("Error fetching areas:", err);
        showSnackBar(message);
      }
    };
    fetchAreas();
  }, [showSnackBar]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // --- Client-Side Processing ---
  const processedAdmins = useMemo(() => {
    let filteredData = [...originalAdmins];

    // 1. Apply Filtering
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase().trim();
      if (lowerSearch) {
        filteredData = filteredData.filter((admin) =>
          Object.values(admin).some((value) =>
            String(value).toLowerCase().includes(lowerSearch),
          ),
        );
      }
    }
    if (filterArea) {
      filteredData = filteredData.filter((admin) => admin.area === filterArea);
    }
    if (filterIsSeller !== "") {
      const sellerBool = filterIsSeller === "true";
      filteredData = filteredData.filter(
        (admin) => admin.isSeller === sellerBool,
      );
    }

    const filteredRowCount = filteredData.length;

    const sortedData = stableSort(filteredData, getComparator(order, orderBy));

    const paginatedData = sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );

    return {
      paginatedAdmins: paginatedData,
      filteredRowCount: filteredRowCount,
    };
  }, [
    originalAdmins,
    searchTerm,
    filterArea,
    filterIsSeller,
    order,
    orderBy,
    page,
    rowsPerPage,
  ]);

  // --- Handlers ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterAreaChange = (event: SelectChangeEvent<string>) => {
    setFilterArea(event.target.value);
    setPage(0);
  };

  const handleFilterIsSellerChange = (event: SelectChangeEvent<string>) => {
    setFilterIsSeller(event.target.value);
    setPage(0);
  };

  const handleSortRequest = (property: keyof Admin) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreate = () => {
    navigate("/admin/admins/create");
  };
  const handleUpdate = (username: string) => {
    navigate(`/admin/admins/update/${username}`);
  };

  const handleDeleteClick = (admin: Admin) => {
    setDeletionTarget({
      username: admin.username,
      displayName: `${admin.firstname} ${admin.lastname} (${admin.username})`,
    });
    setShowConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    setDeletionTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletionTarget) return;
    setIsDeleting(true);
    try {
      await deleteAdmin(deletionTarget.username);
      showSnackBar(
        `Admin '${deletionTarget.displayName}' eliminado exitosamente.`,
      );
      fetchAdmins();
    } catch (err: any) {
      const message = err.message || "Ocurrió un error al eliminar el admin.";
      showSnackBar(message);
      console.error(`Error deleting admin ${deletionTarget.username}:`, err);
    } finally {
      setIsDeleting(false);
      handleCloseConfirmDialog();
    }
  };

  // --- Render Logic ---

  const EnhancedTableHead = React.memo(() => (
    <TableHead sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontWeight: "bold", minWidth: headCell.minWidth }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={() =>
                  headCell.id !== "actions" &&
                  handleSortRequest(headCell.id as keyof Admin)
                }
                disabled={isLoading || isDeleting}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  ));
  EnhancedTableHead.displayName = "EnhancedTableHead";

  // Main content rendering function
  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
            minHeight: 200,
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando Admins...</Typography>
        </Box>
      );
    }

    if (error && originalAdmins.length === 0) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button
            onClick={fetchAdmins}
            size="small"
            sx={{ ml: 1 }}
            disabled={isLoading}
          >
            Reintentar
          </Button>
        </Alert>
      );
    }

    if (processedAdmins.filteredRowCount === 0) {
      const filtersActive = searchTerm || filterArea || filterIsSeller !== "";
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          {filtersActive
            ? "No hay admins que coincidan con los criterios de búsqueda/filtro."
            : "No hay administradores creados."}
        </Alert>
      );
    }

    return (
      <Paper
        sx={{ width: "100%", mb: 2, position: "relative", overflow: "hidden" }}
      >
        {isDeleting && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              zIndex: 2,
            }}
          >
            <CircularProgress size={30} />
          </Box>
        )}
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-label="administrators table"
            size="medium"
          >
            <EnhancedTableHead />
            <TableBody>
              {processedAdmins.paginatedAdmins.map((admin) => (
                <TableRow
                  key={
                    admin._id ? admin._id.toString() : String(admin.username)
                  }
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {admin.username}
                  </TableCell>
                  <TableCell>{`${admin.firstname} ${admin.lastname}`}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.area}</TableCell>
                  <TableCell>
                    {admin.isSeller ? (
                      <Chip
                        label="Sí"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="No" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="left">
                    <Tooltip title="Editar Admin">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => handleUpdate(admin.username)}
                          disabled={isDeleting || isLoading}
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Eliminar Admin">
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(admin)}
                          disabled={
                            isLoading ||
                            (isDeleting &&
                              deletionTarget?.username === admin.username)
                          }
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={processedAdmins.filteredRowCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
        />
      </Paper>
    );
  };

  // --- Main Return ---
  return (
    <>
      <Title title="Modificar Admins" />

      {/* Header & Controls Area */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid2
          container
          spacing={2}
          alignItems="center"
          sx={{
            "& .MuiGrid-item": {
              pt: { xs: 1, sm: "16px" },
              pb: { xs: 1, sm: 0 },
            },
          }}
        >
          {" "}
          {/* Responsive spacing */}
          {/* Search Input */}
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Buscar por nombre, e‑mail, área, vendedor…"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={isLoading || isDeleting}
            />
          </Grid2>
          {/* Filter by Area */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel id="area-filter-label">Área</InputLabel>
              <Select
                labelId="area-filter-label"
                value={filterArea}
                onChange={handleFilterAreaChange}
                label="Área"
                disabled={
                  isLoading || isDeleting || availableAreas.length === 0
                }
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {availableAreas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          {/* Filter by isSeller */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel id="seller-filter-label">Es Vendedor</InputLabel>
              <Select
                labelId="seller-filter-label"
                value={filterIsSeller}
                onChange={handleFilterIsSellerChange}
                label="Es Vendedor"
                disabled={isLoading || isDeleting}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
          {/* Spacer */}
          <Grid2 size={{ xs: 12 }} sx={{ flexGrow: 1 }} />
          {/* Create Button */}
          <Grid2 size={{ xs: 12, sm: 6, md: "auto" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={isLoading || isDeleting}
              fullWidth
              sx={{ height: "100%", minHeight: "40px" }} // Match height with inputs
            >
              Crear Admin
            </Button>
          </Grid2>
        </Grid2>
      </Paper>

      {/* Display error only if fetch failed and list is empty */}
      {error && !isLoading && originalAdmins.length === 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button
            onClick={fetchAdmins}
            size="small"
            sx={{ ml: 1 }}
            disabled={isLoading}
          >
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Render the main content (table/empty state/etc.) */}
      {renderContent()}

      {/* Confirmation Dialog for Deletion */}
      {deletionTarget && (
        <ConfirmationDialog
          open={showConfirmDialog}
          onClose={handleCloseConfirmDialog}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          message={
            <>
              ¿Estás seguro de que deseas eliminar permanentemente al
              administrador <strong>{deletionTarget.displayName}</strong>? Esta
              acción no se puede deshacer.
            </>
          }
          confirmText="Eliminar"
          isPerformingAction={isDeleting} // Shows loading indicator on confirm button
        />
      )}
    </>
  );
}
