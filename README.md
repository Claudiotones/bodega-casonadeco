# Bodega Casona Deco

Sistema interno para la gestión y seguimiento de pedidos de **Casona Deco**.

## Objetivo

Centralizar el proceso de preparación y despacho de pedidos provenientes de Shopify, reemplazando parte del seguimiento manual realizado actualmente mediante WhatsApp.

El sistema permite visualizar pedidos, productos, cantidades, fotografías y el estado de preparación de cada pedido.

## Flujo de pedidos

Los pedidos avanzan por los siguientes estados:

`Pendiente → Bodega → Armando → Enviado`

También existe un estado especial:

`Problema`

## Funciones actuales

* Visualización de pedidos.
* Clasificación entre Santiago y Regiones.
* Búsqueda por número de pedido o producto.
* Filtros por estado.
* Visualización de productos y cantidades.
* Ampliación de fotografías dentro de la aplicación.
* Registro de observaciones.
* Historial de cambios.
* Estado especial para pedidos con problemas.
* Persistencia temporal mediante `localStorage`.

## Tecnologías

* HTML
* CSS
* JavaScript
* Cloudflare Pages
* GitHub

## Próximas etapas

* Firebase / Firestore para sincronización entre dispositivos.
* Firebase Authentication para usuarios internos.
* Integración con Shopify.
* Importación automática de pedidos pagados.
* Obtención automática de imágenes originales de productos.
* Registro del usuario responsable de cada etapa.
* Sincronización de estados con Shopify.

## Estructura

```text
bodega-casonadeco/
├── index.html
├── style.css
├── app.js
└── README.md
```

## Estado

Actualmente el proyecto se encuentra en etapa de prototipo funcional.

Los pedidos utilizados en esta versión son datos de demostración.
