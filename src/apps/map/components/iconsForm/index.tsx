import * as React from "react"
import { Grid2, Paper, Button, Typography } from "@mui/material"
import TextField from "@mui/material/TextField"

interface IconProps {
  icons: any
  setIcons: (x: any) => void
}

export function IconsForm({ icons, setIcons }: IconProps) {
  const [data, setData] = React.useState({
    name: "",
    description: "",
    src: "",
    originalCoordinates: {
      x: 0,
      y: 0,
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(data)
    setIcons([...icons, data])

    // e.target.reset();
    setData({
      name: "",
      description: "",
      src: "",
      originalCoordinates: {
        x: 0,
        y: 0,
      },
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "x" || e.target.id === "y") {
      setData({
        ...data,
        originalCoordinates: {
          ...data.originalCoordinates,
          [e.target.id]: e.target.value,
        },
      })
    } else {
      setData({
        ...data,
        [e.target.id]: e.target.value,
      })
    }
  }

  return (
    <>
      <Paper style={{ padding: "8%", width: "80%" }} elevation={1}>
        <form onSubmit={handleSubmit}>
          <Grid2 container spacing={5}>
            <Grid2>
              <Typography
                variant="h5"
                sx={{ color: "black", paddingBottom: 3 }}
              >
                Incluye íconos en LPG
              </Typography>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2>
              <TextField
                id="name"
                label="Nombre"
                variant="filled"
                onChange={handleInputChange}
                fullWidth
              />
            </Grid2>
            <Grid2>
              <TextField
                id="description"
                label="Descripción"
                variant="filled"
                onChange={handleInputChange}
                fullWidth
              />
            </Grid2>
            <Grid2>
              <TextField
                id="src"
                label="URL"
                variant="filled"
                onChange={handleInputChange}
                fullWidth
              />
            </Grid2>
            <Grid2 size={{xs:6}}>
              <TextField
                id="x"
                label="Posición X"
                variant="filled"
                onChange={handleInputChange}
              />
            </Grid2>
            <Grid2 size={{xs:6}}>
              <TextField
                id="y"
                label="Posición Y"
                variant="filled"
                onChange={handleInputChange}
              />
            </Grid2>
            <Grid2>
              <Button
                id="button"
                variant="contained"
                type="submit"
                sx={{ backgroundColor: "#f3a89e" }}
              >
                Agregar
              </Button>
            </Grid2>
          </Grid2>
        </form>
      </Paper>
    </>
  )
}
