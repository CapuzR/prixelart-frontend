import React from "react";
import { Card, CardContent, Typography, Divider, Box } from "@mui/material";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode; // Optional action button/icon in header
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  action,
}) => {
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {action}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
