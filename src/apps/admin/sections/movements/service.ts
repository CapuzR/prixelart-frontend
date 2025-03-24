import { Movement } from "../../../../types/movement.types"
import { Prixer } from "../../../../types/prixer.types"
import { Product } from "../../../../types/product.types"
import { Art } from "../../../../types/art.types"
import { Organization } from "../../../../types/organization.types"
import { Discount } from "../../../../types/discount.types"

interface Item {
  product: Product,
  art: Art,
  quantity: number
}

export const sortMovements = (movements: Movement[]) => {
  let movs = movements.sort(function (a: Movement, b: Movement) {
    if (a.createdOn < b.createdOn) {
      return 1
    }
    if (a.createdOn > b.createdOn) {
      return -1
    }
    return 0
  })

  return movs
}

export const getPrixersNames = (list: Movement[]) => {
  let prix:string[] = []
  list.map((mov) => {
    if (prix[0] === null) {
      prix = [mov.destinatary]
    } else if (prix.includes(mov.destinatary)) {
      return
    } else {
      prix.push(mov.destinatary)
    }
  })
  return prix
}

export const getUsername = (fullname: string, orgs: Organization[], prixers: Prixer[]) => {
  const name = fullname?.split(" ")
  let selected: Prixer | undefined
  if (name && name?.length === 2) {
    selected = orgs.find(
      (p: Prixer) => p?.firstName === name[0] && p?.lastName === name[1]
    )
    if (selected === undefined) {
      selected = prixers?.find(
        (p) => p?.firstName === name[0] && p?.lastName === name[1]
      )
    }
  } else if (name && name?.length === 3) {
    selected = orgs.find(
      (p: Prixer) => p.firstName === name[0] && p.lastName === name[1] + " " + name[2]
    )
    if (selected === undefined) {
      selected = prixers?.find(
        (p) => p.firstName === name[0] && p.lastName === name[1] + " " + name[2]
      )
    }
  }
  console.log(selected)
//   setSelectedPrixer(selected?.username)
  return selected?.username
}

export const finalPrice = (item: Item, discountList: Discount[]) => {
  let unitPrice: number
  let discount = discountList.find((dis) => dis._id === item.product.discount)

  if (item.product.finalPrice !== undefined) {
    unitPrice = Number(item.product.finalPrice * item.quantity)
    return unitPrice
  } else if (typeof item.product.discount === "string") {
    unitPrice = item.product?.publicPrice?.equation
      ? Number(item.product?.publicPrice?.equation)
      : Number(item.product.publicPrice.from)

    if (discount?.type === "Porcentaje") {
      let op = Number(
        (unitPrice - (unitPrice / 100) * discount.value) * item.quantity
      )
      unitPrice = op
      return unitPrice
    } else if (discount?.type === "Monto") {
      let op = Number((unitPrice - discount.value) * item.quantity)
      unitPrice = op
      return unitPrice
    }
  } else {
    unitPrice = item.product?.publicPrice?.equation
      ? item.product?.publicPrice?.equation
      : item.product.publicPrice.from

    let op = Number(unitPrice * item.quantity)
    unitPrice = op
    return unitPrice
  }
}

export const unitPrice = (item: Item, discountList: Discount[]) => {
  let unitPrice: string | number
  let discount = discountList.find((dis) => dis._id === item.product.discount)
  if (item.product.finalPrice !== undefined) {
    unitPrice = item.product.finalPrice
    return unitPrice
  } else if (typeof item.product.discount === "string") {
    unitPrice = item.product?.publicPrice.equation
      ? Number(item.product?.publicPrice?.equation)
      : Number(item.product.publicPrice.from)

    if (discount?.type === "Porcentaje") {
      let op = Number(unitPrice - (unitPrice / 100) * discount.value)
      unitPrice = op
      return unitPrice
    } else if (discount?.type === "Monto") {
      let op = Number(unitPrice - discount.value)
      unitPrice = op
      return unitPrice
    }
  } else {
    unitPrice = item.product?.publicPrice?.equation
      ? item.product?.publicPrice?.equation
      : item.product.publicPrice.from

    let op = Number(unitPrice)
    unitPrice = op
    return unitPrice
  }
}