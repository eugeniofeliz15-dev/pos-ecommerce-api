# 🛒 POS & E-commerce API

API RESTful robusta y escalable para un sistema híbrido de Punto de Venta (POS) y Tienda en Línea (E-commerce). Construida con NestJS, Prisma y PostgreSQL.

## 🚀 Características Principales
- **Autenticación y Autorización:** JWT con roles (Administrador, Cajero, Cliente).
- **Seguridad Blindada:** Rate Limiting, Helmet, CORS y validación estricta de entorno (Joi).
- **Integridad de Datos:** Soft Delete para proteger el historial financiero y de inventario.
- **Rendimiento:** Paginación implementada en módulos de alto tráfico.
- **Pasarela de Pagos:** Integración con MockPay y Webhooks para confirmación asíncrona.
- **Documentación:** Swagger UI interactivo y completo.

## 🛠️ Stack Tecnológico
- **Framework:** [NestJS](https://nestjs.com/)
- **Base de Datos:** PostgreSQL (vía [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Hosting:** [Render](https://render.com/)

## 🌍 API en Producción
La API está desplegada y disponible 24/7 en:
👉 **[https://pos-ecommerce-api-24lq.onrender.com/api/docs]*

## 🔑 Credenciales de Prueba
Puedes usar estos usuarios para probar los diferentes roles en el endpoint `/auth/login`:

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@demo.com` | `Admin123!` |
| **Cajero** | `cajero@demo.com` | `Cajero123!` |
| **Cliente** | `cliente@demo.com` | `Client123!` |

## ⚙️ Instalación Local
1. Clona el repositorio: `git clone https://github.com/eugeniofeliz15-dev/pos-ecommerce-api.git`
2. Instala dependencias: `pnpm install`
3. Configura tu `.env` con tus variables locales.
4. Ejecuta migraciones: `pnpm prisma migrate dev`
5. Inicia el servidor: `pnpm run start:dev`

---
Desarrollado por **Cristian Eugenio Claudio Feliz** | 2026
