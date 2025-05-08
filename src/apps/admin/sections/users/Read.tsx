// src/apps/admin/sections/users/views/ReadUsers.tsx
import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, CircularProgress, Alert,
    Tooltip, Stack, Chip, Avatar, Toolbar, TextField, Select, MenuItem,
    FormControl, InputLabel, TablePagination, TableSortLabel // Added components
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh'; // Added
import PersonIcon from '@mui/icons-material/Person'; // User icon
import StorefrontIcon from '@mui/icons-material/Storefront'; // Example Prixer icon

// Hooks, Types, Context, API
import { useSnackBar } from 'context/GlobalContext';
import { User } from 'types/user.types'; // Keep Prixer nested within User type
import { getUsers, deleteUser } from '@api/user.api';

import Title from '@apps/admin/components/Title';
import ConfirmationDialog from '@components/ConfirmationDialog/ConfirmationDialog';
import { visuallyHidden } from '@mui/utils'; // For sorting accessibility

// --- Helper Types & Functions ---

type Order = 'asc' | 'desc';

// Define sortable columns explicitly - 'type' is a derived field
type UserSortableColumns = 'username' | 'firstName' | 'email' | 'active' | 'type';

interface FilterState {
    status: 'all' | 'active' | 'inactive';
    type: 'all' | 'prixer' | 'user';
}

// Sorting helper
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) { return -1; }
    if (b[orderBy] > a[orderBy]) { return 1; }
    return 0;
}

// Stable sort helper
function getComparator<Key extends UserSortableColumns>(
    order: Order,
    orderBy: Key,
): (
    a: User & { type: string }, // Add derived 'type' for comparison
    b: User & { type: string }
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// --- Component ---

const ReadUsers: React.FC = () => {
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar();

    // --- State ---
    const [users, setUsers] = useState<User[]>([]); // Original fetched list
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // State for Filtering, Sorting, Pagination
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filters, setFilters] = useState<FilterState>({ status: 'all', type: 'all' });
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<UserSortableColumns>('username');
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Default rows per page

    // --- Fetch Data ---
    const loadUsers = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        setError(null);
        try {
            const fetchedUsers = await getUsers() as User[];
            setUsers(fetchedUsers); // Set the original list
        } catch (err: any) { /* ... error handling ... */
            const message = err.message || "Error al cargar."; setError(message); showSnackBar(message); console.error("Error fetching:", err);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [showSnackBar]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    // --- Processing Pipeline (Filter, Sort, Paginate) ---
    const processedUsers = useMemo(() => {
        let filteredUsers = [...users];

        // Apply Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                user.username.toLowerCase().includes(lowerQuery) ||
                user.firstName?.toLowerCase().includes(lowerQuery) ||
                user.lastName?.toLowerCase().includes(lowerQuery) ||
                user.email.toLowerCase().includes(lowerQuery)
            );
        }

        // Apply Filters
        filteredUsers = filteredUsers.filter(user => {
            const statusMatch = filters.status === 'all' || (filters.status === 'active' && user.active) || (filters.status === 'inactive' && !user.active);
            const typeMatch = filters.type === 'all' || (filters.type === 'prixer' && !!user.prixer) || (filters.type === 'user' && !user.prixer);
            return statusMatch && typeMatch;
        });

        // Apply Sorting (Add derived 'type' property for sorting)
        const usersWithDerivedType = filteredUsers.map(u => ({ ...u, type: !!u.prixer ? 'Prixer' : 'User' }));
        const sortedUsers = usersWithDerivedType.sort(getComparator(order, orderBy));


        // Apply Pagination (Done after filtering and sorting)
        return sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    }, [users, searchQuery, filters, order, orderBy, page, rowsPerPage]);

    // Calculate total count *after* filtering for pagination
    const totalFilteredCount = useMemo(() => {
        let filteredUsers = [...users];
        if (searchQuery) { const lowerQuery = searchQuery.toLowerCase(); filteredUsers = filteredUsers.filter(user => user.username.toLowerCase().includes(lowerQuery) || user.firstName?.toLowerCase().includes(lowerQuery) || user.lastName?.toLowerCase().includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery)); }
        filteredUsers = filteredUsers.filter(user => { const statusMatch = filters.status === 'all' || (filters.status === 'active' && user.active) || (filters.status === 'inactive' && !user.active); const typeMatch = filters.type === 'all' || (filters.type === 'prixer' && !!user.prixer) || (filters.type === 'user' && !user.prixer); return statusMatch && typeMatch; });
        return filteredUsers.length;
    }, [users, searchQuery, filters]);

    // --- Handlers ---
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setPage(0); // Reset page when search changes
    };

    const handleFilterChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        const { name, value } = event.target;
        if (name) {
            setFilters(prev => ({ ...prev, [name]: value as FilterState[keyof FilterState] }));
            setPage(0); // Reset page when filters change
        }
    };

    const handleRequestSort = (property: UserSortableColumns) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
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
        loadUsers(false); // Fetch without setting global loading true
    };

    // --- Delete Handling ---
    const handleOpenDeleteDialog = (user: User) => { /* ... same logic ... */ if (!user._id) { showSnackBar("Falta ID."); return; } setUserToDelete(user); setDialogOpen(true); };
    const handleCloseDialog = () => { /* ... same logic ... */ if (isDeleting) return; setDialogOpen(false); setUserToDelete(null); };
    const handleConfirmDelete = async () => {
        if (!userToDelete?._id || !userToDelete?.username) { /* ... error handling ... */ showSnackBar("Error: Usuario no seleccionado."); setIsDeleting(false); handleCloseDialog(); return; }
        setIsDeleting(true);
        try {
            // NOTE: Using username for deletion. Verify if API expects _id instead.
            await deleteUser(userToDelete.username);
            showSnackBar(`Usuario "${userToDelete.username}" eliminado.`);
            // Important: Update the *original* users list state
            setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
            handleCloseDialog();
        } catch (err: any) { /* ... error handling ... */
            console.error("Error deleting:", err); showSnackBar(err.message || "Error al eliminar."); handleCloseDialog();
        } finally { setIsDeleting(false); }
    };

    // --- Update & Create Handling ---
    const handleUpdate = (userId: string) => { /* ... same logic ... */ if (!userId) { showSnackBar("Falta ID."); return; } navigate(`/admin/users/update/${userId}`); };
    const handleCreate = () => { /* ... same logic ... */ navigate('/admin/users/create'); };

    // --- Table Head Configuration ---
    interface HeadCell { id: UserSortableColumns; label: string; numeric: boolean; disablePadding: boolean; width?: string; }
    const headCells: readonly HeadCell[] = [
        // Avatar is not sortable
        { id: 'username', numeric: false, disablePadding: false, label: 'Username', width: '15%' },
        { id: 'firstName', numeric: false, disablePadding: false, label: 'Nombre', width: '25%' }, // Sorting by firstName, displays full name
        { id: 'email', numeric: false, disablePadding: false, label: 'Email', width: '20%' },
        { id: 'type', numeric: false, disablePadding: false, label: 'Tipo', width: '10%' }, // New column
        // Role is not easily sortable client-side
        { id: 'active', numeric: false, disablePadding: false, label: 'Estado', width: '10%' },
        // Actions are not sortable
    ];

    // --- Render Logic ---
    return (
        <>
            <Title title="Gestionar Usuarios" />
            {/* Toolbar for Search, Filters, Actions */}
            <Paper sx={{ mb: 2, p: 2 }}>
                <Toolbar sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
                    <Box sx={{ flex: '1 1 40%' }}>
                        <TextField
                            fullWidth variant="outlined" size="small"
                            placeholder="Buscar por nombre, usuario, email..."
                            value={searchQuery} onChange={handleSearchChange}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Estado</InputLabel>
                            <Select name="status" label="Estado" value={filters.status} onChange={handleFilterChange as any}>
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="active">Activo</MenuItem>
                                <MenuItem value="inactive">Inactivo</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Tipo Usuario</InputLabel>
                            <Select name="type" label="Tipo Usuario" value={filters.type} onChange={handleFilterChange as any}>
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="prixer">Prixer</MenuItem>
                                <MenuItem value="user">Usuario</MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title="Refrescar Lista">
                            <IconButton onClick={handleRefresh}><RefreshIcon /></IconButton>
                        </Tooltip>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={isLoading || isDeleting} size="small">Crear</Button>
                    </Box>
                </Toolbar>
            </Paper>

            {/* Main Content Area */}
            {isLoading && (<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>)}
            {error && !isLoading && users.length === 0 && (<Alert severity="error" sx={{ m: 2 }}>{error}<Button onClick={() => loadUsers()} size="small">Reintentar</Button></Alert>)}
            {!isLoading && users.length === 0 && !error && !searchQuery && filters.status === 'all' && filters.type === 'all' && (<Alert severity="info" sx={{ m: 2 }}>No se encontraron usuarios.</Alert>)}
            {!isLoading && totalFilteredCount === 0 && (users.length > 0 || searchQuery || filters.status !== 'all' || filters.type !== 'all') && (<Alert severity="info" sx={{ m: 2 }}>No hay usuarios que coincidan con la búsqueda o filtros aplicados.</Alert>)}

            {/* Table Display */}
            {!isLoading && totalFilteredCount > 0 && (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader sx={{ minWidth: 900 }} aria-label="users table">
                            <TableHead>
                                <TableRow sx={{ '& th': { backgroundColor: (theme) => theme.palette.action.hover, fontWeight: 'bold' } }}>
                                    <TableCell sx={{ width: '5%' }}>Avatar</TableCell> {/* Adjusted width */}
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.numeric ? 'right' : 'left'}
                                            padding={headCell.disablePadding ? 'none' : 'normal'}
                                            sortDirection={orderBy === headCell.id ? order : false}
                                            sx={{ width: headCell.width }}
                                        >
                                            <TableSortLabel
                                                active={orderBy === headCell.id}
                                                direction={orderBy === headCell.id ? order : 'asc'}
                                                onClick={() => handleRequestSort(headCell.id)}
                                            >
                                                {headCell.label}
                                                {orderBy === headCell.id ? (
                                                    <Box component="span" sx={visuallyHidden}>
                                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                    </Box>
                                                ) : null}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))}
                                    <TableCell sx={{ width: '15%' }}>Rol(es)</TableCell> {/* Adjusted width */}
                                    <TableCell align="right" sx={{ width: '10%' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedUsers.map((user) => (
                                    <TableRow hover key={user._id?.toString()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell><Avatar src={user.avatar || undefined} alt={user.username} sx={{ width: 32, height: 32 }} /></TableCell>
                                        <TableCell component="th" scope="row">{user.username}</TableCell>
                                        <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        {/* User Type Column */}
                                        <TableCell>
                                            <Chip
                                                icon={!!user.prixer ? <StorefrontIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                                                label={!!user.prixer ? 'Prixer' : 'Usuario'}
                                                size="small"
                                                color={!!user.prixer ? 'info' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        {/* Status Column */}
                                        <TableCell>
                                            <Chip icon={user.active ? <CheckCircleIcon /> : <CancelIcon />} label={user.active ? 'Activo' : 'Inactivo'} color={user.active ? 'success' : 'default'} size="small" variant="outlined" />
                                        </TableCell>
                                        {/* Roles Column */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {user.role?.map(r => <Chip key={r} label={r} size="small" variant="outlined" />) ?? 'N/A'}
                                            </Box>
                                        </TableCell>
                                        {/* Actions Column */}
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                <Tooltip title="Editar"><IconButton aria-label="edit" color="primary" onClick={() => handleUpdate(user._id!.toString())} disabled={!user._id || isDeleting} size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Eliminar"><IconButton aria-label="delete" color="error" onClick={() => handleOpenDeleteDialog(user)} disabled={!user._id || (isDeleting && userToDelete?._id === user._id)} size="small"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
                        count={totalFilteredCount} // Use count after filtering
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por pág:"
                    />
                </Paper>
            )}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={dialogOpen} onClose={handleCloseDialog} onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
                message={<>¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.username || ''}</strong>?</>}
                confirmText="Eliminar" cancelText="Cancelar" isPerformingAction={isDeleting}
            />
        </>
    );
};

export default ReadUsers;