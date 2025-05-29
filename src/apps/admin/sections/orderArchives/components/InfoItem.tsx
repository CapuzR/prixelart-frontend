import React from 'react';
import { Box, Typography, Tooltip, Link } from '@mui/material';

interface InfoItemProps {
    label: string;
    value?: string | number | null | React.ReactNode;
    tooltip?: string;
    isLink?: boolean;
    href?: string;
    display?: any; // MUI display prop
    valueTypographyProps?: Record<string, any>; // Pass props to value Typography
}

const InfoItem: React.FC<InfoItemProps> = ({
    label,
    value,
    tooltip,
    isLink = false,
    href = '#',
    display,
    valueTypographyProps
}) => {
    const renderValue = () => {
        const content = value ?? <Typography component="span" fontStyle="italic" color="text.secondary">N/A</Typography>;
        if (isLink && typeof value === 'string') {
            return <Link href={href} target="_blank" rel="noopener noreferrer">{content}</Link>;
        }
        return content;
    };

    const mainContent = (
        <Box sx={{ mb: 1.5, display: display }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                {label}
            </Typography>
            <Typography variant="body1" component="div" {...valueTypographyProps}>
                {renderValue()}
            </Typography>
        </Box>
    );

    return tooltip ? (
        <Tooltip title={tooltip} placement="top-start">
            {mainContent}
        </Tooltip>
    ) : mainContent;
};

export default InfoItem;