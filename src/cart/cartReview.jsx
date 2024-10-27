import React from "react";
import Grid from "components/Grid";
import { useCart } from "context/CartContext";
import ItemCard from "components/ItemCard";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Typography from "components/Typography"; // Assuming your Typography component is imported like this

const CartReview: React.FC = () => {
  const { cart } = useCart(); // Get cart from context
  const isMobile = useMediaQuery("(max-width: 600px)"); // Mobile media query

  return (
    <>
      <Grid>
        <Typography level="h1" align="center">
          {/* Add typography content if needed */}
        </Typography>
        <h1
          style={{
            marginBottom: isMobile ? 40 : 20,
            marginTop: 100,
            color: "#404e5c",
          }}
        >
          {isMobile ? "Carrito" : "Carrito de compras"}
        </h1>
      </Grid>

      <Grid isParent={true}>
        {cart?.map((item, index) => (
          <ItemCard 
            key={index} 
            item={item} 
            currency={"USD"} 
            conversionRate={1} // Pass the required props for the ItemCard
          />
        ))}
      </Grid>
    </>
  );
};

export default CartReview;
