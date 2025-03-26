import React from "react"
import useMediaQuery from "@mui/material/useMediaQuery"
import Typography from "@mui/material/Typography"

interface IconProps {
  icons: any
  setSelectedIcon: (x: any) => void
  setOpenSelected: (x: boolean) => void
}

export const IconsList = ({
  icons,
  setSelectedIcon,
  setOpenSelected,
}: IconProps) => {
  const isMobile = useMediaQuery("(max-width:1090px)")

  return (
    <div style={{ marginLeft: isMobile ? 10 : 0, zIndex: 2 }}>
      <Typography
        style={{
          display: "flex",
          width: "100%",
          fontWeight: "bold",
          fontSize: "1.2rem",

          color: "#f69618",
          marginTop: 20,
          marginBottom: 5,
        }}
      >
        Obras
      </Typography>

      <div
        style={{
          width: isMobile ? "45%" : "100%",
          maxWidth: 360,
          paddingTop: 0,
          zIndex: 1,
        }}
      >
        {icons.map((icon: any, index: number) => {
          return (
            <a
              onClick={(e) => {
                setSelectedIcon(icon)
                setOpenSelected(true)
              }}
            >
              <div
                key={index}
                style={{
                  padding: 0,
                  paddingTop: isMobile ? "-50px" : 0,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Typography
                  style={{
                    fontSize: "1.3rem",
                    color: index % 2 === 0 ? "#72cddb" : "#f69618",
                    paddingLeft: icon.text.length === 1 ? 10 : 0,
                  }}
                >
                  {icon.text}
                </Typography>
                <Typography
                  style={{
                    fontSize: "0.8rem",
                    lineHeight: "1",
                    color: "#404e5c",
                  }}
                >
                  {" " + icon.name}
                </Typography>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
