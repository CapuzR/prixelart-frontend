import { useState, useEffect } from "react"
import { Button, Fade } from "@mui/material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.scrollY > window.innerHeight) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility)
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  return (
    <Fade in={isVisible}>
      <Button
        variant="contained"
        color="primary"
        onClick={scrollToTop}
        sx={{
          position: "fixed",
          padding: "6px",
          bottom: 30,
          left: 30,
          zIndex: 1000,
          borderRadius: "50%",
          minWidth: "32px !important",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            opacity: 1,
          },
        }}
        aria-label="Volver arriba"
      >
        <KeyboardArrowUpIcon />
      </Button>
    </Fade>
  )
}

export default ScrollToTopButton
