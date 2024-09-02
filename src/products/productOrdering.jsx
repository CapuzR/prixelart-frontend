import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

export default function ProductOrdering(props) {
    const { order, handleOrder, classes } = props;

    return (
        <FormControl className={classes.formControl}>
            <InputLabel style={{ marginLeft: 10 }} id="demo-simple-select-label">
                Ordenar
            </InputLabel>
            <Select
                variant="outlined"
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={order}
                onChange={handleOrder}
            >
                <MenuItem value={"A-Z"}>A-Z</MenuItem>
                <MenuItem value={"Z-A"}>Z-A</MenuItem>
                <MenuItem value={"Price"}>Menor precio</MenuItem>
            </Select>
        </FormControl>
    );
};