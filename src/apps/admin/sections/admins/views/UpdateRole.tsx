import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react"
import { useParams, useNavigate } from "react-router-dom"

// Hooks and Context
import { useSnackBar } from "context/GlobalContext"
import { PermissionsV2 } from "types/permissions.types"
import { createRole, getRoleById, updateRole } from "@api/admin.api"

// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
  FormGroup,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

import Title from "@apps/admin/components/Title"
import { permissionGroups } from "../roles/roles"
import Grid2 from "@mui/material/Grid"

const initializeNestedPermissions = (
  initialData?: PermissionsV2
): Omit<PermissionsV2, "_id"> => {
  const initial: Omit<PermissionsV2, "_id"> = {
    area: initialData?.area || "",
    admins: {},
    art: {},
    discounts: {},
    movements: {},
    orders: {},
    paymentMethods: {},
    preferences: {},
    products: {},
    shippingMethod: {},
    surcharges: {},
    testimonials: {},
    users: {},
  } as Omit<PermissionsV2, "_id">

  permissionGroups.forEach((group) => {
    group.items.forEach((item) => {
      const parts = item.key.split(".")
      let current: any = initial
      let currentInitialData: any = initialData

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (i === parts.length - 1) {
          current[part] =
            currentInitialData &&
            typeof currentInitialData === "object" &&
            part in currentInitialData
              ? currentInitialData[part]
              : false
        } else {
          if (
            !current[part] ||
            typeof current[part] !== "object" ||
            current[part] === null
          ) {
            current[part] = {}
          }
          current = current[part]

          if (
            currentInitialData &&
            typeof currentInitialData === "object" &&
            part in currentInitialData
          ) {
            currentInitialData = currentInitialData[part]
          } else {
            currentInitialData = undefined
          }
        }
      }
    })
  })
  return initial
}

const getNestedPermissionValue = (
  permissions: Omit<PermissionsV2, "_id">,
  path: string
): boolean => {
  const parts = path.split(".")
  let current: any = permissions

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part]
    } else {
      return false
    }
  }
  return typeof current === "boolean" ? current : false
}

const setNestedPermissionValue = (
  permissions: Omit<PermissionsV2, "_id">,
  path: string,
  value: boolean
): Omit<PermissionsV2, "_id"> => {
  const newPermissions = JSON.parse(JSON.stringify(permissions))
  const parts = path.split(".")
  let current: any = newPermissions

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (i === parts.length - 1) {
      if (typeof current === "object" && current !== null) {
        current[part] = value
      }
    } else {
      if (
        !(part in current) ||
        typeof current[part] !== "object" ||
        current[part] === null
      ) {
        current[part] = {}
      }
      current = current[part]
    }
  }
  return newPermissions
}

const CreateRole: React.FC = () => {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  const [formData, setFormData] = useState<Omit<PermissionsV2, "_id">>(
    initializeNestedPermissions()
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null)
  const [nameTouched, setNameTouched] = useState<boolean>(false)
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  )

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false)
    }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target

    if (name === "area") {
      setFormData((prevData) => ({
        ...prevData,
        area: value,
      }))
    } else {
      setFormData((prevData) =>
        setNestedPermissionValue(prevData, name, checked)
      )
    }

    if (
      errorSubmit &&
      errorSubmit !== "El nombre del Área/Rol es obligatorio."
    ) {
      setErrorSubmit(null)
    }
    if (
      name === "area" &&
      errorSubmit === "El nombre del Área/Rol es obligatorio." &&
      value.trim()
    ) {
      setErrorSubmit(null)
    }
  }

  const handleNameBlur = () => {
    setNameTouched(true)
  }

  const handleGroupToggle = (
    groupItems: { key: string }[],
    checked: boolean
  ) => {
    setFormData((prevData) => {
      let newData = { ...prevData }
      groupItems.forEach((item) => {
        newData = setNestedPermissionValue(newData, item.key, checked)
      })
      return newData
    })
    if (
      errorSubmit &&
      errorSubmit !== "El nombre del Área/Rol es obligatorio."
    ) {
      setErrorSubmit(null)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.area.trim()) {
      return false
    }
    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNameTouched(true)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrorSubmit(null)

    try {
      const response = await createRole(formData)

      if (response) {
        showSnackBar(`Área/Rol "${formData.area}" creado exitosamente.`)
        setFormData(initializeNestedPermissions())
        navigate("/admin/admins/roles/read")
      } else {
        console.warn("Role creation response was empty or unexpected.")
        showSnackBar(
          `Área/Rol "${formData.area}" creado, pero la respuesta fue inesperada.`
        )
        setFormData(initializeNestedPermissions())
        navigate("/admin/admins/roles/read")
      }
    } catch (err: any) {
      console.error("Failed to create role:", err)
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error al crear el Área/Rol. Intente nuevamente."
      setErrorSubmit(message)
      showSnackBar(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(initializeNestedPermissions())
    setErrorSubmit(null)
    setNameTouched(false)
    setExpandedAccordion(false)
    navigate("/admin/admins/roles/read")
  }

  const nameHasError = nameTouched && !formData.area.trim()

  return (
    <>
      <Title title="Crear Nueva Área/Rol" />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="Nombre del Área/Rol"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                onBlur={handleNameBlur}
                required
                fullWidth
                variant="outlined"
                disabled={isSubmitting}
                error={nameHasError}
                helperText={
                  nameHasError ? "El nombre del Área/Rol es obligatorio." : ""
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="overline">Permisos</Typography>
              </Divider>
            </Grid2>

            {permissionGroups.map((group) => {
              const groupKeys = group.items.map((item) => item.key)
              const checkedCount = groupKeys.reduce(
                (count, key) =>
                  count + (getNestedPermissionValue(formData, key) ? 1 : 0),
                0
              )
              const allChecked =
                groupKeys.length > 0 && checkedCount === groupKeys.length
              const someChecked = checkedCount > 0 && !allChecked

              return (
                <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={group.title}>
                  <Accordion
                    square
                    elevation={1}
                    expanded={expandedAccordion === group.title}
                    onChange={handleAccordionChange(group.title)}
                    disabled={isSubmitting}
                    sx={{ "&:before": { display: "none" } }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${group.title}-content`}
                      id={`${group.title}-header`}
                      sx={{
                        flexDirection: "row-reverse",
                        "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded":
                          {
                            transform: "rotate(180deg)",
                          },
                        "& .MuiAccordionSummary-content": {
                          alignItems: "center",
                          marginLeft: 1,
                        },
                      }}
                    >
                      <FormControlLabel
                        onClick={(event) => event.stopPropagation()}
                        onFocus={(event) => event.stopPropagation()}
                        control={
                          <Checkbox
                            checked={allChecked}
                            indeterminate={someChecked}
                            onChange={(e) =>
                              handleGroupToggle(group.items, e.target.checked)
                            }
                            size="small"
                            disabled={isSubmitting || groupKeys.length === 0}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {group.title}
                          </Typography>
                        }
                        sx={{ mr: "auto" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        {`(${checkedCount}/${groupKeys.length})`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1, px: 2 }}>
                      <FormGroup sx={{ pl: { xs: 1, sm: 2 } }}>
                        {group.items.map((item) => (
                          <FormControlLabel
                            key={item.key}
                            control={
                              <Checkbox
                                checked={getNestedPermissionValue(
                                  formData,
                                  item.key
                                )}
                                onChange={handleInputChange}
                                name={item.key}
                                size="small"
                                disabled={isSubmitting}
                              />
                            }
                            label={item.label}
                            sx={{
                              "& .MuiFormControlLabel-label": {
                                fontSize: "0.875rem",
                              },
                            }}
                          />
                        ))}
                        {group.items.length === 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ pl: 2, fontStyle: "italic" }}
                          >
                            (No hay permisos en este grupo)
                          </Typography>
                        )}
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                </Grid2>
              )
            })}

            {errorSubmit && (
              <Grid2 size={{ xs: 12 }}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorSubmit}
                </Alert>
              </Grid2>
            )}

            <Grid2 size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Creando..." : "Crear Área/Rol"}
                </Button>
              </Box>
            </Grid2>
          </Grid2>
        </form>
      </Paper>
    </>
  )
}

const UpdateAdminRole: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  const [formData, setFormData] = useState<Omit<PermissionsV2, "_id">>(
    initializeNestedPermissions()
  )
  const [originalRoleName, setOriginalRoleName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorFetch, setErrorFetch] = useState<string | null>(null)
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null)
  const [nameTouched, setNameTouched] = useState<boolean>(false)
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  )

  const fetchRole = useCallback(async () => {
    if (!id) {
      setErrorFetch("No se proporcionó ID del rol.")
      setIsLoading(false)
      showSnackBar("ID de rol inválido.")
      navigate("/admin/admins/roles/read")
      return
    }

    setIsLoading(true)
    setErrorFetch(null)
    setErrorSubmit(null)
    try {
      const response = await getRoleById(id)
      if (response) {
        const roleData = response as PermissionsV2
        setFormData(initializeNestedPermissions(roleData))
        setOriginalRoleName(roleData.area)
      } else {
        throw new Error("Rol no encontrado.")
      }
    } catch (err: any) {
      console.error("Failed to fetch role:", err)
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los datos del rol."
      setErrorFetch(message)
      showSnackBar(message)
    } finally {
      setIsLoading(false)
    }
  }, [id, navigate, showSnackBar])

  useEffect(() => {
    fetchRole()
  }, [fetchRole])

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false)
    }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target
    if (name === "area") {
      setFormData((prevData) => ({
        ...prevData,
        area: value,
      }))
    } else {
      setFormData((prevData) =>
        setNestedPermissionValue(prevData, name, checked)
      )
    }

    if (
      errorSubmit &&
      errorSubmit !== "El nombre del Área/Rol es obligatorio."
    ) {
      setErrorSubmit(null)
    }
    if (
      name === "area" &&
      errorSubmit === "El nombre del Área/Rol es obligatorio." &&
      value.trim()
    ) {
      setErrorSubmit(null)
    }
  }

  const handleNameBlur = () => {
    setNameTouched(true)
  }

  const handleGroupToggle = (
    groupItems: { key: string }[],
    checked: boolean
  ) => {
    setFormData((prevData) => {
      let newData = { ...prevData }
      groupItems.forEach((item) => {
        newData = setNestedPermissionValue(newData, item.key, checked)
      })
      return newData
    })
    if (
      errorSubmit &&
      errorSubmit !== "El nombre del Área/Rol es obligatorio."
    ) {
      setErrorSubmit(null)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.area.trim()) {
      return false
    }
    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNameTouched(true)

    if (!id || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrorSubmit(null)

    try {
      console.log("Updating Role Data:", id, formData)
      const response = await updateRole(id, formData)

      if (response) {
        showSnackBar(`Área/Rol "${formData.area}" actualizado exitosamente.`)
        navigate("/admin/admins/roles/read")
      } else {
        throw new Error(
          "La actualización del rol no devolvió una respuesta esperada."
        )
      }
    } catch (err: any) {
      console.error("Failed to update role:", err)
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar el Área/Rol."
      setErrorSubmit(message)
      showSnackBar(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/admin/admins/roles/read")
  }

  const nameHasError = nameTouched && !formData.area.trim()

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
          minHeight: "200px",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando datos del rol...</Typography>
      </Box>
    )
  }

  if (errorFetch) {
    return (
      <Box sx={{ p: 2 }}>
        <Title title="Error al Cargar Rol" />
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorFetch}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button onClick={fetchRole} size="small" variant="outlined">
              Reintentar
            </Button>
            <Button onClick={handleCancel} size="small" color="secondary">
              Volver a la lista
            </Button>
          </Stack>
        </Alert>
      </Box>
    )
  }

  return (
    <>
      <Title title={`Actualizar Rol: ${originalRoleName}`} />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="Nombre del Área/Rol"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                onBlur={handleNameBlur}
                required
                fullWidth
                variant="outlined"
                disabled={isSubmitting || isLoading}
                error={nameHasError}
                helperText={
                  nameHasError ? "El nombre del Área/Rol es obligatorio." : ""
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="overline">Permisos</Typography>
              </Divider>
            </Grid2>

            {permissionGroups.map((group) => {
              const groupKeys = group.items.map((item) => item.key)
              const checkedCount = groupKeys.reduce(
                (count, key) =>
                  count + (getNestedPermissionValue(formData, key) ? 1 : 0),
                0
              )
              const allChecked =
                groupKeys.length > 0 && checkedCount === groupKeys.length
              const someChecked = checkedCount > 0 && !allChecked

              return (
                <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={group.title}>
                  <Accordion
                    square
                    elevation={1}
                    expanded={expandedAccordion === group.title}
                    onChange={handleAccordionChange(group.title)}
                    disabled={isLoading || isSubmitting}
                    sx={{ "&:before": { display: "none" } }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${group.title}-content`}
                      id={`${group.title}-header`}
                      sx={{
                        flexDirection: "row-reverse",
                        "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded":
                          {
                            transform: "rotate(180deg)",
                          },
                        "& .MuiAccordionSummary-content": {
                          alignItems: "center",
                          marginLeft: 1,
                        },
                      }}
                    >
                      <FormControlLabel
                        onClick={(event) => event.stopPropagation()}
                        onFocus={(event) => event.stopPropagation()}
                        control={
                          <Checkbox
                            checked={allChecked}
                            indeterminate={someChecked}
                            onChange={(e) =>
                              handleGroupToggle(group.items, e.target.checked)
                            }
                            size="small"
                            disabled={
                              isLoading ||
                              isSubmitting ||
                              groupKeys.length === 0
                            }
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {group.title}
                          </Typography>
                        }
                        sx={{ mr: "auto" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        {`(${checkedCount}/${groupKeys.length})`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1, px: 2 }}>
                      <FormGroup sx={{ pl: { xs: 1, sm: 2 } }}>
                        {group.items.map((item) => (
                          <FormControlLabel
                            key={item.key}
                            control={
                              <Checkbox
                                checked={getNestedPermissionValue(
                                  formData,
                                  item.key
                                )}
                                onChange={handleInputChange}
                                name={item.key}
                                size="small"
                                disabled={isLoading || isSubmitting}
                              />
                            }
                            label={item.label}
                            sx={{
                              "& .MuiFormControlLabel-label": {
                                fontSize: "0.875rem",
                              },
                            }}
                          />
                        ))}
                        {group.items.length === 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ pl: 2, fontStyle: "italic" }}
                          >
                            (No hay permisos en este grupo)
                          </Typography>
                        )}
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                </Grid2>
              )
            })}

            {errorSubmit && (
              <Grid2 size={{ xs: 12 }}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorSubmit}
                </Alert>
              </Grid2>
            )}

            <Grid2 size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting || isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || isLoading}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Box>
            </Grid2>
          </Grid2>
        </form>
      </Paper>
    </>
  )
}

export default UpdateAdminRole
