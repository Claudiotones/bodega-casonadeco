const SHOPIFY_API_VERSION = "2026-07";

const SESSION_COOKIE_NAME = "casona_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_ITERATIONS = 100000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

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

    try {

      // ======================================================
      // CREAR PRIMER ADMINISTRADOR
      // ======================================================

      if (
        pathname ===
        "/api/setup-admin"
      ) {
        if (
          request.method !==
          "POST"
        ) {
          return methodNotAllowed();
        }

        return await setupFirstAdmin(
          request,
          env
        );
      }


      // ======================================================
      // LOGIN
      // ======================================================

      if (
        pathname ===
        "/api/auth/login"
      ) {
        if (
          request.method !==
          "POST"
        ) {
          return methodNotAllowed();
        }

        return await loginUser(
          request,
          env
        );
      }


      // ======================================================
      // USUARIO ACTUAL
      // ======================================================

      if (
        pathname ===
        "/api/auth/me"
      ) {
        if (
          request.method !==
          "GET"
        ) {
          return methodNotAllowed();
        }

        return await getAuthMe(
          request,
          env
        );
      }


      // ======================================================
      // LOGOUT
      // ======================================================

      if (
        pathname ===
        "/api/auth/logout"
      ) {
        if (
          request.method !==
          "POST"
        ) {
          return methodNotAllowed();
        }

        return await logoutUser(
          request,
          env
        );
      }


      // ======================================================
      // USUARIOS
      // GET /api/users
      // POST /api/users
      // ======================================================

      if (
        pathname ===
        "/api/users"
      ) {
        if (
          request.method ===
          "GET"
        ) {
          return await listUsers(
            request,
            env
          );
        }

        if (
          request.method ===
          "POST"
        ) {
          return await createUser(
            request,
            env
          );
        }

        return methodNotAllowed();
      }


      // ======================================================
      // EDITAR USUARIO
      // PUT /api/users/:id
      // ======================================================

      const userUpdateMatch =
        pathname.match(
          /^\/api\/users\/([^/]+)$/
        );

      if (
        userUpdateMatch
      ) {
        if (
          request.method !==
          "PUT"
        ) {
          return methodNotAllowed();
        }

        return await updateUser(
          request,
          env,
          decodeURIComponent(
            userUpdateMatch[1]
          )
        );
      }


      // ======================================================
      // PEDIDOS SHOPIFY
      // ======================================================

      if (
        pathname ===
        "/api/orders"
      ) {
        if (
          request.method !==
          "GET"
        ) {
          return methodNotAllowed();
        }

        return await getShopifyOrders(
          env
        );
      }


      // ======================================================
      // ESTADOS D1
      // ======================================================

      if (
        pathname ===
        "/api/states"
      ) {
        if (
          request.method !==
          "GET"
        ) {
          return methodNotAllowed();
        }

        return await getAllStates(
          env
        );
      }


      // ======================================================
      // ESTADO PEDIDO
      // ======================================================

      const orderStateMatch =
        pathname.match(
          /^\/api\/orders\/([^/]+)\/state$/
        );

      if (
        orderStateMatch
      ) {
        if (
          request.method !==
          "PUT"
        ) {
          return methodNotAllowed();
        }

        return await updateOrderState(
          request,
          env,
          decodeURIComponent(
            orderStateMatch[1]
          )
        );
      }


      // ======================================================
      // ESTADO PRODUCTO
      // ======================================================

      const productStateMatch =
        pathname.match(
          /^\/api\/orders\/([^/]+)\/products\/([^/]+)$/
        );

      if (
        productStateMatch
      ) {
        if (
          request.method !==
          "PUT"
        ) {
          return methodNotAllowed();
        }

        return await updateProductState(
          request,
          env,
          decodeURIComponent(
            productStateMatch[1]
          ),
          decodeURIComponent(
            productStateMatch[2]
          )
        );
      }


      // ======================================================
      // CREAR INCIDENCIA
      // ======================================================

      const incidentCreateMatch =
        pathname.match(
          /^\/api\/orders\/([^/]+)\/incidents$/
        );

      if (
        incidentCreateMatch
      ) {
        if (
          request.method !==
          "POST"
        ) {
          return methodNotAllowed();
        }

        return await createIncident(
          request,
          env,
          decodeURIComponent(
            incidentCreateMatch[1]
          )
        );
      }


      // ======================================================
      // RESOLVER INCIDENCIA
      // ======================================================

      const incidentResolveMatch =
        pathname.match(
          /^\/api\/incidents\/([^/]+)\/resolve$/
        );

      if (
        incidentResolveMatch
      ) {
        if (
          request.method !==
          "PUT"
        ) {
          return methodNotAllowed();
        }

        return await resolveIncident(
          env,
          decodeURIComponent(
            incidentResolveMatch[1]
          )
        );
      }


      // ======================================================
      // HISTORIAL
      // ======================================================

      const historyMatch =
        pathname.match(
          /^\/api\/orders\/([^/]+)\/history$/
        );

      if (
        historyMatch
      ) {
        if (
          request.method !==
          "POST"
        ) {
          return methodNotAllowed();
        }

        return await addOrderHistory(
          request,
          env,
          decodeURIComponent(
            historyMatch[1]
          )
        );
      }


      // ======================================================
      // ARCHIVOS ESTÁTICOS
      // ======================================================

      return env.ASSETS.fetch(
        request
      );

    } catch (error) {

      console.error(
        "Worker error:",
        error
      );

      return jsonResponse(
        {
          success:
            false,

          error:
            error.publicMessage ||
            "Ocurrió un error en el servidor.",

          detail:
            error.message
        },
        error.status ||
        500
      );
    }
  }
};


// ==========================================================
// PRIMER ADMIN
// ==========================================================

async function setupFirstAdmin(
  request,
  env
) {
  validateD1(
    env
  );

  const existing =
    await env.DB
      .prepare(
        "SELECT COUNT(*) AS total FROM users"
      )
      .first();

  if (
    Number(
      existing?.total ||
      0
    ) > 0
  ) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "La configuración inicial ya fue realizada."
      },
      409
    );
  }

  const body =
    await readJsonBody(
      request
    );

  const username =
    normalizeUsername(
      body.username
    );

  const name =
    String(
      body.name ||
      ""
    ).trim();

  const password =
    String(
      body.password ||
      ""
    );

  validateUsername(
    username
  );

  validateDisplayName(
    name
  );

  validatePassword(
    password
  );

  const {
    hash,
    salt
  } =
    await createPasswordHash(
      password
    );

  const id =
    crypto.randomUUID();

  const createdAt =
    new Date()
      .toISOString();

  await env.DB
    .prepare(`
      INSERT INTO users (
        id,
        username,
        name,
        password_hash,
        password_salt,
        role,
        location,
        active,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, 'admin', NULL, 1, ?)
    `)
    .bind(
      id,
      username,
      name,
      hash,
      salt,
      createdAt
    )
    .run();

  const session =
    await createSession(
      env,
      id
    );

  return jsonResponse(
    {
      success:
        true,

      user: {
        id,
        username,
        name,

        role:
          "admin",

        location:
          null,

        active:
          true,

        createdAt
      }
    },
    201,
    {
      "Set-Cookie":
        buildSessionCookie(
          session.id,
          SESSION_DURATION_SECONDS
        )
    }
  );
}


// ==========================================================
// LOGIN
// ==========================================================

async function loginUser(
  request,
  env
) {
  validateD1(
    env
  );

  const body =
    await readJsonBody(
      request
    );

  const username =
    normalizeUsername(
      body.username
    );

  const password =
    String(
      body.password ||
      ""
    );

  if (
    !username ||
    !password
  ) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "Usuario o contraseña incorrectos."
      },
      401
    );
  }

  const user =
    await env.DB
      .prepare(`
        SELECT
          id,
          username,
          name,
          password_hash,
          password_salt,
          role,
          location,
          active,
          created_at
        FROM users
        WHERE username = ?
      `)
      .bind(
        username
      )
      .first();

  if (
    !user ||
    Number(
      user.active
    ) !== 1
  ) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "Usuario o contraseña incorrectos."
      },
      401
    );
  }

  const valid =
    await verifyPassword(
      password,
      user.password_salt,
      user.password_hash
    );

  if (!valid) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "Usuario o contraseña incorrectos."
      },
      401
    );
  }

  const session =
    await createSession(
      env,
      user.id
    );

  return jsonResponse(
    {
      success:
        true,

      user:
        publicUserFromRow(
          user
        )
    },
    200,
    {
      "Set-Cookie":
        buildSessionCookie(
          session.id,
          SESSION_DURATION_SECONDS
        )
    }
  );
}


// ==========================================================
// USUARIO ACTUAL
// ==========================================================

async function getAuthMe(
  request,
  env
) {
  validateD1(
    env
  );

  const user =
    await getCurrentUser(
      request,
      env
    );

  if (!user) {
    return jsonResponse(
      {
        success:
          false,

        authenticated:
          false,

        error:
          "No hay una sesión activa."
      },
      401
    );
  }

  return jsonResponse({
    success:
      true,

    authenticated:
      true,

    user
  });
}


// ==========================================================
// LOGOUT
// ==========================================================

async function logoutUser(
  request,
  env
) {
  validateD1(
    env
  );

  const sessionId =
    getCookieValue(
      request,
      SESSION_COOKIE_NAME
    );

  if (
    sessionId
  ) {
    await env.DB
      .prepare(
        "DELETE FROM sessions WHERE id = ?"
      )
      .bind(
        sessionId
      )
      .run();
  }

  return jsonResponse(
    {
      success:
        true
    },
    200,
    {
      "Set-Cookie":
        buildExpiredSessionCookie()
    }
  );
}


// ==========================================================
// LISTAR USUARIOS
// ==========================================================

async function listUsers(
  request,
  env
) {
  validateD1(
    env
  );

  await requireAdmin(
    request,
    env
  );

  const result =
    await env.DB
      .prepare(`
        SELECT
          id,
          username,
          name,
          role,
          location,
          active,
          created_at
        FROM users
        ORDER BY name COLLATE NOCASE ASC
      `)
      .all();

  return jsonResponse({
    success:
      true,

    users:
      (
        result.results ||
        []
      ).map(
        publicUserFromRow
      )
  });
}


// ==========================================================
// CREAR USUARIO
// ==========================================================

async function createUser(
  request,
  env
) {
  validateD1(
    env
  );

  await requireAdmin(
    request,
    env
  );

  const body =
    await readJsonBody(
      request
    );

  const username =
    normalizeUsername(
      body.username
    );

  const name =
    String(
      body.name ||
      ""
    ).trim();

  const password =
    String(
      body.password ||
      ""
    );

  const role =
    String(
      body.role ||
      "bodega"
    ).trim();

  const location =
    normalizeUserLocation(
      body.location
    );

  validateUsername(
    username
  );

  validateDisplayName(
    name
  );

  validatePassword(
    password
  );

  validateUserRole(
    role
  );

  validateUserLocation(
    location
  );

  const duplicate =
    await env.DB
      .prepare(
        "SELECT id FROM users WHERE username = ?"
      )
      .bind(
        username
      )
      .first();

  if (
    duplicate
  ) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "Ese nombre de usuario ya existe."
      },
      409
    );
  }

  const {
    hash,
    salt
  } =
    await createPasswordHash(
      password
    );

  const id =
    crypto.randomUUID();

  const createdAt =
    new Date()
      .toISOString();

  await env.DB
    .prepare(`
      INSERT INTO users (
        id,
        username,
        name,
        password_hash,
        password_salt,
        role,
        location,
        active,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `)
    .bind(
      id,
      username,
      name,
      hash,
      salt,
      role,
      location,
      createdAt
    )
    .run();

  return jsonResponse(
    {
      success:
        true,

      user: {
        id,
        username,
        name,
        role,
        location,

        active:
          true,

        createdAt
      }
    },
    201
  );
}


// ==========================================================
// EDITAR USUARIO
// ==========================================================

async function updateUser(
  request,
  env,
  userId
) {
  validateD1(
    env
  );

  const admin =
    await requireAdmin(
      request,
      env
    );

  const existing =
    await env.DB
      .prepare(`
        SELECT
          id,
          username,
          name,
          role,
          location,
          active,
          created_at
        FROM users
        WHERE id = ?
      `)
      .bind(
        userId
      )
      .first();

  if (
    !existing
  ) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "Usuario no encontrado."
      },
      404
    );
  }

  const body =
    await readJsonBody(
      request
    );

  const username =
    body.username ===
    undefined
      ? existing.username
      : normalizeUsername(
          body.username
        );

  const name =
    body.name ===
    undefined
      ? existing.name
      : String(
          body.name ||
          ""
        ).trim();

  const role =
    body.role ===
    undefined
      ? existing.role
      : String(
          body.role ||
          ""
        ).trim();

  const location =
    body.location ===
    undefined
      ? existing.location
      : normalizeUserLocation(
          body.location
        );

  const active =
    body.active ===
    undefined
      ? Number(
          existing.active
        ) === 1
      : Boolean(
          body.active
        );

  validateUsername(
    username
  );

  validateDisplayName(
    name
  );

  validateUserRole(
    role
  );

  validateUserLocation(
    location
  );

  if (
    admin.id ===
      userId &&
    !active
  ) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "No puedes desactivar tu propia cuenta."
      },
      400
    );
  }

  if (
    admin.id ===
      userId &&
    role !==
      "admin"
  ) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "No puedes quitarte a ti mismo el rol de administrador."
      },
      400
    );
  }

  const duplicate =
    await env.DB
      .prepare(`
        SELECT id
        FROM users
        WHERE username = ?
          AND id <> ?
      `)
      .bind(
        username,
        userId
      )
      .first();

  if (
    duplicate
  ) {
    return jsonResponse(
      {
        success:
          false,

        error:
          "Ese nombre de usuario ya existe."
      },
      409
    );
  }

  if (
    body.password !==
    undefined
  ) {
    const password =
      String(
        body.password ||
        ""
      );

    validatePassword(
      password
    );

    const {
      hash,
      salt
    } =
      await createPasswordHash(
        password
      );

    await env.DB
      .prepare(`
        UPDATE users
        SET
          username = ?,
          name = ?,
          role = ?,
          location = ?,
          active = ?,
          password_hash = ?,
          password_salt = ?
        WHERE id = ?
      `)
      .bind(
        username,
        name,
        role,
        location,
        active
          ? 1
          : 0,
        hash,
        salt,
        userId
      )
      .run();

  } else {

    await env.DB
      .prepare(`
        UPDATE users
        SET
          username = ?,
          name = ?,
          role = ?,
          location = ?,
          active = ?
        WHERE id = ?
      `)
      .bind(
        username,
        name,
        role,
        location,
        active
          ? 1
          : 0,
        userId
      )
      .run();
  }

  if (
    !active
  ) {
    await env.DB
      .prepare(
        "DELETE FROM sessions WHERE user_id = ?"
      )
      .bind(
        userId
      )
      .run();
  }

  return jsonResponse({
    success:
      true,

    user: {
      id:
        userId,

      username,
      name,
      role,
      location,
      active,

      createdAt:
        existing.created_at ||
        null
    }
  });
}


// ==========================================================
// USUARIO DESDE SESIÓN
// ==========================================================

async function getCurrentUser(
  request,
  env
) {
  const sessionId =
    getCookieValue(
      request,
      SESSION_COOKIE_NAME
    );

  if (
    !sessionId
  ) {
    return null;
  }

  const now =
    new Date()
      .toISOString();

  const row =
    await env.DB
      .prepare(`
        SELECT
          users.id,
          users.username,
          users.name,
          users.role,
          users.location,
          users.active,
          users.created_at,
          sessions.expires_at
        FROM sessions

        INNER JOIN users
          ON users.id =
             sessions.user_id

        WHERE sessions.id = ?
          AND sessions.expires_at > ?
          AND users.active = 1
      `)
      .bind(
        sessionId,
        now
      )
      .first();

  if (
    !row
  ) {
    await env.DB
      .prepare(
        "DELETE FROM sessions WHERE id = ?"
      )
      .bind(
        sessionId
      )
      .run();

    return null;
  }

  return publicUserFromRow(
    row
  );
}


// ==========================================================
// EXIGIR ADMIN
// ==========================================================

async function requireAdmin(
  request,
  env
) {
  const user =
    await getCurrentUser(
      request,
      env
    );

  if (
    !user
  ) {
    const error =
      new Error(
        "Debes iniciar sesión."
      );

    error.status =
      401;

    error.publicMessage =
      error.message;

    throw error;
  }

  if (
    user.role !==
    "admin"
  ) {
    const error =
      new Error(
        "Se requiere rol de administrador."
      );

    error.status =
      403;

    error.publicMessage =
      error.message;

    throw error;
  }

  return user;
}


// ==========================================================
// SESIONES
// ==========================================================

async function createSession(
  env,
  userId
) {
  const id =
    crypto.randomUUID();

  const createdAt =
    new Date();

  const expiresAt =
    new Date(
      createdAt.getTime() +
      SESSION_DURATION_SECONDS *
      1000
    );

  await env.DB
    .prepare(
      "DELETE FROM sessions WHERE expires_at <= ?"
    )
    .bind(
      createdAt
        .toISOString()
    )
    .run();

  await env.DB
    .prepare(`
      INSERT INTO sessions (
        id,
        user_id,
        expires_at,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      id,
      userId,
      expiresAt
        .toISOString(),
      createdAt
        .toISOString()
    )
    .run();

  return {
    id,

    expiresAt:
      expiresAt
        .toISOString()
  };
}


// ==========================================================
// COOKIE SESIÓN
// ==========================================================

function buildSessionCookie(
  sessionId,
  maxAge
) {
  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(
      sessionId
    )}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAge}`
  ].join(
    "; "
  );
}


function buildExpiredSessionCookie() {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0"
  ].join(
    "; "
  );
}


function getCookieValue(
  request,
  name
) {
  const cookieHeader =
    request.headers.get(
      "Cookie"
    ) ||
    "";

  for (
    const part of
    cookieHeader.split(
      ";"
    )
  ) {
    const trimmed =
      part.trim();

    const index =
      trimmed.indexOf(
        "="
      );

    if (
      index < 0
    ) {
      continue;
    }

    const key =
      trimmed.slice(
        0,
        index
      );

    if (
      key !==
      name
    ) {
      continue;
    }

    return decodeURIComponent(
      trimmed.slice(
        index + 1
      )
    );
  }

  return null;
}


// ==========================================================
// HASH CONTRASEÑA
// ==========================================================

async function createPasswordHash(
  password
) {
  const saltBytes =
    crypto.getRandomValues(
      new Uint8Array(
        16
      )
    );

  const hashBytes =
    await derivePasswordBytes(
      password,
      saltBytes
    );

  return {
    salt:
      bytesToBase64(
        saltBytes
      ),

    hash:
      bytesToBase64(
        hashBytes
      )
  };
}


async function verifyPassword(
  password,
  saltBase64,
  expectedHashBase64
) {
  const saltBytes =
    base64ToBytes(
      saltBase64
    );

  const actualHash =
    await derivePasswordBytes(
      password,
      saltBytes
    );

  const expectedHash =
    base64ToBytes(
      expectedHashBase64
    );

  return constantTimeEqual(
    actualHash,
    expectedHash
  );
}


async function derivePasswordBytes(
  password,
  saltBytes
) {
  const encoder =
    new TextEncoder();

  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(
        password
      ),
      "PBKDF2",
      false,
      [
        "deriveBits"
      ]
    );

  const bits =
    await crypto.subtle.deriveBits(
      {
        name:
          "PBKDF2",

        salt:
          saltBytes,

        iterations:
          PASSWORD_ITERATIONS,

        hash:
          "SHA-256"
      },
      keyMaterial,
      256
    );

  return new Uint8Array(
    bits
  );
}


function constantTimeEqual(
  left,
  right
) {
  if (
    left.length !==
    right.length
  ) {
    return false;
  }

  let difference =
    0;

  for (
    let i = 0;
    i < left.length;
    i++
  ) {
    difference |=
      left[i] ^
      right[i];
  }

  return difference ===
    0;
}


function bytesToBase64(
  bytes
) {
  let binary =
    "";

  for (
    const byte of
    bytes
  ) {
    binary +=
      String.fromCharCode(
        byte
      );
  }

  return btoa(
    binary
  );
}


function base64ToBytes(
  value
) {
  const binary =
    atob(
      value
    );

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(
        i
      );
  }

  return bytes;
}


// ==========================================================
// VALIDACIONES USUARIOS
// ==========================================================

function normalizeUsername(
  value
) {
  return String(
    value ||
    ""
  )
    .trim()
    .toLowerCase();
}


function normalizeUserLocation(
  value
) {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value ===
      "" ||
    value ===
      "ninguna"
  ) {
    return null;
  }

  return String(
    value
  ).trim();
}


function validateUsername(
  username
) {
  if (
    !/^[a-z0-9._-]{3,30}$/.test(
      username
    )
  ) {
    throw new Error(
      "El usuario debe tener entre 3 y 30 caracteres y usar solo letras minúsculas, números, punto, guion o guion bajo."
    );
  }
}


function validateDisplayName(
  name
) {
  if (
    name.length <
      2 ||
    name.length >
      80
  ) {
    throw new Error(
      "El nombre debe tener entre 2 y 80 caracteres."
    );
  }
}


function validatePassword(
  password
) {
  if (
    password.length <
      8 ||
    password.length >
      128
  ) {
    throw new Error(
      "La contraseña debe tener entre 8 y 128 caracteres."
    );
  }
}


function validateUserRole(
  role
) {
  const allowed = [
    "admin",
    "bodega",
    "armado",
    "despacho"
  ];

  if (
    !allowed.includes(
      role
    )
  ) {
    throw new Error(
      `Rol de usuario inválido: ${role}`
    );
  }
}


function validateUserLocation(
  location
) {
  const allowed = [
    null,
    "las-condes",
    "patronato"
  ];

  if (
    !allowed.includes(
      location
    )
  ) {
    throw new Error(
      `Sucursal de usuario inválida: ${location}`
    );
  }
}


function publicUserFromRow(
  row
) {
  return {
    id:
      row.id,

    username:
      row.username,

    name:
      row.name,

    role:
      row.role,

    location:
      row.location ||
      null,

    active:
      Number(
        row.active
      ) === 1,

    createdAt:
      row.created_at ||
      null
  };
}


// ==========================================================
// SHOPIFY PEDIDOS
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

  if (
    !response.ok
  ) {
    throw new Error(
      `Shopify respondió HTTP ${response.status}`
    );
  }

  if (
    data.errors
  ) {
    throw new Error(
      data.errors
        .map(
          error =>
            error.message
        )
        .join(
          " | "
        )
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
              ?.city ||
            "",

          province:
            order.shippingAddress
              ?.province ||
            "",

          provinceCode:
            order.shippingAddress
              ?.provinceCode ||
            "",

          country:
            order.shippingAddress
              ?.country ||
            "",

          methods:
            order.shippingLines.nodes.map(
              line =>
                line.title
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
                item.sku ||
                "",

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
// D1 ESTADOS
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
            created_at,
            user_id,
            user_name,
            user_role
          FROM order_history
          ORDER BY id ASC
        `)
        .all()
    ]);

  const stateMap =
    {};

  for (
    const row of
    orderStatesResult.results ||
    []
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
        row.notes ||
        "",

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
    productStatesResult.results ||
    []
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
    incidentsResult.results ||
    []
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
        row.product_code ||
        "",

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
    historyResult.results ||
    []
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
        row.created_at,

      userId:
        row.user_id ||
        null,

      userName:
        row.user_name ||
        null,

      userRole:
        row.user_role ||
        null
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
// ESTADO GENERAL PEDIDO
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
    existing?.shopify_order_id ??
    null;

  const status =
    body.status ??
    existing?.status ??
    "pendiente";

  const previousStatus =
    body.previousStatus ??
    existing?.previous_status ??
    null;

  const assemblyLocation =
    body.assemblyLocation ??
    existing?.assembly_location ??
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
// ESTADO PRODUCTO
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
    existing?.warehouse_status ??
    "pendiente";

  const transferFrom =
    body.transferFrom ===
    undefined
      ? existing?.transfer_from ??
        null
      : body.transferFrom;

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

  if (
    !productId
  ) {
    throw new Error(
      "Falta productId."
    );
  }

  if (
    !reason
  ) {
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

  if (
    !incident
  ) {
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

      incident: {
        id:
          incidentId,

        status:
          "resuelto"
      },

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
// HISTORIAL
// ==========================================================

async function addOrderHistory(
  request,
  env,
  orderNumber
) {
  validateD1(
    env
  );

  const user =
    await getCurrentUser(
      request,
      env
    );

  if (!user) {
    return jsonResponse(
      {
        success: false,
        error: "Debes iniciar sesión."
      },
      401
    );
  }

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
    new Date()
      .toISOString();

  const result =
    await env.DB
      .prepare(`
        INSERT INTO order_history (
          order_number,
          text,
          created_at,
          user_id,
          user_name,
          user_role
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        orderNumber,
        text,
        createdAt,
        user.id,
        user.name,
        user.role
      )
      .run();

  return jsonResponse(
    {
      success:
        true,

      history: {
        orderNumber,
        text,
        createdAt,

        userId:
          user.id,

        userName:
          user.name,

        userRole:
          user.role
      },

      meta:
        result.meta
    },
    201
  );
}


// ==========================================================
// CONTENEDOR ESTADO
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
// CÓDIGO PRODUCTO
// ==========================================================

function getProductCode(
  item
) {
  const product =
    item.variant
      ?.product;

  if (
    !product
  ) {
    return "";
  }

  const metafieldCode =
    product.codigo
      ?.value
      ?.trim();

  if (
    metafieldCode
  ) {
    return metafieldCode;
  }

  return extractCodeFromDescription(
    stripHtml(
      product.descriptionHtml ||
      ""
    )
  );
}


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
      match?.[1]
    ) {
      return match[
        1
      ].trim();
    }
  }

  return "";
}


function stripHtml(
  html
) {
  if (
    !html
  ) {
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
// SHOPIFY TOKEN
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
// IMAGEN PRODUCTO
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


function getFullSizeShopifyImage(
  url
) {
  if (
    !url
  ) {
    return "";
  }

  return url.replace(
    /_(?:pico|icon|thumb|small|compact|medium|large|grande|\d+x\d+)(?=\.[a-zA-Z]+(?:\?|$))/,
    ""
  );
}


// ==========================================================
// VALIDACIONES
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
// JSON REQUEST
// ==========================================================

async function readJsonBody(
  request
) {
  const contentType =
    request.headers.get(
      "content-type"
    ) ||
    "";

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
  status = 200,
  extraHeaders = {}
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
          "*",

        ...extraHeaders
      }
    }
  );
}
