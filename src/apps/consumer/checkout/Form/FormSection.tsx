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
import { useFormContext, Controller, FieldValues, ControllerRenderProps, FieldError } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface FieldConfig {
  label: string;
  required?: boolean;
  width?: number;
  helperText?: string;
  conditionedBy?: string | string[];
  onConditionChange?: (...args: any[]) => void;
  isHidden?: boolean;
  type?: string;
  options?: string[];
  adornment?: React.ReactNode;
  tooltip?: string;
  [key: string]: any;
}

interface SectionConfig {
  title: string;
  fields: Record<string, FieldConfig>;
}

interface FormSectionProps {
  sectionConfig: SectionConfig;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: (event: React.SyntheticEvent, expanded: boolean) => void;
}


const FormSection: React.FC<FormSectionProps> = ({ sectionConfig, sectionKey, isExpanded, onToggle, }) => {
  const { control, getValues } = useFormContext();
  const formValues = getValues(sectionKey);

  interface FieldProps extends ControllerRenderProps<FieldValues, string> { }

  const renderFieldComponent = (
    field: FieldProps,
    fieldState: { error?: FieldError },
    fieldConfig: FieldConfig
  ) => {
    const {
      type,
      options,
      adornment,
      width,
      errorCheck,
      conditionedBy,
      onConditionChange,
      hiddingConditions,
      requiredConditions,
      isHidden,
      tooltip,
      ...textFieldProps
    } = fieldConfig;
    const isDisabled = field.disabled;
    if (fieldConfig.isHidden) return <></>;

    const commonProps = {
      ...field,
      ...textFieldProps,
      error: !!fieldState.error,
      helperText: fieldState.error ? fieldState.error.message : fieldConfig.helperText,
      disabled: isDisabled,
      variant: "outlined" as const,
      InputProps: {
        startAdornment: adornment ? (
          <InputAdornment position="start">{adornment}</InputAdornment>
        ) : null,
      },
      value: field.value || "",
    };

    switch (type) {
      case "dropdown":
        return (
          <TextField fullWidth {...commonProps} select>
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
                fullWidth: true,
                error: !!fieldState.error,
                helperText: fieldState.error ? fieldState.error.message : fieldConfig.helperText,
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
              <Tooltip title={fieldConfig.tooltip}>
                <Info color="secondary" />
              </Tooltip>
            </Grid>
          </Grid>
        );

      case "dropdownWithTooltip":
        return (
          <Grid container spacing={1} alignItems="center" xs={12}> {/* Set width to 6 */}
            <Grid item xs={10}> {/* TextField takes 10 out of 12 columns */}
              <TextField fullWidth {...commonProps} select>
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
        return <TextField fullWidth {...commonProps} />;
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
                render={({ field, fieldState }) => {
                  return renderFieldComponent(field, fieldState, {
                    label: `${label}${required ? " *" : " (opcional)"}`,
                    helperText,
                    required,
                    ...rest,
                  });
                }}
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
