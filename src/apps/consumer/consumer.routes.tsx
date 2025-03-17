import { useState } from "react"
import { Route, Switch } from "react-router-dom"

import Home from "apps/consumer/home/home"
import Catalog from "apps/consumer/art/catalog/views/Catalog"
import Products from "apps/consumer/products/Catalog"
import Cart from "@apps/consumer/cart"
import Prixers from "apps/consumer/prixers/prixersGrid"
import OrgGrid from "apps/consumer/components/orgGrid/orgGrid"
import TestimonialsGrid from "apps/consumer/testimonials/TestimonialsGrid"
import ProductDetails from "apps/consumer/products/Details/Details"
import Flow from "apps/consumer/flow/Flow"

const ConsumerRoutes = () => {
  const [prixer, setPrixer] = useState<any>(null)
  const [fullArt, setFullArt] = useState<any>(null)
  const [pointedProduct, setPointedProduct] = useState<any>(undefined)

  return (
    <Switch>
      <Route path="/productos">
        <Products
          pointedProduct={pointedProduct}
          setPointedProduct={setPointedProduct}
        />
      </Route>
      <Route path="/galeria">
        <Catalog
          setPrixer={setPrixer}
          prixer={prixer}
          setFullArt={setFullArt}
          fullArt={fullArt}
        />
      </Route>
      <Route path="/prixers">
        <Prixers setPrixer={setPrixer} prixer={prixer} />
      </Route>
      <Route path="/organizaciones">
        <OrgGrid setPrixer={setPrixer} prixer={prixer} />
      </Route>
      <Route path="/carrito">
        <Cart />
      </Route>

      <Route path="/testimonios">
        <TestimonialsGrid />
      </Route>

      {/* TODO : Cómo debería llamarse? Flujo? Selección? */}
      <Route path="/flow">
        <Flow />
      </Route>

      <Route path="/producto/:id">
        <ProductDetails />
      </Route>

      <Route path="/" component={Home} exact />
    </Switch>
  )
}

export default ConsumerRoutes
