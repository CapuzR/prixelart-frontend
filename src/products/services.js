export const setProductAtts = async (
  attValue,
  attributesArr,
  iProd,
  iAtt,
  productsArr,
  width,
  height
) => {
  let att = productsArr

  if (att && att.length > 0 && att[iProd]) {
    att[iProd].selection = attValue
    att[iProd].attributes = attributesArr

    const pAtt = await getEquation(att[iProd], iProd, att, width, height)
    return { pAtt: pAtt, att: att }
  }
}

export const setSecondProductAtts = async (
  attValue,
  attributesArr,
  iProd,
  iAtt,
  productsArr,
  width,
  height
) => {
  let att = productsArr
  let prevSelection

  if (typeof att[iProd].selection === "string") {
    prevSelection = [att[iProd].selection]
  } else {
    prevSelection = att[iProd].selection
  }
  if (prevSelection[1] !== undefined) {
    prevSelection.splice(1, 1)
  }
  prevSelection.push(attValue)
  att[iProd].selection = prevSelection
  att[iProd].attributes = attributesArr

  const pAtt = await getEquation(att[iProd], iProd, att, width, height)
  return { pAtt: pAtt, att: att }
}

export const getAttributes = (products) => {
  let lol = products
  lol = products.map((p, i) => {
    let att = []
    p.variants.map((v) => {
      if (v.active) {
        if (att.length == 0) {
          att = [...new Set(v.attributes.flatMap((a) => a))]
        } else {
          att.push(...new Set(v.attributes.flatMap((a) => a)))
        }
      }
    })
    const result = [...new Set(att.flatMap(({ name }) => name))]
    const res1 = [
      ...new Set(
        result.map((a) => {
          return {
            name: a,
            value: [
              ...new Set(
                att.map((v) => {
                  if (v.name == a && v.value) {
                    return v.value
                  }
                })
              ),
            ].filter((a) => a),
          }
        })
      ),
    ]
    p.attributes = res1
    p.selection = []
    p.selection.length = p.attributes.length

    return p
  })
  return lol
}

export const structureEquation = (equation, i, width, height) => {
  let eq = ""
  let x = equation.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  x.split(/[\s{}}]+/).map((n, j, arr) => {
    if (n == "width") {
      eq = eq.concat(width[i] || 0)
    } else if (n == "height") {
      eq = eq.concat(height[i] || 0)
    } else {
      eq = eq.concat(n)
    }
  })
  return eq
}

export const getEquation = async (
  product,
  iProd,
  productArr,
  width,
  height
) => {
  if (product.selection?.length === 2) {
    const filteredVars = await product.variants.filter((v, i) => {
      if (v.attributes && v.attributes.length === 2) {
        return (
          v.attributes[0].value === product.selection[0] &&
          v.attributes[1].value === product.selection[1]
        )
      }
    })
    if (filteredVars.length != 0) {
      if (
        filteredVars[0].publicPrice.equation &&
        filteredVars[0].prixerPrice?.equation
      ) {
        productArr[iProd].needsEquation = true

        productArr[iProd].publicEquation =
          structureEquation(
            filteredVars[0].publicPrice.equation,
            iProd,
            width,
            height
          ) || 0

        productArr[iProd].prixerEquation =
          structureEquation(
            filteredVars[0].prixerPrice.equation,
            iProd,
            width,
            height
          ) || 0
      } else if (filteredVars[0].publicPrice.equation) {
        productArr[iProd].needsEquation = true
        productArr[iProd].publicEquation =
          structureEquation(
            filteredVars[0].publicPrice.equation,
            iProd,
            width,
            height
          ) || 0
      }
    } else {
      productArr[iProd].needsEquation = false
    }
  } else if (
    typeof product.selection === "string" &&
    product.attributes.length === 1
  ) {
    const filteredVars = await product.variants.filter((v, i) => {
      if (v.attributes && v.attributes.length === 1) {
        return v.attributes.every((a) => product.selection.includes(a.value))
      } else {
        return
      }
    })

    if (filteredVars.length != 0) {
      if (
        filteredVars[0].publicPrice.equation &&
        filteredVars[0].prixerPrice?.equation
      ) {
        productArr[iProd].needsEquation = true
        productArr[iProd].publicEquation =
          structureEquation(
            filteredVars[0].publicPrice.equation,

            iProd,
            width,
            height
          ) || 0
        productArr[iProd].prixerEquation =
          structureEquation(
            filteredVars[0].prixerPrice.equation,
            iProd,
            width,
            height
          ) || 0
      } else if (filteredVars[0].publicPrice.equation) {
        productArr[iProd].needsEquation = true
        productArr[iProd].publicEquation =
          structureEquation(
            filteredVars[0].publicPrice.equation,
            iProd,
            width,
            height
          ) || 0
      }
    } else {
      productArr[iProd].needsEquation = false
    }
  } else {
    productArr[iProd].needsEquation = false
    productArr[iProd].publicEquation = ""
    productArr[iProd].prixerEquation = ""
  }
  return productArr
}
