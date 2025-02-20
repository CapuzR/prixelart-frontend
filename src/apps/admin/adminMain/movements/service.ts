import { Movement } from "../../../../types/movement.types"
import { Prixer } from "../../../../types/prixer.types"

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
  let prix = []
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

export const getUsername = (fullname: string, orgs, prixers) => {
  const name = fullname?.split(" ")
  let selected: Partial<Prixer>
  if (name && name?.length === 2) {
    selected = orgs.find(
      (p) => p?.firstName === name[0] && p?.lastName === name[1]
    )
    if (selected === undefined) {
      selected = prixers?.find(
        (p) => p?.firstName === name[0] && p?.lastName === name[1]
      )
    }
    console.log(selected)
  } else if (name && name?.length === 3) {
    selected = orgs.find(
      (p) => p.firstName === name[0] && p.lastName === name[1] + " " + name[2]
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
