// ==========================================================
// ESTADO GLOBAL
// ==========================================================

let orders = [];
let selectedOrderId = null;

let activeZone = "todos";
let activeStatus = "todos";
let activeLocation = "todos";
let searchTerm = "";

let currentUser = null;
let users = [];
let lastStatesSignature = "";
let syncTimer = null;

const SYNC_INTERVAL_MS = 5000;


// ==========================================================
// INCIDENCIA ACTUAL
// ==========================================================

let incidentProductId = null;
let incidentReason = null;
let incidentQuantity = 1;
let incidentMaxQuantity = 1;


// ==========================================================
// ELEMENTOS GENERALES
// ==========================================================

const topbar =
  document.querySelector(".topbar");

const appShell =
  document.querySelector(".app-shell");

const loginScreen =
  document.getElementById("login-screen");

const loginForm =
  document.getElementById("login-form");

const loginUsername =
  document.getElementById("login-username");

const loginPassword =
  document.getElementById("login-password");

const loginSubmit =
  document.getElementById("login-submit");

const loginError =
  document.getElementById("login-error");


// ==========================================================
// USUARIO ACTUAL
// ==========================================================

const currentUserAvatar =
  document.getElementById("current-user-avatar");

const currentUserName =
  document.getElementById("current-user-name");

const currentUserRole =
  document.getElementById("current-user-role");

const logoutButton =
  document.getElementById("logout-button");

// ==========================================================
// SOLICITUDES ENTRE SUCURSALES
// ==========================================================

const transferAlertButton =
  document.getElementById(
    "transfer-alert-button"
  );

const transferAlertCount =
  document.getElementById(
    "transfer-alert-count"
  );

const transferAlertPanel =
  document.getElementById(
    "transfer-alert-panel"
  );

const transferAlertClose =
  document.getElementById(
    "transfer-alert-close"
  );

const transferAlertList =
  document.getElementById(
    "transfer-alert-list"
  );

let transferRequests = [];


// ==========================================================
// NAVEGACIÓN
// ==========================================================

const ordersNavButton =
  document.getElementById("orders-nav-button");

const incidentsNavButton =
  document.getElementById("incidents-nav-button");

const usersNavButton =
  document.getElementById("users-nav-button");

const ordersPage =
  document.getElementById("orders-page");

const usersSection =
  document.getElementById("users-section");


// ==========================================================
// PEDIDOS
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

const modalDocumentLink =
  document.getElementById(
    "modal-document-link"
  );

const modalDocumentPrintedStatus =
  document.getElementById(
    "modal-document-printed-status"
  );

const modalDocumentPrintedButton =
  document.getElementById(
    "modal-document-printed-button"
  );

const assemblyLocationSelect =
  document.getElementById("assembly-location-select");

const assemblyLocationBadge =
  document.getElementById("assembly-location-badge");

const progressSteps =
  document.getElementById("progress-steps");

const modalProductCount =
  document.getElementById("modal-product-count");

const modalProducts =
  document.getElementById("modal-products");

const orderNotesInput =
  document.getElementById("order-notes-input");

const saveNotesButton =
  document.getElementById("save-notes");

const historyList =
  document.getElementById("history-list");

const problemButton =
  document.getElementById("problem-button");

const nextStatusButton =
  document.getElementById("next-status-button");

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
// VISOR IMAGEN
// ==========================================================

const imageViewer =
  document.getElementById("image-viewer");

const imageViewerImg =
  document.getElementById("image-viewer-img");

const closeImageViewerButton =
  document.getElementById("close-image-viewer");


// ==========================================================
// MODAL INCIDENCIA
// ==========================================================

const incidentModal =
  document.getElementById("incidentModal");

const incidentModalClose =
  document.getElementById("incidentModalClose");

const incidentModalBackdrop =
  document.querySelector(".incident-modal-backdrop");

const incidentProductName =
  document.getElementById("incidentProductName");

const incidentQuantitySection =
  document.getElementById("incidentQuantitySection");

const incidentQuantityValue =
  document.getElementById("incidentQuantity");

const incidentQuantityAvailable =
  document.getElementById("incidentQuantityAvailable");

const incidentQuantityMinus =
  document.getElementById("incidentQuantityMinus");

const incidentQuantityPlus =
  document.getElementById("incidentQuantityPlus");

const incidentConfirmButton =
  document.getElementById("incidentConfirmButton");

const incidentCancelButton =
  document.getElementById("incidentCancelButton");

const incidentReasonButtons =
  document.querySelectorAll(".incident-reason-button");


// ==========================================================
// ADMINISTRACIÓN USUARIOS
// ==========================================================

const usersList =
  document.getElementById("users-list");

const createUserButton =
  document.getElementById("create-user-button");

const userModal =
  document.getElementById("user-modal");

const userModalClose =
  document.getElementById("user-modal-close");

const userModalCancel =
  document.getElementById("user-modal-cancel");

const userModalTitle =
  document.getElementById("user-modal-title");

const userForm =
  document.getElementById("user-form");

const userIdInput =
  document.getElementById("user-id");

const userNameInput =
  document.getElementById("user-name");

const userUsernameInput =
  document.getElementById("user-username");

const userPasswordInput =
  document.getElementById("user-password");

const userPasswordHelp =
  document.getElementById("user-password-help");

const userRoleInput =
  document.getElementById("user-role");

const userLocationInput =
  document.getElementById("user-location");

const userActiveInput =
  document.getElementById("user-active");

const userFormError =
  document.getElementById("user-form-error");

const userSaveButton =
  document.getElementById("user-save-button");


// ==========================================================
// API
// ==========================================================

async function apiRequest(
  url,
  options = {}
) {
  const config = {
    ...options,

    credentials:
      "same-origin",

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

  let data = null;

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
    const error =
      new Error(
        data?.error ||
        data?.detail ||
        `Error HTTP ${response.status}`
      );

    error.status =
      response.status;

    throw error;
  }

  return data;
}

// ==========================================================
// CARGAR SOLICITUDES ENTRE SUCURSALES
// ==========================================================

async function loadTransferRequests() {
  if (!currentUser) {
    transferRequests = [];

    renderTransferRequests();

    return;
  }

  try {
    const data =
      await apiRequest(
        "/api/transfer-requests"
      );

    transferRequests =
      Array.isArray(
        data?.requests
      )
        ? data.requests
        : [];

    renderTransferRequests();

  } catch (error) {
    console.error(
      "Error cargando solicitudes:",
      error
    );
  }
}


// ==========================================================
// MOSTRAR SOLICITUDES ENTRE SUCURSALES
// ==========================================================

function renderTransferRequests() {
  if (
    !transferAlertCount ||
    !transferAlertList
  ) {
    return;
  }

  const count =
    transferRequests.length;

  transferAlertCount.textContent =
    String(count);

  transferAlertCount.classList.toggle(
    "hidden",
    count === 0
  );

  if (count === 0) {
    transferAlertList.innerHTML = `
      <div class="transfer-alert-empty">
        No hay solicitudes pendientes.
      </div>
    `;

    return;
  }

  transferAlertList.innerHTML =
    transferRequests
      .map(request => {
        const fromLabel =
          getAssemblyLocationLabel(
            request.fromLocation
          );

        const productCode =
          request.productCode
            ? `
              <div class="transfer-alert-code">
                SKU: ${escapeHtml(
                  request.productCode
                )}
              </div>
            `
            : "";

        return `
          <div
            class="transfer-alert-item"
            data-transfer-request-id="${escapeHtml(
              request.id
            )}"
          >
            <div class="transfer-alert-order">
              Pedido ${escapeHtml(
                request.orderNumber
              )}
            </div>

            <div class="transfer-alert-message">
              <strong>${escapeHtml(
                fromLabel
              )}</strong>
              solicita:
            </div>

            <div class="transfer-alert-product">
              ${escapeHtml(
                request.productName
              )}
            </div>

            ${productCode}

            <div class="transfer-alert-quantity">
              Cantidad:
              <strong>${Number(
                request.quantity
              ) || 1}</strong>
            </div>

            <div class="transfer-alert-actions">
              <button
                type="button"
                class="secondary-button"
                disabled
              >
                Enviar a ${escapeHtml(
                  fromLabel
                )}
              </button>

              <button
                type="button"
                class="secondary-button"
                disabled
              >
                Armar pedido acá
              </button>
            </div>
          </div>
        `;
      })
      .join("");
}


// ==========================================================
// INICIO
// ==========================================================

async function init() {
  hideApplication();

  try {
    const authenticated =
      await restoreSession();

    if (!authenticated) {
      showLogin();

      return;
    }

    await loadApplication();

  } catch (error) {
    console.error(error);

    showLogin();
  }
}


// ==========================================================
// RESTAURAR SESIÓN
// ==========================================================

async function restoreSession() {
  try {
    const data =
      await apiRequest(
        "/api/auth/me"
      );

    currentUser =
      data.user;

    updateCurrentUserUI();

    return true;

  } catch (error) {
    if (
      error.status ===
      401
    ) {
      currentUser =
        null;

      return false;
    }

    throw error;
  }
}


// ==========================================================
// CARGAR APP
// ==========================================================

async function loadApplication() {
  hideLogin();

  showApplication();

  showOrdersPage();

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

updateCurrentUserUI();

render();

lastStatesSignature =
  JSON.stringify(
    statesData.states ||
    {}
  );

startStateSync();
  
}


// ==========================================================
// MOSTRAR / OCULTAR APP
// ==========================================================

function hideApplication() {
  if (topbar) {
    topbar.style.display =
      "none";
  }

  if (appShell) {
    appShell.style.display =
      "none";
  }
}


function showApplication() {
  if (topbar) {
    topbar.style.display =
      "";
  }

  if (appShell) {
    appShell.style.display =
      "";
  }
}


function showLogin() {
  hideApplication();

  loginScreen.classList.remove(
    "hidden"
  );

  loginError.classList.add(
    "hidden"
  );

  loginPassword.value =
    "";

  setTimeout(
    () => {
      loginUsername.focus();
    },
    50
  );
}


function hideLogin() {
  loginScreen.classList.add(
    "hidden"
  );
}


// ==========================================================
// LOGIN
// ==========================================================

async function handleLogin(
  event
) {
  event.preventDefault();

  const username =
    loginUsername.value
      .trim();

  const password =
    loginPassword.value;

  if (
    !username ||
    !password
  ) {
    showLoginError(
      "Ingresa usuario y contraseña."
    );

    return;
  }

  loginSubmit.disabled =
    true;

  loginSubmit.textContent =
    "Ingresando...";

  hideLoginError();

  try {
    const data =
      await apiRequest(
        "/api/auth/login",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              username,
              password
            })
        }
      );

    currentUser =
      data.user;

    loginPassword.value =
      "";

    await loadApplication();

  } catch (error) {
    console.error(error);

    showLoginError(
      error.message ||
      "No se pudo iniciar sesión."
    );

  } finally {
    loginSubmit.disabled =
      false;

    loginSubmit.textContent =
      "Ingresar";
  }
}


function showLoginError(
  message
) {
  loginError.textContent =
    message;

  loginError.classList.remove(
    "hidden"
  );
}


function hideLoginError() {
  loginError.textContent =
    "";

  loginError.classList.add(
    "hidden"
  );
}


// ==========================================================
// LOGOUT
// ==========================================================

async function logout() {
  try {
    await apiRequest(
      "/api/auth/logout",
      {
        method:
          "POST",

        body:
          JSON.stringify({})
      }
    );

  } catch (error) {
    console.error(error);
  }

  currentUser =
    null;

  users =
    [];

  orders =
    [];

  closeModal();
  closeIncidentModal();
  closeUserModal();

  showLogin();
}


// ==========================================================
// USUARIO CABECERA
// ==========================================================

function updateCurrentUserUI() {
  if (!currentUser) {
    return;
  }

  currentUserName.textContent =
    currentUser.name;

  currentUserRole.textContent =
    getUserRoleLabel(
      currentUser.role
    ) +
    (
      currentUser.location
        ? ` · ${getAssemblyLocationLabel(
            currentUser.location
          )}`
        : ""
    );

  currentUserAvatar.textContent =
    getInitials(
      currentUser.name
    );

  if (
    currentUser.role ===
    "admin"
  ) {
    usersNavButton.classList.remove(
      "hidden"
    );
  } else {
    usersNavButton.classList.add(
      "hidden"
    );
  }
}


// ==========================================================
// NAVEGACIÓN
// ==========================================================

function clearSidebarSelection() {
  document
    .querySelectorAll(
      ".sidebar-item"
    )
    .forEach(button => {
      button.classList.remove(
        "active"
      );
    });
}


function showOrdersPage() {
  usersSection.classList.add(
    "hidden"
  );

  ordersPage.classList.remove(
    "hidden"
  );

  clearSidebarSelection();

  ordersNavButton.classList.add(
    "active"
  );
}


async function showUsersPage() {
  if (
    currentUser?.role !==
    "admin"
  ) {
    return;
  }

  ordersPage.classList.add(
    "hidden"
  );

  usersSection.classList.remove(
    "hidden"
  );

  clearSidebarSelection();

  usersNavButton.classList.add(
    "active"
  );

  await loadUsers();
}


function showIncidentsPage() {
  showOrdersPage();

  activeZone =
    "problema";

  document
    .querySelectorAll(
      ".filter-button"
    )
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.zone ===
          "problema"
      );
    });

  renderOrders();
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

  const pickup =
    order.pickup || {
      isPickup: false,
      locationKey: null,
      location: null
    };

  const zone =
    pickup.isPickup
      ? "retiro"
      : classifyZone(
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

    documentUrl:
  order.documentUrl ||
  "",

    status:
      "pendiente",

    previousStatus:
      null,

    assemblyLocation:
      "sin-asignar",

    zone,

        pickup: {
          isPickup:
            Boolean(
              pickup.isPickup
            ),
        
          locationKey:
            pickup.locationKey ||
            null,
        
          location:
            pickup.location ||
            null
        },
        
        shipping:
          pickup.isPickup
            ? (
                pickup.location
                  ? `Retiro en ${pickup.location}`
                  : "Retiro en tienda"
              )
            : (
                shippingMethod ||
                "Sin método de envío"
              ),

    shipping:
      pickup.isPickup
        ? (
            pickup.locationName
              ? `Retiro en ${pickup.locationName}`
              : "Retiro en tienda"
          )
        : (
            shippingMethod ||
            "Sin método de envío"
          ),

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
          pickup.isPickup
            ? "Pedido de retiro recibido desde Shopify"
            : "Pedido recibido desde Shopify",

        time:
          formatShopifyDate(
            order.createdAt
          )
      }
    ]
  };
}

// ==========================================================
// MEZCLAR D1 + SHOPIFY
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

documentPrinted:
  Boolean(
    saved.documentPrinted
  ),

documentPrintedAt:
  saved.documentPrintedAt ||
  null,

documentPrintedBy:
  saved.documentPrintedBy ||
  null,

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
                      item.productId ===
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
                  null,
                
                stockStatus:
                  savedProduct
                    ?.stockStatus ||
                  null,
                
                stockLocation:
                  savedProduct
                    ?.stockLocation ||
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
// ZONA
// ==========================================================

function classifyZone(
  shippingMethod,
  shipping = {}
) {
  const city =
    String(
      shipping.city ||
      ""
    )
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );

  const santiagoCommunes = [
    "cerrillos",
    "cerro navia",
    "colina",
    "conchali",
    "el bosque",
    "estacion central",
    "huechuraba",
    "independencia",
    "la cisterna",
    "la florida",
    "la granja",
    "la pintana",
    "la reina",
    "las condes",
    "lo barnechea",
    "lo espejo",
    "lo prado",
    "macul",
    "maipu",
    "nunoa",
    "padre hurtado",
    "pedro aguirre cerda",
    "penalolen",
    "providencia",
    "pudahuel",
    "puente alto",
    "quilicura",
    "quinta normal",
    "recoleta",
    "renca",
    "san bernardo",
    "san joaquin",
    "san miguel",
    "san ramon",
    "santiago",
    "vitacura"
  ];

  if (
    santiagoCommunes.includes(
      city
    )
  ) {
    return "santiago";
  }

  return "regiones";
}


// ==========================================================
// GUARDAR ESTADO PEDIDO
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
// GUARDAR PRODUCTO
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
            null,

          stockStatus:
            product.stockStatus ||
            null,

          stockLocation:
            product.stockLocation ||
            null
        })
    }
  );
}


// ==========================================================
// HISTORIAL CENTRALIZADO
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
      data.history?.createdAt ||
      new Date()
        .toISOString(),

    userId:
      data.history?.userId ||
      currentUser?.id ||
      null,

    userName:
      data.history?.userName ||
      currentUser?.name ||
      null,

    userRole:
      data.history?.userRole ||
      currentUser?.role ||
      null
  };

  order.history.push(
    item
  );

  return item;
}

// ==========================================================
// SINCRONIZACIÓN SILENCIOSA
// ==========================================================

async function syncRemoteStates() {
  if (
    !currentUser ||
    document.hidden
  ) {
    return;
  }

  try {
    const data =
      await apiRequest(
        "/api/states"
      );

    const states =
      data.states ||
      {};

    const signature =
      JSON.stringify(
        states
      );

    if (
      signature ===
      lastStatesSignature
    ) {
      return;
    }

    lastStatesSignature =
      signature;

    applyRemoteStates(
      states
    );

    render();

    if (
      selectedOrderId !==
      null
    ) {
      const order =
        getSelectedOrder();

      if (order) {
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
      }
    }

  } catch (error) {
    console.error(
      "Error sincronizando estados:",
      error
    );
  }
}


function startStateSync() {
  stopStateSync();

  loadTransferRequests();

  syncTimer =
    setInterval(
      async () => {
        await syncRemoteStates();
        await loadTransferRequests();
      },
      SYNC_INTERVAL_MS
    );
}


function stopStateSync() {
  if (
    syncTimer
  ) {
    clearInterval(
      syncTimer
    );

    syncTimer =
      null;
  }
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
// LISTADO PEDIDOS
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
    order.pickup?.isPickup
      ? "zone-pickup"
      : order.zone ===
          "santiago"
        ? "zone-santiago"
        : "zone-regiones"
  }"
>
  ${
    order.pickup?.isPickup
      ? `RETIRO · ${
          order.pickup.location
            ? escapeHtml(
                order.pickup.location.toUpperCase()
              )
            : "TIENDA"
        }`
      : order.zone ===
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

          · ${totalUnits}

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

          <span class="status-dot"></span>

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
// MARCAR BOLETA COMO IMPRESA
// ==========================================================

async function markDocumentPrinted() {
  const order =
    getSelectedOrder();

  if (
    !order ||
    !order.documentUrl
  ) {
    return;
  }

  try {
    const data =
      await apiRequest(
        `/api/orders/${encodeURIComponent(
          order.number
        )}/document-printed`,
        {
          method:
            "PUT"
        }
      );

    order.documentPrinted =
      true;

    order.documentPrintedAt =
      data.documentPrintedAt ||
      new Date().toISOString();

    order.documentPrintedBy =
      data.documentPrintedBy ||
      currentUser?.name ||
      "";

    openOrder(
      order.id
    );

    showToast(
      "Boleta marcada como impresa"
    );

  } catch (error) {
    showToast(
      `Error: ${error.message}`
    );
  }
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

  if (
    order.documentUrl
  ) {
    modalDocumentLink.href =
      order.documentUrl;

    modalDocumentLink.classList.remove(
      "hidden"
    );

    if (
      order.documentPrinted
    ) {
      modalDocumentPrintedButton
        ?.classList.add(
          "hidden"
        );

      if (
        modalDocumentPrintedStatus
      ) {
        const printedBy =
          order.documentPrintedBy ||
          "Usuario";

        const printedAt =
          order.documentPrintedAt
            ? new Date(
                order.documentPrintedAt
              ).toLocaleString(
                "es-CL"
              )
            : "";

        modalDocumentPrintedStatus
          .innerHTML = `
            ✅ BOLETA IMPRESA
            <span>
              ${escapeHtml(
                printedBy
              )}
              ${
                printedAt
                  ? ` · ${escapeHtml(
                      printedAt
                    )}`
                  : ""
              }
            </span>
          `;

        modalDocumentPrintedStatus
          .classList.remove(
            "hidden"
          );
      }

    } else {
      modalDocumentPrintedButton
        ?.classList.remove(
          "hidden"
        );

      modalDocumentPrintedStatus
        ?.classList.add(
          "hidden"
        );
    }

  } else {
    modalDocumentLink.href =
      "#";

    modalDocumentLink.classList.add(
      "hidden"
    );

    modalDocumentPrintedButton
      ?.classList.add(
        "hidden"
      );

    modalDocumentPrintedStatus
      ?.classList.add(
        "hidden"
      );
  }

  if (
    order.pickup?.isPickup
  ) {
    modalZone.textContent =
      order.pickup.location
        ? `RETIRO · ${order.pickup.location.toUpperCase()}`
        : "RETIRO · TIENDA";

    modalZone.className =
      "zone-badge zone-pickup";

  } else {
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
  }

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

// ==========================================================
// SUCURSAL
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
// PROGRESO
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
            <div class="${className}">

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

  modalProductCount.classList.toggle(
    "products-complete",
    readyUnits ===
      totalUnits &&
    totalUnits > 0
  );

  modalProductCount.classList.toggle(
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
                  <div class="product-image-wrapper">

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

              <h4 class="product-name">
                ${escapeHtml(
                  product.name
                )}
              </h4>

              ${
                product.variant
                  ? `
                    <p class="product-meta">
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
                    <p class="product-meta">

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
                    <p class="product-meta">
                      SKU:
                      ${escapeHtml(
                        product.sku
                      )}
                    </p>
                  `
                  : ""
              }

              <span class="product-quantity">
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

  bindProductButtons();
}


// ==========================================================
// EVENTOS PRODUCTOS
// ==========================================================

function bindProductButtons() {
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

  modalProducts
    .querySelectorAll(
      ".warehouse-product-last-unit-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          markProductLastUnit(
            button.dataset.productId
          );
        }
      );
    });
  
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
// ESTADO PRODUCTO
// ==========================================================

function renderWarehouseProductStatus(
  order,
  product
) {
  const status =
    product.warehouseStatus ||
    "pendiente";

  const stockStatus =
    product.stockStatus ||
    null;

  const transferOrigin =
    getAssemblyLocationLabel(
      product.transferFrom
    );

  const transferDestination =
    getAssemblyLocationLabel(
      order.assemblyLocation
    );

  const stockLocation =
    getAssemblyLocationLabel(
      product.stockLocation
    );

  if (
    status ===
      "bajado" &&
    stockStatus ===
      "agotado"
  ) {
    return `
      <div
        class="warehouse-product-status ready"
      >
        ✓ PRODUCTO BAJADO
      </div>

      <div
        class="warehouse-product-stockout"
      >
        ⚠ AGOTADO EN
        ${escapeHtml(
          stockLocation.toUpperCase()
        )}
        <div
          class="warehouse-product-stockout-detail"
        >
          Última unidad asignada a este pedido
        </div>
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
    "bajado"
  ) {
    return `
      <div
        class="warehouse-product-status ready"
      >
        ✓ PRODUCTO BAJADO
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
        ↔ TRASLADO:
        ${escapeHtml(
          transferOrigin.toUpperCase()
        )}
        →
        ${escapeHtml(
          transferDestination.toUpperCase()
        )}
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
      class="warehouse-product-status-row"
    >
      <div
        class="warehouse-product-status pending"
      >
        POR BAJAR
      </div>
    </div>

    <div
      class="warehouse-product-actions"
    >
      <button
        type="button"
        class="warehouse-product-ready-button"
        data-product-id="${product.id}"
      >
        ✓ Marcar como bajado
      </button>

      <button
        type="button"
        class="warehouse-product-last-unit-button"
        data-product-id="${product.id}"
      >
        ⚠ Marcar última unidad
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
// PRODUCTO LISTO
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

  const oldStockStatus =
    product.stockStatus;

  const oldStockLocation =
    product.stockLocation;

  product.warehouseStatus =
    "bajado";

  product.transferFrom =
    null;

  product.stockStatus =
    null;

  product.stockLocation =
    null;

  try {
    await saveRemoteProductState(
      order,
      product
    );

    refreshOpenOrder();

    showToast(
      oldStatus ===
        "traslado"
        ? "Producto recibido"
        : "Producto marcado como bajado"
    );

  } catch (error) {
    product.warehouseStatus =
      oldStatus;

    product.transferFrom =
      oldTransfer;

    product.stockStatus =
      oldStockStatus;

    product.stockLocation =
      oldStockLocation;

    refreshOpenOrder();

    showToast(
      "Error: " +
      error.message
    );
  }
}

// ==========================================================
// ÚLTIMA UNIDAD
// ==========================================================

async function markProductLastUnit(
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

  const oldStockStatus =
    product.stockStatus;

  const oldStockLocation =
    product.stockLocation;

  product.warehouseStatus =
    "bajado";

  product.transferFrom =
    null;

  product.stockStatus =
    "agotado";

  product.stockLocation =
    order.assemblyLocation;

  try {
    await saveRemoteProductState(
      order,
      product
    );

    await addRemoteHistory(
      order,
      `Última unidad utilizada en ${getAssemblyLocationLabel(
        order.assemblyLocation
      )}: ${product.name}. Producto agotado en esa sucursal.`
    );

    refreshOpenOrder();

    showToast(
      `Última unidad asignada · agotado en ${getAssemblyLocationLabel(
        order.assemblyLocation
      )}`
    );

  } catch (error) {
    product.warehouseStatus =
      oldStatus;

    product.transferFrom =
      oldTransfer;

    product.stockStatus =
      oldStockStatus;

    product.stockLocation =
      oldStockLocation;

    refreshOpenOrder();

    showToast(
      `Error: ${error.message}`
    );
  }
}

// ==========================================================
// NO HAY AQUÍ
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

  const fromLocation =
    order.assemblyLocation;

  const toLocation =
    fromLocation ===
      "patronato"
      ? "las-condes"
      : "patronato";

  try {
    const transferData =
      await apiRequest(
        "/api/transfer-requests",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              orderNumber:
                order.number,

              productId:
                product.id,

              productName:
                product.name,

              productCode:
                product.code ||
                "",

              quantity:
                product.quantity,

              fromLocation,
              toLocation
            })
        }
      );

    const existingIncident =
      order.incidents?.find(
        item =>
          item.productId ===
            product.id &&
          String(
            item.reason ||
            ""
          ).toLowerCase() ===
            "falta en sucursal" &&
          item.status ===
            "pendiente"
      );

    if (!existingIncident) {
      const incidentData =
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
                  "Falta en sucursal",

                quantity:
                  product.quantity
              })
          }
        );

      if (
        incidentData?.incident
      ) {
        order.incidents.push(
          incidentData.incident
        );
      }
    }

    await addRemoteHistory(
      order,
      `No hay en ${getAssemblyLocationLabel(
        fromLocation
      )}: ${product.name}. Solicitud enviada a ${getAssemblyLocationLabel(
        toLocation
      )}.`
    );

    refreshOpenOrder();

    if (
      transferData?.alreadyExists
    ) {
      showToast(
        `Ya existe una solicitud pendiente para ${getAssemblyLocationLabel(
          toLocation
        )}`
      );
    } else {
      showToast(
        `Solicitud enviada a ${getAssemblyLocationLabel(
          toLocation
        )}`
      );
    }

  } catch (error) {
    showToast(
      `Error: ${error.message}`
    );
  }
}


// ==========================================================
// DESHACER PRODUCTO
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
// INCIDENCIAS
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

        <div class="incident-header">

          <strong>
            ⚠ Reemplazo pendiente
          </strong>

        </div>

        <div class="incident-details">

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

        <span class="incident-time">
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
// ABRIR INCIDENCIA
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
// CREAR INCIDENCIA
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
    showToast(
      `Error: ${error.message}`
    );

  } finally {
    incidentConfirmButton.disabled =
      false;
  }
}


// ==========================================================
// CERRAR INCIDENCIA
// ==========================================================

function closeIncidentModal() {
  if (!incidentModal) {
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
// RESOLVER INCIDENCIA
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
    showToast(
      `Error: ${error.message}`
    );
  }
}


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

        ${
          item.userName
            ? `
              <strong>
                ${escapeHtml(
                  item.userName
                )}
              </strong>
              ·
            `
            : ""
        }

        ${escapeHtml(
          item.text
        )}

            <span class="history-time">
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
// BOTONES ESTADO PEDIDO
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
// USUARIOS ADMIN
// ==========================================================

async function loadUsers() {
  if (
    currentUser?.role !==
    "admin"
  ) {
    return;
  }

  usersList.innerHTML = `
    <div
      style="
        padding:30px;
        color:#64748b;
      "
    >
      Cargando usuarios...
    </div>
  `;

  try {
    const data =
      await apiRequest(
        "/api/users"
      );

    users =
      data.users ||
      [];

    renderUsers();

  } catch (error) {
    usersList.innerHTML = `
      <div class="login-error">
        ${escapeHtml(
          error.message
        )}
      </div>
    `;
  }
}


// ==========================================================
// RENDER USUARIOS
// ==========================================================

function renderUsers() {
  if (
    users.length ===
    0
  ) {
    usersList.innerHTML = `
      <div class="empty-state">
        <h3>
          No hay usuarios
        </h3>

        <p>
          Crea la primera cuenta del equipo.
        </p>
      </div>
    `;

    return;
  }

  usersList.innerHTML =
    users
      .map(user => {
        return `
          <article class="user-card">

            <div class="user-card-top">

              <div class="user-card-identity">

                <div class="user-card-avatar">
                  ${escapeHtml(
                    getInitials(
                      user.name
                    )
                  )}
                </div>

                <div>

                  <h3 class="user-card-name">
                    ${escapeHtml(
                      user.name
                    )}
                  </h3>

                  <div class="user-card-username">
                    @${escapeHtml(
                      user.username
                    )}
                  </div>

                </div>

              </div>

              <span
                class="
                  user-status-badge
                  ${
                    user.active
                      ? "user-status-active"
                      : "user-status-inactive"
                  }
                "
              >
                ${
                  user.active
                    ? "Activo"
                    : "Inactivo"
                }
              </span>

            </div>

            <div class="user-card-meta">

              <span class="user-role-badge">
                ${escapeHtml(
                  getUserRoleLabel(
                    user.role
                  )
                )}
              </span>

              <span class="user-location-badge">
                ${
                  user.location
                    ? escapeHtml(
                        getAssemblyLocationLabel(
                          user.location
                        )
                      )
                    : "Sin sucursal"
                }
              </span>

            </div>

            <div class="user-card-actions">

              <button
                type="button"
                class="user-edit-button"
                data-user-id="${user.id}"
              >
                Editar
              </button>

            </div>

          </article>
        `;
      })
      .join("");

  usersList
    .querySelectorAll(
      ".user-edit-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          openEditUserModal(
            button.dataset.userId
          );
        }
      );
    });
}


// ==========================================================
// MODAL CREAR USUARIO
// ==========================================================

function openCreateUserModal() {
  userForm.reset();

  userIdInput.value =
    "";

  userModalTitle.textContent =
    "Crear usuario";

  userSaveButton.textContent =
    "Crear usuario";

  userPasswordInput.required =
    true;

  userPasswordHelp.textContent =
    "Mínimo 8 caracteres.";

  userActiveInput.checked =
    true;

  userRoleInput.value =
    "bodega";

  userLocationInput.value =
    "";

  hideUserFormError();

  userModal.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";

  setTimeout(
    () => {
      userNameInput.focus();
    },
    50
  );
}


// ==========================================================
// MODAL EDITAR USUARIO
// ==========================================================

function openEditUserModal(
  userId
) {
  const user =
    users.find(
      item =>
        item.id ===
        userId
    );

  if (!user) {
    return;
  }

  userForm.reset();

  userIdInput.value =
    user.id;

  userNameInput.value =
    user.name;

  userUsernameInput.value =
    user.username;

  userPasswordInput.value =
    "";

  userRoleInput.value =
    user.role;

  userLocationInput.value =
    user.location ||
    "";

  userActiveInput.checked =
    Boolean(
      user.active
    );

  userModalTitle.textContent =
    "Editar usuario";

  userSaveButton.textContent =
    "Guardar cambios";

  userPasswordInput.required =
    false;

  userPasswordHelp.textContent =
    "Déjala vacía para mantener la contraseña actual.";

  hideUserFormError();

  userModal.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";
}


// ==========================================================
// CERRAR MODAL USUARIO
// ==========================================================

function closeUserModal() {
  if (!userModal) {
    return;
  }

  userModal.classList.add(
    "hidden"
  );

  if (
    modal.classList.contains(
      "hidden"
    )
  ) {
    document.body.style.overflow =
      "";
  }

  hideUserFormError();
}


// ==========================================================
// GUARDAR USUARIO
// ==========================================================

async function saveUser(
  event
) {
  event.preventDefault();

  if (
    currentUser?.role !==
    "admin"
  ) {
    return;
  }

  const userId =
    userIdInput.value
      .trim();

  const editing =
    Boolean(
      userId
    );

  const name =
    userNameInput.value
      .trim();

  const username =
    userUsernameInput.value
      .trim()
      .toLowerCase();

  const password =
    userPasswordInput.value;

  const role =
    userRoleInput.value;

  const location =
    userLocationInput.value ||
    null;

  const active =
    userActiveInput.checked;

  if (
    !name ||
    !username
  ) {
    showUserFormError(
      "Completa nombre y usuario."
    );

    return;
  }

  if (
    !editing &&
    password.length <
      8
  ) {
    showUserFormError(
      "La contraseña debe tener al menos 8 caracteres."
    );

    return;
  }

  if (
    editing &&
    password &&
    password.length <
      8
  ) {
    showUserFormError(
      "La nueva contraseña debe tener al menos 8 caracteres."
    );

    return;
  }

  userSaveButton.disabled =
    true;

  userSaveButton.textContent =
    editing
      ? "Guardando..."
      : "Creando...";

  hideUserFormError();

  try {
    const body = {
      name,
      username,
      role,
      location,
      active
    };

    if (
      password
    ) {
      body.password =
        password;
    }

    if (
      editing
    ) {
      await apiRequest(
        `/api/users/${encodeURIComponent(
          userId
        )}`,
        {
          method:
            "PUT",

          body:
            JSON.stringify(
              body
            )
        }
      );

      showToast(
        "Usuario actualizado"
      );

    } else {
      await apiRequest(
        "/api/users",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              ...body,
              password
            })
        }
      );

      showToast(
        "Usuario creado"
      );
    }

    closeUserModal();

    await loadUsers();

    if (
      editing &&
      userId ===
        currentUser.id
    ) {
      await restoreSession();

      updateCurrentUserUI();
    }

  } catch (error) {
    showUserFormError(
      error.message
    );

  } finally {
    userSaveButton.disabled =
      false;

    userSaveButton.textContent =
      editing
        ? "Guardar cambios"
        : "Crear usuario";
  }
}


function showUserFormError(
  message
) {
  userFormError.textContent =
    message;

  userFormError.classList.remove(
    "hidden"
  );
}


function hideUserFormError() {
  userFormError.textContent =
    "";

  userFormError.classList.add(
    "hidden"
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


function getUserRoleLabel(
  role
) {
  const labels = {
    admin:
      "Administrador",

    bodega:
      "Bodega",

    armado:
      "Armado",

    despacho:
      "Despacho"
  };

  return (
    labels[role] ||
    role
  );
}


function getInitials(
  name = ""
) {
  const parts =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length ===
    0
  ) {
    return "--";
  }

  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2
      )
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length -
      1
    ][0]
  ).toUpperCase();
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
// LOGIN EVENTS
// ==========================================================

loginForm.addEventListener(
  "submit",
  handleLogin
);


logoutButton.addEventListener(
  "click",
  logout
);


// ==========================================================
// BOLETA IMPRESA
// ==========================================================

modalDocumentPrintedButton
  ?.addEventListener(
    "click",
    event => {
      event.preventDefault();

      markDocumentPrinted();
    }
  );

// ==========================================================
// EVENTOS SOLICITUDES ENTRE SUCURSALES
// ==========================================================

transferAlertButton?.addEventListener(
  "click",
  () => {
    transferAlertPanel?.classList.toggle(
      "hidden"
    );
  }
);

transferAlertClose?.addEventListener(
  "click",
  () => {
    transferAlertPanel?.classList.add(
      "hidden"
    );
  }
);

// ==========================================================
// NAVEGACIÓN
// ==========================================================

ordersNavButton.addEventListener(
  "click",
  showOrdersPage
);


incidentsNavButton.addEventListener(
  "click",
  showIncidentsPage
);


usersNavButton.addEventListener(
  "click",
  showUsersPage
);


// ==========================================================
// USUARIOS
// ==========================================================

createUserButton.addEventListener(
  "click",
  openCreateUserModal
);


userForm.addEventListener(
  "submit",
  saveUser
);


userModalClose.addEventListener(
  "click",
  closeUserModal
);


userModalCancel.addEventListener(
  "click",
  closeUserModal
);


userModal.addEventListener(
  "click",
  event => {
    if (
      event.target ===
      userModal
    ) {
      closeUserModal();
    }
  }
);


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
// FILTRO SUCURSAL
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
      event.target.value
        .trim();

    renderOrders();
  }
);


// ==========================================================
// CERRAR MODAL DE PEDIDO
// ==========================================================

function closeModal() {
  selectedOrderId = null;

  modal.classList.add(
    "hidden"
  );

  document.body.style.overflow =
    "";
}

// ==========================================================
// PEDIDO
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


assemblyLocationSelect.addEventListener(
  "change",
  changeAssemblyLocation
);


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
// INCIDENCIA
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
// ESCAPE
// ==========================================================

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key !==
      "Escape"
    ) {
      return;
    }

    if (
      !userModal.classList.contains(
        "hidden"
      )
    ) {
      closeUserModal();

      return;
    }

    if (
      incidentModal.classList.contains(
        "is-open"
      )
    ) {
      closeIncidentModal();

      return;
    }

    if (
      imageViewer &&
      !imageViewer.classList.contains(
        "hidden"
      )
    ) {
      closeImageViewer();

      return;
    }

    if (
      !modal.classList.contains(
        "hidden"
      )
    ) {
      closeModal();
    }
  }
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
// EJECUTAR
// ==========================================================

init();
