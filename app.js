let orders = [];
let selectedOrderId = null;

let activeZone = "todos";
let activeStatus = "todos";
let activeLocation = "todos";
let searchTerm = "";


// ==========================================================
// INCIDENCIA ACTUAL
// ==========================================================

let incidentProductId = null;
let incidentReason = null;
let incidentQuantity = 1;
let incidentMaxQuantity = 1;


// ==========================================================
// ELEMENTOS PRINCIPALES
// ==========================================================

const ordersGrid =
  document.getElementById("orders-grid");

const emptyState =
  document.getElementById("empty-state");

const statPendiente =
  document.getElementById("stat-pendiente");

const statBodega =
  document.getElementById("stat-bodega");

const statArmando =
  document.getElementById("stat-armando");

const statEnviado =
  document.getElementById("stat-enviado");

const searchOrder =
  document.getElementById("search-order");


// ==========================================================
// MODAL PEDIDO
// ==========================================================

const modal =
  document.getElementById("order-modal");

const closeModalButton =
  document.getElementById("close-modal");

const closeModalXButton =
  document.getElementById("close-modal-x");

const modalOrderNumber =
  document.getElementById("modal-order-number");

const modalZone =
  document.getElementById("modal-zone");

const modalOrderDate =
  document.getElementById("modal-order-date");

const assemblyLocationSelect =
  document.getElementById(
    "assembly-location-select"
  );

const assemblyLocationBadge =
  document.getElementById(
    "assembly-location-badge"
  );

const progressSteps =
  document.getElementById("progress-steps");

const modalProductCount =
  document.getElementById(
    "modal-product-count"
  );

const modalProducts =
  document.getElementById("modal-products");

const orderNotesInput =
  document.getElementById(
    "order-notes-input"
  );

const saveNotesButton =
  document.getElementById("save-notes");

const historyList =
  document.getElementById("history-list");

const problemButton =
  document.getElementById("problem-button");

const nextStatusButton =
  document.getElementById(
    "next-status-button"
  );

const resetDemoButton =
  document.getElementById("reset-demo");


// ==========================================================
// TOAST
// ==========================================================

const toast =
  document.getElementById("toast");

const toastMessage =
  document.getElementById("toast-message");


// ==========================================================
// VISOR DE IMAGEN
// ==========================================================

const imageViewer =
  document.getElementById("image-viewer");

const imageViewerImg =
  document.getElementById(
    "image-viewer-img"
  );

const closeImageViewerButton =
  document.getElementById(
    "close-image-viewer"
  );


// ==========================================================
// MODAL INCIDENCIAS
// ==========================================================

const incidentModal =
  document.getElementById("incidentModal");

const incidentModalClose =
  document.getElementById(
    "incidentModalClose"
  );

const incidentModalBackdrop =
  document.querySelector(
    ".incident-modal-backdrop"
  );

const incidentProductName =
  document.getElementById(
    "incidentProductName"
  );

const incidentQuantitySection =
  document.getElementById(
    "incidentQuantitySection"
  );

const incidentQuantityValue =
  document.getElementById(
    "incidentQuantity"
  );

const incidentQuantityAvailable =
  document.getElementById(
    "incidentQuantityAvailable"
  );

const incidentQuantityMinus =
  document.getElementById(
    "incidentQuantityMinus"
  );

const incidentQuantityPlus =
  document.getElementById(
    "incidentQuantityPlus"
  );

const incidentConfirmButton =
  document.getElementById(
    "incidentConfirmButton"
  );

const incidentCancelButton =
  document.getElementById(
    "incidentCancelButton"
  );

const incidentReasonButtons =
  document.querySelectorAll(
    ".incident-reason-button"
  );


// ==========================================================
// API
// ==========================================================

async function apiRequest(
  url,
  options = {}
) {
  const config = {
    ...options,
    headers: {
      ...(options.body
        ? {
            "Content-Type":
              "application/json"
          }
        : {}),
      ...(options.headers || {})
    }
  };

  const response =
    await fetch(
      url,
      config
    );

  let data;

  try {
    data =
      await response.json();
  } catch {
    data =
      null;
  }

  if (
    !response.ok ||
    data?.success === false
  ) {
    throw new Error(
      data?.detail ||
      data?.error ||
      `Error HTTP ${response.status}`
    );
  }

  return data;
}


// ==========================================================
// INICIO
// ==========================================================

async function init() {
  try {
    showLoadingState();

    const [
      shopifyData,
      statesData
    ] =
      await Promise.all([
        apiRequest(
          "/api/orders"
        ),

        apiRequest(
          "/api/states"
        )
      ]);

    orders =
      shopifyData.orders
        .filter(order => {
          return (
            order.financialStatus ===
              "PAID" &&
            order.fulfillmentStatus !==
              "FULFILLED"
          );
        })
        .map(
          shopifyOrderToLocalOrder
        );

    applyRemoteStates(
      statesData.states ||
      {}
    );

    render();

  } catch (error) {
    console.error(error);

    ordersGrid.innerHTML = `
      <div
        style="
          grid-column:1 / -1;
          padding:30px;
          background:white;
          border-radius:16px;
          border:1px solid #e5e1da;
        "
      >
        <strong>
          No se pudieron cargar los pedidos.
        </strong>

        <p style="margin-bottom:0;">
          ${escapeHtml(
            error.message
          )}
        </p>
      </div>
    `;
  }
}


// ==========================================================
// SHOPIFY → FORMATO LOCAL
// ==========================================================

function shopifyOrderToLocalOrder(
  order
) {
  const shippingMethod =
    order.shipping?.methods?.[0] ||
    "";

  const zone =
    classifyZone(
      shippingMethod,
      order.shipping
    );

  return {
    id:
      order.id,

    number:
      order.number,

    date:
      formatShopifyDate(
        order.createdAt
      ),

    status:
      "pendiente",

    previousStatus:
      null,

    assemblyLocation:
      "sin-asignar",

    zone,

    shipping:
      shippingMethod ||
      "Sin método de envío",

    shippingDetails: {
      city:
        order.shipping?.city ||
        "",

      province:
        order.shipping?.province ||
        "",

      provinceCode:
        order.shipping?.provinceCode ||
        "",

      country:
        order.shipping?.country ||
        ""
    },

    notes:
      "",

    incidents:
      [],

    products:
      order.products.map(
        product => ({
          id:
            product.id,

          name:
            product.name,

          quantity:
            product.quantity,

          code:
            product.code ||
            "",

          sku:
            product.sku ||
            "",

          variant:
            product.variant ||
            "",

          image:
            product.image ||
            "",

          warehouseStatus:
            "pendiente",

          transferFrom:
            null
        })
      ),

    history: [
      {
        text:
          "Pedido recibido desde Shopify",

        time:
          formatShopifyDate(
            order.createdAt
          )
      }
    ]
  };
}


// ==========================================================
// MEZCLAR ESTADOS D1 + SHOPIFY
// ==========================================================

function applyRemoteStates(
  stateMap
) {
  orders =
    orders.map(order => {
      const saved =
        stateMap[
          order.number
        ];

      if (!saved) {
        return order;
      }

      const savedProducts =
        Array.isArray(
          saved.products
        )
          ? saved.products
          : [];

      const remoteHistory =
        Array.isArray(
          saved.history
        )
          ? saved.history
          : [];

      return {
        ...order,

        status:
          saved.status ||
          order.status,

        previousStatus:
          saved.previousStatus ||
          null,

        assemblyLocation:
          saved.assemblyLocation ||
          "sin-asignar",

        notes:
          typeof saved.notes ===
          "string"
            ? saved.notes
            : "",

        incidents:
          Array.isArray(
            saved.incidents
          )
            ? saved.incidents
            : [],

        products:
          order.products.map(
            product => {
              const savedProduct =
                savedProducts.find(
                  item =>
                    item.id ===
                    product.id
                );

              return {
                ...product,

                warehouseStatus:
                  savedProduct
                    ?.warehouseStatus ||
                  "pendiente",

                transferFrom:
                  savedProduct
                    ?.transferFrom ||
                  null
              };
            }
          ),

        history:
          remoteHistory.length > 0
            ? remoteHistory
            : order.history
      };
    });
}


// ==========================================================
// CLASIFICAR SANTIAGO / REGIONES
// ==========================================================

function classifyZone(
  shippingMethod,
  shipping
) {
  const method =
    String(
      shippingMethod ||
      ""
    ).toLowerCase();

  if (
    method.includes(
      "santiago"
    )
  ) {
    return "santiago";
  }

  return "regiones";
}


// ==========================================================
// GUARDAR ESTADO GENERAL EN D1
// ==========================================================

async function saveRemoteOrderState(
  order
) {
  return apiRequest(
    `/api/orders/${encodeURIComponent(
      order.number
    )}/state`,
    {
      method:
        "PUT",

      body:
        JSON.stringify({
          shopifyOrderId:
            order.id,

          status:
            order.status,

          previousStatus:
            order.previousStatus,

          assemblyLocation:
            order.assemblyLocation ||
            "sin-asignar",

          notes:
            order.notes ||
            ""
        })
    }
  );
}


// ==========================================================
// GUARDAR PRODUCTO EN D1
// ==========================================================

async function saveRemoteProductState(
  order,
  product
) {
  return apiRequest(
    `/api/orders/${encodeURIComponent(
      order.number
    )}/products/${encodeURIComponent(
      product.id
    )}`,
    {
      method:
        "PUT",

      body:
        JSON.stringify({
          warehouseStatus:
            product.warehouseStatus ||
            "pendiente",

          transferFrom:
            product.transferFrom ||
            null
        })
    }
  );
}


// ==========================================================
// HISTORIAL D1
// ==========================================================

async function addRemoteHistory(
  order,
  text
) {
  const data =
    await apiRequest(
      `/api/orders/${encodeURIComponent(
        order.number
      )}/history`,
      {
        method:
          "POST",

        body:
          JSON.stringify({
            text
          })
      }
    );

  const item = {
    text:
      data.history?.text ||
      text,

    time:
      formatStoredDate(
        data.history
          ?.createdAt ||
        new Date()
          .toISOString()
      )
  };

  order.history.push(
    item
  );

  return item;
}


// ==========================================================
// RENDER GENERAL
// ==========================================================

function render() {
  renderStats();
  renderOrders();
}


// ==========================================================
// ESTADÍSTICAS
// ==========================================================

function renderStats() {
  statPendiente.textContent =
    orders.filter(
      order =>
        order.status ===
        "pendiente"
    ).length;

  statBodega.textContent =
    orders.filter(
      order =>
        order.status ===
        "bodega"
    ).length;

  statArmando.textContent =
    orders.filter(
      order =>
        order.status ===
        "armando"
    ).length;

  statEnviado.textContent =
    orders.filter(
      order =>
        order.status ===
        "enviado"
    ).length;
}


// ==========================================================
// LISTADO DE PEDIDOS
// ==========================================================

function renderOrders() {
  const filteredOrders =
    orders.filter(order => {
      const matchesZone =
        activeZone ===
          "todos" ||
        (
          activeZone ===
            "problema"
            ? hasPendingIncidents(
                order
              ) ||
              order.status ===
                "problema"
            : order.zone ===
              activeZone
        );

      const matchesStatus =
        activeStatus ===
          "todos" ||
        order.status ===
          activeStatus;

      const matchesLocation =
        activeLocation ===
          "todos" ||
        order.assemblyLocation ===
          activeLocation;

      const normalizedSearch =
        searchTerm.toLowerCase();

      const matchesSearch =
        order.number
          .toLowerCase()
          .includes(
            normalizedSearch
          ) ||

        order.products.some(
          product =>
            product.name
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||

            String(
              product.code ||
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||

            String(
              product.sku ||
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              )
        );

      return (
        matchesZone &&
        matchesStatus &&
        matchesLocation &&
        matchesSearch
      );
    });

  ordersGrid.innerHTML =
    "";

  if (
    filteredOrders.length ===
    0
  ) {
    emptyState.classList.remove(
      "hidden"
    );

    return;
  }

  emptyState.classList.add(
    "hidden"
  );

  filteredOrders.forEach(
    order => {
      ordersGrid.appendChild(
        createOrderCard(
          order
        )
      );
    }
  );
}


// ==========================================================
// TARJETA PEDIDO
// ==========================================================

function createOrderCard(
  order
) {
  const article =
    document.createElement(
      "article"
    );

  article.className =
    `order-card location-card-${order.assemblyLocation || "sin-asignar"}`;

  const visibleProducts =
    order.products.slice(
      0,
      3
    );

  const totalUnits =
    order.products.reduce(
      (
        sum,
        product
      ) =>
        sum +
        product.quantity,
      0
    );

  const pendingIncidents =
    getPendingIncidentCount(
      order
    );

  article.innerHTML = `
    <div class="order-card-inner">

      <div class="order-card-top">

        <div>

          <h3 class="order-number">
            ${escapeHtml(
              order.number
            )}
          </h3>

          <p class="order-date">
            ${escapeHtml(
              order.date
            )}
          </p>

        </div>

        <span
          class="zone-badge ${
            order.zone ===
              "santiago"
              ? "zone-santiago"
              : "zone-regiones"
          }"
        >
          ${
            order.zone ===
              "santiago"
              ? "Santiago"
              : "Regiones"
          }
        </span>

      </div>


      <div class="order-card-products">

        <div class="order-thumb-group">

          ${
            visibleProducts
              .map(product => {
                if (
                  !product.image
                ) {
                  return "";
                }

                return `
                  <img
                    class="order-thumb"
                    src="${product.image}"
                    alt="${escapeHtml(
                      product.name
                    )}"
                  >
                `;
              })
              .join("")
          }

        </div>


        <div class="order-product-summary">

          ${order.products.length}

          ${
            order.products.length ===
            1
              ? "producto"
              : "productos"
          }

          ·

          ${totalUnits}

          ${
            totalUnits ===
            1
              ? "unidad"
              : "unidades"
          }

          ${
            pendingIncidents > 0
              ? `
                <div
                  style="
                    margin-top:6px;
                    color:#dc2626;
                    font-weight:800;
                  "
                >
                  ⚠ ${pendingIncidents}

                  ${
                    pendingIncidents ===
                    1
                      ? "incidencia pendiente"
                      : "incidencias pendientes"
                  }
                </div>
              `
              : ""
          }

        </div>

      </div>


      <div class="order-status-row">

        <span
          class="status-badge status-${order.status}"
        >

          <span
            class="status-dot"
          ></span>

          ${getStatusLabel(
            order.status
          )}

        </span>

        <button
          class="order-view-button"
          type="button"
        >
          Ver pedido →
        </button>

      </div>

    </div>
  `;

  article.addEventListener(
    "click",
    () => {
      openOrder(
        order.id
      );
    }
  );

  return article;
}


// ==========================================================
// ABRIR PEDIDO
// ==========================================================

function openOrder(
  orderId
) {
  selectedOrderId =
    orderId;

  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  modalOrderNumber.textContent =
    order.number;

  modalOrderDate.textContent =
    `${order.date} · ${order.shipping}`;

  modalZone.textContent =
    order.zone ===
      "santiago"
      ? "Santiago"
      : "Regiones";

  modalZone.className =
    "zone-badge " +
    (
      order.zone ===
        "santiago"
        ? "zone-santiago"
        : "zone-regiones"
    );

  orderNotesInput.value =
    order.notes ||
    "";

  updateAssemblyLocationUI(
    order
  );

  renderProgress(
    order
  );

  renderProducts(
    order
  );

  renderHistory(
    order
  );

  updateModalButtons(
    order
  );

  modal.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";
}


function closeModal() {
  modal.classList.add(
    "hidden"
  );

  document.body.style.overflow =
    "";

  selectedOrderId =
    null;
}


// ==========================================================
// LUGAR DE ARMADO
// ==========================================================

function updateAssemblyLocationUI(
  order
) {
  const location =
    order.assemblyLocation ||
    "sin-asignar";

  assemblyLocationSelect.value =
    location;

  assemblyLocationBadge.className =
    "assembly-location-badge";

  if (
    location ===
    "las-condes"
  ) {
    assemblyLocationBadge.textContent =
      "Las Condes";

    assemblyLocationBadge.classList.add(
      "location-las-condes"
    );

  } else if (
    location ===
    "patronato"
  ) {
    assemblyLocationBadge.textContent =
      "Patronato";

    assemblyLocationBadge.classList.add(
      "location-patronato"
    );

  } else {
    assemblyLocationBadge.textContent =
      "Sin asignar";

    assemblyLocationBadge.classList.add(
      "location-unassigned"
    );
  }
}


async function changeAssemblyLocation() {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  const oldLocation =
    order.assemblyLocation;

  const newLocation =
    assemblyLocationSelect.value;

  if (
    oldLocation ===
    newLocation
  ) {
    return;
  }

  assemblyLocationSelect.disabled =
    true;

  try {
    order.assemblyLocation =
      newLocation;

    await saveRemoteOrderState(
      order
    );

    await addRemoteHistory(
      order,
      `Lugar de armado: ${getAssemblyLocationLabel(
        newLocation
      )}`
    );

    updateAssemblyLocationUI(
      order
    );

    render();

    renderHistory(
      order
    );

    showToast(
      `Pedido asignado a ${getAssemblyLocationLabel(
        newLocation
      )}`
    );

  } catch (error) {
    console.error(error);

    order.assemblyLocation =
      oldLocation;

    updateAssemblyLocationUI(
      order
    );

    showToast(
      `Error: ${error.message}`
    );

  } finally {
    assemblyLocationSelect.disabled =
      false;
  }
}


function getAssemblyLocationLabel(
  location
) {
  const labels = {
    "las-condes":
      "Las Condes",

    "patronato":
      "Patronato",

    "sin-asignar":
      "Sin asignar"
  };

  return (
    labels[location] ||
    "Sin asignar"
  );
}


// ==========================================================
// PROGRESO GENERAL
// ==========================================================

function renderProgress(
  order
) {
  const statuses = [
    {
      key:
        "pendiente",

      label:
        "Pedido recibido"
    },

    {
      key:
        "bodega",

      label:
        "Bajado de bodega"
    },

    {
      key:
        "armando",

      label:
        "Pedido armado"
    },

    {
      key:
        "enviado",

      label:
        "Pedido enviado"
    }
  ];

  let comparisonStatus =
    order.status;

  if (
    order.status ===
    "problema"
  ) {
    comparisonStatus =
      order.previousStatus ||
      "pendiente";
  }

  const currentIndex =
    statuses.findIndex(
      status =>
        status.key ===
        comparisonStatus
    );

  progressSteps.innerHTML =
    statuses
      .map(
        (
          status,
          index
        ) => {
          let className =
            "progress-step";

          if (
            index <
            currentIndex
          ) {
            className +=
              " completed";
          }

          if (
            index ===
            currentIndex
          ) {
            className +=
              " current";
          }

          if (
            order.status ===
              "enviado" &&
            index ===
              currentIndex
          ) {
            className =
              "progress-step completed";
          }

          return `
            <div
              class="${className}"
            >

              <span
                class="progress-step-number"
              >
                ${
                  index <
                    currentIndex ||
                  order.status ===
                    "enviado"
                    ? "✓"
                    : index + 1
                }
              </span>

              <span
                class="progress-step-label"
              >
                ${status.label}
              </span>

            </div>
          `;
        }
      )
      .join("");
}


// ==========================================================
// PRODUCTOS
// ==========================================================

function renderProducts(
  order
) {
  const totalUnits =
    order.products.reduce(
      (
        sum,
        product
      ) =>
        sum +
        product.quantity,
      0
    );


  const readyUnits =
    order.products.reduce(
      (
        sum,
        product
      ) => {
        if (
          product.warehouseStatus ===
          "bajado"
        ) {
          return (
            sum +
            product.quantity
          );
        }

        return sum;
      },
      0
    );


  const transferUnits =
    order.products.reduce(
      (
        sum,
        product
      ) => {
        if (
          product.warehouseStatus ===
          "traslado"
        ) {
          return (
            sum +
            product.quantity
          );
        }

        return sum;
      },
      0
    );


  const pendingUnits =
    totalUnits -
    readyUnits -
    transferUnits;


  let progressText =
    `${readyUnits} de ${totalUnits} listos`;


  if (
    transferUnits > 0
  ) {
    progressText +=
      ` · ${transferUnits} en traslado`;
  }


  if (
    pendingUnits > 0
  ) {
    progressText +=
      ` · ${pendingUnits} pendientes`;
  }


  if (
    readyUnits ===
      totalUnits &&
    totalUnits > 0
  ) {
    progressText =
      `✓ ${totalUnits} de ${totalUnits} listos`;
  }


  modalProductCount.textContent =
    progressText;


  modalProductCount
    .classList
    .toggle(
      "products-complete",
      readyUnits ===
        totalUnits &&
      totalUnits > 0
    );


  modalProductCount
    .classList
    .toggle(
      "products-pending",
      readyUnits <
        totalUnits
    );


  modalProducts.innerHTML =
    order.products
      .map(
        product => `
          <article class="product-item">

            ${
              product.image
                ? `
                  <button
                    type="button"
                    class="product-image-wrapper product-image-button"
                    data-image="${product.image}"
                    data-product="${escapeHtml(
                      product.name
                    )}"
                  >

                    <img
                      class="product-image"
                      src="${product.image}"
                      alt="${escapeHtml(
                        product.name
                      )}"
                    >

                  </button>
                `
                : `
                  <div
                    class="product-image-wrapper"
                  >
                    <div
                      style="
                        width:100%;
                        height:100%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:#888;
                        font-size:12px;
                        text-align:center;
                        padding:8px;
                      "
                    >
                      Sin imagen
                    </div>
                  </div>
                `
            }


            <div class="product-info">

              <h4
                class="product-name"
              >
                ${escapeHtml(
                  product.name
                )}
              </h4>


              ${
                product.variant
                  ? `
                    <p
                      class="product-meta"
                    >
                      Variante:
                      ${escapeHtml(
                        product.variant
                      )}
                    </p>
                  `
                  : ""
              }


              ${
                product.code
                  ? `
                    <p
                      class="product-meta"
                    >
                      <strong>
                        Código:
                      </strong>

                      ${escapeHtml(
                        product.code
                      )}
                    </p>
                  `
                  : ""
              }


              ${
                product.sku
                  ? `
                    <p
                      class="product-meta"
                    >
                      SKU:
                      ${escapeHtml(
                        product.sku
                      )}
                    </p>
                  `
                  : ""
              }


              <span
                class="product-quantity"
              >
                Cantidad:
                ${product.quantity}
              </span>


              ${renderWarehouseProductStatus(
                order,
                product
              )}


              ${renderProductIncident(
                order,
                product
              )}

            </div>

          </article>
        `
      )
      .join("");


  // IMÁGENES

  modalProducts
    .querySelectorAll(
      ".product-image-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          openImageViewer(
            button.dataset.image,
            button.dataset.product
          );
        }
      );
    });


  // INCIDENCIA

  modalProducts
    .querySelectorAll(
      ".incident-report-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          reportProductIncident(
            button.dataset.productId
          );
        }
      );
    });


  // RESOLVER INCIDENCIA

  modalProducts
    .querySelectorAll(
      ".incident-resolve-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          resolveProductIncident(
            button.dataset.productId
          );
        }
      );
    });


  // PRODUCTO BAJADO / RECIBIDO

  modalProducts
    .querySelectorAll(
      ".warehouse-product-ready-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          markProductReady(
            button.dataset.productId
          );
        }
      );
    });


  // NO HAY AQUÍ

  modalProducts
    .querySelectorAll(
      ".warehouse-product-missing-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          markProductMissing(
            button.dataset.productId
          );
        }
      );
    });


  // DESHACER

  modalProducts
    .querySelectorAll(
      ".warehouse-reset-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          resetProductWarehouseStatus(
            button.dataset.productId
          );
        }
      );
    });
}


// ==========================================================
// ESTADO DE BODEGA POR PRODUCTO
// ==========================================================

function renderWarehouseProductStatus(
  order,
  product
) {
  const status =
    product.warehouseStatus ||
    "pendiente";

  if (
    status ===
    "bajado"
  ) {
    return `
      <div
        class="warehouse-product-status ready"
      >
        ✓ Producto bajado
      </div>

      <button
        type="button"
        class="warehouse-reset-button"
        data-product-id="${product.id}"
      >
        Deshacer
      </button>
    `;
  }


  if (
    status ===
    "traslado"
  ) {
    return `
      <div
        class="warehouse-product-status transfer"
      >
        ↔ Solicitado desde

        <strong>
          ${escapeHtml(
            getAssemblyLocationLabel(
              product.transferFrom
            )
          )}
        </strong>
      </div>

      <button
        type="button"
        class="warehouse-product-ready-button"
        data-product-id="${product.id}"
      >
        ✓ Marcar como recibido
      </button>
    `;
  }


  return `
    <div
      class="warehouse-product-actions"
    >

      <button
        type="button"
        class="warehouse-product-ready-button"
        data-product-id="${product.id}"
      >
        ✓ Bajado
      </button>

      <button
        type="button"
        class="warehouse-product-missing-button"
        data-product-id="${product.id}"
      >
        ↔ No hay aquí
      </button>

    </div>
  `;
}


// ==========================================================
// PRODUCTO BAJADO / RECIBIDO
// ==========================================================

async function markProductReady(
  productId
) {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  const product =
    order.products.find(
      item =>
        item.id ===
        productId
    );

  if (!product) {
    return;
  }

  const oldStatus =
    product.warehouseStatus;

  const oldTransfer =
    product.transferFrom;

  product.warehouseStatus =
    "bajado";

  product.transferFrom =
    null;

  try {
    await saveRemoteProductState(
      order,
      product
    );

    const historyText =
      oldStatus ===
        "traslado"
        ? `Producto recibido y listo: ${product.name}`
        : `Producto bajado: ${product.name}`;

    await addRemoteHistory(
      order,
      historyText
    );

    refreshOpenOrder();

    showToast(
      oldStatus ===
        "traslado"
        ? "Producto recibido"
        : "Producto marcado como bajado"
    );

  } catch (error) {
    console.error(error);

    product.warehouseStatus =
      oldStatus;

    product.transferFrom =
      oldTransfer;

    refreshOpenOrder();

    showToast(
      `Error: ${error.message}`
    );
  }
}


// ==========================================================
// NO HAY EN ESTA SUCURSAL
// ==========================================================

async function markProductMissing(
  productId
) {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  if (
    !order.assemblyLocation ||
    order.assemblyLocation ===
      "sin-asignar"
  ) {
    showToast(
      "Primero asigna Las Condes o Patronato"
    );

    return;
  }

  const product =
    order.products.find(
      item =>
        item.id ===
        productId
    );

  if (!product) {
    return;
  }

  const oldStatus =
    product.warehouseStatus;

  const oldTransfer =
    product.transferFrom;

  const transferFrom =
    order.assemblyLocation ===
      "patronato"
      ? "las-condes"
      : "patronato";

  product.warehouseStatus =
    "traslado";

  product.transferFrom =
    transferFrom;

  try {
    await saveRemoteProductState(
      order,
      product
    );

    await addRemoteHistory(
      order,
      `Producto solicitado desde ${getAssemblyLocationLabel(
        transferFrom
      )}: ${product.name}`
    );

    refreshOpenOrder();

    showToast(
      `Solicitado desde ${getAssemblyLocationLabel(
        transferFrom
      )}`
    );

  } catch (error) {
    console.error(error);

    product.warehouseStatus =
      oldStatus;

    product.transferFrom =
      oldTransfer;

    refreshOpenOrder();

    showToast(
      `Error: ${error.message}`
    );
  }
}


// ==========================================================
// DESHACER ESTADO PRODUCTO
// ==========================================================

async function resetProductWarehouseStatus(
  productId
) {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  const product =
    order.products.find(
      item =>
        item.id ===
        productId
    );

  if (!product) {
    return;
  }

  const oldStatus =
    product.warehouseStatus;

  const oldTransfer =
    product.transferFrom;

  product.warehouseStatus =
    "pendiente";

  product.transferFrom =
    null;

  try {
    await saveRemoteProductState(
      order,
      product
    );

    await addRemoteHistory(
      order,
      `Estado de producto restablecido: ${product.name}`
    );

    refreshOpenOrder();

    showToast(
      "Estado del producto restablecido"
    );

  } catch (error) {
    console.error(error);

    product.warehouseStatus =
      oldStatus;

    product.transferFrom =
      oldTransfer;

    refreshOpenOrder();

    showToast(
      `Error: ${error.message}`
    );
  }
}


// ==========================================================
// INCIDENCIA PRODUCTO
// ==========================================================

function renderProductIncident(
  order,
  product
) {
  const incident =
    order.incidents?.find(
      item =>
        item.productId ===
          product.id &&
        item.status ===
          "pendiente"
    );

  if (incident) {
    return `
      <div
        class="product-incident active"
      >

        <div
          class="incident-header"
        >
          <strong>
            ⚠ Reemplazo pendiente
          </strong>
        </div>

        <div
          class="incident-details"
        >

          <span>
            ${escapeHtml(
              incident.reason
            )}
          </span>

          <span>
            Cantidad:

            <strong>
              ${incident.quantity}
            </strong>
          </span>

        </div>

        <span
          class="incident-time"
        >
          Reportado:
          ${escapeHtml(
            formatStoredDate(
              incident.createdAt
            )
          )}
        </span>

        <button
          type="button"
          class="incident-resolve-button"
          data-product-id="${product.id}"
        >
          ✓ Marcar como reemplazado
        </button>

      </div>
    `;
  }


  const resolvedIncident =
    order.incidents
      ?.slice()
      .reverse()
      .find(
        item =>
          item.productId ===
            product.id &&
          item.status ===
            "resuelto"
      );


  return `
    ${
      resolvedIncident
        ? `
          <div
            class="product-incident resolved"
          >
            ✓ Último reemplazo completado
            · ${resolvedIncident.quantity}

            ${
              resolvedIncident.quantity ===
              1
                ? "unidad"
                : "unidades"
            }
          </div>
        `
        : ""
    }

    <button
      type="button"
      class="incident-report-button"
      data-product-id="${product.id}"
    >
      ⚠ Reportar incidencia
    </button>
  `;
}


// ==========================================================
// ABRIR MODAL INCIDENCIA
// ==========================================================

function reportProductIncident(
  productId
) {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  const product =
    order.products.find(
      item =>
        item.id ===
        productId
    );

  if (!product) {
    return;
  }

  const existingIncident =
    order.incidents?.find(
      item =>
        item.productId ===
          productId &&
        item.status ===
          "pendiente"
    );

  if (
    existingIncident
  ) {
    showToast(
      "Este producto ya tiene una incidencia pendiente"
    );

    return;
  }

  incidentProductId =
    product.id;

  incidentReason =
    null;

  incidentQuantity =
    1;

  incidentMaxQuantity =
    product.quantity;

  incidentProductName.textContent =
    product.code
      ? `${product.name} · Código ${product.code}`
      : product.name;

  incidentQuantityValue.textContent =
    "1";

  incidentQuantityAvailable.textContent =
    `Cantidad disponible en el pedido: ${product.quantity}`;

  incidentQuantitySection.hidden =
    true;

  incidentReasonButtons.forEach(
    button => {
      button.classList.remove(
        "selected"
      );
    }
  );

  incidentModal.classList.add(
    "is-open"
  );

  incidentModal.setAttribute(
    "aria-hidden",
    "false"
  );
}


// ==========================================================
// MOTIVO INCIDENCIA
// ==========================================================

function selectIncidentReason(
  reason,
  button
) {
  incidentReason =
    reason;

  incidentReasonButtons.forEach(
    item => {
      item.classList.remove(
        "selected"
      );
    }
  );

  button.classList.add(
    "selected"
  );

  incidentQuantity =
    1;

  incidentQuantitySection.hidden =
    false;

  updateIncidentQuantity();
}


// ==========================================================
// CANTIDAD INCIDENCIA
// ==========================================================

function updateIncidentQuantity() {
  if (
    incidentQuantity <
    1
  ) {
    incidentQuantity =
      1;
  }

  if (
    incidentQuantity >
    incidentMaxQuantity
  ) {
    incidentQuantity =
      incidentMaxQuantity;
  }

  incidentQuantityValue.textContent =
    incidentQuantity;

  incidentQuantityMinus.disabled =
    incidentQuantity <=
    1;

  incidentQuantityPlus.disabled =
    incidentQuantity >=
    incidentMaxQuantity;
}


// ==========================================================
// CREAR INCIDENCIA EN D1
// ==========================================================

async function confirmProductIncident() {
  const order =
    getSelectedOrder();

  if (
    !order ||
    !incidentProductId
  ) {
    return;
  }

  if (
    !incidentReason
  ) {
    showToast(
      "Selecciona Dañado o Quebrado"
    );

    return;
  }

  const product =
    order.products.find(
      item =>
        item.id ===
        incidentProductId
    );

  if (!product) {
    return;
  }

  incidentConfirmButton.disabled =
    true;

  try {
    const data =
      await apiRequest(
        `/api/orders/${encodeURIComponent(
          order.number
        )}/incidents`,
        {
          method:
            "POST",

          body:
            JSON.stringify({
              productId:
                product.id,

              productName:
                product.name,

              productCode:
                product.code ||
                "",

              reason:
                incidentReason,

              quantity:
                incidentQuantity
            })
        }
      );

    order.incidents.push(
      data.incident
    );

    await addRemoteHistory(
      order,
      `Incidencia: ${incidentReason} · ${product.name} · x${incidentQuantity}`
    );

    closeIncidentModal();

    refreshOpenOrder();

    showToast(
      "Incidencia reportada"
    );

  } catch (error) {
    console.error(error);

    showToast(
      `Error: ${error.message}`
    );

  } finally {
    incidentConfirmButton.disabled =
      false;
  }
}


// ==========================================================
// CERRAR MODAL INCIDENCIA
// ==========================================================

function closeIncidentModal() {
  if (
    !incidentModal
  ) {
    return;
  }

  incidentModal.classList.remove(
    "is-open"
  );

  incidentModal.setAttribute(
    "aria-hidden",
    "true"
  );

  incidentProductId =
    null;

  incidentReason =
    null;

  incidentQuantity =
    1;

  incidentMaxQuantity =
    1;

  incidentQuantitySection.hidden =
    true;

  incidentReasonButtons.forEach(
    button => {
      button.classList.remove(
        "selected"
      );
    }
  );
}


// ==========================================================
// RESOLVER INCIDENCIA EN D1
// ==========================================================

async function resolveProductIncident(
  productId
) {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  const incident =
    order.incidents?.find(
      item =>
        item.productId ===
          productId &&
        item.status ===
          "pendiente"
    );

  if (!incident) {
    return;
  }

  const confirmed =
    confirm(
      `¿Confirmas que el producto fue reemplazado?\n\n` +
      `${incident.productName}\n` +
      `Cantidad: ${incident.quantity}`
    );

  if (!confirmed) {
    return;
  }

  try {
    const data =
      await apiRequest(
        `/api/incidents/${encodeURIComponent(
          incident.id
        )}/resolve`,
        {
          method:
            "PUT",

          body:
            JSON.stringify({})
        }
      );

    incident.status =
      "resuelto";

    incident.resolvedAt =
      data.incident
        ?.resolvedAt ||
      new Date()
        .toISOString();

    await addRemoteHistory(
      order,
      `Producto reemplazado: ${incident.productName} · x${incident.quantity}`
    );

    refreshOpenOrder();

    showToast(
      "Reemplazo completado"
    );

  } catch (error) {
    console.error(error);

    showToast(
      `Error: ${error.message}`
    );
  }
}


// ==========================================================
// INCIDENCIAS
// ==========================================================

function getPendingIncidentCount(
  order
) {
  return (
    order.incidents?.filter(
      incident =>
        incident.status ===
        "pendiente"
    ).length ||
    0
  );
}


function hasPendingIncidents(
  order
) {
  return (
    getPendingIncidentCount(
      order
    ) > 0
  );
}


// ==========================================================
// VISOR IMAGEN
// ==========================================================

function openImageViewer(
  image,
  productName
) {
  if (
    !imageViewer ||
    !imageViewerImg
  ) {
    return;
  }

  imageViewerImg.src =
    image;

  imageViewerImg.alt =
    productName ||
    "Producto";

  imageViewer.classList.remove(
    "hidden"
  );
}


function closeImageViewer() {
  if (
    !imageViewer ||
    !imageViewerImg
  ) {
    return;
  }

  imageViewer.classList.add(
    "hidden"
  );

  imageViewerImg.src =
    "";
}


// ==========================================================
// HISTORIAL
// ==========================================================

function renderHistory(
  order
) {
  if (
    !order.history ||
    order.history.length ===
      0
  ) {
    historyList.innerHTML = `
      <div
        class="history-item"
      >
        Sin movimientos registrados.
      </div>
    `;

    return;
  }

  historyList.innerHTML =
    order.history
      .slice()
      .reverse()
      .map(
        item => `
          <div
            class="history-item"
          >

            ${escapeHtml(
              item.text
            )}

            <span
              class="history-time"
            >
              ${escapeHtml(
                formatStoredDate(
                  item.time
                )
              )}
            </span>

          </div>
        `
      )
      .join("");
}


// ==========================================================
// ESTADO GENERAL
// ==========================================================

function updateModalButtons(
  order
) {
  if (
    order.status ===
    "enviado"
  ) {
    nextStatusButton.textContent =
      "Pedido ya enviado";

    nextStatusButton.disabled =
      true;

    nextStatusButton.style.opacity =
      "0.5";

  } else {
    nextStatusButton.disabled =
      false;

    nextStatusButton.style.opacity =
      "1";

    if (
      order.status ===
      "problema"
    ) {
      nextStatusButton.textContent =
        "Resolver problema";
    } else {
      nextStatusButton.textContent =
        getNextButtonLabel(
          order.status
        );
    }
  }

  if (
    order.status ===
    "problema"
  ) {
    problemButton.textContent =
      "✓ Problema registrado";

    problemButton.disabled =
      true;

    problemButton.style.opacity =
      "0.5";

  } else {
    problemButton.textContent =
      "⚠ Reportar incidencia";

    problemButton.disabled =
      false;

    problemButton.style.opacity =
      "1";
  }
}


// ==========================================================
// AVANZAR PEDIDO
// ==========================================================

async function advanceSelectedOrder() {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  if (
    hasPendingIncidents(
      order
    )
  ) {
    showToast(
      "El pedido tiene incidencias pendientes"
    );

    return;
  }

  if (
    order.status ===
    "problema"
  ) {
    const oldStatus =
      order.status;

    const oldPrevious =
      order.previousStatus;

    order.status =
      order.previousStatus ||
      "pendiente";

    order.previousStatus =
      null;

    try {
      await saveRemoteOrderState(
        order
      );

      await addRemoteHistory(
        order,
        "Problema resuelto"
      );

      refreshOpenOrder();

      showToast(
        "Problema resuelto"
      );

    } catch (error) {
      order.status =
        oldStatus;

      order.previousStatus =
        oldPrevious;

      refreshOpenOrder();

      showToast(
        `Error: ${error.message}`
      );
    }

    return;
  }


  const nextStatusMap = {
    pendiente:
      "bodega",

    bodega:
      "armando",

    armando:
      "enviado"
  };


  const nextStatus =
    nextStatusMap[
      order.status
    ];

  if (!nextStatus) {
    return;
  }

  const oldStatus =
    order.status;

  order.status =
    nextStatus;

  nextStatusButton.disabled =
    true;

  try {
    await saveRemoteOrderState(
      order
    );

    await addRemoteHistory(
      order,
      getHistoryText(
        nextStatus
      )
    );

    refreshOpenOrder();

    showToast(
      `Pedido actualizado: ${getStatusLabel(
        nextStatus
      )}`
    );

  } catch (error) {
    console.error(error);

    order.status =
      oldStatus;

    refreshOpenOrder();

    showToast(
      `Error: ${error.message}`
    );

  } finally {
    nextStatusButton.disabled =
      false;
  }
}


// ==========================================================
// PROBLEMA GENERAL
// ==========================================================

async function markProblem() {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  if (
    order.status ===
      "problema" ||
    order.status ===
      "enviado"
  ) {
    return;
  }

  const oldStatus =
    order.status;

  order.previousStatus =
    oldStatus;

  order.status =
    "problema";

  try {
    await saveRemoteOrderState(
      order
    );

    await addRemoteHistory(
      order,
      "Problema general reportado"
    );

    refreshOpenOrder();

    showToast(
      "Problema registrado"
    );

  } catch (error) {
    order.status =
      oldStatus;

    order.previousStatus =
      null;

    refreshOpenOrder();

    showToast(
      `Error: ${error.message}`
    );
  }
}


// ==========================================================
// NOTAS
// ==========================================================

async function saveNotes() {
  const order =
    getSelectedOrder();

  if (!order) {
    return;
  }

  const oldNotes =
    order.notes;

  const newNotes =
    orderNotesInput
      .value
      .trim();

  order.notes =
    newNotes;

  saveNotesButton.disabled =
    true;

  try {
    await saveRemoteOrderState(
      order
    );

    await addRemoteHistory(
      order,
      newNotes
        ? "Observación actualizada"
        : "Observación eliminada"
    );

    renderHistory(
      order
    );

    render();

    showToast(
      "Observación guardada"
    );

  } catch (error) {
    order.notes =
      oldNotes;

    orderNotesInput.value =
      oldNotes;

    showToast(
      `Error: ${error.message}`
    );

  } finally {
    saveNotesButton.disabled =
      false;
  }
}


// ==========================================================
// HELPERS
// ==========================================================

function refreshOpenOrder() {
  const orderId =
    selectedOrderId;

  render();

  if (
    orderId !==
    null
  ) {
    openOrder(
      orderId
    );
  }
}


function getSelectedOrder() {
  return orders.find(
    order =>
      order.id ===
      selectedOrderId
  );
}


function getStatusLabel(
  status
) {
  const labels = {
    pendiente:
      "Pendiente",

    bodega:
      "Bodega",

    armando:
      "Armando",

    enviado:
      "Enviado",

    problema:
      "Problema"
  };

  return (
    labels[status] ||
    status
  );
}


function getNextButtonLabel(
  status
) {
  const labels = {
    pendiente:
      "Marcar como bajado de bodega",

    bodega:
      "Marcar como armado",

    armando:
      "Marcar como enviado"
  };

  return (
    labels[status] ||
    "Avanzar pedido"
  );
}


function getHistoryText(
  status
) {
  const labels = {
    bodega:
      "Pedido bajado de bodega",

    armando:
      "Pedido en preparación",

    enviado:
      "Pedido enviado"
  };

  return (
    labels[status] ||
    "Estado actualizado"
  );
}


function getCurrentDateTime() {
  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit"
    }
  ).format(
    new Date()
  );
}


function formatShopifyDate(
  dateString
) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit"
    }
  ).format(
    new Date(
      dateString
    )
  );
}


function formatStoredDate(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(
      value
    );
  }

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit"
    }
  ).format(
    date
  );
}


function showToast(
  message
) {
  toastMessage.textContent =
    message;

  toast.classList.remove(
    "hidden"
  );

  clearTimeout(
    showToast.timeout
  );

  showToast.timeout =
    setTimeout(
      () => {
        toast.classList.add(
          "hidden"
        );
      },
      2500
    );
}


function showLoadingState() {
  ordersGrid.innerHTML = `
    <div
      style="
        grid-column:1 / -1;
        padding:50px;
        text-align:center;
        color:#64748b;
      "
    >
      Cargando pedidos de Shopify...
    </div>
  `;
}


function escapeHtml(
  value = ""
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


// ==========================================================
// FILTROS ZONA
// ==========================================================

document
  .querySelectorAll(
    ".filter-button"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(
            ".filter-button"
          )
          .forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

        button.classList.add(
          "active"
        );

        activeZone =
          button.dataset.zone;

        renderOrders();
      }
    );
  });


// ==========================================================
// FILTROS ESTADO
// ==========================================================

document
  .querySelectorAll(
    ".status-filter"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(
            ".status-filter"
          )
          .forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

        button.classList.add(
          "active"
        );

        activeStatus =
          button.dataset.status;

        renderOrders();
      }
    );
  });


// ==========================================================
// FILTRO LUGAR DE ARMADO
// ==========================================================

document
  .querySelectorAll(
    ".location-filter"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(
            ".location-filter"
          )
          .forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

        button.classList.add(
          "active"
        );

        activeLocation =
          button.dataset.location;

        renderOrders();
      }
    );
  });


// ==========================================================
// BUSCADOR
// ==========================================================

searchOrder.addEventListener(
  "input",
  event => {
    searchTerm =
      event.target
        .value
        .trim();

    renderOrders();
  }
);


// ==========================================================
// CERRAR PEDIDO
// ==========================================================

closeModalButton.addEventListener(
  "click",
  closeModal
);


closeModalXButton.addEventListener(
  "click",
  closeModal
);


modal.addEventListener(
  "click",
  event => {
    if (
      event.target ===
      modal
    ) {
      closeModal();
    }
  }
);


// ==========================================================
// ESCAPE
// ==========================================================

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key ===
        "Escape" &&
      incidentModal &&
      incidentModal.classList.contains(
        "is-open"
      )
    ) {
      closeIncidentModal();

      return;
    }

    if (
      event.key ===
        "Escape" &&
      imageViewer &&
      !imageViewer.classList.contains(
        "hidden"
      )
    ) {
      closeImageViewer();

      return;
    }

    if (
      event.key ===
        "Escape" &&
      !modal.classList.contains(
        "hidden"
      )
    ) {
      closeModal();
    }
  }
);


// ==========================================================
// BOTONES GENERALES
// ==========================================================

nextStatusButton.addEventListener(
  "click",
  advanceSelectedOrder
);


problemButton.addEventListener(
  "click",
  markProblem
);


saveNotesButton.addEventListener(
  "click",
  saveNotes
);


// ==========================================================
// OCULTAR DEMO
// ==========================================================

if (
  resetDemoButton
) {
  resetDemoButton.style.display =
    "none";
}


// ==========================================================
// VISOR IMAGEN
// ==========================================================

if (
  closeImageViewerButton
) {
  closeImageViewerButton.addEventListener(
    "click",
    closeImageViewer
  );
}


if (
  imageViewer
) {
  imageViewer.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        imageViewer
      ) {
        closeImageViewer();
      }
    }
  );
}


// ==========================================================
// MODAL INCIDENCIA
// ==========================================================

incidentReasonButtons.forEach(
  button => {
    button.addEventListener(
      "click",
      () => {
        selectIncidentReason(
          button.dataset.reason,
          button
        );
      }
    );
  }
);


incidentQuantityMinus.addEventListener(
  "click",
  () => {
    incidentQuantity--;

    updateIncidentQuantity();
  }
);


incidentQuantityPlus.addEventListener(
  "click",
  () => {
    incidentQuantity++;

    updateIncidentQuantity();
  }
);


incidentConfirmButton.addEventListener(
  "click",
  confirmProductIncident
);


incidentModalClose.addEventListener(
  "click",
  closeIncidentModal
);


incidentCancelButton.addEventListener(
  "click",
  closeIncidentModal
);


incidentModalBackdrop.addEventListener(
  "click",
  closeIncidentModal
);


// ==========================================================
// LUGAR DE ARMADO
// ==========================================================

assemblyLocationSelect.addEventListener(
  "change",
  changeAssemblyLocation
);


// ==========================================================
// EJECUTAR
// ==========================================================

init();
