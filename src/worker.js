const SHOPIFY_API_VERSION = "2026-07";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ======================================================
    // PREFLIGHT
    // ======================================================

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type"
        }
      });
    }


    // ======================================================
    // API: PEDIDOS SHOPIFY
    // ======================================================

    if (
      pathname === "/api/orders"
    ) {
      if (
        request.method !== "GET"
      ) {
        return methodNotAllowed();
      }

      try {
        return await getShopifyOrders(
          env
        );
      } catch (error) {
        console.error(
          "Shopify error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              "No se pudieron obtener los pedidos de Shopify.",
            detail:
              error.message
          },
          500
        );
      }
    }


    // ======================================================
    // API: TODOS LOS ESTADOS OPERATIVOS
    // ======================================================

    if (
      pathname === "/api/states"
    ) {
      if (
        request.method !== "GET"
      ) {
        return methodNotAllowed();
      }

      try {
        return await getAllStates(
          env
        );
      } catch (error) {
        console.error(
          "D1 states error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              "No se pudieron obtener los estados.",
            detail:
              error.message
          },
          500
        );
      }
    }


    // ======================================================
    // API:
    // PUT /api/orders/:orderNumber/state
    // ======================================================

    const orderStateMatch =
      pathname.match(
        /^\/api\/orders\/([^/]+)\/state$/
      );

    if (orderStateMatch) {
      if (
        request.method !== "PUT"
      ) {
        return methodNotAllowed();
      }

      try {
        const orderNumber =
          decodeURIComponent(
            orderStateMatch[1]
          );

        return await updateOrderState(
          request,
          env,
          orderNumber
        );
      } catch (error) {
        console.error(
          "D1 order state error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              "No se pudo actualizar el pedido.",
            detail:
              error.message
          },
          500
        );
      }
    }


    // ======================================================
    // API:
    // PUT /api/orders/:orderNumber/products/:productId
    // ======================================================

    const productStateMatch =
      pathname.match(
        /^\/api\/orders\/([^/]+)\/products\/([^/]+)$/
      );

    if (productStateMatch) {
      if (
        request.method !== "PUT"
      ) {
        return methodNotAllowed();
      }

      try {
        const orderNumber =
          decodeURIComponent(
            productStateMatch[1]
          );

        const productId =
          decodeURIComponent(
            productStateMatch[2]
          );

        return await updateProductState(
          request,
          env,
          orderNumber,
          productId
        );
      } catch (error) {
        console.error(
          "D1 product state error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              "No se pudo actualizar el producto.",
            detail:
              error.message
          },
          500
        );
      }
    }


    // ======================================================
    // API:
    // POST /api/orders/:orderNumber/incidents
    // ======================================================

    const incidentCreateMatch =
      pathname.match(
        /^\/api\/orders\/([^/]+)\/incidents$/
      );

    if (incidentCreateMatch) {
      if (
        request.method !== "POST"
      ) {
        return methodNotAllowed();
      }

      try {
        const orderNumber =
          decodeURIComponent(
            incidentCreateMatch[1]
          );

        return await createIncident(
          request,
          env,
          orderNumber
        );
      } catch (error) {
        console.error(
          "D1 incident create error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              "No se pudo crear la incidencia.",
            detail:
              error.message
          },
          500
        );
      }
    }


    // ======================================================
    // API:
    // PUT /api/incidents/:id/resolve
    // ======================================================

    const incidentResolveMatch =
      pathname.match(
        /^\/api\/incidents\/([^/]+)\/resolve$/
      );

    if (incidentResolveMatch) {
      if (
        request.method !== "PUT"
      ) {
        return methodNotAllowed();
      }

      try {
        const incidentId =
          decodeURIComponent(
            incidentResolveMatch[1]
          );

        return await resolveIncident(
          env,
          incidentId
        );
      } catch (error) {
        console.error(
          "D1 incident resolve error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              "No se pudo resolver la incidencia.",
            detail:
              error.message
          },
          500
        );
      }
    }


    // ======================================================
    // API:
    // POST /api/orders/:orderNumber/history
    // ======================================================

    const historyMatch =
      pathname.match(
        /^\/api\/orders\/([^/]+)\/history$/
      );

    if (historyMatch) {
      if (
        request.method !== "POST"
      ) {
        return methodNotAllowed();
      }

      try {
        const orderNumber =
          decodeURIComponent(
            historyMatch[1]
          );

        return await addOrderHistory(
          request,
          env,
          orderNumber
        );
      } catch (error) {
        console.error(
          "D1 history error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              "No se pudo guardar el historial.",
            detail:
              error.message
          },
          500
        );
      }
    }


    // ======================================================
    // RESTO → ARCHIVOS ESTÁTICOS
    // ======================================================

    return env.ASSETS.fetch(
      request
    );
  }
};


// ==========================================================
// SHOPIFY
// OBTENER PEDIDOS
// ==========================================================

async function getShopifyOrders(
  env
) {
  validateShopifyEnvironment(
    env
  );

  const accessToken =
    await getShopifyAccessToken(
      env
    );

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

  const response =
    await fetch(
      endpoint,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          "X-Shopify-Access-Token":
            accessToken
        },

        body:
          JSON.stringify({
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
                getProductCode(
                  item
                ),

              variant:
                item.variant?.title &&
                item.variant.title !==
                  "Default Title"
                  ? item.variant.title
                  : "",

              image:
                getLineItemImage(
                  item
                )
            })
          )
      })
    );

  return jsonResponse({
    success:
      true,

    count:
      orders.length,

    orders
  });
}


// ==========================================================
// D1
// OBTENER TODO EL ESTADO OPERATIVO
// ==========================================================

async function getAllStates(
  env
) {
  validateD1(
    env
  );

  const [
    orderStatesResult,
    productStatesResult,
    incidentsResult,
    historyResult
  ] =
    await Promise.all([
      env.DB
        .prepare(`
          SELECT
            order_number,
            shopify_order_id,
            status,
            previous_status,
            assembly_location,
            notes,
            updated_at
          FROM order_states
        `)
        .all(),

      env.DB
        .prepare(`
          SELECT
            order_number,
            product_id,
            warehouse_status,
            transfer_from,
            updated_at
          FROM product_states
        `)
        .all(),

      env.DB
        .prepare(`
          SELECT
            id,
            order_number,
            product_id,
            product_name,
            product_code,
            reason,
            quantity,
            status,
            created_at,
            resolved_at
          FROM incidents
          ORDER BY created_at ASC
        `)
        .all(),

      env.DB
        .prepare(`
          SELECT
            id,
            order_number,
            text,
            created_at
          FROM order_history
          ORDER BY id ASC
        `)
        .all()
    ]);

  const orderStates =
    orderStatesResult.results ||
    [];

  const productStates =
    productStatesResult.results ||
    [];

  const incidents =
    incidentsResult.results ||
    [];

  const history =
    historyResult.results ||
    [];

  const stateMap =
    {};

  for (
    const row of
    orderStates
  ) {
    stateMap[
      row.order_number
    ] = {
      orderNumber:
        row.order_number,

      shopifyOrderId:
        row.shopify_order_id,

      status:
        row.status,

      previousStatus:
        row.previous_status,

      assemblyLocation:
        row.assembly_location,

      notes:
        row.notes || "",

      updatedAt:
        row.updated_at,

      products:
        [],

      incidents:
        [],

      history:
        []
    };
  }

  for (
    const row of
    productStates
  ) {
    ensureOrderStateContainer(
      stateMap,
      row.order_number
    );

    stateMap[
      row.order_number
    ].products.push({
      id:
        row.product_id,

      warehouseStatus:
        row.warehouse_status,

      transferFrom:
        row.transfer_from,

      updatedAt:
        row.updated_at
    });
  }

  for (
    const row of
    incidents
  ) {
    ensureOrderStateContainer(
      stateMap,
      row.order_number
    );

    stateMap[
      row.order_number
    ].incidents.push({
      id:
        row.id,

      productId:
        row.product_id,

      productName:
        row.product_name,

      productCode:
        row.product_code || "",

      reason:
        row.reason,

      quantity:
        row.quantity,

      status:
        row.status,

      createdAt:
        row.created_at,

      resolvedAt:
        row.resolved_at
    });
  }

  for (
    const row of
    history
  ) {
    ensureOrderStateContainer(
      stateMap,
      row.order_number
    );

    stateMap[
      row.order_number
    ].history.push({
      id:
        row.id,

      text:
        row.text,

      time:
        row.created_at
    });
  }

  return jsonResponse({
    success:
      true,

    states:
      stateMap
  });
}


// ==========================================================
// D1
// ACTUALIZAR ESTADO GENERAL DEL PEDIDO
// ==========================================================

async function updateOrderState(
  request,
  env,
  orderNumber
) {
  validateD1(
    env
  );

  const body =
    await readJsonBody(
      request
    );

  const existing =
    await env.DB
      .prepare(`
        SELECT
          order_number,
          shopify_order_id,
          status,
          previous_status,
          assembly_location,
          notes
        FROM order_states
        WHERE order_number = ?
      `)
      .bind(
        orderNumber
      )
      .first();

  const shopifyOrderId =
    body.shopifyOrderId ??
    existing
      ?.shopify_order_id ??
    null;

  const status =
    body.status ??
    existing?.status ??
    "pendiente";

  const previousStatus =
    body.previousStatus ??
    existing
      ?.previous_status ??
    null;

  const assemblyLocation =
    body.assemblyLocation ??
    existing
      ?.assembly_location ??
    "sin-asignar";

  const notes =
    body.notes ??
    existing?.notes ??
    "";

  validateOrderStatus(
    status
  );

  validateAssemblyLocation(
    assemblyLocation
  );

  const now =
    new Date()
      .toISOString();

  await env.DB
    .prepare(`
      INSERT INTO order_states (
        order_number,
        shopify_order_id,
        status,
        previous_status,
        assembly_location,
        notes,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(order_number)
      DO UPDATE SET
        shopify_order_id =
          excluded.shopify_order_id,

        status =
          excluded.status,

        previous_status =
          excluded.previous_status,

        assembly_location =
          excluded.assembly_location,

        notes =
          excluded.notes,

        updated_at =
          excluded.updated_at
    `)
    .bind(
      orderNumber,
      shopifyOrderId,
      status,
      previousStatus,
      assemblyLocation,
      notes,
      now
    )
    .run();

  return jsonResponse({
    success:
      true,

    state: {
      orderNumber,
      shopifyOrderId,
      status,
      previousStatus,
      assemblyLocation,
      notes,
      updatedAt:
        now
    }
  });
}


// ==========================================================
// D1
// ACTUALIZAR ESTADO DE UN PRODUCTO
// ==========================================================

async function updateProductState(
  request,
  env,
  orderNumber,
  productId
) {
  validateD1(
    env
  );

  const body =
    await readJsonBody(
      request
    );

  const existing =
    await env.DB
      .prepare(`
        SELECT
          warehouse_status,
          transfer_from
        FROM product_states
        WHERE
          order_number = ?
          AND product_id = ?
      `)
      .bind(
        orderNumber,
        productId
      )
      .first();

  const warehouseStatus =
    body.warehouseStatus ??
    existing
      ?.warehouse_status ??
    "pendiente";

  const transferFrom =
    body.transferFrom ??
    existing
      ?.transfer_from ??
    null;

  validateWarehouseStatus(
    warehouseStatus
  );

  if (
    transferFrom !==
    null
  ) {
    validateTransferLocation(
      transferFrom
    );
  }

  const now =
    new Date()
      .toISOString();

  await env.DB
    .prepare(`
      INSERT INTO product_states (
        order_number,
        product_id,
        warehouse_status,
        transfer_from,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?)

      ON CONFLICT(
        order_number,
        product_id
      )
      DO UPDATE SET
        warehouse_status =
          excluded.warehouse_status,

        transfer_from =
          excluded.transfer_from,

        updated_at =
          excluded.updated_at
    `)
    .bind(
      orderNumber,
      productId,
      warehouseStatus,
      transferFrom,
      now
    )
    .run();

  return jsonResponse({
    success:
      true,

    productState: {
      orderNumber,
      productId,
      warehouseStatus,
      transferFrom,
      updatedAt:
        now
    }
  });
}


// ==========================================================
// D1
// CREAR INCIDENCIA
// ==========================================================

async function createIncident(
  request,
  env,
  orderNumber
) {
  validateD1(
    env
  );

  const body =
    await readJsonBody(
      request
    );

  const productId =
    String(
      body.productId ||
      ""
    ).trim();

  const productName =
    String(
      body.productName ||
      ""
    ).trim();

  const productCode =
    String(
      body.productCode ||
      ""
    ).trim();

  const reason =
    String(
      body.reason ||
      ""
    ).trim();

  const quantity =
    Number.parseInt(
      body.quantity,
      10
    );

  if (!productId) {
    throw new Error(
      "Falta productId."
    );
  }

  if (!reason) {
    throw new Error(
      "Falta el motivo de la incidencia."
    );
  }

  if (
    ![
      "Dañado",
      "Quebrado"
    ].includes(
      reason
    )
  ) {
    throw new Error(
      "El motivo debe ser Dañado o Quebrado."
    );
  }

  if (
    Number.isNaN(
      quantity
    ) ||
    quantity < 1
  ) {
    throw new Error(
      "Cantidad de incidencia inválida."
    );
  }

  const id =
    crypto.randomUUID();

  const createdAt =
    new Date()
      .toISOString();

  await env.DB
    .prepare(`
      INSERT INTO incidents (
        id,
        order_number,
        product_id,
        product_name,
        product_code,
        reason,
        quantity,
        status,
        created_at,
        resolved_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        'pendiente',
        ?,
        NULL
      )
    `)
    .bind(
      id,
      orderNumber,
      productId,
      productName,
      productCode,
      reason,
      quantity,
      createdAt
    )
    .run();

  return jsonResponse(
    {
      success:
        true,

      incident: {
        id,
        orderNumber,
        productId,
        productName,
        productCode,
        reason,
        quantity,

        status:
          "pendiente",

        createdAt,

        resolvedAt:
          null
      }
    },
    201
  );
}


// ==========================================================
// D1
// RESOLVER INCIDENCIA
// ==========================================================

async function resolveIncident(
  env,
  incidentId
) {
  validateD1(
    env
  );

  const incident =
    await env.DB
      .prepare(`
        SELECT
          id,
          status
        FROM incidents
        WHERE id = ?
      `)
      .bind(
        incidentId
      )
      .first();

  if (!incident) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "Incidencia no encontrada."
      },
      404
    );
  }

  if (
    incident.status ===
    "resuelto"
  ) {
    return jsonResponse({
      success:
        true,

      message:
        "La incidencia ya estaba resuelta."
    });
  }

  const resolvedAt =
    new Date()
      .toISOString();

  await env.DB
    .prepare(`
      UPDATE incidents
      SET
        status = 'resuelto',
        resolved_at = ?
      WHERE id = ?
    `)
    .bind(
      resolvedAt,
      incidentId
    )
    .run();

  return jsonResponse({
    success:
      true,

    incident: {
      id:
        incidentId,

      status:
        "resuelto",

      resolvedAt
    }
  });
}


// ==========================================================
// D1
// AGREGAR HISTORIAL
// ==========================================================

async function addOrderHistory(
  request,
  env,
  orderNumber
) {
  validateD1(
    env
  );

  const body =
    await readJsonBody(
      request
    );

  const text =
    String(
      body.text ||
      ""
    ).trim();

  if (!text) {
    throw new Error(
      "El texto del historial está vacío."
    );
  }

  const createdAt =
    body.createdAt
      ? String(
          body.createdAt
        )
      : new Date()
          .toISOString();

  const result =
    await env.DB
      .prepare(`
        INSERT INTO order_history (
          order_number,
          text,
          created_at
        )
        VALUES (?, ?, ?)
      `)
      .bind(
        orderNumber,
        text,
        createdAt
      )
      .run();

  return jsonResponse(
    {
      success:
        true,

      history: {
        orderNumber,
        text,
        createdAt
      },

      meta:
        result.meta
    },
    201
  );
}


// ==========================================================
// CREAR CONTENEDOR VACÍO PARA /api/states
// ==========================================================

function ensureOrderStateContainer(
  stateMap,
  orderNumber
) {
  if (
    stateMap[
      orderNumber
    ]
  ) {
    return;
  }

  stateMap[
    orderNumber
  ] = {
    orderNumber,

    shopifyOrderId:
      null,

    status:
      "pendiente",

    previousStatus:
      null,

    assemblyLocation:
      "sin-asignar",

    notes:
      "",

    updatedAt:
      null,

    products:
      [],

    incidents:
      [],

    history:
      []
  };
}


// ==========================================================
// SHOPIFY
// OBTENER CÓDIGO DEL PRODUCTO
// ==========================================================

function getProductCode(
  item
) {
  const product =
    item.variant
      ?.product;

  if (!product) {
    return "";
  }


  // ------------------------------------------------------
  // 1. METACAMPO custom.codigo
  // ------------------------------------------------------

  const metafieldCode =
    product.codigo
      ?.value
      ?.trim();

  if (
    metafieldCode
  ) {
    return metafieldCode;
  }


  // ------------------------------------------------------
  // 2. DESCRIPCIÓN
  // ------------------------------------------------------

  const description =
    stripHtml(
      product.descriptionHtml ||
      ""
    );

  return extractCodeFromDescription(
    description
  );
}


// ==========================================================
// EXTRAER CÓDIGO DE DESCRIPCIÓN
// ==========================================================

function extractCodeFromDescription(
  description
) {
  if (
    !description
  ) {
    return "";
  }

  const patterns = [
    /\bc[oó]digo\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9._\/-]*)/i,

    /\bc[oó]d\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9._\/-]*)/i
  ];

  for (
    const pattern of
    patterns
  ) {
    const match =
      description.match(
        pattern
      );

    if (
      match &&
      match[1]
    ) {
      return match[
        1
      ].trim();
    }
  }

  return "";
}


// ==========================================================
// QUITAR HTML DE DESCRIPCIÓN
// ==========================================================

function stripHtml(
  html
) {
  if (!html) {
    return "";
  }

  return String(
    html
  )
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

    .replace(
      /<[^>]*>/g,
      " "
    )

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

    .replace(
      /\s+/g,
      " "
    )

    .trim();
}


// ==========================================================
// SHOPIFY
// ACCESS TOKEN
// ==========================================================

async function getShopifyAccessToken(
  env
) {
  const endpoint =
    `https://${env.SHOPIFY_SHOP}/admin/oauth/access_token`;

  const response =
    await fetch(
      endpoint,
      {
        method:
          "POST",

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
// SHOPIFY
// IMAGEN DEL PRODUCTO
// ==========================================================

function getLineItemImage(
  item
) {
  const variantImage =
    item.variant
      ?.image
      ?.url;

  if (
    variantImage
  ) {
    return getFullSizeShopifyImage(
      variantImage
    );
  }

  const productImage =
    item.variant
      ?.product
      ?.featuredMedia
      ?.preview
      ?.image
      ?.url;

  if (
    productImage
  ) {
    return getFullSizeShopifyImage(
      productImage
    );
  }

  return "";
}


// ==========================================================
// SHOPIFY
// QUITAR _160x160, ETC.
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
// VALIDACIÓN SHOPIFY
// ==========================================================

function validateShopifyEnvironment(
  env
) {
  const required = [
    "SHOPIFY_SHOP",
    "SHOPIFY_CLIENT_ID",
    "SHOPIFY_CLIENT_SECRET"
  ];

  const missing =
    required.filter(
      key =>
        !env[key]
    );

  if (
    missing.length >
    0
  ) {
    throw new Error(
      `Faltan variables: ${missing.join(", ")}`
    );
  }
}


// ==========================================================
// VALIDACIÓN D1
// ==========================================================

function validateD1(
  env
) {
  if (
    !env.DB
  ) {
    throw new Error(
      "No existe el binding D1 DB."
    );
  }
}


// ==========================================================
// VALIDAR ESTADO GENERAL
// ==========================================================

function validateOrderStatus(
  status
) {
  const allowed = [
    "pendiente",
    "bodega",
    "armando",
    "enviado",
    "problema"
  ];

  if (
    !allowed.includes(
      status
    )
  ) {
    throw new Error(
      `Estado de pedido inválido: ${status}`
    );
  }
}


// ==========================================================
// VALIDAR SUCURSAL
// ==========================================================

function validateAssemblyLocation(
  location
) {
  const allowed = [
    "sin-asignar",
    "las-condes",
    "patronato"
  ];

  if (
    !allowed.includes(
      location
    )
  ) {
    throw new Error(
      `Lugar de armado inválido: ${location}`
    );
  }
}


// ==========================================================
// VALIDAR ESTADO PRODUCTO
// ==========================================================

function validateWarehouseStatus(
  status
) {
  const allowed = [
    "pendiente",
    "bajado",
    "traslado"
  ];

  if (
    !allowed.includes(
      status
    )
  ) {
    throw new Error(
      `Estado de producto inválido: ${status}`
    );
  }
}


// ==========================================================
// VALIDAR ORIGEN DE TRASLADO
// ==========================================================

function validateTransferLocation(
  location
) {
  const allowed = [
    "las-condes",
    "patronato"
  ];

  if (
    !allowed.includes(
      location
    )
  ) {
    throw new Error(
      `Sucursal de traslado inválida: ${location}`
    );
  }
}


// ==========================================================
// LEER JSON
// ==========================================================

async function readJsonBody(
  request
) {
  const contentType =
    request.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    throw new Error(
      "La solicitud debe usar Content-Type application/json."
    );
  }

  try {
    return await request.json();
  } catch {
    throw new Error(
      "JSON inválido."
    );
  }
}


// ==========================================================
// MÉTODO NO PERMITIDO
// ==========================================================

function methodNotAllowed() {
  return jsonResponse(
    {
      success:
        false,

      error:
        "Método no permitido."
    },
    405
  );
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
          "no-store",

        "Access-Control-Allow-Origin":
          "*"
      }
    }
  );
}
