import React, { ChangeEvent } from "react"
import { TextField, Typography, Box } from "@mui/material"
import { Address } from "types/order.types" 
import Grid2 from "@mui/material/Grid"
interface EditableAddressFormProps {
  address: Address
  onAddressChange: (updatedAddress: Address) => void
  isDisabled?: boolean
  basicDisabled?: boolean
  showRecipientFields?: boolean
}

const EditableAddressForm: React.FC<EditableAddressFormProps> = ({
  address,
  onAddressChange,
  basicDisabled,
  isDisabled,
  showRecipientFields = true,
}) => {
  const handleRecipientChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    onAddressChange({
      ...address,
      recepient: {
        ...address.recepient,
        [name]: value,
      },
    })
  }

  const handleBasicAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    onAddressChange({
      ...address,
      address: {
        ...address.address,
        [name]: value,
      },
    })
  }

  return (
    <Box
      sx={{
        mt: 1,
        mb: 2,
        p: { xs: 1.5, md: 2 },
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        backgroundColor: "#fcfcfc",
      }}
    >
      <Grid2 container spacing={2}>
        {showRecipientFields && (
          <>
            <Grid2 size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Datos del Destinatario:
              </Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre Destinatario"
                name="name"
                value={address.recepient.name || ""}
                onChange={handleRecipientChange}
                fullWidth
                size="small"
                disabled={isDisabled || basicDisabled}
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Apellido Destinatario"
                name="lastName"
                value={address.recepient.lastName || ""}
                onChange={handleRecipientChange}
                fullWidth
                size="small"
                disabled={isDisabled || basicDisabled}
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email Destinatario"
                name="email"
                value={address.recepient.email || ""}
                onChange={handleRecipientChange}
                fullWidth
                size="small"
                disabled={isDisabled || basicDisabled}
                type="email"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Teléfono Destinatario"
                name="phone"
                value={address.recepient.phone || ""}
                onChange={handleRecipientChange}
                fullWidth
                size="small"
                disabled={isDisabled || basicDisabled}
                required
              />
            </Grid2>
          </>
        )}

        <Grid2 size={{ xs: 12 }} sx={{ mt: showRecipientFields ? 1 : 0 }}>
          <Typography variant="caption" color="text.secondary">
            Dirección:
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            label="Línea 1"
            name="line1"
            value={address.address.line1 || ""}
            onChange={handleBasicAddressChange}
            fullWidth
            size="small"
            required
            disabled={isDisabled}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            label="Línea 2 (Opcional)"
            name="line2"
            value={address.address.line2 || ""}
            onChange={handleBasicAddressChange}
            fullWidth
            size="small"
            disabled={isDisabled}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            label="Referencia (Opcional)"
            name="reference"
            value={address.address.reference || ""}
            onChange={handleBasicAddressChange}
            fullWidth
            size="small"
            disabled={isDisabled}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Ciudad"
            name="city"
            value={address.address.city || ""}
            onChange={handleBasicAddressChange}
            fullWidth
            size="small"
            required
            disabled={isDisabled}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Estado/Provincia"
            name="state"
            value={address.address.state || ""}
            onChange={handleBasicAddressChange}
            fullWidth
            size="small"
            disabled={isDisabled}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Código Postal"
            name="zipCode"
            value={address.address.zipCode || ""}
            onChange={handleBasicAddressChange}
            fullWidth
            size="small"
            disabled={isDisabled}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="País"
            name="country"
            value={address.address.country || ""}
            onChange={handleBasicAddressChange}
            fullWidth
            size="small"
            required
            disabled={isDisabled}
          />
        </Grid2>
      </Grid2>
    </Box>
  )
}

export default EditableAddressForm
