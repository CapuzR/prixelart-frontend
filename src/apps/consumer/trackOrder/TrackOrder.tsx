import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import YourLogo from './Logo.png';

const TrackOrder: React.FC = () => {
    const [orderId, setOrderId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrderId(event.target.value);
        if (error) setError('');
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!orderId.trim()) {
            setError('Por favor, ingresa un ID de orden.');
            return;
        }
        // You can add more specific validation for orderId format if needed
        navigate(`/track/${orderId.trim()}`);
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper elevation={3} sx={{ mt: { xs: 4, md: 8 }, p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                {/* Replace with your actual logo */}
                <img src={YourLogo} alt="Prixelart Logo" style={{ maxWidth: '150px', marginBottom: '24px' }} />
                <Typography variant="h5" component="h2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Rastrea tu Pedido
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
                    Ingresa el ID de tu orden para ver el estado actual y los detalles de tu envío.
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="orderId"
                        label="ID de Orden"
                        name="orderId"
                        autoComplete="off"
                        autoFocus
                        value={orderId}
                        onChange={handleInputChange}
                        error={!!error}
                        helperText={error || "Ej: 681b2444f8fe35acf3935089"}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 2, mb: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        Trackear Orden
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default TrackOrder;