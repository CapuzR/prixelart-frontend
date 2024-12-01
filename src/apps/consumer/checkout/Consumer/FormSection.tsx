import React, { useState, useEffect, useMemo, useCallback } from "react";
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

const FormSection = ({
  sectionConfig,
  sectionData,
  sourceData,
  expanded,
  onChange,
  handleDispatch,
  sectionKey,
}) => {
  const [selectedCheckbox, setSelectedCheckbox] = useState(
    sectionConfig.defaultCheckbox || null
  );
  const [prevState, setPrevState] = useState({});
  const [fieldsExpanded, setFieldsExpanded] = useState(false);
  useEffect(() => {
    console.log(selectedCheckbox, sourceData[selectedCheckbox]);
    console.log("sectionData", sectionData);
    if (selectedCheckbox && sourceData[selectedCheckbox]) {
      const isDataSame = Object.entries(sourceData[selectedCheckbox]).every(
        ([key, value]) => sectionData[key] === value
      );

      if (!isDataSame) {
        handleDispatch(sectionConfig.actionType, sourceData[selectedCheckbox]);
      }
    }
  }, [
    selectedCheckbox,
    sourceData,
    sectionConfig.actionType,
    sectionData,
    handleDispatch
  ]);

  useEffect(() => {
      setFieldsExpanded(!areAnyCheckboxesChecked());
  }, [selectedCheckbox]);
  
  const hasIncompleteFields = () => {
    // Check standard fields
    const fieldsIncomplete = sectionConfig.fields && Object.keys(sectionConfig.fields).some((key) => {
      const fieldConfig = sectionConfig.fields[key];
      const value = sectionData[key];
      const isRequired = fieldConfig.required ?? true; // Default required to true
      return (
        isRequired &&
        fieldConfig.errorCheck &&
        !fieldConfig.errorCheck(value, sectionData)
      );
    });
  
    // Check additional fields
    const additionalFieldsIncomplete = sectionConfig.additional && Object.keys(sectionConfig.additional).some((key) => {
      const additionalField = sectionConfig.additional[key];
      const value = sectionData[key];
      const isRequired = additionalField.required ?? true; // Default required to true
      return (
        isRequired &&
        additionalField.errorCheck &&
        !additionalField.errorCheck(value, sectionData)
      );
    });
  
    return fieldsIncomplete || additionalFieldsIncomplete;
  };
  
  const handleCheckboxChange = (type) => {
    const isCurrentlyChecked = selectedCheckbox === type;

    if (isCurrentlyChecked) {
      setSelectedCheckbox(null);
        handleDispatch(sectionConfig.actionType, prevState);
    } else {
      setPrevState(sectionData);
      setSelectedCheckbox(type);
      handleDispatch(sectionConfig.actionType, sourceData[type]);
    }
  };

  const isCheckboxChecked = (type) => selectedCheckbox === type;

  const areAnyCheckboxesChecked = () => {
    return sectionConfig.checkboxes?.some(({ type }) => isCheckboxChecked(type));
  };  

  const renderCheckboxes = () =>
    sectionConfig.checkboxes?.map(({ type, label }) => (
      <Grid item xs={12} key={type}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isCheckboxChecked(type)}
              onChange={() => handleCheckboxChange(type)}
            />
          }
          label={label}
        />
      </Grid>
    ));

    const renderFields = () => {
      const filteredFields =
        sectionConfig.fields &&
        Object.keys(sectionConfig.fields).filter(
          (key) =>
            !sectionConfig.fields[key].renderKey ||
            sectionConfig.fields[key].renderKey === sectionKey
        );
    
      return (
        <>
          <Grid item xs={12}>
            <Typography
              variant="h6"
              style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={() => areAnyCheckboxesChecked() && setFieldsExpanded(!fieldsExpanded)}
            >
              {sectionConfig.fieldsTitle}
              {areAnyCheckboxesChecked() && (
              <ExpandMoreIcon
                style={{
                  transform: fieldsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                  marginLeft: "8px",
                }}
              />
              )}
            </Typography>
          </Grid>
          {fieldsExpanded &&
            filteredFields?.map((key) => {
              const {
                label,
                errorCheck,
                helperText,
                adornment,
                width = 6,
                required = true,
                actionType,
                renderKey,
                dataKey,
                ...rest
              } = sectionConfig.fields[key];
    
              const isDisabled =
                selectedCheckbox &&
                sectionConfig.checkboxes?.some(({ type, activeFields }) => {
                  if (selectedCheckbox === type) {
                    return activeFields ? !activeFields.includes(key) : true;
                  }
                  return false;
                });
    
              const effectiveActionType = actionType || sectionConfig.actionType;

              const labelWithRequirement = `${label} ${
                required ? "*" : "(optional)"
              }`;    
    
              return (
                <Grid item lg={width} md={width} sm={12} xs={12} key={key}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label={labelWithRequirement}
                    value={sectionData[key] || ""}
                    error={
                      errorCheck &&
                      !errorCheck(sectionData[key], sectionData)
                    }
                    helperText={
                      errorCheck && !errorCheck(sectionData[key], sectionData)
                        ? helperText
                        : ""
                    }
                    InputProps={{
                      startAdornment: adornment ? (
                        <InputAdornment position="start">
                          {adornment}
                        </InputAdornment>
                      ) : null,
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (sectionData[key] !== value) {
                        handleDispatch(effectiveActionType, { [key]: value });
                      };
    
                      if (dataKey && dataKey !== sectionKey) {
                        handleDispatch(sectionConfig.actionType, { [key]: value });
                      }
                    }}
                    margin="normal"
                    disabled={isDisabled}
                    {...rest}
                  />
                </Grid>
              );
            })}
        </>
      );
    };
    
  const renderAdditionalFields = () =>
    Object.keys(sectionConfig.additional || {}).map((key) => {
      const additionalField = sectionConfig.additional[key];
      const isDisabled =
        selectedCheckbox &&
        sectionConfig.checkboxes?.some(({ type, activeFields }) => {
          if (selectedCheckbox === type) {
            return activeFields ? !activeFields.includes(key) : true;
          }
          return false;
        });

      const effectiveActionType =
      additionalField.actionType || sectionConfig.actionType;

      const isRequired = additionalField.required ?? true;

      const labelWithRequirement = `${additionalField.label} ${
        isRequired ? "*" : "(optional)"
      }`;    
     
    return (
      <Grid item lg={6} md={6} sm={12} xs={12} key={key}>
        <TextField
          select={additionalField.type === "dropdown"}
          type={additionalField.type === "date" ? "date" : undefined}
          label={additionalField.label}
          value={sectionData[key] || ""}
          error={
            isRequired &&
            additionalField.errorCheck &&
            !additionalField.errorCheck(sectionData[key], sectionData)
          }
          helperText={
            isRequired &&
            additionalField.errorCheck &&
            !additionalField.errorCheck(sectionData[key], sectionData)
              ? additionalField.helperText
              : ""
          }
          onChange={(e) => {
            const value = e.target.value;
            handleDispatch(effectiveActionType, { [key]: value });

            if (additionalField.dataKey && additionalField.dataKey !== sectionKey) {
              handleDispatch(sectionConfig.actionType, { [key]: value });
            }
          }}
          fullWidth
          variant="outlined"
          margin="normal"
          disabled={isDisabled}
        >
          {additionalField.options?.map((option) => (
            <MenuItem value={option} key={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    );
    });

  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {sectionConfig.headerLabel && sectionConfig.headerValue ? 
            sectionConfig.headerLabel + " " + sectionConfig.headerValue.map((key) => sectionData[key]).join(" ") : 
            sectionConfig.title}{" "}
          {hasIncompleteFields() && (
            <span style={{ color: "red", marginLeft: "8px" }}>*Pendiente</span>
          )}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {sectionConfig.additionalFieldsPosition === "start" && renderAdditionalFields()}
          {renderCheckboxes()}
          {renderFields()}
          {sectionConfig.additionalFieldsPosition === "end" && renderAdditionalFields()}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default FormSection;
