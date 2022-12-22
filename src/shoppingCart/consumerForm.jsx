import { makeStyles } from "@material-ui/core/styles";
import React, { useState, Suspense } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import LocalPhoneIcon from "@material-ui/icons/LocalPhone";
import EmailIcon from "@material-ui/icons/Email";
import HomeIcon from "@material-ui/icons/Home";
import BusinessIcon from "@material-ui/icons/Business";
import UtilVals from "../utils/validations";
import Accordion from "@material-ui/core/Accordion";
import Typography from "@material-ui/core/Typography";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const useStyles = makeStyles((theme) => ({
  gridInput: {
    display: "flex",
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
  },
}));
function ConsumerForm(props) {
  const classes = useStyles();
  const [shippingDataCheck, setShippingDataCheck] = useState(true);
  const [billingDataCheck, setBillingDataCheck] = useState(true);
  const [billingShDataCheck, setBillingShDataCheck] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAccordionExpansion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleShippingDataCheck = () => {
    if (shippingDataCheck) {
      props.setValues({
        ...props.values,
        shippingName: "",
        shippingLastName: "",
        shippingPhone: "",
        shippingAddress: "",
      });
    } else {
      props.setValues({
        ...props.values,
        shippingName: props.values.name,
        shippingLastName: props.values.lastName,
        shippingPhone: props.values.phone,
        shippingAddress: props.values.address,
      });
    }

    setShippingDataCheck(!shippingDataCheck);
  };

  const handleBillingDataCheck = () => {
    if (shippingDataCheck) {
      props.setValues({
        ...props.values,
        billingName: "",
        billingLastName: "",
        billingPhone: "",
        billingAddress: "",
      });
    } else {
      props.setValues({
        ...props.values,
        billingName: props.values.shippingName,
        billingLastName: props.values.shippingLastName,
        billingPhone: props.values.shippingPhone,
        billingAddress: props.values.shippingAddress,
      });
    }

    setShippingDataCheck(!shippingDataCheck);
  };

  const handleBillingShDataCheck = () => {
    if (billingShDataCheck) {
      props.setValues({
        ...props.values,
        billingName: "",
        billingLastName: "",
        billingPhone: "",
        billingAddress: "",
      });
    } else {
      props.setValues({
        ...props.values,
        shippingName: props.values.shippingName,
        shippingLastName: props.values.shippingLastName,
        shippingPhone: props.values.shippingPhone,
        shippingAddress: props.values.shippingAddress,
      });
    }

    setShippingDataCheck(!shippingDataCheck);
  };

  return (
    <div>
      <Accordion
        expanded={expanded === "basic"}
        onChange={handleAccordionExpansion("basic")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Datos básicos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form autoComplete="off">
            <Grid container>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Nombre"
                  fullWidth
                  className={classes.textField}
                  value={props.values?.name ? props.values.name : ""}
                  onChange={(e) =>
                    props.setValues({ ...props.values, name: e.target.value })
                  }
                  required
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Apellido"
                  fullWidth
                  className={classes.textField}
                  value={props.values?.lastName ? props.values.lastName : ""}
                  required
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      lastName: e.target.value,
                    })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  className={classes.textField}
                  id="standard-name"
                  label="Usuario"
                  fullWidth
                  required
                  value={
                    props.values?.username
                      ? props.values.username.toLowerCase()
                      : ""
                  }
                  error={!UtilVals.isAValidUsername(props.values?.username)}
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      username: e.target.value,
                    })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Cédula o RIF"
                  fullWidth
                  helperText="ej: V-12345679 o V-1234567-0"
                  className={classes.textField}
                  value={props.values?.ci ? props.values.ci : ""}
                  onChange={(e) =>
                    props.setValues({ ...props.values, ci: e.target.value })
                  }
                  required
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Telefono"
                  fullWidth
                  className={classes.textField}
                  helperText="ej: 584141234567 o +584141234567 o 04143201028"
                  value={props.values?.phone ? props.values.phone : ""}
                  //   error={!UtilVals.isAValidPhoneNum(props.values?.phone)}
                  onChange={(e) =>
                    props.setValues({ ...props.values, phone: e.target.value })
                  }
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Correo"
                  fullWidth
                  className={classes.textField}
                  value={props.values?.email ? props.values.email : ""}
                  onChange={(e) =>
                    props.setValues({ ...props.values, email: e.target.value })
                  }
                  error={!UtilVals.isAValidEmail(props.values?.email)}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid
                item
                lg={12}
                md={12}
                sm={12}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  fullWidth
                  label="Dirección de envio"
                  className={classes.textField}
                  multiline
                  rows={3}
                  helperText="Incluir todos los detalles posibles, incluidas referencias."
                  value={props.values?.address ? props.values.address : ""}
                  required
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      address: e.target.value,
                    })
                  }
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === "shipping"}
        onChange={handleAccordionExpansion("shipping")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Datos de Envío</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form autoComplete="off">
            <Grid container>
              <Grid
                item
                lg={12}
                md={12}
                sm={12}
                xs={12}
                // className={classes.gridInput}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shippingDataCheck}
                      onChange={() => {
                        handleShippingDataCheck();
                      }}
                    />
                  }
                  label="Igual a Datos básicos"
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Nombre"
                  fullWidth
                  className={classes.textField}
                  disabled={shippingDataCheck}
                  value={
                    shippingDataCheck
                      ? props.values?.name
                        ? props.values.name
                        : ""
                      : props.values.shippingName
                  }
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      shippingName: e.target.value,
                    })
                  }
                  required
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Apellido"
                  fullWidth
                  disabled={shippingDataCheck}
                  className={classes.textField}
                  value={
                    shippingDataCheck
                      ? props.values?.lastName
                        ? props.values.lastName
                        : ""
                      : props.values.shippingLastName
                  }
                  required
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      shippingLastName: e.target.value,
                    })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Telefono"
                  fullWidth
                  disabled={shippingDataCheck}
                  className={classes.textField}
                  helperText="ej: 584141234567 o +584141234567 o 04143201028"
                  value={
                    shippingDataCheck
                      ? props.values?.phone
                        ? props.values.phone
                        : ""
                      : props.values.shippingPhone
                  }
                  // error={
                  //   shippingDataCheck
                  //     ? props.values?.phone != undefined &&
                  //       !UtilVals.isAValidPhoneNum(props.values?.phone)
                  //     : props.values?.shippingPhone != undefined &&
                  //       !UtilVals.isAValidPhoneNum(props.values?.shippingPhone)
                  // }
                  onChange={(e) => {
                    props.setValues({
                      ...props.values,
                      shippingPhone: e.target.value,
                    });
                  }}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid
                item
                lg={12}
                md={12}
                sm={12}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  fullWidth
                  label="Dirección de envio"
                  className={classes.textField}
                  multiline
                  disabled={shippingDataCheck}
                  rows={3}
                  helperText="Incluir todos los detalles posibles, incluidas referencias."
                  value={
                    shippingDataCheck
                      ? props.values?.address
                        ? props.values.address
                        : ""
                      : props.values.shippingAddress
                  }
                  required
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      shippingAddress: e.target.value,
                    })
                  }
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === "billing"}
        onChange={handleAccordionExpansion("billing")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Datos de facturación</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form autoComplete="off">
            <Grid container>
              <Grid
                item
                lg={12}
                md={12}
                sm={12}
                xs={12}
                // className={classes.gridInput}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={billingDataCheck}
                      onChange={(e) => {
                        if (billingShDataCheck) {
                          setBillingDataCheck(!billingDataCheck);
                          setBillingShDataCheck(!billingShDataCheck);
                        } else {
                          setBillingDataCheck(!billingDataCheck);
                        }
                      }}
                    />
                  }
                  label="Igual a Datos básicos"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={billingShDataCheck}
                      onChange={(e) => {
                        if (billingDataCheck) {
                          setBillingShDataCheck(!billingShDataCheck);
                          setBillingDataCheck(!billingDataCheck);
                        } else {
                          setBillingShDataCheck(!billingShDataCheck);
                        }
                      }}
                    />
                  }
                  label="Igual a Datos de envío"
                />
              </Grid>
              <Grid
                item
                lg={6}
                md={6}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Nombre"
                  fullWidth
                  className={classes.textField}
                  disabled={billingDataCheck || billingShDataCheck}
                  value={
                    billingShDataCheck
                      ? props.values?.shippingName
                        ? props.values.shippingName
                        : ""
                      : billingDataCheck
                      ? props.values?.name
                        ? props.values.name
                        : ""
                      : props.values.billingShName
                  }
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      billingShName: e.target.value,
                    })
                  }
                  required
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                lg={6}
                md={6}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Apellido"
                  fullWidth
                  className={classes.textField}
                  disabled={billingDataCheck || billingShDataCheck}
                  value={
                    billingShDataCheck
                      ? props.values?.shippingLastName
                        ? props.values.shippingLastName
                        : ""
                      : billingDataCheck
                      ? props.values?.lastName
                        ? props.values.lastName
                        : ""
                      : props.values.billingShLastName
                  }
                  required
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      billingShLastName: e.target.value,
                    })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={4}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  label="Telefono"
                  fullWidth
                  disabled={billingDataCheck || billingShDataCheck}
                  className={classes.textField}
                  helperText="ej: 584141234567 o +584141234567 o 04143201028"
                  value={
                    billingShDataCheck
                      ? props.values?.shippingPhone
                        ? props.values.shippingPhone
                        : ""
                      : billingDataCheck
                      ? props.values?.phone
                        ? props.values.phone
                        : ""
                      : props.values.billingShPhone
                  }
                  // error={
                  //   billingDataCheck
                  //     ? props.values?.phone != undefined &&
                  //       !UtilVals.isAValidPhoneNum(props.values?.phone)
                  //     : billingShDataCheck
                  //     ? (props.values?.billingPhone != undefined ||
                  //         (shippingDataCheck &&
                  //           props.values?.phone != undefined)) &&
                  //       !UtilVals.isAValidPhoneNum(props.values?.billingPhone)
                  //     : props.values?.billingShPhone != undefined &&
                  //       !UtilVals.isAValidPhoneNum(props.values?.billingShPhone)
                  // }
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      billingShPhone: e.target.value,
                    })
                  }
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid
                item
                lg={12}
                md={12}
                sm={12}
                xs={12}
                className={classes.gridInput}
              >
                <TextField
                  id="standard-name"
                  fullWidth
                  label="Dirección de facturación"
                  multiline
                  rows={3}
                  disabled={billingDataCheck || billingShDataCheck}
                  className={classes.textField}
                  value={
                    billingShDataCheck
                      ? props.values?.shippingAddress
                        ? props.values.shippingAddress
                        : ""
                      : billingDataCheck
                      ? props.values?.address
                        ? props.values.address
                        : ""
                      : props.values.billingShAddress
                  }
                  required
                  onChange={(e) =>
                    props.setValues({
                      ...props.values,
                      billingShAddress: e.target.value,
                    })
                  }
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default ConsumerForm;
