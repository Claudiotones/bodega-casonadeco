const STORAGE_KEY = "casona_deco_order_states_v2";

let orders = [];
let selectedOrderId = null;

let activeZone = "todos";
let activeStatus = "todos";
let searchTerm = "";

const ordersGrid = document.getElementById("orders-grid");
const emptyState = document.getElementById("empty-state");

const statPendiente = document.getElementById("stat-pendiente");
const statBodega = document.getElementById("stat-bodega");
const statArmando = document.getElementById("stat-armando");
const statEnviado = document.getElementById("stat-enviado");

const searchOrder = document.getElementById("search-order");

const modal = document.getElementById("order-modal");
const closeModalButton = document.getElementById("close-modal");
const closeModalXButton = document.getElementById("close-modal-x");

const modalOrderNumber = document.getElementById("modal-order-number");
const modalZone = document.getElementById("modal-zone");
const modalOrderDate = document.getElementById("modal-order-date");

const progressSteps = document.getElementById("progress-steps");
const modalProductCount = document.getElementById("modal-product-count");
const modalProducts = document.getElementById("modal-products");

const orderNotesInput = document.getElementById("order-notes-input");
const saveNotesButton = document.getElementById("save-notes");

const historyList = document.getElementById("history-list");

const problemButton = document.getElementById("problem-button");
const nextStatusButton = document.getElementById("next-status-button");

const resetDemoButton = document.getElementById("reset-demo");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

const imageViewer = document.getElementById("image-viewer");
const imageViewerImg = document.getElementById("image-viewer-img");
const closeImageViewerButton = document.getElementById("close-image-viewer");


// ==========================================================
// INICIO
// ==========================================================

async function init() {
  try {
    showLoadingState();

    const response = await fetch("/api/orders", {
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.detail ||
        data.error ||
        "No se pudieron cargar los pedidos."
      );
    }

    orders = data.orders
      .filter(order => {
        return (
          order.financialStatus === "PAID" &&
          order.fulfillmentStatus !== "FULFILLED"
        );
      })
      .map(shopifyOrderToLocalOrder);

    applySavedStates();

    render();
  } catch (error) {
    console.error(error);

    ordersGrid.innerHTML = `
      <div style="
        grid-column: 1 / -1;
        padding: 30px;
        background: white;
        border-radius: 16px;
        border: 1px solid #e5e1da;
      ">
        <strong>No se pudieron cargar los pedidos.</strong>
        <p style="margin-bottom:0;">
          ${escapeHtml(error.message)}
        </p>
      </div>
    `;
  }
}


// ==========================================================
// SHOPIFY → FORMATO DEL PANEL
// ==========================================================

function shopifyOrderToLocalOrder(order) {
  const shippingMethod =
    order.shipping?.methods?.[0] || "";

  const zone = classifyZone(
    shippingMethod,
    order.shipping
  );

  return {
    id: order.id,
    number: order.number,

    date: formatShopifyDate(order.createdAt),

    status: "pendiente",

    previousStatus: null,

    zone,

    shipping:
      shippingMethod || "Sin método de envío",

    shippingDetails: {
      city: order.shipping?.city || "",
      province: order.shipping?.province || "",
      provinceCode:
        order.shipping?.provinceCode || "",
      country: order.shipping?.country || ""
    },

    notes: "",

    products: order.products.map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      code: product.code || "",
      sku: product.sku || "",
      variant: product.variant || "",
      image: product.image || ""
    })),

    history: [
      {
        text: "Pedido recibido desde Shopify",
        time: formatShopifyDate(order.createdAt)
      }
    ]
  };
}


// ==========================================================
// CLASIFICAR SANTIAGO / REGIONES
// ==========================================================

function classifyZone(shippingMethod, shipping) {
  const method =
    String(shippingMethod || "").toLowerCase();

  if (method.includes("santiago")) {
    return "santiago";
  }

  return "regiones";
}


// ==========================================================
// ESTADOS LOCALES
// ==========================================================

function getSavedStates() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function applySavedStates() {
  const savedStates = getSavedStates();

  orders = orders.map(order => {
    const saved = savedStates[order.number];

    if (!saved) {
      return order;
    }

    return {
      ...order,
      status: saved.status || order.status,
      previousStatus:
        saved.previousStatus || null,
      notes:
        typeof saved.notes === "string"
          ? saved.notes
          : order.notes,
      history:
        Array.isArray(saved.history)
          ? saved.history
          : order.history
    };
  });
}

function saveOrderStates() {
  const states = {};

  orders.forEach(order => {
    states[order.number] = {
      status: order.status,
      previousStatus:
        order.previousStatus || null,
      notes: order.notes || "",
      history: order.history || []
    };
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(states)
  );
}


// ==========================================================
// RENDER
// ==========================================================

function render() {
  renderStats();
  renderOrders();
}

function renderStats() {
  statPendiente.textContent = orders.filter(
    order => order.status === "pendiente"
  ).length;

  statBodega.textContent = orders.filter(
    order => order.status === "bodega"
  ).length;

  statArmando.textContent = orders.filter(
    order => order.status === "armando"
  ).length;

  statEnviado.textContent = orders.filter(
    order => order.status === "enviado"
  ).length;
}

function renderOrders() {
  const filteredOrders = orders.filter(order => {
    const matchesZone =
      activeZone === "todos" ||
      (
        activeZone === "problema"
          ? order.status === "problema"
          : order.zone === activeZone
      );

    const matchesStatus =
      activeStatus === "todos" ||
      order.status === activeStatus;

    const matchesSearch =
      order.number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.products.some(product =>
        product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

    return (
      matchesZone &&
      matchesStatus &&
      matchesSearch
    );
  });

  ordersGrid.innerHTML = "";

  if (filteredOrders.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filteredOrders.forEach(order => {
    const card = createOrderCard(order);
    ordersGrid.appendChild(card);
  });
}

function createOrderCard(order) {
  const article = document.createElement("article");

  article.className = "order-card";

  const visibleProducts =
    order.products.slice(0, 3);

  const totalUnits =
    order.products.reduce(
      (sum, product) =>
        sum + product.quantity,
      0
    );

  article.innerHTML = `
    <div class="order-card-inner">

      <div class="order-card-top">

        <div>
          <h3 class="order-number">
            ${escapeHtml(order.number)}
          </h3>

          <p class="order-date">
            ${escapeHtml(order.date)}
          </p>
        </div>

        <span class="zone-badge ${
          order.zone === "santiago"
            ? "zone-santiago"
            : "zone-regiones"
        }">
          ${
            order.zone === "santiago"
              ? "Santiago"
              : "Regiones"
          }
        </span>

      </div>

      <div class="order-card-products">

        <div class="order-thumb-group">

          ${visibleProducts.map(product => {
            if (!product.image) {
              return "";
            }

            return `
              <img
                class="order-thumb"
                src="${product.image}"
                alt="${escapeHtml(product.name)}"
              >
            `;
          }).join("")}

        </div>

        <div class="order-product-summary">
          ${order.products.length}
          ${
            order.products.length === 1
              ? "producto"
              : "productos"
          }
          ·
          ${totalUnits}
          ${
            totalUnits === 1
              ? "unidad"
              : "unidades"
          }
        </div>

      </div>

      <div class="order-status-row">

        <span class="status-badge status-${order.status}">
          <span class="status-dot"></span>
          ${getStatusLabel(order.status)}
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
    openOrder(order.id);
  }
);

return article;
}


// ==========================================================
// DETALLE DEL PEDIDO
// ==========================================================

function openOrder(orderId) {
  selectedOrderId = orderId;

  const order = getSelectedOrder();

  if (!order) return;

  modalOrderNumber.textContent =
    order.number;

  modalOrderDate.textContent =
    `${order.date} · ${order.shipping}`;

  modalZone.textContent =
    order.zone === "santiago"
      ? "Santiago"
      : "Regiones";

  modalZone.className =
    "zone-badge " +
    (
      order.zone === "santiago"
        ? "zone-santiago"
        : "zone-regiones"
    );

  orderNotesInput.value =
    order.notes || "";

  renderProgress(order);
  renderProducts(order);
  renderHistory(order);
  updateModalButtons(order);

  modal.classList.remove("hidden");

  document.body.style.overflow =
    "hidden";
}

function closeModal() {
  modal.classList.add("hidden");

  document.body.style.overflow = "";

  selectedOrderId = null;
}


// ==========================================================
// PROGRESO
// ==========================================================

function renderProgress(order) {
  const statuses = [
    {
      key: "pendiente",
      label: "Pedido recibido"
    },
    {
      key: "bodega",
      label: "Bajado de bodega"
    },
    {
      key: "armando",
      label: "Pedido armado"
    },
    {
      key: "enviado",
      label: "Pedido enviado"
    }
  ];

  let comparisonStatus =
    order.status;

  if (order.status === "problema") {
    comparisonStatus =
      order.previousStatus ||
      "pendiente";
  }

  const currentIndex =
    statuses.findIndex(
      status =>
        status.key === comparisonStatus
    );

  progressSteps.innerHTML =
    statuses.map(
      (status, index) => {
        let className =
          "progress-step";

        if (index < currentIndex) {
          className += " completed";
        }

        if (index === currentIndex) {
          className += " current";
        }

        if (
          order.status === "enviado" &&
          index === currentIndex
        ) {
          className =
            "progress-step completed";
        }

        return `
          <div class="${className}">

            <span class="progress-step-number">
              ${
                index < currentIndex ||
                order.status === "enviado"
                  ? "✓"
                  : index + 1
              }
            </span>

            <span class="progress-step-label">
              ${status.label}
            </span>

          </div>
        `;
      }
    ).join("");
}


// ==========================================================
// PRODUCTOS
// ==========================================================

function renderProducts(order) {
  const totalUnits =
    order.products.reduce(
      (sum, product) =>
        sum + product.quantity,
      0
    );

  modalProductCount.textContent =
    `${order.products.length} productos · ${totalUnits} unidades`;

  modalProducts.innerHTML =
    order.products.map(
      product => `
        <article class="product-item">

          ${
            product.image
              ? `
                <button
                  type="button"
                  class="product-image-wrapper product-image-button"
                  data-image="${product.image}"
                  data-product="${escapeHtml(product.name)}"
                >
                  <img
                    class="product-image"
                    src="${product.image}"
                    alt="${escapeHtml(product.name)}"
                  >
                </button>
              `
              : `
                <div class="product-image-wrapper">
                  <div style="
                    width:100%;
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#888;
                    font-size:12px;
                    text-align:center;
                    padding:8px;
                  ">
                    Sin imagen
                  </div>
                </div>
              `
          }

          <div class="product-info">

            <h4 class="product-name">
              ${escapeHtml(product.name)}
            </h4>

            ${
              product.variant
                ? `
                  <p class="product-meta">
                    Variante:
                    ${escapeHtml(product.variant)}
                  </p>
                `
                : ""
            }

                        ${
              product.code
                ? `
                  <p class="product-meta">
                    <strong>Código:</strong>
                    ${escapeHtml(product.code)}
                  </p>
                `
                : ""
            }

            ${
              product.sku
                ? `
                  <p class="product-meta">
                    SKU:
                    ${escapeHtml(product.sku)}
                  </p>
                `
                : ""
            }

            <span class="product-quantity">
            <span class="product-quantity">
              Cantidad:
              ${product.quantity}
            </span>

          </div>

        </article>
      `
    ).join("");

  modalProducts
    .querySelectorAll(
      ".product-image-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          openImageViewer(
            button.dataset.image,
            button.dataset.product
          );
        }
      );
    });
}


// ==========================================================
// VISOR DE IMAGEN
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

  imageViewerImg.src = image;

  imageViewerImg.alt =
    productName || "Producto";

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

  imageViewerImg.src = "";
}


// ==========================================================
// HISTORIAL
// ==========================================================

function renderHistory(order) {
  if (
    !order.history ||
    order.history.length === 0
  ) {
    historyList.innerHTML = `
      <div class="history-item">
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
          <div class="history-item">

            ${escapeHtml(item.text)}

            <span class="history-time">
              ${escapeHtml(item.time)}
            </span>

          </div>
        `
      )
      .join("");
}


// ==========================================================
// BOTONES DE ESTADO
// ==========================================================

function updateModalButtons(order) {
  if (order.status === "enviado") {
    nextStatusButton.textContent =
      "Pedido ya enviado";

    nextStatusButton.disabled = true;

    nextStatusButton.style.opacity =
      "0.5";
  } else {
    nextStatusButton.disabled = false;

    nextStatusButton.style.opacity =
      "1";

    if (order.status === "problema") {
      nextStatusButton.textContent =
        "Resolver problema";
    } else {
      nextStatusButton.textContent =
        getNextButtonLabel(
          order.status
        );
    }
  }

  if (order.status === "problema") {
    problemButton.textContent =
      "✓ Problema registrado";

    problemButton.disabled = true;

    problemButton.style.opacity =
      "0.5";
  } else {
    problemButton.textContent =
      "⚠ Marcar problema";

    problemButton.disabled = false;

    problemButton.style.opacity =
      "1";
  }
}

function advanceSelectedOrder() {
  const order =
    getSelectedOrder();

  if (!order) return;

  if (order.status === "problema") {
    order.status =
      order.previousStatus ||
      "pendiente";

    order.history.push({
      text: "Problema resuelto",
      time: getCurrentDateTime()
    });

    order.previousStatus = null;

    saveOrderStates();

    refreshOpenOrder();

    showToast(
      "Problema resuelto"
    );

    return;
  }

  const nextStatusMap = {
    pendiente: "bodega",
    bodega: "armando",
    armando: "enviado"
  };

  const nextStatus =
    nextStatusMap[order.status];

  if (!nextStatus) return;

  order.status = nextStatus;

  order.history.push({
    text:
      getHistoryText(nextStatus),

    time:
      getCurrentDateTime()
  });

  saveOrderStates();

  refreshOpenOrder();

  showToast(
    `Pedido actualizado: ${getStatusLabel(nextStatus)}`
  );
}

function markProblem() {
  const order =
    getSelectedOrder();

  if (!order) return;

  if (order.status === "problema") {
    return;
  }

  if (order.status === "enviado") {
    showToast(
      "Un pedido enviado no puede marcarse como problema"
    );

    return;
  }

  order.previousStatus =
    order.status;

  order.status =
    "problema";

  order.history.push({
    text: "Problema reportado",
    time: getCurrentDateTime()
  });

  saveOrderStates();

  refreshOpenOrder();

  showToast(
    "Problema registrado"
  );
}


// ==========================================================
// OBSERVACIONES
// ==========================================================

function saveNotes() {
  const order =
    getSelectedOrder();

  if (!order) return;

  order.notes =
    orderNotesInput.value.trim();

  order.history.push({
    text:
      order.notes
        ? "Observación actualizada"
        : "Observación eliminada",

    time:
      getCurrentDateTime()
  });

  saveOrderStates();

  renderHistory(order);
  render();

  showToast(
    "Observación guardada"
  );
}


// ==========================================================
// HELPERS
// ==========================================================

function refreshOpenOrder() {
  const orderId =
    selectedOrderId;

  render();

  if (orderId !== null) {
    openOrder(orderId);
  }
}

function getSelectedOrder() {
  return orders.find(
    order =>
      order.id === selectedOrderId
  );
}

function getStatusLabel(status) {
  const labels = {
    pendiente: "Pendiente",
    bodega: "Bodega",
    armando: "Armando",
    enviado: "Enviado",
    problema: "Problema"
  };

  return labels[status] || status;
}

function getNextButtonLabel(status) {
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

function getHistoryText(status) {
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
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(new Date());
}

function formatShopifyDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date =
    new Date(dateString);

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);
}

function showToast(message) {
  toastMessage.textContent =
    message;

  toast.classList.remove(
    "hidden"
  );

  clearTimeout(
    showToast.timeout
  );

  showToast.timeout =
    setTimeout(() => {
      toast.classList.add(
        "hidden"
      );
    }, 2300);
}

function showLoadingState() {
  ordersGrid.innerHTML = `
    <div style="
      grid-column: 1 / -1;
      padding: 50px;
      text-align: center;
      color: #78716a;
    ">
      Cargando pedidos de Shopify...
    </div>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ==========================================================
// EVENTOS
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
          .forEach(item =>
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
          .forEach(item =>
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

searchOrder.addEventListener(
  "input",
  event => {
    searchTerm =
      event.target.value.trim();

    renderOrders();
  }
);

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
    if (event.target === modal) {
      closeModal();
    }
  }
);

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      imageViewer &&
      !imageViewer.classList.contains(
        "hidden"
      )
    ) {
      closeImageViewer();
      return;
    }

    if (
      event.key === "Escape" &&
      !modal.classList.contains(
        "hidden"
      )
    ) {
      closeModal();
    }
  }
);

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

if (resetDemoButton) {
  resetDemoButton.style.display =
    "none";
}

if (closeImageViewerButton) {
  closeImageViewerButton.addEventListener(
    "click",
    closeImageViewer
  );
}

if (imageViewer) {
  imageViewer.addEventListener(
    "click",
    event => {
      if (
        event.target === imageViewer
      ) {
        closeImageViewer();
      }
    }
  );
}


// ==========================================================
// EJECUTAR
// ==========================================================

init();
