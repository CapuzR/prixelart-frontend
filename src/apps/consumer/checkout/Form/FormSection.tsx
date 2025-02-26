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
  Tooltip,
} from "@mui/material";
import { ExpandMore, Info } from '@mui/icons-material';
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; 
import dayjs from "dayjs";
import { is } from "immutable";
import { get } from "http";

const FormSection = ({
  order,
  sectionConfig,
  sectionKey,
  isExpanded,
  onToggle,
}) => {
  const { control, getValues } = useFormContext();
  const formValues = getValues(sectionKey); 

  const renderFieldComponent = (field, fieldState, fieldConfig) => {
    const { type, options, adornment, ...rest } = fieldConfig;
    const isDisabled = field.disabled;
    if (field.isHidden) return null;

    const commonProps = {
      ...field,
      error: !!fieldState.error,
      helperText: fieldState.error ? fieldState.error.message : fieldConfig.helperText,
      fullWidth: true,
      disabled: isDisabled, 
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
        
      case "tooltip":
        return (
          <FormControlLabel
            control={
              <Tooltip
                title={field.value}
                style={{ marginLeft: 5, marginRight: 20 }}
              >
                <Info color="secondary" />
              </Tooltip>
            }
            label={fieldConfig.label}
          />
        );

      case "date":
        return (
          <DatePicker 
            {...field}
            minDate={dayjs()}
            label={fieldConfig.label}
            format="DD/MM/YYYY"
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

        case "textWithTooltip":
          return (
            <Grid container {...commonProps} spacing={1} alignItems="center">
              <Grid item>
                <TextField />
              </Grid>
              <Grid item>
                <Tooltip title={field.tooltip}>
                  <Info color="secondary" />
                </Tooltip>
              </Grid>
            </Grid>
          );

          case "dropdownWithTooltip":
            return (
              <Grid container spacing={1} alignItems="center" xs={12}> {/* Set width to 6 */}
                <Grid item xs={10}> {/* TextField takes 10 out of 12 columns */}
                  <TextField {...commonProps} select fullWidth>
                    {options?.map((option, idx) => (
                      <MenuItem key={idx} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={2}> {/* Tooltip takes 2 out of 12 columns */}
                  <Tooltip title={fieldConfig.tooltip}>
                    <Info color="secondary" />
                  </Tooltip>
                </Grid>
              </Grid>
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
            hiddingConditions,
            requiredConditions,
            isHidden,
            ...rest
          } = fieldConfig;

        const isDisabled = Array.isArray(conditionedBy)
          ? conditionedBy.some((condition) => getValues(condition) === true)
          : conditionedBy
          ? getValues(conditionedBy) === true
          : false;

        if (isHidden) return null;

          return (
            <Grid item xs={12} sm={width} key={key}>
              <Controller
                name={`${sectionKey}.${key}`}
                control={control}
                disabled={isDisabled}
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
    <Accordion expanded={isExpanded} onChange={onToggle}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
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
