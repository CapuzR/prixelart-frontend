import { useState } from "react"

import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import Grid2 from "@mui/material/Grid2"
import { useTheme } from "@mui/material/styles"
import Typography from "@mui/material/Typography"

import TestimonialsFeed from "../../admin/sections/testimonials/components/Feed"

export default function TestimonialsGrid() {
  return (
    <>
      <Container
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          flexGrow: 1,
        }}
      >
        <CssBaseline />

        <Grid2
          style={{ marginTop: 90, justifyContent: "center", display: "flex" }}
        >
          <Typography
            variant="h4"
            style={{ color: "#404e5c", marginBottom: 20 }}
            fontWeight="bold"
          >
            <strong>Testimonios</strong>
          </Typography>
        </Grid2>
        <Grid2>
          <TestimonialsFeed />
        </Grid2>
      </Container>
    </>
  )
}
