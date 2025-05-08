// src/apps/admin/sections/roles/views/ReadRoles.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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
    List,
    ListItem,
    ListItemText,
    Collapse,
    ListItemButton,
    FormControl,
    MenuItem,
    SelectChangeEvent,
    TableSortLabel,
    TextField,
    OutlinedInput,
    InputLabel,
    Select,
    InputAdornment,
    TablePagination,
    Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add'; // Import AddIcon
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search'; // Import SearchIcon
import { visuallyHidden } from '@mui/utils';
import Grid2 from '@mui/material/Grid';

// Hooks and Context 
import { useSnackBar } from 'context/GlobalContext';
import { Permissions } from 'types/permissions.types';
import { getRoles, deleteRole } from '@api/admin.api';

import Title from '@apps/admin/components/Title';
import ConfirmationDialog from '@components/ConfirmationDialog/ConfirmationDialog';
import { permissionGroups } from '../roles/roles';

export const RolePermissionsDetails: React.FC<{ role: Permissions }> = ({ role }) => {
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const handleGroupClick = (groupTitle: string) => {
        setOpenGroup(openGroup === groupTitle ? null : groupTitle);
    };

    return (
        <Box sx={{ maxWidth: 400 }}> {/* Keep max width or adjust  */}
            <List dense disablePadding>
                {permissionGroups.map((group) => (
                    group.check(role) && ( // Only show groups the role actually has permissions in
                        <React.Fragment key={group.title}>
                            <ListItemButton onClick={() => handleGroupClick(group.title)} sx={{ py: 0.5 }}>
                                <ListItemText
                                    primary={group.title}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                />
                                {openGroup === group.title ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse in={openGroup === group.title} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding dense>
                                    {group.items.map((item) => (
                                        item.check(role) && ( // Only show permissions the role has
                                            <ListItem key={item.label} sx={{ pl: 4, py: 0.2 }}>
                                                <ListItemText
                                                    primary={`• ${item.label}`}
                                                    primaryTypographyProps={{ variant: 'caption' }}
                                                />
                                            </ListItem>
                                        )
                                    ))}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    )
                ))}
            </List>
        </Box>
    );
};


const ReadRoles: React.FC = () => {
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar();

    // --- State ---
    const [roles, setRoles] = useState<Permissions[]>([]); // Original fetched data
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [roleToDelete, setRoleToDelete] = useState<Permissions | null>(null);

    // --- UI Control State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]); // Array of group titles
    const [sortConfig, setSortConfig] = useState<{ key: keyof Permissions | null; direction: 'asc' | 'desc' }>({ key: 'area', direction: 'asc' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Start with fewer rows per page
    const [expandedRow, setExpandedRow] = useState<string | null>(null); // Store ObjectId as string

    // --- Fetch Roles ---
    const loadRoles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedRoles = await getRoles() as Permissions[];
            if (fetchedRoles.some(role => !role._id)) {
                console.error("Some roles fetched are missing the '_id' field.");
                // Ensure _id is treated correctly if it's an ObjectId
                setRoles(fetchedRoles.map(r => ({ ...r, _id: r._id }))); // Assuming getRoles returns proper Permissions type
            } else {
                setRoles(fetchedRoles.map(r => ({ ...r, _id: r._id })));
            }
        } catch (err: any) {
            const message = err.message || "Error al cargar la lista de roles.";
            setError(message);
            showSnackBar(message);
            console.error("Error fetching roles list:", err);
        } finally {
            setIsLoading(false);
        }
    }, [showSnackBar]);

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    // --- Event Handlers ---
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset page on search
    };

    const handleFilterChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        setSelectedFilters(typeof value === 'string' ? value.split(',') : value);
        setPage(0); // Reset page on filter change
    };

    const handleSortRequest = (key: keyof Permissions) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExpandClick = (roleIdString: string) => {
        setExpandedRow(expandedRow === roleIdString ? null : roleIdString);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset page when rows per page changes
    };

    // --- Delete Handling ---
    const handleOpenDeleteDialog = (role: Permissions) => {
        if (!role._id) {
            showSnackBar("Cannot delete role: Missing ID.");
            return;
        }
        setRoleToDelete(role);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (isDeleting) return;
        setDialogOpen(false);
        // Delay resetting roleToDelete to avoid dialog content flashing
        setTimeout(() => setRoleToDelete(null), 150);
    };

    const handleConfirmDelete = async () => {
        if (!roleToDelete || !roleToDelete._id) {
            showSnackBar("Error: No role selected for deletion or missing ID.");
            setIsDeleting(false); // Ensure isDeleting is reset
            handleCloseDialog();
            return;
        }

        setIsDeleting(true);
        const roleIdString = roleToDelete._id.toString(); // Use string version of ID
        try {
            await deleteRole(roleIdString);
            showSnackBar(`Rol "${roleToDelete.area}" eliminado exitosamente.`);
            // Optimistically update UI
            setRoles(prevRoles => prevRoles.filter(role => role._id?.toString() !== roleIdString));
            handleCloseDialog();
        } catch (err: any) {
            console.error("Error deleting role:", err);
            const message = err.message || "Error al eliminar el rol.";
            showSnackBar(message);
            handleCloseDialog(); // Close dialog even on error
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Update Handling ---
    const handleUpdate = (roleIdString: string) => {
        if (!roleIdString) {
            showSnackBar("Cannot update role: Missing ID.");
            return;
        }
        navigate(`/admin/admins/roles/update/${roleIdString}`);
    };

    // --- Create Handling ---
    const handleCreate = () => {
        navigate('/admin/admins/roles/create');
    };

    // --- Derived Data Calculation (Search, Filter, Sort) ---
    const processedRoles = useMemo(() => {
        let processed = [...roles];

        // 1. Search Filter
        if (searchTerm) {
            processed = processed.filter(role =>
                role.area.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Group Filter
        if (selectedFilters.length > 0) {
            processed = processed.filter(role => {
                // Role must have permissions in at least one of the selected filter groups
                return selectedFilters.some(filterTitle => {
                    const group = permissionGroups.find(g => g.title === filterTitle);
                    // Check if the group exists and if the role has any permission in that group
                    return group ? group.check(role) : false;
                });
            });
        }

        // 3. Sorting
        if (sortConfig.key === 'area') { // Only sorting by area implemented
            processed.sort((a, b) => {
                const comparison = a.area.localeCompare(b.area);
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        // Add else if for other sortable keys 

        return processed;
    }, [roles, searchTerm, selectedFilters, sortConfig]);

    // --- Derived Data Calculation (Pagination) ---
    const paginatedRoles = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return processedRoles.slice(startIndex, startIndex + rowsPerPage);
    }, [processedRoles, page, rowsPerPage]);

    // --- Render Logic ---
    const renderContent = () => {
        // Loading state handled outside this function now
        if (isLoading) return null;

        // Error state when list is initially empty
        if (error && roles.length === 0) {
            return (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                    <Button onClick={loadRoles} size="small" sx={{ ml: 1 }}>Reintentar</Button>
                </Alert>
            );
        }

        // Empty state when no roles exist at all (after loading, no errors)
        if (!isLoading && roles.length === 0 && !error) {
            return (
                <Alert severity="info" sx={{ m: 2 }}>
                    No se encontraron roles. Puede crear uno nuevo usando el botón de arriba.
                </Alert>
            );
        }

        // Table content
        return (
            <>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="roles expandable table">
                        <TableHead sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                            <TableRow>
                                <TableCell padding="checkbox" /> {/* Cell for expand icon */}
                                <TableCell
                                    sortDirection={sortConfig.key === 'area' ? sortConfig.direction : false}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    <TableSortLabel
                                        active={sortConfig.key === 'area'}
                                        direction={sortConfig.key === 'area' ? sortConfig.direction : 'asc'}
                                        onClick={() => handleSortRequest('area')}
                                    >
                                        Nombre del Área/Rol
                                        {sortConfig.key === 'area' ? (
                                            <Box component="span" sx={visuallyHidden}>
                                                {sortConfig.direction === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                            </Box>
                                        ) : null}
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRoles.map((role) => {
                                // Ensure role._id exists and get string version
                                const roleIdString = role._id?.toString();
                                if (!roleIdString) {
                                    console.warn("Role missing _id:", role);
                                    return null; // Skip rendering row if ID is missing
                                }
                                const isExpanded = expandedRow === roleIdString;

                                return (
                                    <React.Fragment key={roleIdString}>
                                        {/* Main Data Row */}
                                        <TableRow
                                            hover
                                            sx={{ '& > *': { borderBottom: 'unset' } }} // Remove bottom border for expandable effect
                                            aria-expanded={isExpanded}
                                        >
                                            <TableCell padding="checkbox">
                                                <IconButton
                                                    aria-label="expand row"
                                                    size="small"
                                                    onClick={() => handleExpandClick(roleIdString)}
                                                >
                                                    {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {role.area}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                    <Tooltip title="Editar Rol">
                                                        <span>
                                                            <IconButton
                                                                aria-label="edit"
                                                                color="primary"
                                                                onClick={() => handleUpdate(roleIdString)}
                                                                disabled={isDeleting} // Disable if any delete is in progress
                                                                size="small"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Eliminar Rol">
                                                        <span>
                                                            <IconButton
                                                                aria-label="delete"
                                                                color="error"
                                                                onClick={() => handleOpenDeleteDialog(role)}
                                                                // Disable if this specific role is being deleted
                                                                disabled={isDeleting && roleToDelete?._id?.toString() === roleIdString}
                                                                size="small"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                        {/* Collapsible Row for Details */}
                                        <TableRow>
                                            {/* Use a single cell spanning all columns for the Collapse content */}
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                    <Box sx={{
                                                        margin: 1,
                                                        p: 2,
                                                        border: '1px solid rgba(224, 224, 224, 1)',
                                                        borderRadius: 1,
                                                        backgroundColor: (theme) => theme.palette.background.default // Slight background difference
                                                    }}>
                                                        <Typography variant="h6" gutterBottom component="div" sx={{ mb: 1 }}>
                                                            Permisos Asignados para "{role.area}"
                                                        </Typography>
                                                        <RolePermissionsDetails role={role} />
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                );
                            })}
                            {/* Handle empty rows when filtering/searching yields no results */}
                            {paginatedRoles.length === 0 && !isLoading && processedRoles.length === 0 && (searchTerm || selectedFilters.length > 0) && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No se encontraron roles que coincidan con los criterios de búsqueda o filtrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Pagination Component - Show only if there are roles to paginate */}
                {processedRoles.length > 0 && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={processedRoles.length} // Total count based on filtered/searched data
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Roles por página:" // Localization example
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`} // Localization example
                    />
                )}
            </>
        );
    };


    return (
        <>
            <Title title="Gestionar Áreas/Roles" />

            {/* Header Section: Filters, Search, Create Button */}
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}> {/* Add elevation */}
                <Grid2 container spacing={2} alignItems="center" justifyContent="space-between">
                    {/* Search Input */}
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label="Buscar por Nombre"
                            variant="outlined"
                            size="small"
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
                    </Grid2>

                    {/* Filter Select */}
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="role-filter-label">Filtrar por Grupo de Permisos</InputLabel>
                            <Select
                                labelId="role-filter-label"
                                multiple
                                value={selectedFilters}
                                onChange={handleFilterChange}
                                input={<OutlinedInput label="Filtrar por Grupo de Permisos" />}
                                renderValue={(selected) => selected.length === 0 ? <em>Todos</em> : selected.join(', ')}
                                MenuProps={{ // Prevent menu from going too wide
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                {/* Option to clear filters easily */}
                                <MenuItem disabled value="">
                                    <em>Seleccionar grupos...</em>
                                </MenuItem>
                                {permissionGroups.map((group) => (
                                    <MenuItem key={group.title} value={group.title}>
                                        <Checkbox checked={selectedFilters.includes(group.title)} size="small" />
                                        <ListItemText primary={group.title} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid2>

                    {/* Create Button */}
                    <Grid2 size={{ xs: 12, md: "auto" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreate}
                            disabled={isLoading || isDeleting}
                            fullWidth // Make button full width on smaller screens
                            sx={{ width: { md: 'auto' } }} // Auto width on medium+ screens
                        >
                            Crear Rol
                        </Button>
                    </Grid2>
                </Grid2>
            </Paper>

            {/* Loading Indicator */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, minHeight: 150 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Cargando roles...</Typography>
                </Box>
            )}

            {/* Display general fetch error here if list has old data but refresh failed */}
            {error && !isLoading && roles.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    No se pudo actualizar la lista de roles: {error}
                    <Button onClick={loadRoles} size="small" sx={{ ml: 1 }}>Reintentar</Button>
                </Alert>
            )}

            {/* Render Table/Pagination or Empty/Error State */}
            {renderContent()}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
                message={
                    <>
                        ¿Estás seguro de que deseas eliminar el rol{' '}
                        <strong>{roleToDelete?.area || ''}</strong>? Esta acción no se puede deshacer.
                    </>
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                isPerformingAction={isDeleting}
            />
        </>
    );
};

export default ReadRoles;