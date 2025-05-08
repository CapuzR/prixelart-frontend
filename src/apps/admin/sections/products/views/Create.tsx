// src/apps/admin/sections/products/views/CreateProduct.tsx
import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Hooks, Types, Context, API
import { useSnackBar } from 'context/GlobalContext';
import { Product, Variant, VariantAttribute } from 'types/product.types';
import { createProduct } from '@api/product.api';

// MUI Components
import {
  Box, Typography, TextField, Button, Paper, FormControlLabel, Checkbox,
  CircularProgress, Alert, Stack, Divider, IconButton, Chip,
  Tooltip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Icon for Copy Variant
import Title from '@apps/admin/components/Title';
import Grid2 from '@mui/material/Grid';
// --- Type Enhancements for Form State ---

// Interface for a defined attribute type (name only)
interface AttributeType {
  id: string; // Use UUID for stable key
  name: string;
}

// Interface for variant state within the form
interface FormVariant extends Omit<Variant, '_id' | 'attributes'> {
  tempId: string; // Temporary ID for list key and state management
  attributes: { [attributeName: string]: string }; // Map attribute name to its value for this variant
  variantNameManuallyEdited: boolean; // Flag to prevent auto-name generation after manual edit
}

// Interface for the form's state
interface FormState extends Pick<Product, 'name' | 'description' | 'category' | 'productionTime' | 'cost' | 'coordinates' | 'mockUp' | 'active' | 'autoCertified' | 'bestSeller' | 'hasSpecialVar'> {
  attributeTypes: AttributeType[]; // Defined attribute types for this product
  variants: FormVariant[];
}

// Interface for validation errors
interface ValidationErrors {
  product?: { [key in keyof Omit<FormState, 'variants' | 'attributeTypes'>]?: string };
  attributeTypes?: { [index: number]: { name?: string } };
  variants?: { [tempId: string]: { [key in keyof FormVariant | 'attributeValues']?: string } }; // Include general + attributes
}

// --- Initial State ---

const initialAttributeTypeState: AttributeType = { id: uuidv4(), name: '' };

const initialVariantState = (attributeTypes: AttributeType[]): FormVariant => {
  const attributes: { [attributeName: string]: string } = {};
  attributeTypes.forEach(at => {
    attributes[at.name] = ''; // Initialize values for defined attributes
  });
  return {
    tempId: uuidv4(),
    name: '',
    variantImage: '',
    attributes: attributes,
    publicPrice: '',
    prixerPrice: '',
    variantNameManuallyEdited: false,
  };
};

const initialFormState: FormState = {
  name: "",
  description: "",
  category: "",
  productionTime: "",
  cost: "",
  coordinates: "",
  mockUp: "",
  active: true,
  autoCertified: false,
  bestSeller: false,
  hasSpecialVar: false,
  attributeTypes: [{ ...initialAttributeTypeState }], // Start with one attribute type definition
  variants: [], // Start with no variants until attributes are defined
};


// --- Helper Function ---
const generateVariantName = (attributes: { [attributeName: string]: string }): string => {
  // Simple concatenation, can be customized
  return Object.values(attributes).filter(val => val.trim()).join(' / ');
};


// --- Component ---
const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();
  const formRef = useRef<HTMLFormElement>(null); // Ref for scrolling to errors

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);
  // State to manage which variant accordion might need expanding due to error
  const [errorVariantId, setErrorVariantId] = useState<string | null>(null);

  // --- Handlers for Product level fields ---
  const handleProductInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (validationErrors?.product?.[name as keyof ValidationErrors['product']]) {
      setValidationErrors(prev => ({ ...prev, product: { ...prev?.product, [name]: undefined } }));
    }
  };

  // --- Handlers for Attribute Type Definition ---
  const handleAttributeTypeNameChange = (id: string, value: string) => {
    // IMPORTANT: Changing an attribute type name requires updating variant attributes.
    // This can be complex. A simple approach is to prevent editing names once variants exist,
    // or handle the rename carefully across all variants. Let's allow editing for now.
    let oldName = '';
    setFormData(prev => {
      const updatedTypes = prev.attributeTypes.map(at => {
        if (at.id === id) {
          oldName = at.name; // Capture the old name
          return { ...at, name: value };
        }
        return at;
      });

      // Update variant attributes if the name actually changed and was valid previously
      let updatedVariants = prev.variants;
      if (oldName && oldName !== value) {
        updatedVariants = prev.variants.map(variant => {
          const newAttributes = { ...variant.attributes };
          if (Object.prototype.hasOwnProperty.call(newAttributes, oldName)) {
            newAttributes[value] = newAttributes[oldName]; // Copy value to new key
            delete newAttributes[oldName]; // Delete old key
          } else {
            newAttributes[value] = ''; // Initialize if somehow missing
          }
          // Also regenerate name if not manually edited
          const newName = !variant.variantNameManuallyEdited
            ? generateVariantName(newAttributes)
            : variant.name;

          return { ...variant, attributes: newAttributes, name: newName };
        });
      }


      return { ...prev, attributeTypes: updatedTypes, variants: updatedVariants };
    });
    // Clear potential validation error for this specific attribute type name
    setValidationErrors(prev => {
      if (!prev?.attributeTypes) return prev;
      const typeIndex = prev.attributeTypes && formData.attributeTypes.findIndex(at => at.id === id);
      if (typeIndex !== undefined && typeIndex !== -1 && prev.attributeTypes?.[typeIndex]?.name) {
        const newAttributeErrors = { ...prev.attributeTypes };
        delete newAttributeErrors[typeIndex].name;
        if (Object.keys(newAttributeErrors[typeIndex]).length === 0) {
          delete newAttributeErrors[typeIndex];
        }
        return { ...prev, attributeTypes: Object.keys(newAttributeErrors).length > 0 ? newAttributeErrors : undefined };
      }
      return prev;
    });
  };

  const handleAddAttributeType = () => {
    setFormData(prev => ({
      ...prev,
      attributeTypes: [...prev.attributeTypes, { ...initialAttributeTypeState, id: uuidv4() }],
      // Add this new attribute key with empty value to all existing variants
      variants: prev.variants.map(v => ({
        ...v,
        attributes: {
          ...v.attributes,
          ['']: '' // Add with empty name initially, will be updated by handleAttributeTypeNameChange
        }
      }))
    }));
  };

  const handleRemoveAttributeType = (idToRemove: string) => {
    let nameToRemove = '';
    setFormData(prev => {
      const typeToRemove = prev.attributeTypes.find(at => at.id === idToRemove);
      nameToRemove = typeToRemove?.name || '';

      const updatedTypes = prev.attributeTypes.filter(at => at.id !== idToRemove);

      // Remove corresponding attribute from all variants if the name was valid
      let updatedVariants = prev.variants;
      if (nameToRemove) {
        updatedVariants = prev.variants.map(variant => {
          const newAttributes = { ...variant.attributes };
          delete newAttributes[nameToRemove];
          // Also regenerate name if not manually edited
          const newName = !variant.variantNameManuallyEdited
            ? generateVariantName(newAttributes)
            : variant.name;
          return { ...variant, attributes: newAttributes, name: newName };
        });
      }

      // Ensure at least one attribute type remains if variants exist
      if (updatedTypes.length === 0 && updatedVariants.length > 0) {
        showSnackBar("No se puede eliminar el último tipo de atributo si existen variantes. Elimine las variantes primero.");
        return prev; // Prevent deletion
      }


      return { ...prev, attributeTypes: updatedTypes, variants: updatedVariants };
    });
    // Clear potential validation errors related to the removed type index - tricky, might need full revalidation
  };


  // --- Handlers for Variant level fields ---
  const handleVariantInputChange = (tempId: string, field: keyof Omit<FormVariant, 'attributes' | 'tempId'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant =>
        variant.tempId === tempId
          ? {
            ...variant,
            [field]: value,
            // Mark name as manually edited if the 'name' field is changed directly
            variantNameManuallyEdited: field === 'name' ? true : variant.variantNameManuallyEdited
          }
          : variant
      ),
    }));
    // Clear validation error for this specific field
    if (validationErrors?.variants?.[tempId]?.[field]) {
      setValidationErrors(prev => {
        const newVariantErrors = { ...prev?.variants?.[tempId] };
        delete newVariantErrors[field];
        return { ...prev, variants: { ...prev?.variants, [tempId]: newVariantErrors } };
      });
    }
  };

  // Handler for Attribute VALUE changes within a variant
  const handleVariantAttributeValueChange = (tempId: string, attributeName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => {
        if (variant.tempId === tempId) {
          const updatedAttributes = {
            ...variant.attributes,
            [attributeName]: value,
          };
          // Auto-update name ONLY if it wasn't manually edited before
          const newName = !variant.variantNameManuallyEdited
            ? generateVariantName(updatedAttributes)
            : variant.name;
          return {
            ...variant,
            attributes: updatedAttributes,
            name: newName,
          };
        }
        return variant;
      }),
    }));
    // Clear validation error for attribute values (might need a specific key like 'attributeValues')
    if (validationErrors?.variants?.[tempId]?.attributeValues) {
      setValidationErrors(prev => {
        const newVariantErrors = { ...prev?.variants?.[tempId] };
        delete newVariantErrors.attributeValues; // Clear general attribute value error for this variant
        return { ...prev, variants: { ...prev?.variants, [tempId]: newVariantErrors } };
      });
    }
  };


  const handleAddVariant = () => {
    // Ensure there's at least one valid attribute type defined
    const validAttributeTypes = formData.attributeTypes.filter(at => at.name.trim());
    if (validAttributeTypes.length === 0) {
      showSnackBar("Defina al menos un nombre de atributo válido antes de añadir variantes.");
      // Optionally highlight the attribute type input
      setValidationErrors(prev => ({ ...prev, attributeTypes: { ...prev?.attributeTypes, [0]: { name: 'Defina un nombre' } } }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      // Use the *currently defined* valid attribute types for the new variant
      variants: [...prev.variants, initialVariantState(validAttributeTypes)],
    }));
    setErrorVariantId(null); // Clear error highlighting
  };

  const handleRemoveVariant = (tempIdToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.tempId !== tempIdToRemove),
    }));
    if (errorVariantId === tempIdToRemove) {
      setErrorVariantId(null);
    }
  };

  const handleCopyVariant = (tempIdToCopy: string) => {
    const variantToCopy = formData.variants.find(v => v.tempId === tempIdToCopy);
    if (!variantToCopy) return;

    const newVariant: FormVariant = {
      ...JSON.parse(JSON.stringify(variantToCopy)), // Deep copy
      tempId: uuidv4(), // Assign new temp ID
      name: `${variantToCopy.name} (Copia)`, // Append copy indicator
      variantNameManuallyEdited: true, // Assume user will edit, so stop auto-name
    };

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
    setErrorVariantId(null); // Clear error highlighting
  };


  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: ValidationErrors = { product: {}, attributeTypes: {}, variants: {} };
    let firstErrorVariantId: string | null = null;
    let hasErrors = false;

    // Validate Product Details
    if (!formData.name.trim()) { errors.product!.name = "Nombre es obligatorio."; hasErrors = true; }
    if (!formData.description.trim()) { errors.product!.description = "Descripción es obligatoria."; hasErrors = true; }
    if (!formData.category.trim()) { errors.product!.category = "Categoría es obligatoria."; hasErrors = true; }
    if (formData.cost && (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)) { errors.product!.cost = "Costo debe ser número positivo."; hasErrors = true; }
    // Add other product field validations  (e.g., productionTime, mockUp URL format)


    // Validate Attribute Types
    const definedAttributeNames = new Set<string>();
    formData.attributeTypes.forEach((at, index) => {
      const trimmedName = at.name.trim();
      if (!trimmedName) {
        if (!errors.attributeTypes![index]) errors.attributeTypes![index] = {};
        errors.attributeTypes![index].name = "Nombre de atributo no puede estar vacío.";
        hasErrors = true;
      } else if (definedAttributeNames.has(trimmedName)) {
        if (!errors.attributeTypes![index]) errors.attributeTypes![index] = {};
        errors.attributeTypes![index].name = "Nombre de atributo duplicado.";
        hasErrors = true;
      } else {
        definedAttributeNames.add(trimmedName);
      }
    });

    if (formData.attributeTypes.length === 0 || definedAttributeNames.size === 0) {
      // Need at least one valid attribute type if planning to add variants
      if (formData.variants.length > 0) {
        showSnackBar("Debe definir al menos un tipo de atributo válido si tiene variantes.");
        // Highlight the add attribute type area maybe?
        hasErrors = true;
      } else if (formData.attributeTypes.length > 0 && !errors.attributeTypes![0]?.name) {
        // If the first empty type hasn't been flagged yet
        if (!errors.attributeTypes![0]) errors.attributeTypes![0] = {};
        errors.attributeTypes![0].name = "Defina al menos un tipo de atributo.";
        hasErrors = true;
      }
    }


    // Validate Variants
    if (formData.variants.length === 0) {
      // It's valid to have no variants initially, but maybe show a warning if submitting?
      // Let's allow submitting with no variants for now.
    }

    formData.variants.forEach((variant) => {
      let variantHasError = false;
      if (!variant.name.trim()) {
        if (!errors.variants![variant.tempId]) errors.variants![variant.tempId] = {};
        errors.variants![variant.tempId].name = "Nombre Variante es obligatorio.";
        hasErrors = true; variantHasError = true;
      }
      if (isNaN(parseFloat(variant.publicPrice)) || parseFloat(variant.publicPrice) < 0) {
        if (!errors.variants![variant.tempId]) errors.variants![variant.tempId] = {};
        errors.variants![variant.tempId].publicPrice = "Precio Público debe ser número positivo.";
        hasErrors = true; variantHasError = true;
      }
      if (isNaN(parseFloat(variant.prixerPrice)) || parseFloat(variant.prixerPrice) < 0) {
        if (!errors.variants![variant.tempId]) errors.variants![variant.tempId] = {};
        errors.variants![variant.tempId].prixerPrice = "Precio Prixer debe ser número positivo.";
        hasErrors = true; variantHasError = true;
      }
      // Validate variantImage URL format 

      // Validate Attribute Values for defined types
      let attributeValueError = false;
      definedAttributeNames.forEach(attrName => {
        if (!variant.attributes[attrName]?.trim()) {
          attributeValueError = true;
        }
      });
      if (attributeValueError) {
        if (!errors.variants![variant.tempId]) errors.variants![variant.tempId] = {};
        errors.variants![variant.tempId].attributeValues = "Todos los valores de atributo definidos son obligatorios.";
        hasErrors = true; variantHasError = true;
      }

      if (variantHasError && !firstErrorVariantId) {
        firstErrorVariantId = variant.tempId;
      }

    });

    setValidationErrors(hasErrors ? errors : null);
    setErrorVariantId(firstErrorVariantId); // Set state to expand the first error accordion

    if (hasErrors) {
      showSnackBar("Por favor, corrija los errores indicados.");
      // Scroll to first error - crude attempt: scroll form into view
      // A better implementation would find the specific field ref.
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return !hasErrors;
  };

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setValidationErrors(null); // Clear errors on successful validation start

    // Prepare payload
    // 1. Get valid defined attribute type names
    const validAttributeTypeNames = formData.attributeTypes
      .map(at => at.name.trim())
      .filter(name => name);


    // 2. Map variants, ensuring attributes are in the desired final format (Array<VariantAttribute>)
    const finalVariants: Variant[] = formData.variants.map(formVariant => {
      // Create the attributes array based on defined types
      const attributesArray: VariantAttribute[] = validAttributeTypeNames.map(attrName => ({
        name: attrName,
        value: formVariant.attributes[attrName] || '' // Use stored value or empty string
      }));

      // Destructure to remove tempId and internal flags
      const { tempId, variantNameManuallyEdited, attributes, ...restOfVariant } = formVariant;

      return {
        ...restOfVariant,
        publicPrice: String(restOfVariant.publicPrice), // Ensure prices are strings
        prixerPrice: String(restOfVariant.prixerPrice),
        attributes: attributesArray, // Use the constructed array
        // Ensure variantImage is included, even if empty
        variantImage: restOfVariant.variantImage || undefined,
      };
    });

    // 3. Construct the final Product payload
    const payload: Partial<Product> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      productionTime: formData.productionTime || undefined,
      cost: formData.cost || undefined,
      coordinates: formData.coordinates || undefined,
      mockUp: formData.mockUp || undefined,
      active: formData.active,
      autoCertified: formData.autoCertified,
      bestSeller: formData.bestSeller,
      hasSpecialVar: formData.hasSpecialVar,
      variants: finalVariants,
      // Sources, thumbUrl are assumed handled elsewhere based on original code/request
      sources: { images: [] }, // Provide default empty structure  by API
    };


    try {
      console.log("Submitting Product Data:", JSON.stringify(payload, null, 2)); // Log payload for debugging
      const response = await createProduct(payload);

      if (response) { // Adjust check based on API response structure
        showSnackBar(`Producto "${formData.name}" creado exitosamente.`);
        navigate("/admin/products/read"); // Adjust route
      } else {
        throw new Error("La creación del producto falló o no devolvió respuesta.");
      }
    } catch (err: any) {
      console.error("Failed to create product:", err);
      const errorMessage = err?.response?.data?.message || err.message || "Error desconocido al crear el producto.";
      setValidationErrors({ product: { name: errorMessage } }); // Show general error near top
      showSnackBar(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin/products/read");

  // --- Render ---
  return (
    <>
      <Title title="Crear Nuevo Producto" />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate ref={formRef}>
          <Grid2 container spacing={3}>
            {/* --- Product Details --- */}
            <Grid2 size={{ xs: 12 }}><Typography variant="h6">Detalles del Producto</Typography></Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField label="Nombre del Producto" name="name" value={formData.name} onChange={handleProductInputChange} required fullWidth disabled={isSubmitting} error={!!validationErrors?.product?.name} helperText={validationErrors?.product?.name} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField label="Categoría" name="category" value={formData.category} onChange={handleProductInputChange} required fullWidth disabled={isSubmitting} error={!!validationErrors?.product?.category} helperText={validationErrors?.product?.category} />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField label="Descripción" name="description" value={formData.description} onChange={handleProductInputChange} required fullWidth multiline rows={4} disabled={isSubmitting} error={!!validationErrors?.product?.description} helperText={validationErrors?.product?.description} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <TextField label="Tiempo de Producción (días)" name="productionTime" type="number" value={formData.productionTime} onChange={handleProductInputChange} fullWidth disabled={isSubmitting} inputProps={{ min: "0" }} error={!!validationErrors?.product?.productionTime} helperText={validationErrors?.product?.productionTime} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <TextField label="Costo ($) (Opcional)" name="cost" type="number" value={formData.cost} onChange={handleProductInputChange} fullWidth disabled={isSubmitting} inputProps={{ step: "0.01", min: "0" }} error={!!validationErrors?.product?.cost} helperText={validationErrors?.product?.cost} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <TextField label="Mockup URL (Opcional)" name="mockUp" type="url" value={formData.mockUp} onChange={handleProductInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.product?.mockUp} helperText={validationErrors?.product?.mockUp} />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField label="Coordenadas (Opcional)" name="coordinates" value={formData.coordinates} onChange={handleProductInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.product?.coordinates} helperText={validationErrors?.product?.coordinates} />
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                <FormControlLabel control={<Checkbox checked={formData.active} onChange={handleProductInputChange} name="active" disabled={isSubmitting} />} label="Activo" />
                <FormControlLabel control={<Checkbox checked={formData.autoCertified} onChange={handleProductInputChange} name="autoCertified" disabled={isSubmitting} />} label="Auto Certificado" />
                <FormControlLabel control={<Checkbox checked={formData.bestSeller} onChange={handleProductInputChange} name="bestSeller" disabled={isSubmitting} />} label="Más Vendido" />
                <FormControlLabel control={<Checkbox checked={formData.hasSpecialVar} onChange={handleProductInputChange} name="hasSpecialVar" disabled={isSubmitting} />} label="Variante Especial" />
              </Stack>
            </Grid2>

            {/* --- Attribute Type Definition --- */}
            <Grid2 size={{ xs: 12 }}><Divider sx={{ my: 2 }}><Typography variant="overline">Definir Tipos de Atributos</Typography></Divider></Grid2>
            {formData.attributeTypes.map((attrType, index) => (
              <Grid2 size={{ xs: 12 }} container spacing={1} key={attrType.id} sx={{ mb: 1, pl: 2 }}>
                <Grid2 size={{ xs: 10, sm: 5 }}>
                  <TextField
                    label={`Nombre Atributo #${index + 1}`}
                    value={attrType.name}
                    onChange={(e) => handleAttributeTypeNameChange(attrType.id, e.target.value)}
                    required
                    fullWidth
                    size="small"
                    disabled={isSubmitting}
                    error={!!validationErrors?.attributeTypes?.[index]?.name}
                    helperText={validationErrors?.attributeTypes?.[index]?.name}
                  />
                </Grid2>
                <Grid2 size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveAttributeType(attrType.id)}
                    disabled={isSubmitting || (formData.attributeTypes.length <= 1 && formData.variants.length === 0)} // Can't remove last one if no variants yet either
                    sx={{ color: (formData.attributeTypes.length <= 1 && formData.variants.length === 0) ? 'grey.400' : 'error.main' }}
                  >
                    <Tooltip title="Eliminar Tipo Atributo"><DeleteIcon fontSize="inherit" /></Tooltip>
                  </IconButton>
                </Grid2>
              </Grid2>
            ))}
            <Grid2 size={{ xs: 12 }}>
              <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={handleAddAttributeType} disabled={isSubmitting}>Añadir Tipo de Atributo</Button>
            </Grid2>


            {/* --- Variants Section --- */}
            <Grid2 size={{ xs: 12 }}><Divider sx={{ my: 2 }}><Typography variant="overline">Variantes del Producto</Typography></Divider></Grid2>

            {formData.variants.map((variant, vIndex) => {
              const variantErrors = validationErrors?.variants?.[variant.tempId];
              const isErrorExpanded = errorVariantId === variant.tempId; // Check if this variant has the first error

              return (
                <Grid2 size={{ xs: 12 }} key={variant.tempId}>
                  <Accordion
                    sx={{ border: 1, borderColor: variantErrors ? 'error.main' : 'divider', '&:before': { display: 'none' } }} // Highlight if error
                    TransitionProps={{ unmountOnExit: true }} // Good for performance
                    defaultExpanded={isErrorExpanded} // Expand if it's the first error variant
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`variant-${variant.tempId}-content`} id={`variant-${variant.tempId}-header`} sx={{ '& .MuiAccordionSummary-content': { justifyContent: 'space-between', alignItems: 'center' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {variant.name || `Variante #${vIndex + 1}`}
                        </Typography>
                        <Chip label={`$${variant.publicPrice || '?.??'}`} size="small" variant="outlined" />
                      </Box>
                      <Box>
                        <Tooltip title="Duplicar Variante">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopyVariant(variant.tempId); }} disabled={isSubmitting} sx={{ mr: 1 }}>
                            <ContentCopyIcon fontSize='inherit' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar Variante">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemoveVariant(variant.tempId); }} disabled={isSubmitting} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize='inherit' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 8 }}>
                          <TextField
                            label="Nombre Variante"
                            value={variant.name}
                            onChange={(e) => handleVariantInputChange(variant.tempId, 'name', e.target.value)}
                            required
                            fullWidth size="small" disabled={isSubmitting}
                            error={!!variantErrors?.name}
                            helperText={variantErrors?.name || (variant.variantNameManuallyEdited ? "Nombre editado manualmente" : "Nombre generado automáticamente")}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
                          <TextField
                            label="Precio Público ($)"
                            name="publicPrice" type="number" value={variant.publicPrice}
                            onChange={(e) => handleVariantInputChange(variant.tempId, 'publicPrice', e.target.value)}
                            required fullWidth size="small" disabled={isSubmitting}
                            inputProps={{ step: "0.01", min: "0" }}
                            error={!!variantErrors?.publicPrice}
                            helperText={variantErrors?.publicPrice}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
                          <TextField
                            label="Precio Prixer ($)"
                            name="prixerPrice" type="number" value={variant.prixerPrice}
                            onChange={(e) => handleVariantInputChange(variant.tempId, 'prixerPrice', e.target.value)}
                            required fullWidth size="small" disabled={isSubmitting}
                            inputProps={{ step: "0.01", min: "0" }}
                            error={!!variantErrors?.prixerPrice}
                            helperText={variantErrors?.prixerPrice}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                          <TextField
                            label="URL Imagen Variante (Opcional)"
                            type="url"
                            value={variant.variantImage}
                            onChange={(e) => handleVariantInputChange(variant.tempId, 'variantImage', e.target.value)}
                            fullWidth size="small" disabled={isSubmitting}
                            error={!!variantErrors?.variantImage} // Add specific validation 
                            helperText={variantErrors?.variantImage}
                          />
                        </Grid2>

                        {/* Attribute Values Section */}
                        <Grid2 size={{ xs: 12 }}><Typography variant="body2" sx={{ mt: 1, mb: 0.5, fontWeight: 'medium' }}>Valores de Atributos:</Typography></Grid2>
                        {formData.attributeTypes.filter(at => at.name.trim()).map((attrType) => ( // Only show inputs for validly named types
                          <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={attrType.id}>
                            <TextField
                              label={attrType.name} // Use defined name as label
                              value={variant.attributes[attrType.name] || ''}
                              onChange={(e) => handleVariantAttributeValueChange(variant.tempId, attrType.name, e.target.value)}
                              required // Assuming all defined attributes are required per variant
                              fullWidth size="small" disabled={isSubmitting}
                              error={!!variantErrors?.attributeValues && !(variant.attributes[attrType.name]?.trim())} // Highlight specific field if general attribute error exists and this one is empty
                              helperText={(!!variantErrors?.attributeValues && !(variant.attributes[attrType.name]?.trim())) ? "Valor requerido" : ""}
                            />
                          </Grid2>
                        ))}
                        {/* Display general attribute error if present */}
                        {variantErrors?.attributeValues && <Grid2 size={{ xs: 12 }}><FormHelperText error>{variantErrors.attributeValues}</FormHelperText></Grid2>}

                      </Grid2>
                    </AccordionDetails>
                  </Accordion>
                </Grid2>
              );
            })}

            <Grid2 size={{ xs: 12 }}>
              <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddVariant} disabled={isSubmitting || formData.attributeTypes.filter(at => at.name.trim()).length === 0}>
                Añadir Variante
              </Button>
              {formData.attributeTypes.filter(at => at.name.trim()).length === 0 && <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>Defina tipos de atributos primero.</Typography>}
            </Grid2>
            {/* --- End Variants Section --- */}


            {/* --- General Error Display & Actions --- */}
            {validationErrors?.product?.name && !formData.name.trim() ? null : /* Don't show general API error if required field error already exists */
              validationErrors?.product?.name && <Grid2 size={{ xs: 12 }}><Alert severity="error" sx={{ mt: 2 }}>Error: {validationErrors.product.name}</Alert></Grid2>
            }

            <Grid2 size={{ xs: 12 }}>
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                  {isSubmitting ? "Creando..." : "Crear Producto"}
                </Button>
              </Stack>
            </Grid2>

          </Grid2>
        </form >
      </Paper >
    </>
  );
};

export default CreateProduct;

// Add this import at the top if not already there
import { FormHelperText } from '@mui/material';