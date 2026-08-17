const SHOPIFY_API_VERSION = "2026-07";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ==========================================
    // API: PEDIDOS DE SHOPIFY
    // ==========================================

    if (url.pathname === "/api/orders") {
      if (request.method !== "GET") {
        return jsonResponse(
          { error: "Método no permitido" },
          405
        );
      }

      try {
        return await getShopifyOrders(env);
      } catch (error) {
        console.error("Shopify error:", error);

        return jsonResponse(
          {
            error: "No se pudieron obtener los pedidos de Shopify.",
            detail: error.message
          },
          500
        );
      }
    }

    // ==========================================
    // RESTO → ARCHIVOS ESTÁTICOS
    // ==========================================

    return env.ASSETS.fetch(request);
  }
};


// ==========================================================
// OBTENER PEDIDOS
// ==========================================================

async function getShopifyOrders(env) {
  validateEnvironment(env);

  const accessToken =
    await getShopifyAccessToken(env);

  const endpoint =
    `https://${env.SHOPIFY_SHOP}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const query = `
    query GetRecentOrders {
      orders(
        first: 100
        sortKey: CREATED_AT
        reverse: true
      ) {
        nodes {
          id
          name
          createdAt

          displayFinancialStatus
          displayFulfillmentStatus

          shippingAddress {
            city
            province
            provinceCode
            country
          }

          shippingLines(first: 5) {
            nodes {
              title
            }
          }

          lineItems(first: 50) {
            nodes {
              id
              name
              quantity
              sku

              variant {
                id
                title

                image {
                  url
                  altText
                }

                product {
                  id
                  title
                  descriptionHtml

                  codigo: metafield(
                    namespace: "custom"
                    key: "codigo"
                  ) {
                    value
                  }

                  featuredMedia {
                    preview {
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(
    endpoint,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "X-Shopify-Access-Token":
          accessToken
      },

      body: JSON.stringify({
        query
      })
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      `Shopify respondió HTTP ${response.status}`
    );
  }

  if (data.errors) {
    throw new Error(
      data.errors
        .map(
          error =>
            error.message
        )
        .join(" | ")
    );
  }

  const orders =
    data.data.orders.nodes.map(
      order => ({
        id:
          order.id,

        number:
          order.name,

        createdAt:
          order.createdAt,

        financialStatus:
          order.displayFinancialStatus,

        fulfillmentStatus:
          order.displayFulfillmentStatus,

        shipping: {
          city:
            order.shippingAddress
              ?.city || "",

          province:
            order.shippingAddress
              ?.province || "",

          provinceCode:
            order.shippingAddress
              ?.provinceCode || "",

          country:
            order.shippingAddress
              ?.country || "",

          methods:
            order.shippingLines
              .nodes
              .map(
                shippingLine =>
                  shippingLine.title
              )
        },

        products:
          order.lineItems.nodes.map(
            item => ({
              id:
                item.id,

              name:
                item.name,

              quantity:
                item.quantity,

              sku:
                item.sku || "",

              code:
                getProductCode(item),

              variant:
                item.variant?.title &&
                item.variant.title !==
                  "Default Title"
                  ? item.variant.title
                  : "",

              image:
                getLineItemImage(item)
            })
          )
      })
    );

  return jsonResponse({
    success: true,
    count: orders.length,
    orders
  });
}


// ==========================================================
// OBTENER CÓDIGO DEL PRODUCTO
// ==========================================================

function getProductCode(item) {
  const product =
    item.variant?.product;

  if (!product) {
    return "";
  }

  // ------------------------------------------------------
  // 1. PRIORIDAD: METACAMPO custom.codigo
  // ------------------------------------------------------

  const metafieldCode =
    product.codigo?.value
      ?.trim();

  if (metafieldCode) {
    return metafieldCode;
  }

  // ------------------------------------------------------
  // 2. SI NO EXISTE, BUSCAR EN LA DESCRIPCIÓN
  // ------------------------------------------------------

  const description =
    stripHtml(
      product.descriptionHtml || ""
    );

  return extractCodeFromDescription(
    description
  );
}


// ==========================================================
// EXTRAER CÓDIGO DE LA DESCRIPCIÓN
// ==========================================================

function extractCodeFromDescription(
  description
) {
  if (!description) {
    return "";
  }

  /*
    Detecta, por ejemplo:

    Código: BJ1121-9
    Codigo: BJ1121-9
    COD: BJ1121-9
    Cod: BJ1121-9
    cod: BJ1121-9
    Cód.: BJ1121-9
    codigo BJ1121-9
    Código - BJ1121-9
  */

  const patterns = [
    /\bc[oó]digo\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9._\/-]*)/i,

    /\bc[oó]d\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9._\/-]*)/i
  ];

  for (const pattern of patterns) {
    const match =
      description.match(pattern);

    if (
      match &&
      match[1]
    ) {
      return match[1].trim();
    }
  }

  return "";
}


// ==========================================================
// QUITAR HTML DE LA DESCRIPCIÓN
// ==========================================================

function stripHtml(html) {
  if (!html) {
    return "";
  }

  return String(html)

    // Saltos de línea
    .replace(
      /<br\s*\/?>/gi,
      " "
    )

    .replace(
      /<\/p>/gi,
      " "
    )

    .replace(
      /<\/li>/gi,
      " "
    )

    // Quitar etiquetas
    .replace(
      /<[^>]*>/g,
      " "
    )

    // Algunas entidades HTML comunes
    .replace(
      /&nbsp;/gi,
      " "
    )

    .replace(
      /&amp;/gi,
      "&"
    )

    .replace(
      /&quot;/gi,
      '"'
    )

    .replace(
      /&#39;/gi,
      "'"
    )

    // Espacios repetidos
    .replace(
      /\s+/g,
      " "
    )

    .trim();
}


// ==========================================================
// ACCESS TOKEN DE SHOPIFY
// ==========================================================

async function getShopifyAccessToken(
  env
) {
  const endpoint =
    `https://${env.SHOPIFY_SHOP}/admin/oauth/access_token`;

  const response = await fetch(
    endpoint,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },

      body:
        new URLSearchParams({
          grant_type:
            "client_credentials",

          client_id:
            env.SHOPIFY_CLIENT_ID,

          client_secret:
            env.SHOPIFY_CLIENT_SECRET
        })
    }
  );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.access_token
  ) {
    throw new Error(
      "Shopify no entregó un access token."
    );
  }

  return data.access_token;
}


// ==========================================================
// IMAGEN DEL PRODUCTO
// ==========================================================

function getLineItemImage(item) {
  const variantImage =
    item.variant?.image?.url;

  if (variantImage) {
    return getFullSizeShopifyImage(
      variantImage
    );
  }

  const productImage =
    item.variant?.product
      ?.featuredMedia
      ?.preview
      ?.image
      ?.url;

  if (productImage) {
    return getFullSizeShopifyImage(
      productImage
    );
  }

  return "";
}


// ==========================================================
// QUITAR TAMAÑOS COMO _160x160 DE SHOPIFY
// ==========================================================

function getFullSizeShopifyImage(
  url
) {
  if (!url) {
    return "";
  }

  return url.replace(
    /_(?:pico|icon|thumb|small|compact|medium|large|grande|\d+x\d+)(?=\.[a-zA-Z]+(?:\?|$))/,
    ""
  );
}


// ==========================================================
// VALIDACIÓN
// ==========================================================

function validateEnvironment(env) {
  const required = [
    "SHOPIFY_SHOP",
    "SHOPIFY_CLIENT_ID",
    "SHOPIFY_CLIENT_SECRET"
  ];

  const missing =
    required.filter(
      key => !env[key]
    );

  if (
    missing.length > 0
  ) {
    throw new Error(
      `Faltan variables: ${missing.join(", ")}`
    );
  }
}


// ==========================================================
// RESPUESTA JSON
// ==========================================================

function jsonResponse(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(
      data,
      null,
      2
    ),
    {
      status,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store"
      }
    }
  );
}
