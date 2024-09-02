import Switch from '@material-ui/core/Switch';

export default function CurrencySwitch(props) {
    const { classes, currency, changeCurrency } = props;

    return (
        <Switch
            classes={{
            root: classes.base,
            switchBase: classes.switchBase,
            thumb: currency ? classes.thumbTrue : classes.thumb,
            track: classes.track,
            checked: classes.checked,
            }}
            color="primary"
            value={currency}
            onChange={(e) => {
            changeCurrency(e);
            }}
            style={{ marginRight: "-5px" }}
        />
    );
}