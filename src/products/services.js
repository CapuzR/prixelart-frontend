export const setProductAtts = async (
  attValue,
  attributesArr,
  iProd,
  iAtt,
  productsArr,
  width,
  height
) => {
  let att = productsArr;
  if (att && att.length > 0 && att[iProd] && att[iProd].selection) {
    att[iProd].selection[iAtt] = attValue;
  }
  const pAtt = await getEquation(att[iProd], iProd, att, width, height);
  return { pAtt: pAtt, att: att };
  // setTiles(pAtt.pAtt ? [...pAtt.pAtt] : [...pAtt.att]);
};

export const getAttributes = (products) => {
  let lol = products;
  lol = products.map((p, i) => {
    let att = [];
    p.variants.map((v) => {
      if (v.active) {
        if (att.length == 0) {
          att = [...new Set(v.attributes.flatMap((a) => a))];
        } else {
          att.push(...new Set(v.attributes.flatMap((a) => a)));
        }
      }
    });
    const result = [...new Set(att.flatMap(({ name }) => name))];
    const res1 = [
      ...new Set(
        result.map((a) => {
          return {
            name: a,
            value: [
              ...new Set(
                att.map((v) => {
                  if (v.name == a && v.value) {
                    return v.value;
                  }
                })
              ),
            ].filter((a) => a),
          };
        })
      ),
    ];
    p.attributes = res1;
    p.selection = [];
    p.selection.length = p.attributes.length;

    return p;
  });
  return lol;
};

export const structureEquation = (equation, i, width, height) => {
  let eq = "";
  equation.split(/[\s{}}]+/).map((n, j, arr) => {
    if (n == "width") {
      eq = eq.concat(width[i] || 0);
    } else if (n == "height") {
      eq = eq.concat(height[i] || 0);
    } else {
      eq = eq.concat(n);
    }
  });
  return eq;
};

export const getEquation = async (
  product,
  iProd,
  productArr,
  width,
  height
) => {
  if (product.selection) {
    const filteredVars = await product.variants.filter((v, i) => {
      if (
        v.attributes &&
        v.attributes.length != 0 &&
        v.attributes.length == product.selection.length
      ) {
        return v.attributes.every((a) => product.selection.includes(a.value));
      } else {
        return false;
      }
    });

    if (filteredVars.length != 0) {
      if (
        filteredVars[0].publicPrice.equation &&
        filteredVars[0].prixerPrice.equation
      ) {
        productArr[iProd].needsEquation = true;
        productArr[iProd].publicEquation = eval(
          structureEquation(
            filteredVars[0].publicPrice.equation,
            iProd,
            width,
            height
          ) || 0
        );
        productArr[iProd].prixerEquation = eval(
          structureEquation(
            filteredVars[0].prixerPrice.equation,
            iProd,
            width,
            height
          ) || 0
        );
      } else {
        productArr[iProd].needsEquation = false;
      }
    } else {
      productArr[iProd].needsEquation = false;
    }
  } else {
    productArr[iProd].needsEquation = false;
    productArr[iProd].publicEquation = "";
    productArr[iProd].prixerEquation = "";
  }

  return productArr;
};
