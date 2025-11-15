import React from "react";
import Switch from "components/Switch";
import { useCurrency } from "context/GlobalContext";

const CurrencySwitch: React.FC = () => {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <div>
      <Switch
        checked={currency === "Bs"}
        onChange={toggleCurrency}
        leftLabel="$"
        rightLabel="Bs"
      />
    </div>
  );
};

export default CurrencySwitch;
