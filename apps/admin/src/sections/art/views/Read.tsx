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
  Avatar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Toolbar,
  TablePagination,
  TableSortLabel, // Import necessary components
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh"; // Import Refresh Icon
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Example for Approved status
import PendingIcon from "@mui/icons-material/Pending"; // Example for Pending status
import CancelIcon from "@mui/icons-material/Cancel"; // Example for Rejected status

// Hooks, Types, Context, API
import { useSnackBar } from "@prixpon/context/GlobalContext";
import { Art } from "@prixpon/types/art.types";
import { getArts, deleteArt } from "@prixpon/api-client/art.api";
import Title from "@apps/admin/components/Title";
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog";
import { User } from "@prixpon/types/user.types";
import { getUsersByIds } from "@prixpon/api-client/user.api";

// --- Helper Functions for Sorting ---

// Generic comparator
function descendingComparator<T>(a: T, b: T, orderBy: keyof T | string) {
  // Handle nested properties  (e.g., owner name) - requires specific logic
  const bValue = getNestedValue(b, orderBy);
  const aValue = getNestedValue(a, orderBy);

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

// Helper to get potentially nested values for sorting
// Adjust this based on the actual fields you need to sort by (like owner name)
function getNestedValue<T>(obj: T, path: string | number | symbol): any {
  // Simple implementation for now, assumes non-nested or handled elsewhere
  if (path === "ownerName") {
    // Special handling for owner name - requires ownerInfoMap access, complex here
    // Let's skip sorting by owner name client-side for now unless ownerInfoMap is passed
    return ""; // Placeholder
  }
  // Handle potential undefined values for comparison
  const value = obj[path as keyof T];
  return value === null || typeof value === "undefined" ? "" : value;
}

type Order = "asc" | "desc";

// Stable sort implementation
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1]; // Stabilize based on original index
  });
  return stabilizedThis.map((el) => el[0]);
}

// Interface for the user map state
interface UserMap {
  [userId: string]: {
    name: string;
    avatar?: string;
  };
}

// --- Component ---
const ReadArts: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [arts, setArts] = useState<Art[]>([]); // Original full list
  const [ownerInfoMap, setOwnerInfoMap] = useState<UserMap>({});
  const [availableCategories, setAvailableCategories] = useState<string[]>([]); // For category filter
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]); // For status filter
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [artToDelete, setArtToDelete] = useState<Art | null>(null);

  // Client-side processing state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Default rows per page
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Art | string>("title"); // Default sort column
  const [filterTags, setFilterTags] = useState<Set<string>>(new Set());

  // Debounce state for search input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset page when search term changes
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // --- Fetch Data ---
  const loadArtsAndOwners = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setError(null);
      setOwnerInfoMap({});
      setAvailableCategories([]);
      setAvailableStatuses([]);

      try {
        // 1. Fetch ALL Arts (Client-Side Strategy)
        const fetchedArts = (await getArts()) as Art[];
        setArts(fetchedArts);

        // Derive unique categories and statuses for filters
        const categories = new Set<string>();
        const statuses = new Set<string>();
        fetchedArts.forEach((art) => {
          if (art.category) categories.add(art.category);
          if (art.status) statuses.add(art.status);
        });
        setAvailableCategories(Array.from(categories).sort());
        setAvailableStatuses(Array.from(statuses).sort());

        // 2. Extract Unique User IDs
        const ownerIds = Array.from(
          new Set(
            fetchedArts
              .map((art) => art.userId?.toString())
              .filter((id): id is string => !!id),
          ),
        );

        // 3. Fetch User Details
        if (ownerIds.length) {
          const fetchedUsers = (await getUsersByIds(ownerIds)) as User[];
          const userMap: UserMap = {};
          fetchedUsers.forEach((user) => {
            const userIdStr = user._id!.toString();
            userMap[userIdStr] = {
              name:
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                user.username!,
              avatar: user.prixer?.avatar,
            };
          });
          setOwnerInfoMap(userMap);
        }
      } catch (err: any) {
        /* ... error handling ... */
        const message = err.message || "Error al cargar datos.";
        setError(message);
        showSnackBar(message);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [showSnackBar],
  );

  useEffect(() => {
    loadArtsAndOwners();
  }, [loadArtsAndOwners]);

  // --- Client-Side Processing Pipeline ---

  // 1. Filtering
  const filteredArts = useMemo(() => {
    return arts.filter((art) => {
      const ownerName =
        ownerInfoMap[art.userId?.toString()]?.name?.toLowerCase() ||
        art.prixerUsername?.toLowerCase() ||
        "";
      const searchLower = debouncedSearchTerm.toLowerCase();

      // Filter checks
      const statusMatch =
        filterStatus === "all" ||
        art.status?.toLowerCase() === filterStatus.toLowerCase();
      const visibilityMatch =
        filterVisibility === "all" ||
        (art.visible ? "yes" : "no") === filterVisibility;
      const categoryMatch =
        filterCategory === "all" || art.category === filterCategory;

      // --- NEW: Tag Filter Check (AND logic - art must have ALL selected tags) ---
      const tagMatch =
        filterTags.size === 0 ||
        Array.from(filterTags).every(
          (filterTag) =>
            art.tags?.some(
              (artTag) => artTag.toLowerCase() === filterTag.toLowerCase(),
            ), // Case-insensitive tag check
        );
      // --- End NEW ---

      // Search checks
      const searchMatch =
        !searchLower ||
        art.title?.toLowerCase().includes(searchLower) ||
        ownerName.includes(searchLower) ||
        art.tags?.join(" ").toLowerCase().includes(searchLower) ||
        art.description?.toLowerCase().includes(searchLower) ||
        art.artId?.toLowerCase().includes(searchLower);

      // Combine all filters
      return (
        statusMatch &&
        visibilityMatch &&
        categoryMatch &&
        tagMatch &&
        searchMatch
      ); // Added tagMatch
    });
    // Add filterTags to dependency array
  }, [
    arts,
    debouncedSearchTerm,
    filterStatus,
    filterVisibility,
    filterCategory,
    filterTags,
    ownerInfoMap,
  ]);

  // 2. Sorting
  const sortedArts = useMemo(() => {
    // Create comparator based on current order and orderBy
    const comparator = (a: Art, b: Art): number => {
      // Special handling for owner name - needs ownerInfoMap
      if (orderBy === "ownerName") {
        const nameA =
          ownerInfoMap[a.userId?.toString()]?.name || a.prixerUsername || "";
        const nameB =
          ownerInfoMap[b.userId?.toString()]?.name || b.prixerUsername || "";
        return order === "desc"
          ? nameA.localeCompare(nameB) * -1 // localeCompare handles strings well
          : nameA.localeCompare(nameB);
      }

      // Generic comparator for other fields
      const comp = descendingComparator(a, b, orderBy);
      return order === "desc" ? comp : -comp; // Invert result for 'asc'
    };
    return stableSort(filteredArts, comparator);
  }, [filteredArts, order, orderBy, ownerInfoMap]); // Add ownerInfoMap dependency for ownerName sort

  // 3. Pagination
  const paginatedArts = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedArts.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedArts, page, rowsPerPage]);

  // --- Handlers ---

  // Delete Handling (same as before)
  const handleOpenDeleteDialog = (art: Art) => {
    setArtToDelete(art);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    if (isDeleting) return;
    setDialogOpen(false);
    setArtToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!artToDelete?._id) return;
    setIsDeleting(true);
    try {
      await deleteArt(artToDelete._id.toString());
      showSnackBar(`Arte "${artToDelete.title}" eliminado.`);
      // Reload all data for simplicity with client-side processing
      loadArtsAndOwners(false); // Reload without main spinner
      handleCloseDialog();
    } catch (err: any) {
      showSnackBar(err.message || "Error al eliminar.");
      handleCloseDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  // Update/Create Navigation (same as before)
  const handleUpdate = (id: string | undefined) => {
    if (id) navigate(`/admin/art/update/${id}`);
  };
  const handleCreate = () => {
    navigate("/admin/art/create");
  };

  // Search Handler
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter Handlers
  const handleFilterChange = (
    event: ChangeEvent<{ name?: string; value: unknown }>,
    filterSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    filterSetter(event.target.value as string);
    setPage(0); // Reset page when filters change
  };

  // Sort Handler
  const handleRequestSort = (property: keyof Art | string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    // No need to setPage(0) here, sorting usually stays on the current page view
  };

  // Pagination Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page when rows per page changes
  };

  // --- NEW: Tag Click Handler ---
  const handleTagClick = (tag: string) => {
    setFilterTags((prevTags) => {
      const newTags = new Set(prevTags);
      const lowerTag = tag.toLowerCase(); // Store/compare lowercase for consistency
      if (newTags.has(lowerTag)) {
        newTags.delete(lowerTag); // Remove if already exists
      } else {
        newTags.add(lowerTag); // Add if not exists
      }
      return newTags;
    });
    setPage(0); // Reset page when tag filter changes
  };

  // Refresh Handler
  const handleRefresh = () => {
    loadArtsAndOwners(false); // Fetch data without showing the main loading spinner
    showSnackBar("Lista actualizada.");
  };

  // --- Render Logic ---

  // Helper to render status chips
  const renderStatusChip = (status?: string) => {
    if (!status) return <Chip label="N/A" size="small" />;
    const lowerStatus = status.toLowerCase();
    let color: "success" | "warning" | "error" | "info" | "default" = "default";
    let icon = null;

    // Customize based on your actual status values
    if (lowerStatus === "approved" || lowerStatus === "aprobada") {
      color = "success";
      icon = <CheckCircleIcon />;
    } else if (lowerStatus === "pending" || lowerStatus === "pendiente") {
      color = "warning";
      icon = <PendingIcon />;
    } else if (lowerStatus === "rejected" || lowerStatus === "rechazada") {
      color = "error";
      icon = <CancelIcon />;
    }

    return (
      <Chip
        label={status}
        color={color}
        size="small"
        icon={icon || undefined}
        variant="outlined"
      />
    );
  };

  return (
    <>
      <Title title="Gestionar Arte" />

      {/* Toolbar for Actions, Search, Filters */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {/* Row 1: Search, Main Filters, Actions */}
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: 2, width: "100%" }}
          >
            {/* Search */}
            <TextField
              sx={{
                flexBasis: { xs: "100%", sm: "auto" },
                flexGrow: 1,
                minWidth: "200px",
              }}
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

            {/* Filters */}
            <FormControl
              size="small"
              sx={{ flexBasis: { xs: "45%", sm: "auto" }, minWidth: 120 }}
            >
              {/*  Status Filter */}
              <InputLabel id="status-filter-label">Estado</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Estado"
                name="status"
                value={filterStatus}
                onChange={(e) => handleFilterChange(e as any, setFilterStatus)}
              >
                <MenuItem value="all">Todos</MenuItem>
                {availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{ flexBasis: { xs: "45%", sm: "auto" }, minWidth: 120 }}
            >
              {/* Visibility Filter */}
              <InputLabel id="visibility-filter-label">Visibilidad</InputLabel>
              <Select
                labelId="visibility-filter-label"
                label="Visibilidad"
                name="visibility"
                value={filterVisibility}
                onChange={(e) =>
                  handleFilterChange(e as any, setFilterVisibility)
                }
              >
                <MenuItem value="all">Todos</MenuItem>{" "}
                <MenuItem value="yes">Sí</MenuItem>{" "}
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{ flexBasis: { xs: "45%", sm: "auto" }, minWidth: 120 }}
            >
              {/* Category Filter */}
              <InputLabel id="category-filter-label">Categoría</InputLabel>
              <Select
                labelId="category-filter-label"
                label="Categoría"
                name="category"
                value={filterCategory}
                onChange={(e) =>
                  handleFilterChange(e as any, setFilterCategory)
                }
              >
                <MenuItem value="all">Todas</MenuItem>{" "}
                {availableCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
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
              {/* Refresh and Create Buttons */}
              <Tooltip title="Refrescar Lista">
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
                Crear Arte
              </Button>
            </Box>
          </Box>

          {/* --- NEW: Row 2: Active Tag Filters --- */}
          {filterTags.size > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
                pt: 1,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" sx={{ mr: 1, fontWeight: "medium" }}>
                Filtros por Tags:
              </Typography>
              {Array.from(filterTags).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => handleTagClick(tag)} // Use the same handler to remove
                  color="primary" // Keep consistent with active tags in table
                />
              ))}
            </Box>
          )}
          {/* --- End NEW --- */}
        </Toolbar>
      </Paper>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && !isLoading && filteredArts.length === 0 && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button
            onClick={() => loadArtsAndOwners()}
            size="small"
            sx={{ ml: 1 }}
          >
            Reintentar
          </Button>
        </Alert>
      )}
      {error && !isLoading && filteredArts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudo actualizar la lista: {error}
        </Alert>
      )}
      {!isLoading && filteredArts.length === 0 && !error && (
        <Alert severity="info" sx={{ m: 2 }}>
          No se encontraron obras que coincidan con los criterios.
        </Alert>
      )}

      {!isLoading && filteredArts.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 900 }} aria-label="art table">
            <TableHead
              sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
            >
              <TableRow>
                <TableCell sx={{ width: "8%" }}>Imagen</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "25%" }}>
                  <TableSortLabel
                    active={orderBy === "title"}
                    direction={orderBy === "title" ? order : "asc"}
                    onClick={() => handleRequestSort("title")}
                  >
                    Título
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                  <TableSortLabel
                    active={orderBy === "ownerName"}
                    direction={orderBy === "ownerName" ? order : "asc"}
                    onClick={() => handleRequestSort("ownerName")}
                  >
                    Propietario
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "12%" }}>
                  <TableSortLabel
                    active={orderBy === "category"}
                    direction={orderBy === "category" ? order : "asc"}
                    onClick={() => handleRequestSort("category")}
                  >
                    Categoría
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                  Tags
                </TableCell>{" "}
                {/* Tags column not sortable easily client-side */}
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleRequestSort("status")}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "5%" }}>
                  <TableSortLabel
                    active={orderBy === "visible"}
                    direction={orderBy === "visible" ? order : "asc"}
                    onClick={() => handleRequestSort("visible")}
                  >
                    Visible
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: "bold", width: "10%" }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedArts.map((art) => {
                /* ownerInfo lookup */
                const ownerInfo = ownerInfoMap[art.userId?.toString()] || {
                  name: art.prixerUsername || `ID: ${art.userId}`,
                  avatar: undefined,
                };
                return (
                  <TableRow
                    hover
                    key={art._id?.toString() || art.artId}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    {/* Other Cells */}
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={art.squareThumbUrl || art.smallThumbUrl}
                        alt={art.title}
                        sx={{ width: 56, height: 56 }}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Tooltip title={art.title} placement="top-start">
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 250 }}
                        >
                          {art.title}
                        </Typography>
                      </Tooltip>
                      <Typography
                        variant="caption"
                        display="block"
                        color="textSecondary"
                      >
                        ID: {art.artId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={ownerInfo.name} placement="top-start">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            src={ownerInfo.avatar}
                            sx={{ width: 24, height: 24 }}
                          />
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 150 }}
                          >
                            {ownerInfo.name}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{art.category || "-"}</TableCell>
                    {/* Updated Tag Cell */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          maxWidth: 200,
                        }}
                      >
                        {/* Display first few tags (e.g., 5) */}
                        {(art.tags || []).slice(0, 5).map((tag) => {
                          const lowerTag = tag.toLowerCase();
                          const isActive = filterTags.has(lowerTag);
                          return (
                            <Tooltip
                              key={tag}
                              title={
                                isActive
                                  ? `Quitar filtro "${tag}"`
                                  : `Filtrar por "${tag}"`
                              }
                            >
                              <Chip
                                label={tag}
                                size="small"
                                onClick={() => handleTagClick(tag)}
                                color={isActive ? "primary" : "default"}
                                variant={isActive ? "filled" : "outlined"}
                                sx={{ cursor: "pointer" }}
                              />
                            </Tooltip>
                          );
                        })}

                        {/* --- NEW: Conditionally render "..." chip with Tooltip --- */}
                        {(art.tags?.length || 0) > 5 &&
                          (() => {
                            // Calculate remaining tags
                            const remainingTags = (art.tags || []).slice(5);
                            // Format for tooltip (e.g., comma separated)
                            const tooltipTitle = `Más tags: ${remainingTags.join(", ")}`;

                            return (
                              <Tooltip title={tooltipTitle} placement="top">
                                {/* The actual "..." chip */}
                                <Chip
                                  label="..."
                                  size="small"
                                  variant="outlined" // Use outlined or plain
                                  sx={{ cursor: "default" }} // Indicate it's not directly clickable for filtering
                                />
                              </Tooltip>
                            );
                          })()}
                        {/* --- End NEW --- */}
                      </Box>
                    </TableCell>
                    <TableCell>{renderStatusChip(art.status)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title={art.visible ? "Visible" : "Oculto"}>
                        {art.visible ? (
                          <VisibilityIcon color="success" />
                        ) : (
                          <VisibilityOffIcon color="action" />
                        )}
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      {/* Action Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Editar Arte">
                          <IconButton
                            aria-label="edit"
                            color="primary"
                            onClick={() => handleUpdate(art._id?.toString())}
                            disabled={!art._id || isDeleting}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar Arte">
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(art)}
                            disabled={
                              !art._id ||
                              (isDeleting && artToDelete?._id === art._id)
                            }
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredArts.length} // Count based on filtered data
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por pág:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count}`
            }
          />
        </TableContainer>
      )}

      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={
          <>
            ¿Estás seguro de eliminar la obra{" "}
            <strong>{artToDelete?.title || ""}</strong>?
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isPerformingAction={isDeleting}
      />
    </>
  );
};

export default ReadArts;
