//--- File: src/apps/admin/sections/dashboard/components/PerformanceTable.tsx ---
import React from 'react';
import { Box, Typography, Avatar, Link, Tooltip, IconButton } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueFormatter,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { Link as RouterLink } from 'react-router-dom';
import { getMainSiteBaseUrl } from '@api/utils.api';

// The data structure passed to this component for a product/art
// needs to include the necessary image sources.
export interface PerformanceData {
  id: string;
  name: string;
  imageUrl?: string; // Used for Sellers, Prixers, and as a fallback
  totalSales: number;
  totalUnits: number;
  orderCount: number;
  // Add the 'sources' object for products
  sources?: {
    images: { url: string }[];
  }
}

interface PerformanceTableProps {
  data: PerformanceData[];
  metric: 'sales' | 'units';
  loading: boolean;
  isProduct?: boolean;
  isPrixer?: boolean;
  isArt?: boolean;
}

const salesFormatter: GridValueFormatter = (value: number) => {
  if (value == null || isNaN(value)) {
    return '$0.00';
  }
  return `$${value.toFixed(2)}`;
};

const PerformanceTable: React.FC<PerformanceTableProps> = ({
  data,
  metric,
  loading,
  isProduct,
  isPrixer,
  isArt,
}) => {

  const mainSiteUrl = getMainSiteBaseUrl();

  let headerName = 'Nombre';
  if (isProduct) headerName = 'Producto';
  else if (isArt) headerName = 'Arte';
  else if (isPrixer) headerName = 'Prixer';

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: headerName,
      flex: 2,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<PerformanceData>) => {

        // Determine the correct image URL based on the data type
        let displayImageUrl = params.row.imageUrl; // Default/fallback
        if (isProduct && params.row.sources?.images?.[0]?.url) {
          displayImageUrl = params.row.sources.images[0].url;
        } else if (isArt) {
          // For art, the `imageUrl` from the backend aggregation is already the largeThumbUrl
          displayImageUrl = params.row.imageUrl;
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Avatar
              src={displayImageUrl}
              sx={{ mr: 2, width: 40, height: 40 }}
              variant="rounded"
            >
              {params.row.name?.charAt(0) ?? '?'}
            </Avatar>
            <Link
              href={isPrixer ? `${mainSiteUrl}/prixer/${params.row.name}` : undefined}
              target={isPrixer ? "_blank" : undefined}
              rel="noopener noreferrer"
              underline={isPrixer ? "hover" : "none"}
              color="inherit"
              sx={{ fontWeight: isPrixer ? 'bold' : 'normal' }}
            >
              <Typography variant="body2">{params.row.name}</Typography>
            </Link>
          </Box>
        );
      },
    },
    { field: 'totalSales', headerName: 'Ingresos', type: 'number', valueFormatter: salesFormatter, flex: 1, minWidth: 150 },
    { field: 'totalUnits', headerName: 'Unidades Vendidas', type: 'number', flex: 1, minWidth: 150 },
    { field: 'orderCount', headerName: '# Órdenes', type: 'number', flex: 1, minWidth: 120 },
  ];

  if (isProduct || isArt) {
    columns.push({
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params: GridRenderCellParams<PerformanceData>) => {
        const viewPath = isProduct ? `${mainSiteUrl}/producto/${params.row.id}` : `${mainSiteUrl}/art/${params.row.id}`;
        const editPath = isProduct ? `/admin/product/update/${params.row.id}` : `/admin/art/update/${params.row.id}`;
        const entity = isProduct ? "Producto" : "Arte";
        return (
          <Box>
            <Tooltip title={`Ver ${entity}`}>
              <IconButton size="small" component="a" href={viewPath} target="_blank" rel="noopener noreferrer">
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={`Editar ${entity}`}>
              <IconButton size="small" component={RouterLink} to={editPath}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    })
  }

  const sortedData = React.useMemo(
    () =>
      [...data].sort((a, b) => {
        if (metric === 'sales') {
          return (b.totalSales || 0) - (a.totalSales || 0);
        }
        return (b.totalUnits || 0) - (a.totalUnits || 0);
      }),
    [data, metric]
  );

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={sortedData}
        columns={columns}
        loading={loading}
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        rowHeight={60}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none !important',
          },
        }}
      />
    </Box>
  );
};

export default PerformanceTable;