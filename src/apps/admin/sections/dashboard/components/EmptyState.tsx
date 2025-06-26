import React from 'react';
import { Box, Typography } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface EmptyStateProps {
    icon: SvgIconComponent;
    title: string;
    message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: '100%',
                minHeight: 200,
                p: 3,
                color: 'text.secondary',
            }}
        >
            <Icon sx={{ fontSize: 60, mb: 2, color: 'grey.400' }} />
            <Typography variant="h6" component="p" gutterBottom sx={{ color: 'text.primary' }}>
                {title}
            </Typography>
            <Typography variant="body2">{message}</Typography>
        </Box>
    );
};

export default EmptyState;