import React, { useState, useEffect } from "react"
import Paper from "@mui/material/Paper"
import Grid2 from "@mui/material/Grid2"
import Button from "@mui/material/Button"
import { makeStyles } from "tss-react/mui"
import { useTheme, Theme } from "@mui/material/styles"
import MDEditor from "@uiw/react-md-editor"
import { useSnackBar, useLoading, getPermissions } from "@context/GlobalContext"
import { getTerms, updateTerms } from "../api"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      "& .MuiTextField-root": {
        margin: theme.spacing(1),
        width: "100%",
        height: "100%",
      },
    },
    paper: {
      padding: theme.spacing(2),
      margin: "auto",
      width: "100%",
    },
  }
})

interface cardinal {
  horizontal: string
  vertical: string
  open: boolean
}

export default function Terms() {
  const { classes } = useStyles()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()

  const [value, setValue] = useState<string | undefined>("")
  const [state, setState] = useState<cardinal>({
    open: false,
    vertical: "top",
    horizontal: "center",
  })
  const { vertical, horizontal, open } = state

  const handleChange = async () => {
    try {
      if (value) {
        const response = await updateTerms(value)
        if (response && response.data.success) {
          showSnackBar("Los términos y condiciones fueron actualizados!")
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const readTerms = async () => {
    try {
      const terms = await getTerms()
      setValue(terms)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    readTerms()
  }, [])

  const handleClick = () => () => {
    setState({
      open: true,
      vertical: "bottom",
      horizontal: "right",
    })
    handleChange()
  }

  const handleText: (value?: string) => void = (value) => {
    setValue(value)
    if (value === undefined) {
      setValue("")
    }
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {
          <Grid2 container spacing={2}>
            {permissions?.modifyTermsAndCo && (
              <Button
                variant="outlined"
                color="primary"
                style={{ margin: "14px 30px" }}
                onClick={handleClick}
              >
                Actualizar
              </Button>
            )}
            <Grid2 size={{ xs: 12 }}>
              <div
                style={{
                  width: "100%",
                  textAlign: "justify",
                  padding: "2px",
                  minHeight: "400px",
                }}
                data-color-mode="light"
              >
                {permissions?.modifyTermsAndCo && (
                  <MDEditor
                    value={value}
                    onChange={handleText}
                    style={{ minHeight: "600px", height: "600px" }}
                  />
                )}
                <MDEditor.Markdown
                  source={value}
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            </Grid2>
          </Grid2>
          //)
        }
      </Paper>
    </div>
  )
}
