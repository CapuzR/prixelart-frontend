import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  useMemo,
} from "react"
import { useNavigate } from "react-router-dom"

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Chip,
  Avatar,
  Collapse,
  TextField,
  Autocomplete,
  FormControl,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  TablePagination,
  TableSortLabel,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import DownloadIcon from "@mui/icons-material/Download"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import SearchIcon from "@mui/icons-material/Search"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import StarIcon from "@mui/icons-material/Star"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import { visuallyHidden } from "@mui/utils"
import Grid2 from "@mui/material/Grid"

// Hooks, Types, Context, API
import { useSnackBar } from "context/GlobalContext"
import { Product, Variant, VariantAttribute } from "types/product.types"
import { PermissionsV2 } from "types/permissions.types"

import {
  fetchProducts,
  updateManyProduct,
  deleteProduct,
} from "@api/product.api"
import { getPermissions } from "@api/admin.api"

import Title from "@apps/admin/components/Title"
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog"

import ExcelJS from "exceljs"
import * as XLSX from "xlsx"
// // Interface for Product data from API

const VariantDetailsTable: React.FC<{ variants: Variant[] }> = ({
  variants,
}) => {
  if (!variants || variants.length === 0) {
    return (
      <Typography
        variant="caption"
        sx={{ p: 2, fontStyle: "italic", display: "block" }}
      >
        Este producto no tiene variantes definidas.
      </Typography>
    )
  }
  return (
    <Box
      sx={{
        margin: 1,
        p: 1,
        backgroundColor: (theme) => theme.palette.background.default,
        borderRadius: 1,
      }}
    >
      <Typography
        variant="subtitle2"
        gutterBottom
        component="div"
        sx={{ px: 1, pt: 1 }}
      >
        Variantes Definidas
      </Typography>
      <TableContainer>
        <Table size="small" aria-label="variant details">
          <TableHead>
            <TableRow sx={{ "& th": { fontSize: "0.75rem", py: 0.5 } }}>
              <TableCell sx={{ width: "10%" }}>Imagen</TableCell>
              <TableCell sx={{ width: "25%" }}>Nombre Variante</TableCell>
              <TableCell sx={{ width: "35%" }}>Atributos</TableCell>
              <TableCell align="right" sx={{ width: "15%" }}>
                Precio Público
              </TableCell>
              <TableCell align="right" sx={{ width: "15%" }}>
                PVM
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variants.map((variant) => (
              <TableRow
                key={variant._id || variant.name}
                sx={{ "& td": { fontSize: "0.8rem", py: 0.5 } }}
              >
                <TableCell>
                  <Avatar
                    variant="rounded"
                    src={variant.variantImage || undefined}
                    sx={{ width: 40, height: 40 }}
                  />
                </TableCell>
                <TableCell sx={{ wordBreak: "break-word" }}>
                  {variant.name}
                </TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {variant.attributes.map((attr, index) => (
                      <Chip
                        key={`${attr.name}-${index}`}
                        label={`${attr.name}: ${attr.value}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {variant.attributes.length === 0 && (
                      <Typography variant="caption">(Sin atributos)</Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">{variant.publicPrice}</TableCell>
                <TableCell align="right">{variant.prixerPrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

type ProductSortKeys =
  | keyof Pick<Product, "name" | "category" | "active">
  | "variantsCount"

const ReadProducts: React.FC = () => {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const [permissions, setPermissions] = useState<PermissionsV2 | null>(null)

  // --- State ---
  const [products, setProducts] = useState<Product[]>([]) // Original data
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // UI Control State
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [filters, setFilters] = useState<{
    category: string[]
    status: "all" | "active" | "inactive"
    bestSeller: "all" | "yes" | "no"
  }>({
    category: [],
    status: "all",
    bestSeller: "all",
  })
  const [sortConfig, setSortConfig] = useState<{
    key: ProductSortKeys | null
    direction: "asc" | "desc"
  }>({ key: "name", direction: "asc" })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [expandedRow, setExpandedRow] = useState<string | null>(null) // Store ObjectId as string

  // --- Fetch Data & Extract Categories ---
  const loadProducts = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      setError(null)
      try {
        const fetchedProducts = (await fetchProducts()) as Product[]
        if (fetchedProducts.some((p) => !p._id))
          console.error("Some products missing '_id'.")

        // Initial sort can happen here or later in useMemo
        fetchedProducts.sort((a, b) => a.name.localeCompare(b.name))
        setProducts(fetchedProducts)

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(fetchedProducts.map((p) => p.category).filter(Boolean)),
        ].sort()
        setCategories(uniqueCategories)
      } catch (err: any) {
        const message = err.message || "Error al cargar los productos."
        setError(message)
        showSnackBar(message)
        console.error("Error fetching products:", err)
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [showSnackBar]
  )

  const checkAuthAndPermissions = async () => {
    setError(null)
    try {
      const fetchedPermissions = await getPermissions()
      setPermissions(fetchedPermissions)
    } catch (err: any) {
      console.error("Permission check failed in Layout:", err)
      if (err.message === "Unauthorized") {
        setError("Unauthorized access. Redirecting to login...")
        setTimeout(() => navigate("/admin/inicio", { replace: true }), 1500)
      } else {
        setError(err.message || "Failed to load permissions. Please try again.")
        navigate("/admin/inicio", { replace: true })
      }
      setPermissions(null)
    } finally {
    }
  }

  useEffect(() => {
    loadProducts()
    checkAuthAndPermissions()
  }, [loadProducts])

  // --- Event Handlers ---
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  // Generic filter handler
  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
    setPage(0)
  }

  const handleSortRequest = (key: ProductSortKeys) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const handleExpandClick = (productIdString: string) => {
    setExpandedRow(expandedRow === productIdString ? null : productIdString)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // --- Delete Handling (Keep as is) ---
  const handleOpenDeleteDialog = (product: Product) => {
    if (!product._id) {
      showSnackBar("Falta ID.")
      return
    }
    setProductToDelete(product)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    if (isDeleting) return
    setDialogOpen(false)
    setProductToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete?._id) {
      showSnackBar("Error: Producto no seleccionado.")
      setIsDeleting(false)
      handleCloseDialog()
      return
    }

    setIsDeleting(true)

    try {
      await deleteProduct(productToDelete._id.toString()) // API call

      showSnackBar(`Producto "${productToDelete.name}" eliminado.`)

      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id))

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error deleting product:", err)

      showSnackBar(err.message || "Error al eliminar.")

      handleCloseDialog()
    } finally {
      setIsDeleting(false)
    }
  }

  // --- Update & Create Handling (Keep as is) ---
  const handleUpdate = (productId: string) => {
    if (!productId) {
      showSnackBar("Falta ID.")
      return
    }
    navigate(`/admin/product/update/${productId}`)
  } // Adjust route

  const handleCreate = () => {
    navigate("/admin/product/create")
  }

  // --- Derived Data (Memoized) ---
  const processedProducts = useMemo(() => {
    let filtered = [...products]

    // 1. Search Filter (Name, Category, Description)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearchTerm) ||
          p.category.toLowerCase().includes(lowerSearchTerm) ||
          p.description.toLowerCase().includes(lowerSearchTerm)
      )
    }

    // 2. Category Filter
    if (filters.category.length > 0) {
      filtered = filtered.filter((p) => filters.category.includes(p.category))
    }

    // 3. Status Filter
    if (filters.status !== "all") {
      filtered = filtered.filter((p) =>
        filters.status === "active" ? p.active : !p.active
      )
    }

    // 4. Best Seller Filter
    if (filters.bestSeller !== "all") {
      filtered = filtered.filter((p) =>
        filters.bestSeller === "yes" ? p.bestSeller : !p.bestSeller
      )
    }

    // 5. Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        if (sortConfig.key === "variantsCount") {
          aValue = a.variants?.length || 0
          bValue = b.variants?.length || 0
        } else {
          aValue = a[sortConfig.key!]
          bValue = b[sortConfig.key!]
        }

        let comparison = 0
        if (aValue === null || aValue === undefined)
          comparison = 1 // Sort nulls/undefined last
        else if (bValue === null || bValue === undefined) comparison = -1
        else if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue)
        } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          comparison = aValue === bValue ? 0 : aValue ? -1 : 1 // True first for boolean
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue
        } else {
          // Fallback for mixed types or other types (treat as string)
          comparison = String(aValue).localeCompare(String(bValue))
        }

        return sortConfig.direction === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [products, searchTerm, filters, sortConfig])

  const paginatedProducts = useMemo(() => {
    return processedProducts.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    )
  }, [processedProducts, page, rowsPerPage])

  const handleDownloadExcel = async () => {
    if (permissions?.area !== "Master") {
      showSnackBar(
        "No tienes permiso para realizar una actualización masiva de productos."
      )
      return
    }

    if (products.length === 0) {
      showSnackBar("No hay productos para exportar.")
      return
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Prixelart"
    workbook.lastModifiedBy = "Prixelart"
    workbook.created = new Date()
    workbook.modified = new Date()

    const worksheet = workbook.addWorksheet("Productos y Variantes")

    const headerColumns = [
      { header: "ID Producto", key: "productId", width: 12 },
      { header: "Nombre Producto", key: "productName", width: 15 },
      { header: "Activo", key: "active", width: 6 },
      { header: "Autocertificado", key: "autoCertified", width: 6 },
      { header: "Más Vendido", key: "bestSeller", width: 6 },
      { header: "Categoría", key: "category", width: 10 },
      { header: "Costo", key: "cost", width: 6 },
      { header: "Descripción", key: "description", width: 40 },
      { header: "Tiene Variación Especial", key: "hasSpecialVar", width: 27 },
      { header: "Tiempo de Producción", key: "productionTime", width: 10 },
      { header: "Líneas de Producción", key: "productionLines", width: 10 },
      { header: "ID Variante", key: "variantId", width: 10 },
      { header: "Nombre Variante", key: "variantName", width: 15 },
      { header: "PVP", key: "publicPrice", width: 6 },
      { header: "PVM", key: "prixerPrice", width: 6 },
      { header: "Atributos Variante", key: "variantAttributes", width: 20 },
      { header: "Descuento ID Variante", key: "discountId", width: 6 },
      { header: "Recargo ID Variante", key: "surchargeId", width: 6 },
      { header: "Tipo de Fila", key: "rowType", width: 11 },
    ]

    worksheet.columns = headerColumns

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 10, name: "Arial" }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })

    products.forEach((product) => {
      const productRowData = {
        productId: product._id ? product._id.toString() : "",
        productName: product.name,
        active: product.active ? "Sí" : "No",
        autoCertified: product.autoCertified ? "Sí" : "No",
        bestSeller: product.bestSeller ? "Sí" : "No",
        category: product.category,
        cost: product.cost || "",
        description: product.description,
        hasSpecialVar: product.hasSpecialVar ? "Sí" : "No",
        productionTime: product.productionTime || "",
        productionLines: product.productionLines
          ? product.productionLines.join(", ")
          : "",
        variantId: "",
        variantName: "",
        publicPrice: "",
        prixerPrice: "",
        variantAttributes: "",
        discountId: "",
        surchargeId: "",
        rowType: "Producto Principal",
      }

      const productRow = worksheet.addRow(productRowData)
      productRow.eachCell((cell) => {
        cell.font = { size: 10, name: "Arial" }
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        }
        cell.alignment = { vertical: "top", wrapText: true }
      })
      productRow.getCell("rowType").font = {
        bold: true,
        italic: true,
        size: 10,
        name: "Arial",
      } // Estilo para 'Tipo de Fila'

      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          const formattedAttributes = variant.attributes
            .map((attr) => `${attr.name}: ${attr.value}`)
            .join(", ")

          const variantRowData = {
            productId: "",
            productName: "",
            active: "",
            autoCertified: "",
            bestSeller: "",
            category: "",
            cost: "",
            description: "",
            hasSpecialVar: "",
            productionTime: "",
            productionLines: "",
            variantId: variant._id || "",
            variantName: variant.name,
            publicPrice: variant.publicPrice,
            prixerPrice: variant.prixerPrice,
            variantAttributes: formattedAttributes,
            discountId: variant.discountId ? variant.discountId.join(", ") : "",
            surchargeId: variant.surchargeId
              ? variant.surchargeId.join(", ")
              : "",
            rowType: "Variante",
          }

          const variantRow = worksheet.addRow(variantRowData)
          variantRow.eachCell((cell) => {
            cell.font = { size: 9, name: "Arial", color: { argb: "FF505050" } }
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            }
            cell.alignment = { vertical: "top", wrapText: true }
          })
          variantRow.getCell("rowType").font = {
            bold: true,
            italic: true,
            size: 9,
            name: "Arial",
            color: { argb: "FF505050" },
          }
          variantRow.getCell("variantName").value = `  - ${variant.name}`
        })
      }
    })

    try {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "productos_y_variantes.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al generar o descargar el archivo Excel:", error)
      alert("Hubo un error al descargar el archivo Excel.")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      showSnackBar("No se seleccionó ningún archivo.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

        console.log("Datos leídos del Excel:", jsonData)

        processAndSendExcelData(jsonData)
      } catch (error) {
        console.error("Error al leer el archivo Excel:", error)
        showSnackBar(
          "Error al leer el archivo Excel. Asegúrate de que sea un formato válido."
        )
      }
    }

    reader.onerror = (e) => {
      console.error("Error al leer el archivo:", e)
      showSnackBar("Error al leer el archivo. Intenta de nuevo.")
    }

    reader.readAsArrayBuffer(file)
  }

  const processAndSendExcelData = async (excelData: any[]) => {
    if (!excelData || excelData.length === 0) {
      showSnackBar("El archivo Excel no contiene datos.")
      return
    }

    const productsToUpdate: Product[] = []
    let currentProduct: Product | null = null

    for (const row of excelData) {
      const rowType = row["Tipo de Fila"]
      if (rowType === "Producto Principal") {
        if (currentProduct) {
          productsToUpdate.push(currentProduct)
        }
        currentProduct = {
          _id: row["ID Producto"],
          name: row["Nombre Producto"],
          active: row["Activo"] === "Sí",
          autoCertified: row["Autocertificado"] === "Sí",
          bestSeller: row["Más Vendido"] === "Sí",
          category: row["Categoría"],
          cost: row["Costo"] ? String(row["Costo"]) : undefined,
          description: row["Descripción"],
          hasSpecialVar: row["Tiene Variación Especial"] === "Sí",
          productionTime: row["Tiempo de Producción"]
            ? String(row["Tiempo de Producción"])
            : undefined,
          productionLines: row["Líneas de Producción"]
            ? String(row["Líneas de Producción"])
                .split(",")
                .map((s) => s.trim())
            : [],
          mockUp: "",
          sources: { images: [] },
          variants: [],
        }
      } else if (rowType === "Variante" && currentProduct) {
        const attributesString = row["Atributos Variante"] || ""
        const attributes: VariantAttribute[] = attributesString
          .split(",")
          .map((attrPair: string) => {
            const [name, value] = attrPair.split(":").map((s) => s.trim())
            return { name, value }
          })
          .filter((attr: VariantAttribute) => attr.name && attr.value)

        const variant: Variant = {
          _id: row["ID Variante"] || undefined,
          name: row["Nombre Variante"],
          publicPrice: String(row["PVP"]),
          prixerPrice: String(row["PVM"]),
          attributes: attributes,
          discountId: row["Descuento ID Variante"]
            ? String(row["Descuento ID Variante"])
                .split(",")
                .map((s) => s.trim())
            : undefined,
          surchargeId: row["Recargo ID Variante"]
            ? String(row["Recargo ID Variante"])
                .split(",")
                .map((s) => s.trim())
            : undefined,
        }
        currentProduct.variants?.push(variant)
      }
    }

    if (currentProduct) {
      productsToUpdate.push(currentProduct)
    }

    try {
      const response = await updateManyProduct(productsToUpdate)
      showSnackBar("Productos actualizados masivamente con éxito.")
      loadProducts()
    } catch (error) {
      console.error("Error al enviar datos al backend:", error)
      showSnackBar("Error de red o del servidor al actualizar productos.")
    }
  }

  // --- Render Logic ---
  return (
    <>
      <Title title="Gestionar Productos" />

      {/* Filter/Search Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Grid2 container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Buscar Producto..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
              }}
            />
          </Grid2>
          {/* Category Filter */}
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              multiple
              size="small"
              options={categories}
              value={filters.category}
              onChange={(event, newValue) => {
                handleFilterChange("category", newValue)
              }}
              renderInput={(params) => (
                <TextField {...params} label="Filtrar por Categoría" />
              )}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox checked={selected} size="small" />
                  {option}
                </li>
              )}
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid2>
          {/* Status Filter */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Estado</InputLabel>
              <Select
                labelId="status-filter-label"
                name="status"
                value={filters.status}
                label="Estado"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
          {/* Best Seller Filter */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="bestseller-filter-label">Más Vendido</InputLabel>
              <Select
                labelId="bestseller-filter-label"
                name="bestSeller"
                value={filters.bestSeller}
                label="Más Vendido"
                onChange={(e) =>
                  handleFilterChange("bestSeller", e.target.value)
                }
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="yes">Sí</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
          {/* Create Button */}
          <Grid2
            size={{ xs: 12, md: 2 }}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="excel-upload-input"
            />
            {permissions?.area === "Master" && (
              <>
                {" "}
                <Tooltip
                  title="Subir excel para edición masiva"
                  sx={{ marginRight: "8px" }}
                >
                  <IconButton
                    color="primary"
                    onClick={() =>
                      document.getElementById("excel-upload-input")?.click()
                    }
                    disabled={isLoading || isDeleting}
                  >
                    <UploadFileIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title="Descargar excel de productos"
                  sx={{ marginRight: "8px" }}
                >
                  <IconButton
                    color="primary"
                    // variant="contained"
                    onClick={handleDownloadExcel}
                    disabled={isLoading || isDeleting}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title="Crear producto">
              <IconButton
                color="primary"
                // variant="contained"
                onClick={handleCreate}
                disabled={isLoading || isDeleting}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Grid2>
        </Grid2>
      </Paper>

      {/* Loading / Error States */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && !isLoading && products.length === 0 && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button onClick={() => loadProducts()} size="small">
            Reintentar
          </Button>
        </Alert>
      )}
      {/* Display fetch error even if showing stale data */}
      {error && !isLoading && products.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudo actualizar la lista: {error}
        </Alert>
      )}

      {/* Table */}
      {!isLoading && products.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 900 }}
              aria-label="products expandable table"
            >
              <TableHead
                sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
              >
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: "3%" }} />{" "}
                  {/* Expand icon */}
                  <TableCell sx={{ width: "10%" }}>Imagen</TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", width: "22%" }}
                    sortDirection={
                      sortConfig.key === "name" ? sortConfig.direction : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "name"}
                      direction={
                        sortConfig.key === "name" ? sortConfig.direction : "asc"
                      }
                      onClick={() => handleSortRequest("name")}
                    >
                      Nombre{" "}
                      {sortConfig.key === "name" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortConfig.direction} sort
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", width: "15%" }}
                    sortDirection={
                      sortConfig.key === "category"
                        ? sortConfig.direction
                        : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "category"}
                      direction={
                        sortConfig.key === "category"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSortRequest("category")}
                    >
                      Categoría{" "}
                      {sortConfig.key === "category" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortConfig.direction} sort
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                    Líneas de Producción
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", width: "5%" }}
                    sortDirection={
                      sortConfig.key === "variantsCount"
                        ? sortConfig.direction
                        : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "variantsCount"}
                      direction={
                        sortConfig.key === "variantsCount"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSortRequest("variantsCount")}
                    >
                      #Var{" "}
                      {sortConfig.key === "variantsCount" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortConfig.direction} sort
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", width: "10%" }}
                    sortDirection={
                      sortConfig.key === "active" ? sortConfig.direction : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "active"}
                      direction={
                        sortConfig.key === "active"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSortRequest("active")}
                    >
                      Estado{" "}
                      {sortConfig.key === "active" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortConfig.direction} sort
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", width: "5%" }}
                    align="center"
                  >
                    Misc
                  </TableCell>{" "}
                  {/* Misc flags like Best Seller */}
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", width: "10%" }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const isExpanded = expandedRow === product._id?.toString()
                  // Ensure ID exists before rendering row/handlers
                  const productIdString = product._id?.toString()
                  if (!productIdString) return null

                  return (
                    <React.Fragment key={productIdString}>
                      {/* Main Row */}
                      <TableRow
                        hover
                        sx={{ "& > *": { borderBottom: "unset" } }}
                      >
                        <TableCell padding="checkbox">
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => handleExpandClick(productIdString)}
                          >
                            {isExpanded ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Avatar
                            variant="rounded"
                            src={
                              product.thumbUrl ||
                              product.sources?.images?.[0]?.url ||
                              undefined
                            }
                            alt={product.name}
                            sx={{ width: 56, height: 56 }}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {product.productionLines?.map((line, index) => (
                              <Chip
                                key={index}
                                label={line}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {(!product.productionLines ||
                              product.productionLines.length === 0) && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                -
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          {product.variants?.length || 0}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              product.active ? (
                                <CheckCircleIcon />
                              ) : (
                                <CancelIcon />
                              )
                            }
                            label={product.active ? "Activo" : "Inactivo"}
                            color={product.active ? "success" : "default"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {product.bestSeller && (
                            <Tooltip title="Más Vendido">
                              <StarIcon color="warning" fontSize="small" />
                            </Tooltip>
                          )}
                          {/* Add other icons here  (e.g., autoCertified) */}
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 0.5,
                            }}
                          >
                            <Tooltip title="Editar Producto">
                              <IconButton
                                aria-label="edit"
                                color="primary"
                                onClick={() => handleUpdate(productIdString)}
                                disabled={isDeleting}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar Producto">
                              <IconButton
                                aria-label="delete"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(product)}
                                disabled={
                                  isDeleting &&
                                  productToDelete?._id === product._id
                                }
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                      {/* Expandable Row */}
                      <TableRow>
                        {/* Span across all columns */}
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={9}
                        >
                          {" "}
                          {/* Update colSpan to match total columns */}
                          <Collapse
                            in={isExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            {/* Use the helper component */}
                            <VariantDetailsTable
                              variants={product.variants || []}
                            />
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  )
                })}
                {/* Handle empty state after filtering */}
                {paginatedProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {" "}
                      {/* Update colSpan */}
                      No se encontraron productos que coincidan con los
                      filtros/búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={processedProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Productos por página:"
          />
        </>
      )}

      {/* Empty state when no products exist at all */}
      {!isLoading && products.length === 0 && !error && (
        <Alert severity="info" sx={{ m: 2 }}>
          No se encontraron productos. Haga clic en "Crear" para agregar uno
          nuevo.
        </Alert>
      )}

      {/* Confirmation Dialog (Keep as is) */}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={
          <>
            ¿Está seguro que desea eliminar el producto{" "}
            <strong>{productToDelete?.name}</strong>? Esta acción no se puede
            deshacer.
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isPerformingAction={isDeleting}
      />
    </>
  )
}

export default ReadProducts
