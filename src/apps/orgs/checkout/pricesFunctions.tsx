

import React from 'react';

export interface Price {
  from: number | string;
  to?: number | string;
}

export interface PrixerAttribute {
  name: string;
  values: string[];
}

export interface Product {
  _id?: string;
  modifyPrice?: boolean;
  finalPrice?: number;
  prixerEquation?: string | number;
  prixerPrice?: Price;
  publicEquation?: string | number;
  publicPrice: Price;
  discount?: string;
  attributes?: PrixerAttribute[];
  selection?: string;
}

export interface Art {
  prixerUsername: string;
  owner: string;
  comission: number;
}

export interface Discount {
  _id: string;
  type: 'Porcentaje' | 'Monto';
  value: number;
}

export interface OrgAgreementProductVariant {
  name: string;
  cporg: number;
}

export interface OrgAgreementProduct {
  id: string;
  cporg: number;
  variants?: OrgAgreementProductVariant[];
}

export interface OrgAgreement {
  base: 'pvprixer' | 'pvm' | 'pvp';
  appliedProducts: OrgAgreementProduct[];
  considerations: { [key: string]: number };
}

export interface Organization {
  agreement: OrgAgreement;
}

export interface Surcharge {
  appliedUsers: string[];
  type: 'Porcentaje' | 'Monto';
  value: number;
}

export interface Item {
  product: Product;
  art: Art;
  quantity?: number;
}

const UnitPrice = (
  product: Product,
  art: Art,
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[],
  prixer?: string
): string => {
  let base = 0;
  let final = 0;

  if (product.modifyPrice) {
    final = product.finalPrice ?? 0;
  } else if (prixer !== undefined) {
    if (product.prixerEquation) {
      final = Number(product.prixerEquation);
    } else if (product.prixerPrice) {
      final = Number(product.prixerPrice.from);
    }

    if (art.prixerUsername !== prixer && art.owner !== prixer) {
      final = (final - final / 10) / (1 - art.comission / 100);
    }
  } else {
    if (product.publicEquation) {
      base = Number(product.publicEquation);
    } else {
      base = Number(product.publicPrice.from);
    }
    final = base - base / 10;
    final = final / (1 - art.comission / 100);
  }

  if (
    prixer === undefined &&
    typeof product.discount === 'string' &&
    (product.modifyPrice === false || product.modifyPrice === undefined)
  ) {
    const dis = discountList?.find((d) => d._id === product.discount);
    if (dis?.type === 'Porcentaje') {
      final = final - (final / 100) * dis.value;
    } else if (dis?.type === 'Monto') {
      final = final - dis.value;
    }
  }

  if (product.finalPrice !== undefined) {
    final = product.finalPrice;
  }
  if (currency) {
    final = final * dollarValue;
  }
  return final.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const UnitPriceSug = (
  product: Product,
  art: Art,
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[],
  prixer?: string,
  org?: Organization,
  consumerType?: string
): string => {
  let price = 0;
  let base = 0;
  const dis = discountList?.find((d) => d._id === product.discount);

  if (product.publicEquation === 0) {
    price = 0;
    return price.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    if (org !== undefined) {
      price = UnitPriceForOrg(product, art, prixer, org, consumerType);
    } else {
      const prxEq =
        typeof product.prixerEquation === 'number'
          ? product.prixerEquation
          : Number(String(product.prixerEquation || '').replace(/[,]/gi, '.'));
      const prxFr =
        typeof product.prixerPrice?.from === 'number'
          ? product.prixerPrice.from
          : Number(String(product.prixerPrice?.from || '').replace(/[,]/gi, '.'));
      const pubEq =
        typeof product.publicEquation === 'number'
          ? product.publicEquation
          : Number(String(product.publicEquation || '').replace(/[,]/gi, '.'));
      const pubFr =
        typeof product.publicPrice.from === 'number'
          ? product.publicPrice.from
          : Number(String(product.publicPrice.from || '').replace(/[,]/gi, '.'));

      if (typeof product.selection === 'string' && prixer !== undefined) {
        base = pubEq ? prxEq - prxEq / 10 : prxFr - prxFr / 10;
      } else if (typeof product.selection === 'string') {
        base = pubEq ? pubEq - pubEq / 10 : pubFr - pubFr / 10;
      } else if (prixer !== undefined) {
        base = prxEq ? prxEq - prxEq / 10 : prxFr - prxFr / 10;
      } else {
        base = pubEq ? pubEq - pubEq / 10 : pubFr - pubFr / 10;
      }
      if (prixer !== undefined && prixer !== art.prixerUsername && prixer !== art.owner) {
        price = base / (1 - art.comission / 100);
      } else if (prixer === art.prixerUsername || prixer === art.owner) {
        price = base;
      }

      if (prixer === undefined && typeof product.discount === 'string') {
        if (dis?.type === 'Porcentaje') {
          price = Number(price - (price / 100) * dis.value);
        } else if (dis?.type === 'Monto') {
          price = Number(price - dis.value);
        }
      } else if (prixer === undefined) {
        price = base / (1 - art.comission / 100);
      }
    }
    // Apply currency conversion if needed
    if (currency) {
      price = price * (dollarValue || 1);
    }
    return price.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};

const UnitPriceForOrg = (
  product: Product,
  art: Art,
  prixer: string | undefined,
  org: Organization,
  consumerType?: string
): number => {
  let base = 0;
  let price = 0;
  if (org && org.agreement.base === 'pvprixer') {
    base =
      product.prixerEquation !== '' && product.prixerEquation !== undefined
        ? Number(String(product.prixerEquation).replace(/[,]/gi, '.')) -
        Number(String(product.prixerEquation).replace(/[,]/gi, '.')) / 10
        : Number(String(product.prixerPrice?.from).replace(/[,]/gi, '.')) -
        Number(String(product.prixerPrice?.from).replace(/[,]/gi, '.')) / 10;
  } else if (org && org.agreement.base === 'pvm') {
    base =
      product.prixerEquation !== '' && product.prixerEquation !== undefined
        ? Number(String(product.prixerEquation).replace(/[,]/gi, '.'))
        : Number(String(product.prixerPrice?.from).replace(/[,]/gi, '.'));
  } else if (org && org.agreement.base === 'pvp') {
    base =
      product.publicEquation !== '' && product.publicEquation !== undefined
        ? Number(String(product.publicEquation).replace(/[,]/gi, '.'))
        : Number(String(product.publicPrice.from).replace(/[,]/gi, '.'));
  }
  // Note: product._id is used here so ensure it exists on Product if needed.
  const applied = org.agreement.appliedProducts.find((el) => el.id === product._id);
  const varApplied = applied?.variants?.find((v) =>
    product.selection ? v.name.includes(product.selection) : false
  );
  let percentage =
    product.selection !== undefined && typeof product.selection === 'string'
      ? varApplied?.cporg ?? 0
      : applied?.cporg ?? 0;

  const consumerVar = consumerType?.toLowerCase();
  for (const p in org.agreement.considerations) {
    const prop = p.toLowerCase();
    if (consumerVar && consumerVar.includes(prop)) {
      const c = (percentage / 100) * org.agreement.considerations[p];
      percentage = percentage - c;
    }
  }
  price = base / (1 - Number(percentage) / 100);
  return price;
};

const getVariantPrice = (
  product: Product,
  art: Art,
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[],
  prixer?: string
): string => {
  let price = 0;
  let base = 0;

  base = product.publicEquation
    ? Number(product.publicEquation) - Number(product.publicEquation) / 10
    : Number(product.publicPrice.from) - Number(product.publicPrice.from) / 10;
  if (prixer !== art.prixerUsername && prixer !== art.owner) {
    price = base / (1 - art.comission / 100);
  } else {
    price = base;
  }
  const dis = discountList?.find((d) => d._id === product.discount);
  if (typeof product.discount === 'string') {
    if (dis?.type === 'Porcentaje') {
      price = Number(price - (price / 100) * dis.value);
    } else if (dis?.type === 'Monto') {
      price = Number(price - dis.value);
    }
  }

  // Incluir recargo si es a PrixelartPrefit
  if (currency) {
    price = price * dollarValue;
  }
  return price.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getComission = (
  item: Item,
  art: Art,
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[],
  quantity: number = 1,
  prixer?: string,
  surchargeList?: Surcharge[],
  org?: Organization,
  consumerType?: string
): number => {
  // parameters:
  // producto
  // arte
  // moneda
  // valor de la moneda
  // listado de descuentos
  // cantidad del item
  // es el cliente Prixer?
  // listado de recargos
  // el propietario es una organización?
  // tipo de cliente

  let unit = 0;
  let total = 0;
  if (org !== undefined) {
    unit = UnitPriceForOrg(item.product, art, prixer, org, consumerType);
    const applied = org.agreement.appliedProducts.find((el) => el.id === item.product._id);
    const varApplied = applied?.variants?.find((v) => v.name === item.product.selection);
    let percentage =
      item.product.selection !== undefined && typeof item.product.selection === 'string'
        ? varApplied?.cporg ?? 0
        : applied?.cporg ?? 10;
    total = (unit / 100) * percentage;

    if (consumerType && consumerType !== 'Particular') {
      const consumer = consumerType.toLowerCase();
      for (const p in org.agreement.considerations) {
        const prop = p.toLowerCase();
        if (consumer.includes(prop)) {
          const c = (percentage / 100) * org.agreement.considerations[p];
          total = percentage - c;
        }
      }
    }
  } else {
    unit = Number(
      UnitPrice(item.product, art, currency, dollarValue, discountList, prixer).replace(/[,]/gi, '.')
    );
    total = (unit / 100) * art.comission * quantity;
  }
  if (surchargeList && surchargeList.length > 0) {
    surchargeList.forEach((sur) => {
      if (sur.appliedUsers.includes(art.prixerUsername) || sur.appliedUsers.includes(art.owner)) {
        if (sur.type === 'Porcentaje') {
          total = total - (total / 100) * sur.value;
        } else if (sur.type === 'Monto') {
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

const getComissionv2 = (
  product: Product,
  art: Art,
  currency: boolean,
  dollarValue: number,
  consumerType: string,
  prixer: string | undefined,
  org?: Organization,
  surchargeList?: Surcharge[]
): number => {
  let total = 0;
  const unit = product.finalPrice ?? 0;

  if (org !== undefined) {
    const applied = org.agreement.appliedProducts.find((el) => el.id === product._id);
    const varApplied = applied?.variants?.find((v) => v.name === product.selection);
    let percentage =
      product.selection !== undefined && typeof product.selection === 'string'
        ? varApplied?.cporg ?? 0
        : applied?.cporg ?? 10;
    total = (unit / 100) * percentage;

    if (consumerType && consumerType !== 'Particular') {
      const consumer = consumerType.toLowerCase();
      for (const p in org.agreement.considerations) {
        const prop = p.toLowerCase();
        if (consumer.includes(prop)) {
          const c = (percentage / 100) * org.agreement.considerations[p];
          total = percentage - c;
        }
      }
    }
  } else {
    total = Number((unit / 100) * art.comission);
  }

  if (surchargeList && surchargeList.length > 0) {
    surchargeList.forEach((sur) => {
      if (sur.appliedUsers.includes(art.prixerUsername) || sur.appliedUsers.includes(art.owner)) {
        if (sur.type === 'Porcentaje') {
          total = total - (total / 100) * sur.value;
        } else if (sur.type === 'Monto') {
          total = total - sur.value;
        }
      }
    });
  }

  if (prixer !== undefined && prixer !== art.prixerUsername && prixer !== art.owner) {
    return 0;
  } else {
    return currency ? total * dollarValue : total;
  }
};

const getPVPtext = (
  product: Product,
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[]
): JSX.Element | string => {
  const dollar =
    typeof dollarValue === 'string'
      ? Number(String(dollarValue).replace(/[,]/gi, '.'))
      : dollarValue;
  const pubEq =
    typeof product.publicEquation === 'string'
      ? Number(product.publicEquation.replace(/[,]/gi, '.'))
      : (product.publicEquation as number);
  const pubFr =
    typeof product.publicPrice.from === 'number'
      ? product.publicPrice.from
      : Number(String(product.publicPrice.from).replace(/[,]/gi, '.'));
  let pubTo: number = pubFr;
  if (product.publicPrice.to !== null && product.publicPrice.to !== undefined) {
    pubTo =
      typeof product.publicPrice.to === 'number'
        ? product.publicPrice.to
        : Number(String(product.publicPrice.to).replace(/[,]/gi, '.'));
  }

  if (
    product.discount !== undefined &&
    typeof product.discount === 'string' &&
    product.publicEquation !== undefined &&
    product.publicEquation !== '' &&
    currency
  ) {
    const dis = discountList?.find((d) => d._id === product.discount);
    return (
      <>
        <del>
          PVP: Bs
          {Number(pubEq * dollar).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </del>
        <div
          style={{
            backgroundColor: '#d33f49',
            padding: 3,
            width: 180,
            textAlign: 'center',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 8,
          }}
        >
          Descuento de{' '}
          {dis?.type === 'Porcentaje'
            ? '%' + dis.value
            : dis?.type === 'Monto'
              ? Number(dis.value * dollar).toLocaleString('de-DE', { minimumFractionDigits: 2 })
              : ''}
        </div>
        {dis?.type === 'Porcentaje' && (
          <div>
            PVP: Bs
            {Number((pubEq - (pubEq / 100) * dis.value) * dollar).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
        {dis?.type === 'Monto' && (
          <div>
            PVP: Bs
            {Number((pubEq - dis.value) * dollar).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </>
    );
  } else if (
    product.discount !== undefined &&
    typeof product.discount === 'string' &&
    product.publicEquation !== undefined
  ) {
    const dis = discountList?.find((d) => d._id === product.discount);
    return (
      <>
        <del>
          PVP: ${pubEq.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </del>
        <div
          style={{
            backgroundColor: '#d33f49',
            padding: 3,
            width: 180,
            textAlign: 'center',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 8,
          }}
        >
          Descuento de{' '}
          {dis?.type === 'Porcentaje'
            ? '%' + dis.value
            : dis?.type === 'Monto'
              ? dis.value
              : ''}
        </div>
        {dis?.type === 'Porcentaje' && (
          <div>
            PVP: ${Number(pubEq - (pubEq / 100) * dis.value).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
        {dis?.type === 'Monto' && (
          <div>
            PVP: ${Number(pubEq - dis.value).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </>
    );
  } else if (
    product.discount !== undefined &&
    typeof product.discount === 'string' &&
    typeof product.publicPrice.to === 'string' &&
    product.publicPrice.to.length > 0 &&
    currency
  ) {
    const dis = discountList?.find((d) => d._id === product.discount);
    return (
      <>
        <del>
          PVP: Bs
          {Number(pubFr * dollar).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) +
            ' - ' +
            Number(pubTo * dollar).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </del>
        <div
          style={{
            backgroundColor: '#d33f49',
            padding: 3,
            width: 180,
            textAlign: 'center',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 8,
          }}
        >
          Descuento de{' '}
          {dis?.type === 'Porcentaje'
            ? '%' + dis.value
            : dis?.type === 'Monto'
              ? Number(dis.value * dollar).toLocaleString('de-DE', { minimumFractionDigits: 2 })
              : ''}
        </div>
        {dis?.type === 'Porcentaje' && (
          <div>
            PVP: Bs
            {Number((pubFr - (pubFr / 100) * dis.value) * dollar).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
              ' - ' +
              Number((pubTo - (pubTo / 100) * dis.value) * dollar).toLocaleString('de-DE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        )}
        {dis?.type === 'Monto' && (
          <div>
            PVP: ${Number((pubFr - dis.value) * dollar).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
              ' - ' +
              Number((pubTo - dis.value) * dollar).toLocaleString('de-DE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        )}
      </>
    );
  } else if (
    product.discount !== undefined &&
    typeof product.discount === 'string' &&
    typeof product.publicPrice.to !== 'undefined'
  ) {
    const dis = discountList?.find((d) => d._id === product.discount);
    return (
      <>
        <del>
          PVP: ${Number(pubFr).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) +
            ' - ' +
            Number(pubTo).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </del>
        <div
          style={{
            backgroundColor: '#d33f49',
            padding: 3,
            width: 180,
            textAlign: 'center',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 8,
          }}
        >
          Descuento de{' '}
          {dis?.type === 'Porcentaje'
            ? '%' + dis.value
            : dis?.type === 'Monto'
              ? dis.value
              : ''}
        </div>
        {dis?.type === 'Porcentaje' && (
          <div>
            PVP: ${Number(pubFr - (pubFr / 100) * dis.value).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
              ' - ' +
              Number(pubTo - (pubTo / 100) * dis.value).toLocaleString('de-DE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        )}
        {dis?.type === 'Monto' && (
          <div>
            PVP: ${Number(pubFr - dis.value).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
              ' - ' +
              Number(pubTo - dis.value).toLocaleString('de-DE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        )}
      </>
    );
  } else if (product.discount !== undefined && typeof product.discount === 'string' && currency) {
    const dis = discountList?.find((d) => d._id === product.discount);
    return (
      <>
        <del>
          PVP: Bs
          {Number(pubFr * dollar).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </del>
        <div
          style={{
            backgroundColor: '#d33f49',
            padding: 3,
            width: 180,
            textAlign: 'center',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 8,
          }}
        >
          Descuento de{' '}
          {dis?.type === 'Porcentaje'
            ? '%' + dis.value
            : dis?.type === 'Monto'
              ? Number(dis.value * dollar).toLocaleString('de-DE', { minimumFractionDigits: 2 })
              : ''}
        </div>
        {dis?.type === 'Porcentaje' && (
          <div>
            PVP: Bs
            {Number((pubFr - (pubFr / 100) * dis.value) * dollar).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
        {dis?.type === 'Monto' && (
          <div>
            PVP: ${Number((pubFr - dis.value) * dollar).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </>
    );
  } else if (product.discount !== undefined && typeof product.discount === 'string') {
    const dis = discountList?.find((d) => d._id === product.discount);
    return (
      <>
        <del>
          PVP: ${Number(pubFr).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </del>
        <div
          style={{
            backgroundColor: '#d33f49',
            padding: 3,
            width: 180,
            textAlign: 'center',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 8,
          }}
        >
          Descuento de{' '}
          {dis?.type === 'Porcentaje'
            ? '%' + dis.value
            : dis?.type === 'Monto'
              ? dis.value
              : ''}
        </div>
        {dis?.type === 'Porcentaje' && (
          <div>
            PVP: ${Number(pubFr - (pubFr / 100) * dis.value).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
        {dis?.type === 'Monto' && (
          <div>
            PVP: ${Number(pubFr - dis.value).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </>
    );
  } else if (product.publicEquation !== '' && currency) {
    return (
      'PVP: Bs' +
      Number(pubEq * dollar).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (product.publicEquation !== undefined && product.publicEquation !== '') {
    return (
      'PVP: $' +
      pubEq.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (
    product.attributes &&
    product.attributes.length > 0 &&
    product.publicPrice.to !== product.publicPrice.from &&
    currency
  ) {
    return (
      'PVP: Bs' +
      Number(pubFr * dollar).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      ' - ' +
      Number(pubTo * dollar).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (
    product.attributes &&
    product.attributes.length > 0 &&
    product.publicPrice.to !== product.publicPrice.from
  ) {
    return (
      'PVP: $' +
      Number(pubFr).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      ' - ' +
      Number(pubTo).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (currency) {
    return (
      'PVP: Bs' +
      Number(pubFr * dollar).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else {
    return (
      'PVP: $' +
      Number(pubFr).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
};

const getPVMtext = (
  product: Product,
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[]
): JSX.Element | string => {
  const dollar =
    typeof dollarValue === 'string'
      ? Number(String(dollarValue).replace(/[,]/gi, '.'))
      : dollarValue;
  const prxEq =
    typeof product.prixerEquation === 'string'
      ? Number(product.prixerEquation.replace(/[,]/gi, '.'))
      : (product.prixerEquation as number);
  const prxFr =
    typeof product.prixerPrice?.from === 'number'
      ? product.prixerPrice.from
      : Number(String(product.prixerPrice?.from).replace(/[,]/gi, '.'));
  let prxTo: number = prxFr;
  if (product.prixerPrice?.to !== null && product.prixerPrice?.to !== undefined) {
    prxTo =
      typeof product.prixerPrice.to === 'number'
        ? product.prixerPrice.to
        : Number(String(product.prixerPrice.to).replace(/[,]/gi, '.'));
  }

  if (product.prixerEquation !== '' && currency) {
    return (
      'PVM: Bs' +
      (prxEq * dollar).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  if (product.prixerEquation !== undefined && product.prixerEquation !== '') {
    return (
      'PVM: $' +
      prxEq.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (
    product.attributes &&
    product.attributes.length > 0 &&
    product.prixerPrice?.to !== product.prixerPrice?.from &&
    currency
  ) {
    return (
      'PVM: Bs' +
      (Number(prxFr) * dollar).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      ' - ' +
      Number(
        ((typeof product.prixerPrice?.to === 'string'
          ? Number(product.prixerPrice.to.replace(/[,]/gi, '.'))
          : product.prixerPrice?.to) ?? prxFr) * dollar
      ).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (product.attributes && product.attributes.length > 0 && product.prixerPrice?.to !== product.prixerPrice?.from) {
    return (
      'PVM: $' +
      Number(prxFr).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      ' - ' +
      Number(prxTo).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else if (currency) {
    return (
      'PVM: Bs' +
      Number(prxFr * dollar).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } else {
    return (
      'PVM: $' +
      Number(prxFr).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
};

const getPVP = (
  item: Item,
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[]
): number => {
  let base = 0,
    prev = 0,
    final = 0;
  const dis = discountList?.find((d) => d._id === item.product.discount);
  const pubEq =
    typeof item.product.publicEquation === 'number'
      ? item.product.publicEquation
      : Number(String(item.product.publicEquation).replace(/[,]/gi, '.'));
  const pubFr =
    typeof item.product.publicPrice.from === 'number'
      ? item.product.publicPrice.from
      : Number(String(item.product.publicPrice.from).replace(/[,]/gi, '.'));

  base = pubEq || pubFr;
  prev = base - base / 10;

  if (base !== 0) {
    prev = prev / (1 - ((item.art?.comission !== undefined ? item.art.comission : 10) / 100));
    final = prev;

    if (typeof item.product.discount === 'string') {
      if (dis?.type === 'Porcentaje') {
        final = prev - (base / 100) * dis.value;
      } else if (dis?.type === 'Monto') {
        final = prev - dis.value;
      }
    }
  }
  return currency ? Number(final * dollarValue) : final;
};

const getPVM = (
  item: Item,
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[],
  prixer?: string
): number => {
  let base = 0,
    prev = 0,
    final = 0;
  const dis = discountList?.find((d) => d._id === item.product.discount);
  const prxEq =
    typeof item.product.prixerEquation === 'number'
      ? item.product.prixerEquation
      : Number(String(item.product.prixerEquation).replace(/[,]/gi, '.'));
  const prxFr =
    typeof item.product.prixerPrice?.from === 'number'
      ? item.product.prixerPrice.from
      : Number(String(item.product.prixerPrice?.from || '0').replace(/[,]/gi, '.'));

  base = prxEq || prxFr;
  prev = base - base / 10;
  if (item.art !== undefined && item.art.prixerUsername !== prixer && item.art.owner !== prixer) {
    prev = prev / (1 - (item.art?.comission !== undefined ? item.art.comission : 10) / 100);
  }
  final = prev;
  // if (typeof item.product.discount === "string") {
  //   if (dis?.type === "Porcentaje") {
  //     final = prev - (base / 100) * dis.value;
  //   } else if (dis?.type === "Monto") {
  //     final = prev - dis.value;
  //   }
  // }
  return currency ? final * dollarValue : final;
};

const getTotalUnitsPVP = (
  state: Item[],
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[]
): number => {
  const prices: number[] = [0];
  state.forEach((item) => {
    const pubEq =
      typeof item.product.publicEquation === 'number'
        ? item.product.publicEquation
        : Number(item.product.publicEquation);
    const pubFr =
      typeof item.product.publicPrice.from === 'number'
        ? item.product.publicPrice.from
        : Number(String(item.product.publicPrice.from).replace(/[,]/gi, '.'));

    if (item.product && item.art && typeof item.product.discount === 'string') {
      const dis = discountList?.find(({ _id }) => _id === item.product.discount);
      if (dis?.type === 'Porcentaje') {
        const base = pubEq || pubFr;
        let prev = base - base / 10;
        prev = prev / (1 - item.art.comission / 100);
        let final = prev - (base / 100) * dis.value;
        if (item.product.finalPrice !== undefined) {
          final = item.product.finalPrice;
        }
        prices.push(Number(final) * (item.quantity || 1));
      } else if (dis?.type === 'Monto') {
        const base = pubEq || pubFr;
        let prev = base - base / 10;
        prev = prev / (1 - item.art.comission / 100);
        let final = prev - dis.value;
        if (item.product.finalPrice !== undefined) {
          final = item.product.finalPrice;
        }
        prices.push(final * (item.quantity || 1));
      }
    } else if (item.product && item.art) {
      const base = pubEq ? pubEq : pubFr;
      let final = base - base / 10;
      final = final / (1 - item.art.comission / 100);
      if (item.product.finalPrice !== undefined && item.product.finalPrice !== null) {
        final = item.product.finalPrice;
      }
      prices.push(final * (item.quantity || 1));
    }
  });
  const total = prices.reduce((a, b) => a + b, 0);
  return currency ? total * dollarValue : total;
};

const getTotalUnitsPVM = (
  state: Item[],
  currency: boolean,
  dollarValue: number,
  discountList?: Discount[],
  prixer?: string
): number => {
  const prices: number[] = [];
  state.forEach((item) => {
    const prxEq =
      typeof item.product.prixerEquation === 'number'
        ? item.product.prixerEquation
        : Number(String(item.product.prixerEquation).replace(/[,]/gi, '.'));
    const prxFr =
      typeof item.product.prixerPrice?.from === 'number'
        ? item.product.prixerPrice.from
        : Number(String(item.product.prixerPrice?.from || '0').replace(/[,]/gi, '.'));
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
      const base = prxEq ? prxEq : prxFr;
      let final = (base - base / 10) / (1 - item.art.comission / 100);
      if (item.product.finalPrice !== undefined) {
        final = item.product.finalPrice;
      } else if (item.art.prixerUsername !== prixer && item.art.owner !== prixer) {
        final = final / (1 - item.art.comission / 100);
      }
      prices.push(final * (item.quantity || 1));
    }
  });
  const total = prices.reduce((a, b) => a + b, 0);
  return currency ? total * dollarValue : total;
};


export {
  UnitPrice,
  UnitPriceSug,
  UnitPriceForOrg,
  getComission,
  getComissionv2,
  getPVPtext,
  getPVMtext,
  getPVP,
  getPVM,
  getTotalUnitsPVP,
  getTotalUnitsPVM,
};
