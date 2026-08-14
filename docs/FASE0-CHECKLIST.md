# FASE0 — Frentes no técnicos

> **Arrancar en paralelo desde el día uno.** Todos dependen de terceros o del usuario, y sus tiempos de espera no se comprimen escribiendo código más rápido.

## A. Trámites y cuentas

| # | Qué | Bloquea | Estado |
|---|---|---|---|
| A1 | Dominio registrado y apuntado | Despliegue | ⬜ |
| A2 | Correo transaccional: cuenta Brevo + SPF, DKIM y DMARC en el dominio | P12 paso 1 | ⬜ |
| A3 | Cuenta de calendario de empresa (no la personal) y permisos mínimos | P12 paso 2 | ⬜ |
| A4 | Cuenta del proveedor del modelo, con tope de gasto configurado | P12 paso 4 | ⬜ |
| A5 | Hosting elegido y contratado | Despliegue | ⬜ |
| A6 | Aviso de privacidad y términos, revisados contra LOPDP | **Encender el bot** | ⬜ |
| A7 | Licencia de GSAP: verificar términos vigentes para uso comercial | P3 si se usan plugins | ⬜ |

## B. Contenido y negocio

| # | Qué | Bloquea | Estado |
|---|---|---|---|
| B1 | Seis trabajos reales: nombre autorizado por el cliente, tipo, año, enlace, captura | Publicar la sección Trabajos | ⬜ |
| B2 | Testimonio con nombre y cargo reales, o decidir retirar la sección | Publicación | ⬜ |
| B3 | Número de WhatsApp y texto previo del mensaje | Publicación | ⬜ |
| B4 | Horario real de disponibilidad para reuniones (confirmar D1) | — | ⬜ |
| B5 | Guion del bot revisado por el usuario: qué dice y qué no | P8 | ⬜ |

## C. Decisión previa a P0

| # | Qué | Bloquea | Estado |
|---|---|---|---|
| C1 | Qué se extrae de Care como paquete compartido (motor de disponibilidad, máquina de estados) | **Estructura del proyecto** | ⬜ |
| C2 | Convención de idioma de identificadores, alineada con Commerce (D12) | P0 | ⬜ |

> C1 es la más importante de esta lista. Care ya resuelve agendamiento con calendario real. Decidir esto **después** de P5 significa mantener dos motores distintos con los mismos errores.

## D. Automatizaciones internas

| # | Qué | Paquete |
|---|---|---|
| D1 | Pre-commit con `audit:fast` | P0 |
| D2 | Contratos de API generados desde el código | P6 |
| D3 | CI con `npm run audit` completo | P0 |
| D4 | Generador de bloques ocupados sintéticos para probar disponibilidad | P5 |
