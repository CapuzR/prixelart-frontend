//--- File: src/apps/admin/sections/dashboard/components/CollapsibleWidget.tsx ---
import React, { useState, ReactNode } from 'react';
import { Paper, Box, Typography, IconButton, Collapse, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CollapsibleWidgetProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleWidget: React.FC<CollapsibleWidgetProps> = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    const theme = useTheme();

    const handleToggle = () => {
        setOpen(!open);
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
            }}
        >
            <Box
                onClick={handleToggle}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 2,
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover
                    }
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    {title}
                </Typography>
                <IconButton size="small">
                    <ExpandMoreIcon
                        sx={{
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease-in-out',
                        }}
                    />
                </IconButton>
            </Box>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, pt: 0 }}>
                    {children}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default CollapsibleWidget;