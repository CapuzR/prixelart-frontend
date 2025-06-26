import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';
import Grid2 from '@mui/material/Grid';

const DashboardSkeleton: React.FC = () => {
  return (
    <Box>
      {/* KPI Skeletons */}
      <Grid2 container spacing={3} mb={3}>
        {[...Array(4)].map((_, index) => (
          <Grid2 key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Skeleton variant="text" width="60%" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" width="40%" sx={{ fontSize: '2.5rem' }} />
            </Paper>
          </Grid2>
        ))}
      </Grid2>

      {/* Trend Chart Skeleton */}
      <Paper sx={{ p: 2, height: 400, mb: 3 }}>
        <Skeleton variant="text" width="40%" sx={{ fontSize: '1.5rem', mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} />
      </Paper>

      {/* Tabs Skeleton */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Skeleton variant="text" width="80%" height={48} />
        </Box>
        <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={400} />
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardSkeleton;