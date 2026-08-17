const STORAGE_KEY = "casona_deco_orders_demo_v1";

const demoOrders = [
  {
    id: 7028,
    number: "#7028",
    zone: "santiago",
    date: "15 ago 2026 · 12:27",
    status: "pendiente",
    shipping: "Envío Express Santiago",
    notes: "",
    products: [
      {
        name: "Casa porta bolsitas de té de cerámica",
        quantity: 1,
        variant: "",
        image:
          "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Adorno Percha Pez Espada de hierro",
        quantity: 1,
        variant: "",
        image:
          "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&w=800&q=80"
      }
    ],
    history: [
      {
        text: "Pedido recibido",
        time: "15 ago 2026 · 12:27"
      }
    ]
  },

  {
    id: 7029,
    number: "#7029",
    zone: "regiones",
    date: "15 ago 2026 · 12:40",
    status: "bodega",
    shipping: "Chilexpress Regiones",
    notes: "",
    products: [
      {
        name: "Florero de vidrio ámbar",
        quantity: 2,
        variant: "",
        image:
          "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Canasto decorativo",
        quantity: 1,
        variant: "Grande",
        image:
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
      }
    ],
    history: [
      {
        text: "Pedido recibido",
        time: "15 ago 2026 · 12:40"
      },
      {
        text: "Pedido bajado de bodega",
        time: "15 ago 2026 · 13:05"
      }
    ]
  },

  {
    id: 7030,
    number: "#7030",
    zone: "santiago",
    date: "15 ago 2026 · 13:02",
    status: "armando",
    shipping: "Envío Express Santiago",
    notes: "Revisar que el espejo no tenga marcas.",
    products: [
      {
        name: "Espejo decorativo dorado",
        quantity: 1,
        variant: "",
        image:
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"
      }
    ],
    history: [
      {
        text: "Pedido recibido",
        time: "15 ago 2026 · 13:02"
      },
      {
        text: "Pedido bajado de bodega",
        time: "15 ago 2026 · 13:20"
      },
      {
        text: "Pedido en preparación",
        time: "15 ago 2026 · 13:34"
      }
    ]
  },

  {
    id: 7031,
    number: "#7031",
    zone: "regiones",
    date: "15 ago 2026 · 13:18",
    status: "enviado",
    shipping: "Starken",
    notes: "",
    products: [
      {
        name: "Fanales metálicos",
        quantity: 2,
        variant: "Mediano",
        image:
          "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80"
      }
    ],
    history: [
      {
        text: "Pedido recibido",
        time: "15 ago 2026 · 13:18"
      },
      {
        text: "Pedido bajado de bodega",
        time: "15 ago 2026 · 13:45"
      },
      {
        text: "Pedido en preparación",
        time: "15 ago 2026 · 14:05"
      },
      {
        text: "Pedido enviado",
        time: "15 ago 2026 · 15:12"
      }
    ]
  },

  {
    id: 7032,
    number: "#7032",
    zone: "santiago",
    date: "15 ago 2026 · 13:31",
    status: "problema",
    previousStatus: "bodega",
    shipping: "Envío Express Santiago",
    notes: "Producto no encontrado en ubicación habitual.",
    products: [
      {
        name: "Adorno Virgen",
        quantity: 1,
        variant: "",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Pañuelo decorativo",
        quantity: 1,
        variant: "Beige",
        image:
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"
      }
    ],
    history: [
      {
        text: "Pedido recibido",
        time: "15 ago 2026 · 13:31"
      },
      {
        text: "Pedido bajado de bodega",
        time: "15 ago 2026 · 13:50"
      },
      {
        text: "Problema reportado",
        time: "15 ago 2026 · 14:02"
      }
    ]
  },

  {
    id: 7033,
    number: "#7033",
    zone: "regiones",
    date: "15 ago 2026 · 14:10",
    status: "pendiente",
    shipping: "Blue Express",
    notes: "",
    products: [
      {
        name: "Tetera decorativa",
        quantity: 1,
        variant: "",
        image:
          "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Molinillo decorativo",
        quantity: 1,
        variant: "",
        image:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Planta artificial",
        quantity: 2,
        variant: "",
        image:
          "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80"
      }
    ],
    history: [
      {
        text: "Pedido recibido",
        time: "15 ago 2026 · 14:10"
      }
    ]
  }
];

let orders = loadOrders();
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

function loadOrders() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const cloned = JSON.parse(JSON.stringify(demoOrders));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloned));
    return cloned;
  }

  try {
    return JSON.parse(saved);
  } catch {
    const cloned = JSON.parse(JSON.stringify(demoOrders));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloned));
    return cloned;
  }
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

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
      (activeZone === "problema"
        ? order.status === "problema"
        : order.zone === activeZone);

    const matchesStatus =
      activeStatus === "todos" ||
      order.status === activeStatus;

    const matchesSearch =
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products.some(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesZone && matchesStatus && matchesSearch;
  });

  ordersGrid.innerHTML = "";

  if (filteredOrders.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filteredOrders
    .sort((a, b) => b.id - a.id)
    .forEach(order => {
      const card = createOrderCard(order);
      ordersGrid.appendChild(card);
    });
}

function createOrderCard(order) {
  const article = document.createElement("article");
  article.className = "order-card";

  const visibleProducts = order.products.slice(0, 3);

  const totalUnits = order.products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  article.innerHTML = `
    <div class="order-card-inner">

      <div class="order-card-top">

        <div>
          <h3 class="order-number">
            ${order.number}
          </h3>

          <p class="order-date">
            ${order.date}
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
          ${visibleProducts
            .map(
              product => `
                <img
                  class="order-thumb"
                  src="${product.image}"
                  alt="${escapeHtml(product.name)}"
                >
              `
            )
            .join("")}
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

  article
    .querySelector(".order-view-button")
    .addEventListener("click", () => {
      openOrder(order.id);
    });

  article.addEventListener("dblclick", () => {
    openOrder(order.id);
  });

  return article;
}

function openOrder(orderId) {
  selectedOrderId = orderId;

  const order = getSelectedOrder();

  if (!order) return;

  modalOrderNumber.textContent = order.number;
  modalOrderDate.textContent =
    `${order.date} · ${order.shipping}`;

  modalZone.textContent =
    order.zone === "santiago"
      ? "Santiago"
      : "Regiones";

  modalZone.className =
    "zone-badge " +
    (order.zone === "santiago"
      ? "zone-santiago"
      : "zone-regiones");

  orderNotesInput.value = order.notes || "";

  renderProgress(order);
  renderProducts(order);
  renderHistory(order);
  updateModalButtons(order);

  modal.classList.remove("hidden");

  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");

  document.body.style.overflow = "";

  selectedOrderId = null;
}

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

  let comparisonStatus = order.status;

  if (order.status === "problema") {
    comparisonStatus =
      order.previousStatus || "pendiente";
  }

  const currentIndex = statuses.findIndex(
    status => status.key === comparisonStatus
  );

  progressSteps.innerHTML = statuses
    .map((status, index) => {
      let className = "progress-step";

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
        className = "progress-step completed";
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
    })
    .join("");
}

function renderProducts(order) {
  const totalUnits = order.products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  modalProductCount.textContent =
    `${order.products.length} productos · ${totalUnits} unidades`;

  modalProducts.innerHTML = order.products
    .map(
      product => `
        <article class="product-item">

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

            <span class="product-quantity">
              Cantidad: ${product.quantity}
            </span>

          </div>

        </article>
      `
    )
    .join("");

  modalProducts
    .querySelectorAll(".product-image-button")
    .forEach(button => {
      button.addEventListener("click", () => {
        openImageViewer(
          button.dataset.image,
          button.dataset.product
        );
      });
    });
}

function openImageViewer(image, productName) {
  if (!imageViewer || !imageViewerImg) return;

  imageViewerImg.src = image;
  imageViewerImg.alt = productName || "Producto";

  imageViewer.classList.remove("hidden");
}

function closeImageViewer() {
  if (!imageViewer || !imageViewerImg) return;

  imageViewer.classList.add("hidden");

  imageViewerImg.src = "";
}

function renderHistory(order) {
  if (!order.history || order.history.length === 0) {
    historyList.innerHTML = `
      <div class="history-item">
        Sin movimientos registrados.
      </div>
    `;

    return;
  }

  historyList.innerHTML = order.history
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

function updateModalButtons(order) {
  if (order.status === "enviado") {
    nextStatusButton.textContent =
      "Pedido ya enviado";

    nextStatusButton.disabled = true;

    nextStatusButton.style.opacity = "0.5";
  } else {
    nextStatusButton.disabled = false;
    nextStatusButton.style.opacity = "1";

    if (order.status === "problema") {
      nextStatusButton.textContent =
        "Resolver problema";
    } else {
      nextStatusButton.textContent =
        getNextButtonLabel(order.status);
    }
  }

  if (order.status === "problema") {
    problemButton.textContent =
      "✓ Problema registrado";

    problemButton.disabled = true;
    problemButton.style.opacity = "0.5";
  } else {
    problemButton.textContent =
      "⚠ Marcar problema";

    problemButton.disabled = false;
    problemButton.style.opacity = "1";
  }
}

function advanceSelectedOrder() {
  const order = getSelectedOrder();

  if (!order) return;

  if (order.status === "problema") {
    order.status =
      order.previousStatus || "pendiente";

    order.history.push({
      text: "Problema resuelto",
      time: getCurrentDateTime()
    });

    delete order.previousStatus;

    saveOrders();

    refreshOpenOrder();

    showToast("Problema resuelto");

    return;
  }

  const nextStatusMap = {
    pendiente: "bodega",
    bodega: "armando",
    armando: "enviado"
  };

  const nextStatus = nextStatusMap[order.status];

  if (!nextStatus) return;

  order.status = nextStatus;

  order.history.push({
    text: getHistoryText(nextStatus),
    time: getCurrentDateTime()
  });

  saveOrders();

  refreshOpenOrder();

  showToast(
    `Pedido actualizado: ${getStatusLabel(nextStatus)}`
  );
}

function markProblem() {
  const order = getSelectedOrder();

  if (!order) return;

  if (order.status === "problema") return;

  if (order.status === "enviado") {
    showToast(
      "Un pedido enviado no puede marcarse como problema"
    );
    return;
  }

  order.previousStatus = order.status;
  order.status = "problema";

  order.history.push({
    text: "Problema reportado",
    time: getCurrentDateTime()
  });

  saveOrders();

  refreshOpenOrder();

  showToast("Problema registrado");
}

function saveNotes() {
  const order = getSelectedOrder();

  if (!order) return;

  order.notes = orderNotesInput.value.trim();

  order.history.push({
    text: order.notes
      ? "Observación actualizada"
      : "Observación eliminada",
    time: getCurrentDateTime()
  });

  saveOrders();

  renderHistory(order);
  render();

  showToast("Observación guardada");
}

function refreshOpenOrder() {
  const orderId = selectedOrderId;

  render();

  if (orderId !== null) {
    openOrder(orderId);
  }
}

function getSelectedOrder() {
  return orders.find(
    order => order.id === selectedOrderId
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
    pendiente: "Marcar como bajado de bodega",
    bodega: "Marcar como armado",
    armando: "Marcar como enviado"
  };

  return labels[status] || "Avanzar pedido";
}

function getHistoryText(status) {
  const labels = {
    bodega: "Pedido bajado de bodega",
    armando: "Pedido en preparación",
    enviado: "Pedido enviado"
  };

  return labels[status] || "Estado actualizado";
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

function showToast(message) {
  toastMessage.textContent = message;

  toast.classList.remove("hidden");

  clearTimeout(showToast.timeout);

  showToast.timeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2300);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document
  .querySelectorAll(".filter-button")
  .forEach(button => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-button")
        .forEach(item =>
          item.classList.remove("active")
        );

      button.classList.add("active");

      activeZone = button.dataset.zone;

      renderOrders();
    });
  });

document
  .querySelectorAll(".status-filter")
  .forEach(button => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".status-filter")
        .forEach(item =>
          item.classList.remove("active")
        );

      button.classList.add("active");

      activeStatus = button.dataset.status;

      renderOrders();
    });
  });

searchOrder.addEventListener("input", event => {
  searchTerm = event.target.value.trim();

  renderOrders();
});

closeModalButton.addEventListener(
  "click",
  closeModal
);

closeModalXButton.addEventListener(
  "click",
  closeModal
);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      imageViewer &&
      !imageViewer.classList.contains("hidden")
    ) {
      closeImageViewer();
      return;
    }

    if (
      event.key === "Escape" &&
      !modal.classList.contains("hidden")
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

resetDemoButton.addEventListener(
  "click",
  () => {
    const confirmed = confirm(
      "¿Quieres reiniciar todos los pedidos de demostración?"
    );

    if (!confirmed) return;

    orders = JSON.parse(
      JSON.stringify(demoOrders)
    );

    saveOrders();

    render();

    showToast("Demo reiniciada");
  }
);

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
      if (event.target === imageViewer) {
        closeImageViewer();
      }
    }
  );
}

render();