import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; 
import dayjs from "dayjs";

const FormSection = ({
  order,
  sectionConfig,
  sectionKey,
}) => {
  const { control, setValue, getValues } = useFormContext();
  const [fieldsExpanded, setFieldsExpanded] = useState(false);

  const formValues = getValues(sectionKey);

  const renderFieldComponent = (field, fieldState, fieldConfig) => {
    const { type, options, adornment, ...rest } = fieldConfig;
    const commonProps = {
      ...field,
      error: !!fieldState.error,
      helperText: fieldState.error ? fieldState.error.message : fieldConfig.helperText,
      fullWidth: true,
      variant: "outlined",
      InputProps: {
        startAdornment: adornment ? (
          <InputAdornment position="start">{adornment}</InputAdornment>
        ) : null,
      },
      value: field.value || "",
      ...rest,
    };

    switch (type) {
      case "dropdown":
        return (
          <TextField {...commonProps} select>
            {options?.map((option, idx) => (
              <MenuItem key={idx} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        );

      case "checkbox":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label={fieldConfig.label}
          />
        );

      case "date":
        return (
          <DatePicker 
            {...field}
            label={fieldConfig.label}
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            slotProps={{
              textField: {
                error: !!fieldState.error,
                helperText: fieldState.error ? fieldState.error.message : fieldConfig.helperText,
                fullWidth: true,
                variant: "outlined",
              },
            }}
          />
        );

      case "text":
      default:
        return <TextField {...commonProps} />;
    }
  };

  const renderFields = () => {
    const fields = sectionConfig.fields || {};

    return (
      <>
        {Object.keys(fields).map((key) => {
          const fieldConfig = fields[key];
          const {
            label, 
            required = true, 
            width = 6, 
            helperText, 
            errorCheck,
            defaultValue, 
            conditionedBy,
            onConditionChange,
            ...rest
          } = fieldConfig;

          return (
            <Grid item xs={12} sm={width} key={key}>
              <Controller
                name={`${sectionKey}.${key}`}
                control={control}
                defaultValue={getValues(`${sectionKey}.${key}`) || defaultValue || ""}
                rules={{
                  required: required ? "Este campo es requerido" : false,
                  validate: (value) => {
                    if (errorCheck && !errorCheck(value, formValues)) {
                      return helperText || "Formato no válido.";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState }) =>{
                  return renderFieldComponent(field, fieldState, {
                    label: `${label}${required ? " *" : " (opcional)"}`,
                    helperText,
                    required,
                    ...rest,
                  })}
                }  
              />
            </Grid>
          );
        })}
      </>
    );
  };

  return (
    <Accordion expanded={fieldsExpanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={() => setFieldsExpanded(!fieldsExpanded)}
      >
        <Typography>{sectionConfig.title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {renderFields()}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default FormSection;
