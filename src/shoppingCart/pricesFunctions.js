const UnitPrice = (
  product,
  art,
  currency,
  dollarValue,
  discountList,
  prixer
) => {
  let { base, final } = 0;

  if (product.modifyPrice) {
    final = product.finalPrice;
  } else if (prixer !== undefined) {
    product.prixerEquation
      ? (final = Number(product?.prixerEquation?.replace(/[,]/gi, ".")))
      : (final = Number(product?.prixerPrice?.from?.replace(/[,]/gi, ".")));

    if (art.prixerUsername !== prixer && art.owner !== prixer) {
      final = (final - final / 10) / (1 - art.comission / 100);
    }
  } else {
    product.publicEquation
      ? (base = Number(product.publicEquation.replace(/[,]/gi, ".")))
      : (base = Number(product.publicPrice.from.replace(/[,]/gi, ".")));
    final = base - base / 10;
    final = final / (1 - art.comission / 100);
  }

  if (
    prixer === undefined &&
    typeof product.discount === "string" &&
    product.modifyPrice === (false || undefined)
  ) {
    let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
    if (dis?.type === "Porcentaje") {
      final = final - (final / 100) * dis?.value;
    } else if (dis?.type === "Monto") {
      final = final - dis?.value;
    }
  }
  if (product.finalPrice) {
    final = product.finalPrice;
  }
  if (currency) {
    final = final * dollarValue;
  }
  return final?.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const UnitPriceSug = (
  product,
  art,
  currency,
  dollarValue,
  discountList,
  prixer,
  org,
  consumerType
) => {
  let { price, base } = 0;
  let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
  if (org !== undefined) {
    price = UnitPriceForOrg(product, art, prixer, org, consumerType);
  } else {
    if (typeof product.selection === "string" && prixer !== undefined) {
      base = product.prixerEquation
        ? Number(
            product.prixerEquation?.replace(/[,]/gi, ".") -
              product.prixerEquation?.replace(/[,]/gi, ".") / 10
          )
        : Number(
            product.prixerPrice.from?.replace(/[,]/gi, ".") -
              product.prixerPrice.from?.replace(/[,]/gi, ".") / 10
          );
    } else if (typeof product.selection === "string") {
      base = product.publicEquation
        ? Number(product.publicEquation - product.publicEquation / 10)
        : Number(
            product.publicPrice.from?.replace(/[,]/gi, ".") -
              product.publicPrice.from?.replace(/[,]/gi, ".") / 10
          );
    } else if (prixer !== undefined) {
      base = product.prixerEquation
        ? Number(
            product?.prixerEquation?.replace(/[,]/gi, ".") -
              product?.prixerEquation?.replace(/[,]/gi, ".") / 10
          )
        : Number(
            product?.prixerPrice?.from?.replace(/[,]/gi, ".") -
              product?.prixerPrice?.from?.replace(/[,]/gi, ".") / 10
          );
    } else {
      base = product.publicEquation
        ? Number(product.publicEquation - product.publicEquation / 10)
        : Number(product.publicPrice.from - product.publicPrice.from / 10);
    }
    // refinar esta función
    if (
      prixer !== undefined &&
      prixer !== art.prixerUsername &&
      prixer !== art.owner
    ) {
      price = base / (1 - art.comission / 100);
    } else if (prixer === art.prixerUsername || prixer === art.owner) {
      price = base;
    }

    if (prixer === undefined && typeof product.discount === "string") {
      if (dis?.type === "Porcentaje") {
        price = Number(price - (price / 100) * dis?.value);
      } else if (dis?.type === "Monto") {
        price = Number(price - dis?.value);
      }
    } else if (prixer === undefined) {
      price = base / (1 - art.comission / 100);
    }
  }

  // Incluir recargo si es a PrixelartPrefit
  if (currency) {
    price = price * (dollarValue || 1);
  }
  return price.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const UnitPriceForOrg = (product, art, prixer, org, consumerType) => {
  let { base, price } = 0;
  if (org !== undefined && org?.agreement.base === "pvprixer") {
    base =
      product.prixerEquation !== "" && product.prixerEquation !== undefined
        ? Number(
            product.prixerEquation.replace(/[,]/gi, ".") -
              product.prixerEquation.replace(/[,]/gi, ".") / 10
          )
        : Number(
            product.prixerPrice.from.replace(/[,]/gi, ".") -
              product.prixerPrice.from.replace(/[,]/gi, ".") / 10
          );
  } else if (org !== undefined && org?.agreement.base === "pvm") {
    base =
      product.prixerEquation !== "" && product.prixerEquation !== undefined
        ? Number(product.prixerEquation.replace(/[,]/gi, "."))
        : Number(product.prixerPrice.from.replace(/[,]/gi, "."));
  } else if (org !== undefined && org.agreement.base === "pvp") {
    base =
      product.publicEquation !== "" && product.publicEquation !== undefined
        ? Number(product.publicEquation.replace(/[,]/gi, "."))
        : Number(product.publicPrice.from.replace(/[,]/gi, "."));
  }
  const applied = org?.agreement.appliedProducts.find(
    (el) => el.id === product._id
  );
  const varApplied = applied.variants.find((v) => v.name === product.selection);
  let percentage =
    product.selection !== undefined && typeof product.selection === "string"
      ? varApplied.cporg
      : applied.cporg;

  let consumerVar = consumerType.toLowerCase();
  for (const p in org.agreement.considerations) {
    const prop = p.toLowerCase();
    if (consumerVar?.includes(prop)) {
      let c = (percentage / 100) * org.agreement.considerations[p];
      percentage = percentage - c;
      console.log(percentage);
    }
  }
  console.log(percentage);

  price = base / (1 - Number(percentage) / 100);
  console.log(price);
  return price;
};

const getVariantPrice = (product, art) => {
  let { price, base } = 0;

  base = product.publicEquation
    ? Number(product.publicEquation - product.publicEquation / 10)
    : Number(product.publicPrice.from - product.publicPrice.from / 10);
  if (prixer !== art.prixerUsername && prixer !== art.owner) {
    price = base / (1 - art.comission / 100);
  } else {
    price = base;
  }
  let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
  if (typeof product.discount === "string") {
    if (dis?.type === "Porcentaje") {
      price = Number(price - (price / 100) * dis?.value);
    } else if (dis?.type === "Monto") {
      price = Number(price - dis?.value);
    }
  }

  // Incluir recargo si es a PrixelartPrefit
  if (currency) {
    price = price * dollarValue;
  }
  return price.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getComission = (
  item,
  art,
  currency,
  dollarValue,
  discountList,
  quantity,
  prixer,
  surchargeList,
  org,
  consumerType
) => {
  let { unit, total } = 0;
  if (org !== undefined) {
    unit = UnitPriceForOrg(item, art, prixer, org, consumerType);
    const applied = org?.agreement.appliedProducts.find(
      (el) => el.id === item._id
    );
    const varApplied = applied.variants.find((v) => v.name === item.selection);
    // evaluar el tipo de consumidor y aplicar si es necesario un ajuste
    let percentage =
      item.selection !== undefined && typeof item.selection === "string"
        ? varApplied.cporg
        : applied.cporg;
    total = (unit / 100) * percentage;
  } else {
    unit = Number(
      UnitPrice(
        item,
        art,
        currency,
        dollarValue,
        discountList,
        prixer,
        consumerType
      ).replace(/[,]/gi, ".")
    );
    total = (unit / 100) * art.comission * quantity;
  }
  let surcharge;
  if (surchargeList && surchargeList?.length > 0) {
    surchargeList.map((sur) => {
      if (
        sur.appliedUsers.includes(art.prixerUsername) ||
        sur.appliedUsers.includes(art.owner)
      ) {
        if (sur.type === "Porcentaje") {
          surcharge = total - (total / 100) * sur.value;
          total = surcharge;
        } else if (sur.type === "Monto") {
          total = total - sur.value;
        }
      }
    });
  }

  if (prixer !== art.prixerUsername && prixer !== art.owner) {
    return total;
  } else {
    return 0;
  }
};

const getPVPtext = (product, currency, dollarValue, discountList) => {
  if (
    typeof product.discount === "string" &&
    product.publicEquation !== "" &&
    currency
  ) {
    let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
    return (
      <>
        <del>
          PVP: Bs
          {Number(product.publicEquation * dollarValue).toLocaleString(
            "de-DE",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </del>
        <div
          style={{
            backgroundColor: "#d33f49",
            padding: 3,
            width: 180,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            borderRadius: 8,
          }}
        >
          Descuento de {dis?.type === "Porcentaje" && "%" + dis?.value}
          {dis?.type === "Monto" &&
            Number(dis?.value * dollarValue).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
            })}
        </div>
        {dis?.type === "Porcentaje" && (
          <div>
            PVP: Bs
            {Number(
              (product.publicEquation -
                (product.publicEquation / 100) * dis?.value) *
                dollarValue
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
        {dis?.type === "Monto" && (
          <div>
            PVP: Bs
            {Number(
              (product.publicEquation - dis?.value) * dollarValue
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </>
    );
  } else if (
    typeof product.discount === "string" &&
    product.publicEquation !== ""
  ) {
    let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
    return (
      <>
        <del>
          PVP: $
          {product.publicEquation.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </del>
        <div
          style={{
            backgroundColor: "#d33f49",
            padding: 3,
            width: 180,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            borderRadius: 8,
          }}
        >
          Descuento de {dis?.type === "Porcentaje" && "%" + dis?.value}
          {dis?.type === "Monto" && Number(dis?.value)}
        </div>
        {dis?.type === "Porcentaje" && (
          <div>
            PVP: $
            {Number(
              product.publicEquation -
                (product.publicEquation / 100) * dis?.value
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
        {dis?.type === "Monto" && (
          <div>
            PVP: $
            {Number(product.publicEquation - dis?.value).toLocaleString(
              "de-DE",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </div>
        )}
      </>
    );
  } else if (
    typeof product.discount === "string" &&
    typeof product.publicPrice.to === "string" &&
    product.publicPrice.to.length > 0 &&
    currency
  ) {
    let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
    return (
      <>
        <del>
          PVP: Bs
          {Number(product.publicPrice.from * dollarValue).toLocaleString(
            "de-DE",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          ) +
            " - " +
            Number(product.publicPrice?.to * dollarValue).toLocaleString(
              "de-DE",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
        </del>

        <div
          style={{
            backgroundColor: "#d33f49",
            padding: 3,
            width: 180,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            borderRadius: 8,
          }}
        >
          Descuento de {dis?.type === "Porcentaje" && "%" + dis?.value}
          {dis?.type === "Monto" &&
            Number(dis?.value * dollarValue).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
            })}
        </div>

        {dis?.type === "Porcentaje" && (
          <div>
            PVP: Bs
            {Number(
              (product.publicPrice.from -
                (product.publicPrice.from / 100) * dis?.value) *
                dollarValue
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
              " - " +
              Number(
                (product.publicPrice.to -
                  (product.publicPrice.to / 100) * dis?.value) *
                  dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        )}
        {dis?.type === "Monto" && (
          <div>
            PVP: $
            {Number(
              (product.publicPrice.from - dis?.value) * dollarValue
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
              " - " +
              Number(
                (product.publicPrice?.to - dis?.value) * dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        )}
      </>
    );
  } else if (
    typeof product.discount === "string" &&
    typeof product.publicPrice.to === "string" &&
    product.publicPrice.to.length > 0
  ) {
    let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
    return (
      <>
        <del>
          PVP: $
          {Number(product.publicPrice.from).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) +
            " - " +
            Number(product.publicPrice?.to).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </del>

        <div
          style={{
            backgroundColor: "#d33f49",
            padding: 3,
            width: 180,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            borderRadius: 8,
          }}
        >
          Descuento de {dis?.type === "Porcentaje" && "%" + dis?.value}
          {dis?.type === "Monto" && dis?.value}
        </div>

        {dis?.type === "Porcentaje" && (
          <div>
            PVP: $
            {Number(
              product.publicPrice.from -
                (product.publicPrice.from / 100) * dis?.value
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
              " - " +
              Number(
                product.publicPrice?.to -
                  (product.publicPrice?.to / 100) * dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        )}
        {dis?.type === "Monto" && (
          <div>
            PVP: $
            {Number(product.publicPrice.from - dis?.value).toLocaleString(
              "de-DE",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            ) +
              " - " +
              Number(product.publicPrice?.to - dis?.value).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
          </div>
        )}
      </>
    );
  } else if (typeof product.discount === "string" && currency) {
    let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
    return (
      <>
        <del>
          PVP: Bs
          {Number(product.publicPrice.from * dollarValue).toLocaleString(
            "de-DE",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </del>

        <div
          style={{
            backgroundColor: "#d33f49",
            padding: 3,
            width: 180,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            borderRadius: 8,
          }}
        >
          Descuento de {dis?.type === "Porcentaje" && "%" + dis?.value}
          {dis?.type === "Monto" &&
            Number(dis?.value * dollarValue).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </div>

        {dis?.type === "Porcentaje" && (
          <div>
            PVP: Bs
            {Number(
              (product.publicPrice.from -
                (product.publicPrice.from / 100) * dis?.value) *
                dollarValue
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
        {dis?.type === "Monto" && (
          <div>
            PVP: $
            {Number(
              (product.publicPrice.from - dis?.value) * dollarValue
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </>
    );
  } else if (typeof product.discount === "string") {
    let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
    return (
      <>
        <del>
          PVP: $
          {Number(product.publicPrice.from).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </del>

        <div
          style={{
            backgroundColor: "#d33f49",
            padding: 3,
            width: 180,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            borderRadius: 8,
          }}
        >
          Descuento de {dis?.type === "Porcentaje" && "%" + dis?.value}
          {dis?.type === "Monto" && dis?.value}
        </div>

        {dis?.type === "Porcentaje" && (
          <div>
            PVP: $
            {Number(
              product.publicPrice.from -
                (product.publicPrice.from / 100) * dis?.value
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
        {dis?.type === "Monto" && (
          <div>
            PVP: $
            {Number(product.publicPrice.from - dis?.value).toLocaleString(
              "de-DE",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </div>
        )}
      </>
    );
  } else if (product.publicEquation !== "" && currency) {
    return (
      "PVP: Bs" +
      Number(product.publicEquation * dollarValue).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (product.publicEquation !== "") {
    return (
      "PVP: $" +
      Number(product.publicEquation).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (
    product.attributes.length > 0 &&
    product.publicPrice.to !== product.publicPrice.from &&
    typeof product.publicPrice.to === "string" &&
    product.publicPrice.to.length > 0 &&
    currency
  ) {
    return (
      "PVP: Bs" +
      Number(product.publicPrice.from * dollarValue).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      " - " +
      Number(product.publicPrice?.to * dollarValue).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (
    product.attributes.length > 0 &&
    product.publicPrice.to !== product.publicPrice.from &&
    typeof product.publicPrice.to === "string" &&
    product.publicPrice.to.length > 0
  ) {
    return (
      "PVP: $" +
      Number(product.publicPrice.from).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      " - " +
      Number(product.publicPrice?.to)?.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (currency) {
    return (
      "PVP: Bs" +
      Number(product.publicPrice.from * dollarValue).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else {
    return (
      "PVP: $" +
      Number(product.publicPrice.from).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
};

const getPVMtext = (product, currency, dollarValue, discountList) => {
  if (product.prixerEquation !== "" && currency) {
    return (
      "PVM: Bs" +
      (product.prixerEquation * dollarValue).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  if (product.prixerEquation !== "") {
    return (
      "PVM: $" +
      product.prixerEquation.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (
    product.attributes.length > 0 &&
    product.prixerPrice.to !== product.prixerPrice.from &&
    typeof product.prixerPrice.to === "string" &&
    product.prixerPrice.to.length > 0 &&
    currency
  ) {
    return (
      "PVM: Bs" +
      (Number(product.prixerPrice.from) * dollarValue).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      " - " +
      Number(product.prixerPrice?.to * dollarValue).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (
    product.attributes.length > 0 &&
    product.prixerPrice.to !== product.prixerPrice.from &&
    typeof product.prixerPrice.to === "string" &&
    product.prixerPrice.to.length > 0
  ) {
    return (
      "PVM: $" +
      Number(product.prixerPrice.from).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      " - " +
      Number(product.prixerPrice?.to).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (currency) {
    {
      return (
        "PVM: Bs" +
        Number(product?.prixerPrice?.from * dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    }
  } else {
    return (
      "PVM: $" +
      Number(product?.prixerPrice?.from).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
};

const getPVP = (item, currency, dollarValue, discountList) => {
  let { base, prev, final } = 0;
  let dis = discountList?.filter((dis) => dis._id === item.product.discount)[0];

  base = Number(
    item.product?.publicEquation?.replace(/[,]/gi, ".") ||
      item.product?.publicPrice?.from?.replace(/[,]/gi, ".")
  );

  prev = base - base / 10;

  prev =
    prev /
    (1 - (item.art?.comission !== undefined ? item.art.comission : 10) / 100);
  final = prev;

  if (typeof item.product.discount === "string") {
    if (dis?.type === "Porcentaje") {
      final = prev - (base / 100) * dis.value;
    } else if (dis?.type === "Monto") {
      final = prev - dis.value;
    }
  }
  if (currency) {
    return Number(final * dollarValue);
  } else return final;
};

const getPVM = (item, currency, dollarValue, discountList, prixer) => {
  let { base, prev, final } = 0;
  let dis = discountList?.filter((dis) => dis._id === item.product.discount)[0];

  base = Number(
    item.product?.prixerEquation?.replace(/[,]/gi, ".") ||
      item.product?.prixerPrice?.from?.replace(/[,]/gi, ".")
  );
  prev = base - base / 10;
  if (item.art.prixerUsername !== prixer && item.art.owner !== prixer) {
    prev =
      prev /
      (1 - (item.art?.comission !== undefined ? item.art.comission : 10) / 100);
  }
  final = prev;
  // if (typeof item.product.discount === "string") {
  //   if (dis?.type === "Porcentaje") {
  //     final = prev - (base / 100) * dis.value;
  //   } else if (dis?.type === "Monto") {
  //     final = prev - dis.value;
  //   }
  // }
  if (currency) {
    return final * dollarValue;
  } else return final;
};

const getTotalUnitsPVP = (state, currency, dollarValue, discountList) => {
  let prices = [0];
  state.map((item) => {
    if (item.product && item.art && typeof item.product.discount === "string") {
      let dis = discountList?.find(({ _id }) => _id === item.product.discount);
      if (dis?.type === "Porcentaje") {
        const base = Number(
          item.product?.publicEquation?.replace(/[,]/gi, ".") ||
            item.product?.publicPrice?.from?.replace(/[,]/gi, ".")
        );
        let prev = base - base / 10;
        prev = prev / (1 - item.art.comission / 100);

        let final = prev - (base / 100) * dis.value;
        if (item.product.finalPrice !== undefined) {
          final = item.product.finalPrice;
        }
        prices.push(Number(final) * (item.quantity || 1));
      } else if (dis?.type === "Monto") {
        const base = Number(
          item.product?.publicEquation?.replace(/[,]/gi, ".") ||
            item.product?.publicPrice?.from?.replace(/[,]/gi, ".")
        );
        let prev = base - base / 10;
        prev = prev / (1 - item.art.comission / 100);

        let final = prev - dis.value;
        if (item.product.finalPrice !== undefined) {
          final = item.product.finalPrice;
        }
        prices.push(final * (item.quantity || 1));
      }
    } else if (item.product && item.art) {
      const base = Number(
        item.product?.publicEquation
          ? item.product?.publicEquation?.replace(/[,]/gi, ".")
          : item.product?.publicPrice?.from.replace(/[,]/gi, ".")
      );
      let final = base - base / 10;
      final = final / (1 - item.art.comission / 100);
      if (
        item.product.finalPrice !== undefined &&
        item.product.finalPrice !== null
      ) {
        final = item.product.finalPrice;
      }
      prices.push(final * (item.quantity || 1));
    }
  });
  let total = prices?.reduce(function (a, b) {
    return a + b;
  });
  if (currency) {
    return total * dollarValue;
  } else return total;
};
const getTotalUnitsPVM = (
  state,
  currency,
  dollarValue,
  discountList,
  prixer
) => {
  let prices = [];
  state.map((item) => {
    // if (item.product && item.art && typeof item.product.discount === "string") {
    //   let dis = discountList?.filter(
    //     (dis) => dis._id === item.product.discount
    //   )[0];
    //   if (dis?.type === "Porcentaje") {
    //     const base = Number(
    //       item.product?.prixerEquation?.replace(/[,]/gi, ".") ||
    //         item.product?.prixerPrice?.from?.replace(/[,]/gi, ".")
    //     );
    //     let prev = base - base / 10;
    //     prev = prev / (1 - item.art.comission / 100);

    //     let final = prev - (base / 100) * dis.value;

    //     prices.push(final * (item.quantity || 1));
    //   } else if (dis?.type === "Monto") {
    //     const base = Number(
    //       item.product?.prixerEquation?.replace(/[,]/gi, ".") ||
    //         item.product?.prixerPrice?.from?.replace(/[,]/gi, ".")
    //     );

    //     let prev = base - base / 10;
    //     prev = prev / (1 - item.art.comission / 100);

    //     let final = prev - dis.value;

    //     prices.push(final * (item.quantity || 1));
    //   }
    // } else
    if (item.product && item.art) {
      const base = Number(
        item.product?.prixerEquation
          ? item.product?.prixerEquation?.replace(/[,]/gi, ".")
          : item.product?.prixerPrice?.from?.replace(/[,]/gi, ".")
      );
      let final = (base - base / 10) / (1 - item.art.comission / 100);
      if (
        item.product.finalPrice !== undefined
        // &&
        // item.product.modifyPrice === true
      ) {
        final = item.product.finalPrice;
      } else if (
        item.art.prixerUsername !== prixer &&
        item.art.owner !== prixer
      ) {
        final = final / (1 - item.art.comission / 100);
      }
      prices.push(final * (item.quantity || 1));
    }
  });
  let total = prices?.reduce(function (a, b) {
    return a + b;
  });
  if (currency) {
    return total * dollarValue;
  } else return total;
};

export {
  UnitPrice,
  UnitPriceSug,
  getComission,
  getPVPtext,
  getPVMtext,
  getPVP,
  getPVM,
  getTotalUnitsPVP,
  getTotalUnitsPVM,
};
