// import { Organization } from "./../../../../types/organization.types"
// import { Product } from "./../../../../types/product.types"

// export const getSurchargesList = (
//   selectedPrixer,
//   products,
//   surcharges,
//   setSelectedSurcharges,
//   setProductList
// ) => {
//   let x = []
//   let updatedProductList = products.map((product) => {
//     const surcharge = surcharges.find((sur) => {
//       return (
//         sur.appliedUsers.includes(selectedPrixer.username) &&
//         sur.appliedProducts.includes(product.name)
//       )
//     })

//     if (surcharge) {
//       x.push(surcharge)

//       return {
//         ...product,
//         surcharge: surcharge,
//       }
//     }

//     return product
//   })
//   setSelectedSurcharges(x)
//   checkProductList(updatedProductList, selectedPrixer)
// }

// export const checkProductList = (
//   products: Product[],
//   selectedPrixer: Organization
// ) => {
//   let uniqueProducts: Product[] = []

//   selectedPrixer?.agreement?.appliedProducts?.forEach((product) => {
//     const prev = uniqueProducts.some((element) => element._id === product._id)

//     if (!prev) {
//       uniqueProducts.push(product)
//     }
//   })

//   products?.forEach((prod) => {
//     const p = {
//       id: prod._id,
//       name: prod.name,
//       pvp: prod.publicPrice.from,
//       pvm: prod.prixerPrice.from,
//       cost: prod.cost,
//       cporg: selectedPrixer?.agreement?.comission,
//       // || comission,
//       appliedGlobalCporg: true,
//       variants: [],
//       surcharge: prod?.surcharge,
//     }

//     prod.variants?.forEach((variant) => {
//       p.variants.push({
//         id: variant._id,
//         name: variant.name,
//         pvp: variant.publicPrice.equation,
//         pvm: variant.prixerPrice.equation,
//         cost: variant.cost,
//         cporg: selectedPrixer?.agreement?.comission || comission,
//         appliedGlobalCporg: true,
//         surcharge: prod?.surcharge,
//       })
//     })

//     const foundPrev = uniqueProducts.find((element) => element.id === p.id)

//     if (foundPrev) {
//       p.variants.forEach((variant) => {
//         const existingVariant = foundPrev.variants.find(
//           (v) => v.id === variant.id
//         )

//         if (!existingVariant) {
//           p.variants.push(variant)
//         }
//       })
//     } else {
//       uniqueProducts.push(p)
//     }
//   })

//   const updatedProducts = Array.from(uniqueProducts)

//   setAppliedProducts(updatedProducts)
// }
