import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueFormatter,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';

export interface PerformanceData {
  id: string;
  name: string;
  imageUrl?: string;
  totalSales: number;
  totalUnits: number;
  orderCount: number;
}

interface PerformanceTableProps {
  data: PerformanceData[];
  metric: 'sales' | 'units';
  loading: boolean;
  isProduct?: boolean;
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
}) => {
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: isProduct ? 'Producto' : 'Nombre',
      flex: 2,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<PerformanceData>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
          <Avatar
            src={params.row.imageUrl}
            sx={{ mr: 2, width: 40, height: 40 }}
            variant="rounded"
          >
            {params.row.name?.charAt(0) ?? '?'}
          </Avatar>
          <Typography variant="body2">{params.row.name}</Typography>
        </Box>
      ),
    },
    {
      field: 'totalSales',
      headerName: 'Ingresos',
      type: 'number',
      valueFormatter: salesFormatter,
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'totalUnits',
      headerName: 'Unidades Vendidas',
      type: 'number',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'orderCount',
      headerName: '# Órdenes',
      type: 'number',
      flex: 1,
      minWidth: 120,
    },
  ];

  const sortedData = React.useMemo(
    () =>
      [...data].sort((a, b) => {
        if (metric === 'sales') {
          return b.totalSales - a.totalSales;
        }
        return b.totalUnits - a.totalUnits;
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
