import { useState, useEffect } from "react"
import axios from "axios"
import { makeStyles } from "tss-react/mui"
import { useTheme, Theme } from "@mui/material/styles"
import { SelectChangeEvent } from "@mui/material"

import Paper from "@mui/material/Paper"
import Grid2 from "@mui/material/Grid2"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Switch from "@mui/material/Switch"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import AddIcon from "@mui/icons-material/Add"
import useMediaQuery from "@mui/material/useMediaQuery"
import FormGroup from "@mui/material/FormGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import IconButton from "@mui/material/IconButton"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { getTestimonials } from "./api"
import { useSnackBar, useLoading, getPermissions } from "@context/GlobalContext"
import { Testimonial } from "../../../../types/testimonial.types"
// Investigar sobre drag&drop
function getStyles(type: string, theme: Theme) {
  return {
    fontWeight:
      type.indexOf(type) === -1
        ? (theme.typography.fontWeightRegular ?? 400)
        : (theme.typography.fontWeightMedium ?? 500),
  }
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    cardMedia: {
      paddingTop: "81.25%",
      borderRadius: "50%",
      margin: "28px",
    },
    paper: {
      padding: theme.spacing(2),
      margin: "15px",
    },
    input: {
      padding: "2",
    },
    title: {
      flexGrow: 1,
    },
    avatar: {
      width: 80,
      height: 80,
    },
  }
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

export default function Testimonials() {
  const { classes } = useStyles()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()
  const theme = useTheme()

  const [avatar, setAvatar] = useState({ file: "", _id: "" })
  const [type, setType] = useState("")
  const [name, setName] = useState("")
  const [value, setValue] = useState("")
  const [footer, setFooter] = useState("")
  const [tiles, setTiles] = useState<Testimonial[]>([])
  const [avatarObj, setAvatarObj] = useState("")
  const [avatarPic, setAvatarPic] = useState<File | undefined>(undefined)
  const [inputChange, setInputChange] = useState(false)
  const [state, setState] = useState({
    checkedA: true,
  })
  const [updateId, setUpdateId] = useState<string>("")

  const handleChangeType = (event: SelectChangeEvent<string>) => {
    setType(event.target.value)
  }
  // const [position, setPosition] = useState(tiles);

  const [snackBarError, setSnackBarError] = useState(false)

  const readTestimonial = async () => {
    try {
      const res = await getTestimonials()
      setTiles(res)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    readTestimonial()
  }, [])

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    if (!type || !name || !value || !avatar || !state) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)
      const formData = new FormData()
      if (avatarPic) formData.append("avatar", avatarPic)
      formData.append("type", type)
      formData.append("name", name)
      formData.append("value", value)
      formData.append("footer", footer)
      formData.append("status", state.checkedA.toString())

      const base_url = import.meta.env.VITE_BACKEND_URL + "/testimonial/create"

      const response = await axios
        .post(base_url, formData)
        .then((response) => {
          if (response.data.success === false) {
            showSnackBar(response.data.message)
          } else {
            showSnackBar("Creación de testimonio exitoso")
            setName("")
            setAvatarObj("")
            setType("")
            setValue("")
            setFooter("")
            setState({ checkedA: false })
            setUpdateId("")
            readTestimonial()
          }
        })

        .catch((error) => {
          console.log(error.response)
        })
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInputChange(true)
      setAvatarObj(URL.createObjectURL(e.target.files[0]))
      if (!e.target.files) {
        return
      }
      setAvatarPic(e.target.files?.[0])
    } //Avatar
  }
  const deleteTestimonial = async (DeleteId: string) => {
    setLoading(true)
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/testimonial/read/" + DeleteId
    let res = await axios.put(base_url, {
      adminToken: localStorage.getItem("adminTokenV"),
    })
    showSnackBar("Testimonio eliminado exitosamente")
    readTestimonial()
  }

  const ChangeVisibility = async (
    e: React.ChangeEvent<HTMLInputElement>,
    GetId: string
  ) => {
    e.preventDefault()
    setLoading(true)
    handleChange(e)
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/testimonial/update-home/" + GetId
    const response = await axios.put(base_url, {
      status: e.target.checked,
    })
    readTestimonial()
  }

  const ChangePosition = async (index: number, GetId: string) => {
    // e.preventDefault();
    setLoading(true)
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/testimonial/update-position/" + GetId
    const response = await axios.put(base_url, { position: index })
    readTestimonial()
  }

  const handleTestimonialDataEdit = async (GetId: string) => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/testimonial/" + GetId
    const response = await axios.get(base_url)
    setName(response.data.name)
    setAvatarObj(response.data.avatar)
    setType(response.data.type)
    setValue(response.data.value)
    setFooter(response.data.footer)
    setState({ checkedA: response.data.status })
    setUpdateId(GetId)
  }

  const saveChanges = async (
    e: React.MouseEvent<HTMLButtonElement>,
    GetId: string
  ) => {
    e.preventDefault()
    setLoading(true)
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/testimonial/update/" + GetId
    const formData = new FormData()
    formData.append("avatar", avatarPic || avatarObj)
    formData.append("type", type)
    formData.append("name", name)
    formData.append("value", value)
    formData.append("footer", footer)
    formData.append("status", state.checkedA.toString())

    const response = await axios.put(base_url, formData)
    setName("")
    setAvatarObj("")
    setType("")
    setValue("")
    setFooter("")
    setState({ checkedA: false })
    setUpdateId("")
    readTestimonial()
  }
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const reorder = (
    list: Testimonial[],
    startIndex: number,
    endIndex: number
  ) => {
    const result = [...list]
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  return (
    <div>
      <Paper className={classes.paper}>
        <AppBar position="static">
          <Typography
            style={{
              display: "flex",
              alignContent: "center",
              padding: "10px 40px",
            }}
            variant="h6"
            className={classes.title}
          >
            Testimonios
          </Typography>
        </AppBar>

        <Grid2
          container
          spacing={2}
          style={{
            width: "100%",
            padding: isMobile ? "0px" : "18px",
            display: "flex",
            textAlign: "start",
            justifyContent: "center",
          }}
        >
          {permissions?.createTestimonial && (
            <Grid2
              style={{
                padding: isMobile ? "0px" : "24px",
                paddingBottom: "15px",
                margin: isMobile ? "0px" : "15px",
              }}
              className={classes.paper}
              size={{
                xs: 12,
                lg: 10,
              }}
            >
              <Paper
                style={{ padding: isMobile ? "8px" : "24px" }}
                className={classes.paper}
              >
                <form encType="multipart/form-data" style={{ margin: 6 }}>
                  <Grid2
                    container
                    spacing={1}
                    style={{
                      paddingBottom: "10px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      padding={"4px"}
                      paddingRight={4}
                      paddingLeft={2}
                      style={{
                        width: "30%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {avatarObj ? (
                        <Avatar className={classes.avatar}>
                          <label htmlFor="file-input">
                            <img
                              src={avatarObj}
                              alt="testimonial avatar"
                              style={{
                                maxHeight: 80,
                              }}
                            />
                          </label>
                          <input
                            style={{ display: "none" }}
                            accept="image/*"
                            id="file-input"
                            type="file"
                            onChange={onImageChange}
                            required
                            name="avatar"
                          />
                        </Avatar>
                      ) : (
                        <Avatar className={classes.avatar}>
                          <label htmlFor="file-input">
                            <AddIcon
                              style={{
                                width: 40,
                                height: 40,
                                color: "#d33f49",
                                objectFit: "cover",
                              }}
                            />
                          </label>
                          <input
                            style={{ display: "none" }}
                            accept="image/*"
                            id="file-input"
                            type="file"
                            onChange={onImageChange}
                            name="avatar"
                          />
                        </Avatar>
                      )}
                    </Box>
                    <Grid2
                      size={{
                        xs: 8,
                      }}
                      padding={10}
                    >
                      <InputLabel style={{ fontSize: ".85em" }}>
                        Tipo
                      </InputLabel>
                      <Select
                        style={{ width: "100%" }}
                        labelId="tipo"
                        id="tipo"
                        value={type}
                        onChange={(e) => handleChangeType(e)}
                        MenuProps={MenuProps}
                      >
                        {["Prixer", "Compañía", "Cliente"].map((type) => (
                          <MenuItem
                            key={type}
                            value={type}
                            style={getStyles(type, theme)}
                          >
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid2>

                    <Grid2
                      size={{
                        xs: 12,
                      }}
                    >
                      <TextField
                        autoComplete="fname"
                        name="name"
                        variant="outlined"
                        fullWidth
                        type="text"
                        value={name}
                        id="name"
                        label="Nombre"
                        autoFocus
                        onChange={(e) => {
                          setName(e.target.value)
                        }}
                      />
                    </Grid2>
                    <Grid2
                      size={{
                        xs: 12,
                      }}
                    >
                      <TextField
                        autoComplete="fname"
                        name="value"
                        variant="outlined"
                        fullWidth
                        type="text"
                        value={value}
                        // inputProps={{ maxLength: 160 }}
                        id="value"
                        label="Body"
                        autoFocus
                        multiline
                        rows={3}
                        onChange={(e) => {
                          setValue(e.target.value)
                        }}
                      />
                    </Grid2>
                    <Grid2
                      size={{
                        xs: 12,
                      }}
                    >
                      <TextField
                        variant="outlined"
                        fullWidth
                        name="footer"
                        label="Footer"
                        type="text"
                        value={footer}
                        inputProps={{ maxLength: 60 }}
                        id="footer"
                        autoComplete="fname"
                        onChange={(e) => {
                          setFooter(e.target.value)
                        }}
                        multiline
                      />
                    </Grid2>
                    <Grid2
                      size={{
                        xs: 12,
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FormGroup row>
                        <FormControlLabel
                          label="Mostrar en la página de inicio"
                          style={{ color: "secondary" }}
                          control={
                            <Switch
                              color="primary"
                              checked={state.checkedA}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              name="checkedA"
                            />
                          }
                        />
                      </FormGroup>
                    </Grid2>
                  </Grid2>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    value="submit"
                    style={{ paddingTop: "4px", width: "100px" }}
                    onClick={(event) =>
                      updateId
                        ? saveChanges(event, updateId)
                        : handleSubmit(event)
                    }
                  >
                    {updateId ? "Actualizar testimonio" : "Crear testimonio"}
                  </Button>
                </form>
              </Paper>
            </Grid2>
          )}

          <DragDropContext
            onDragEnd={(result) => {
              const { source, destination, draggableId } = result
              if (!destination) {
                return
              }
              if (
                source.index === destination.index &&
                source.droppableId === destination.droppableId
              ) {
                return
              }
              setTiles((tiles) =>
                reorder(tiles, source.index, destination.index)
              )
              ChangePosition(destination.index, draggableId)
            }}
          >
            <Grid2
              container
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Grid2 size={{ xs: 12, sm: 8 }}>
                <Droppable droppableId="testimonials">
                  {(droppableProvided) => (
                    <div
                      {...droppableProvided.droppableProps}
                      ref={droppableProvided.innerRef}
                    >
                      {tiles.map((tile, index) => (
                        <Draggable
                          key={tile._id}
                          draggableId={tile._id}
                          index={index}
                        >
                          {(draggableProvided) => (
                            <Grid2
                              {...draggableProvided.draggableProps}
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.dragHandleProps}
                            >
                              <Paper
                                className={classes.paper}
                                style={{
                                  padding: "15px",
                                }}
                              >
                                <Grid2 key={tile._id} style={{ width: "100%" }}>
                                  <Grid2 container spacing={1}>
                                    <Grid2
                                      marginBottom={2}
                                      style={{ width: "100%" }}
                                    >
                                      {permissions?.createTestimonial && (
                                        <Box
                                          style={{
                                            display: "flex",
                                            justifyContent: "end",
                                          }}
                                        >
                                          <IconButton
                                            style={{ marginLeft: "10px" }}
                                            onClick={() =>
                                              handleTestimonialDataEdit(
                                                tile._id
                                              )
                                            }
                                          >
                                            <EditIcon color={"secondary"} />
                                          </IconButton>
                                          {permissions?.deleteTestimonial && (
                                            <IconButton
                                              onClick={() =>
                                                deleteTestimonial(tile._id)
                                              }
                                            >
                                              <DeleteIcon color={"secondary"} />
                                            </IconButton>
                                          )}
                                        </Box>
                                      )}
                                      <Box
                                        style={{
                                          display: "flex",
                                          paddingLeft: "20px",
                                        }}
                                      >
                                        <Avatar
                                          className={classes.avatar}
                                          src={tile.avatar}
                                        />
                                        <Box
                                          style={{
                                            paddingLeft: "30px",
                                          }}
                                        >
                                          <Typography>{tile.name}</Typography>
                                          <Typography color={"secondary"}>
                                            {tile.type}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Box
                                        style={{
                                          paddingTop: "10px",
                                        }}
                                      >
                                        <Typography
                                          variant={"body2"}
                                          style={{
                                            display: "flex",
                                            textAlign: "center",
                                            justifyContent: "center",
                                            // height: "60px",
                                          }}
                                        >
                                          {tile.value}
                                        </Typography>
                                      </Box>
                                      <Box
                                        style={{
                                          paddingTop: "8px",
                                          height: "35px",
                                        }}
                                      >
                                        <Typography
                                          variant={"body2"}
                                          color="secondary"
                                          style={{
                                            display: "flex",
                                            textAlign: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          {tile.footer}
                                        </Typography>
                                      </Box>
                                      {permissions?.createTestimonial && (
                                        <Box
                                          style={{
                                            paddingTop: "10px",
                                            display: "flex",
                                            justifyContent: "end",
                                          }}
                                        >
                                          <Typography
                                            color="secondary"
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            {" "}
                                            Mostrar en la página de inicio
                                          </Typography>
                                          <Switch
                                            checked={tile.status}
                                            color="primary"
                                            onChange={(event) =>
                                              ChangeVisibility(event, tile._id)
                                            }
                                            name="checkedA"
                                          />
                                        </Box>
                                      )}
                                    </Grid2>
                                  </Grid2>
                                </Grid2>
                              </Paper>
                            </Grid2>
                          )}
                        </Draggable>
                      ))}
                      {droppableProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Grid2>
            </Grid2>
          </DragDropContext>
        </Grid2>
      </Paper>
    </div>
  )
}
