# 🎟️ Sistema de Reserva de Entradas — *Race Conditions* y Transacciones ACID
### Laboratorio Práctico de Backend y Seguridad con Node.js + Express + PostgreSQL

Este proyecto forma parte de mi ruta de formación y portafolio orientado al **desarrollo backend y la ciberseguridad**. En este laboratorio construí una API REST conectada a PostgreSQL con una interfaz visual para demostrar cómo ocurren las **condiciones de carrera (*race conditions*)** en operaciones concurrentes y cómo mitigarlas mediante **transacciones ACID** y bloqueo de filas con `FOR UPDATE`.

---

## 🛡️ ¿Por qué esto importa en ciberseguridad y backend?

En aplicaciones reales (reservas de entradas, transferencias, canje de cupones, control de stock o límites de uso), un fallo de concurrencia no es solo un error de lógica de negocio: también puede convertirse en un **vector de abuso** (como doble asignación de un recurso o explotación por *timing* cuando múltiples peticiones llegan casi al mismo tiempo).

Imagina un evento con **un solo asiento disponible** y dos usuarios intentando reservarlo **simultáneamente**:

| Escenario vulnerable / sin bloqueo ❌ | Escenario protegido con transacción ✅ |
|---|---|
| Dos peticiones concurrentes leen "1 asiento disponible" al mismo tiempo | PostgreSQL inicia una transacción (`BEGIN`) y **bloquea** la fila con `FOR UPDATE` |
| Ambas pasan la comprobación inicial de disponibilidad | La segunda petición **espera** hasta que la primera termine su transacción |
| El sistema registra dos reservas para el mismo último asiento | Solo la primera reserva se confirma (`COMMIT`); la otra ve `0` cupos |
| Se rompe la integridad de los datos y se abren puertas a abuso por concurrencia | El estado se mantiene consistente y protegido bajo propiedades **ACID** |

Este repositorio permite observar este comportamiento de forma práctica y visual directamente en el navegador, respaldado por una API real en Node.js + Express + PostgreSQL.

---

## 🧰 ¿Qué necesito instalar antes de empezar?

Para ejecutar este laboratorio en tu entorno local necesitas:

1. **Node.js** (entorno de ejecución para el servidor JavaScript)
2. **PostgreSQL** (base de datos relacional donde se gestionan los datos y bloqueos)
3. **Git** (para clonar el repositorio y trabajar con control de versiones)

---

## 🐘 Instalación y configuración de PostgreSQL paso a paso

> Si ya tienes PostgreSQL instalado y funcionando, puedes pasar directamente a la configuración de la base de datos.

### En Windows

1. Descarga el instalador desde [https://www.postgresql.org/download/windows](https://www.postgresql.org/download/windows) (por ejemplo, PostgreSQL 16 o superior).
2. Ejecuta el instalador siguiendo estos pasos:
   - Conserva la ruta de instalación por defecto.
   - Selecciona los componentes principales, incluyendo **pgAdmin 4**.
   - Define una contraseña para el usuario `postgres` (por ejemplo, `123456` en entorno local de pruebas) y guárdala bien.
   - Mantén el puerto por defecto (`5432`).
   - Completa la instalación.
3. Abre **pgAdmin 4** desde el menú de inicio.

### Crear la base de datos

1. En **pgAdmin 4**, navega en el panel izquierdo hasta **Servers → PostgreSQL → Databases**.
2. Haz clic derecho sobre **Databases** → **Create → Database...**
3. En el campo **Database**, escribe `primer_proyecto_api` (o el nombre que prefieras usar en tu `.env`).
4. Haz clic en **Save**.

Las tablas se crearán automáticamente cuando inicies la aplicación por primera vez.

---

## 📥 Instalación del proyecto

### Clonar desde GitHub
```bash
git clone [https://github.com/HexK29/TU_REPO.git](https://github.com/HexK29/TU_REPO.git)
cd TU_REPO