# 🎟️ Sistema de Reserva de Entradas
### Demostración de Transacciones Concurrentes con Node.js + Express + PostgreSQL

> **Para las chicas:** Esta guía está escrita para que puedan instalar, entender y defender este proyecto desde cero. Léanla completa antes de la defensa. ¡Pueden hacerlo! 💪

---

## 📌 ¿De qué trata este proyecto?

Imaginen que hay un concierto con **un solo asiento disponible** y dos personas intentan comprarlo **al mismo tiempo** desde sus celulares.

¿Qué pasa? Hay dos posibilidades:

| Sin protección ❌ | Con transacción ✅ |
|---|---|
| Las dos personas leen "1 asiento disponible" al mismo tiempo | La base de datos **bloquea** el asiento para la primera persona |
| Las dos pasan la verificación | La segunda persona **espera** |
| El sistema vende el mismo asiento **dos veces** | Solo una persona obtiene el asiento |
| El negocio pierde dinero y credibilidad | Todo funciona correctamente |

Este proyecto demuestra ese problema **visualmente** en el navegador, usando una API real conectada a PostgreSQL.

---

## 🧰 ¿Qué necesito instalar antes de empezar?

Necesitan tener instalado en su computadora:

1. **Node.js** (el motor que ejecuta el servidor)
2. **PostgreSQL** (la base de datos)
3. **Git** (para clonar el proyecto, opcional)

---

## 🐘 Instalación de PostgreSQL paso a paso

> Si ya tienen PostgreSQL instalado, salten a la sección siguiente.

### Windows

1. Ir a [https://www.postgresql.org/download/windows](https://www.postgresql.org/download/windows)
2. Descargar el instalador de la versión más reciente (ej: PostgreSQL 16)
3. Ejecutar el instalador y seguir los pasos:
   - Dejar la carpeta de instalación por defecto
   - Marcar todos los componentes (especialmente **pgAdmin 4**)
   - Cuando pida una contraseña, escribir `123456` (o la que prefieran, pero anótenla)
   - Puerto: dejar `5432` (el que viene por defecto)
   - Finalizar la instalación

4. Al terminar, abrir **pgAdmin 4** desde el menú de inicio

### Crear la base de datos en pgAdmin

1. Abrir pgAdmin 4
2. En el panel izquierdo, hacer clic en **Servers → PostgreSQL → Databases**
3. Clic derecho en **Databases** → **Create → Database...**
4. En el campo **Database**, escribir exactamente: `primer_proyecto_api`
5. Clic en **Save**

¡Listo! La base de datos está creada. Las tablas se crean automáticamente cuando arranquen el servidor.

---

## 📥 Instalación del proyecto

### Opción A — Clonar desde GitHub
```bash
git clone https://github.com/KeynerLizarazo/Database-s-Project.git
cd Database-s-Project
```

### Opción B — Descomprimir el ZIP
Si recibieron el proyecto como archivo `.zip`, descomprímanlo y abran la carpeta en la terminal.

### Instalar las dependencias
```bash
npm install
```

Esto descarga todas las librerías que el proyecto necesita (Express, PostgreSQL, JWT, etc.). Puede tardar un minuto.

---

## ⚙️ Configurar las variables de entorno

El archivo `.env` contiene la configuración de la base de datos. Ya viene configurado así:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=primer_proyecto_api
DB_USER=postgres
DB_PASSWORD=123456
JWT_SECRET=58c212b3e0082022963fce1b145c9b59466693768f88b4d5449010d22236adae
```

> **Importante:** Si cuando instalaron PostgreSQL pusieron una contraseña diferente a `123456`, cambien el valor de `DB_PASSWORD` por la contraseña que usaron.

---

## 🚀 Arrancar el proyecto

```bash
npm run dev
```

Deberían ver esto en la terminal:

```
✅ Base de datos lista
🌱 Datos de ejemplo insertados   ← solo la primera vez
🚀 Servidor corriendo en http://localhost:3000
🎟️  Panel de demo: http://localhost:3000
```

Luego abrir el navegador y entrar a:

```
http://localhost:3000
```

---

## 🖥️ ¿Qué van a ver en el navegador?

La pantalla está dividida en tres secciones:

### 1. Selector de eventos (arriba)
Tres eventos: Concierto de Rock, Final de Fútbol y Show de Comedia. Cada uno muestra cuántos asientos quedan. Al hacer clic en uno, los paneles de abajo se actualizan.

> **Sugerencia para la demo:** Seleccionen el **Concierto de Rock** que tiene 1 asiento. Así el problema de concurrencia se ve más claro.

### 2. Panel izquierdo — Compra SEGURA 🔒
Simula que Ana y Luis compran al mismo tiempo **con transacción**. Solo uno obtiene el asiento. El log muestra cada paso:
- `BEGIN` — se inicia la transacción
- `FOR UPDATE` — se bloquea la fila del evento
- `UPDATE events` — se descuenta el asiento
- `INSERT reservations` — se registra la reserva
- `COMMIT` — se confirma todo

### 3. Panel derecho — Compra INSEGURA ⚠️
Simula la misma situación **sin transacción**. Ambos leen el stock al mismo tiempo, los dos ven "1 disponible", y los dos reservan. El historial muestra dos reservas para el mismo asiento.

### 4. Historial (abajo)
Muestra todas las reservas realizadas con nombre, evento, estado y fecha.

---

## 🎯 Guión sugerido para la defensa

> Pueden usar estas palabras casi literales al explicar al jurado:

---

**Introducción:**
> "Este sistema simula la venta de entradas para eventos. El problema que resuelve es la **concurrencia**: qué pasa cuando dos personas intentan comprar el último asiento al mismo tiempo."

**Mostrando la demo segura:**
> "Voy a seleccionar el Concierto de Rock, que tiene 1 asiento. Presiono 'Compra Segura'. Como pueden ver, Ana y Luis compraron al mismo tiempo, pero solo Ana obtuvo el asiento. En el log se ve que la base de datos usó una **transacción**: primero hizo BEGIN, luego bloqueó la fila con FOR UPDATE para que nadie más pudiera leerla, descontó el asiento, registró la reserva y confirmó con COMMIT. Luis llegó segundo y recibió 'sin asientos disponibles'."

**Reseteando y mostrando la demo insegura:**
> "Ahora voy a resetear el evento a 1 asiento y mostrar qué pasa **sin** transacción. Presiono 'Compra Insegura'. Como ven, Ana y Luis **ambos** obtuvieron el asiento. Esto es porque los dos leyeron el stock al mismo tiempo, los dos vieron '1 disponible', y el sistema los dejó pasar a los dos. En el historial aparecen dos reservas para el mismo asiento. Esto es exactamente el problema que las transacciones resuelven."

**Cerrando:**
> "La diferencia clave es el `FOR UPDATE` en la consulta SQL. Esa instrucción le dice a PostgreSQL que bloquee la fila hasta que la transacción termine, impidiendo que otra transacción la lea al mismo tiempo."

---

## ❓ Preguntas frecuentes del jurado (y cómo responderlas)

**¿Qué es una transacción?**
> "Es un conjunto de operaciones que se ejecutan como una sola unidad. O todas tienen éxito, o ninguna se aplica. Si algo falla en el medio, la base de datos deshace todo con un ROLLBACK."

**¿Qué es el ACID?**
> "Son las cuatro propiedades que garantizan que una transacción es confiable: **A**tomicidad (todo o nada), **C**onsistencia (los datos siempre quedan en estado válido), **I**solamiento (las transacciones no se interfieren entre sí) y **D**urabilidad (una vez confirmada, la transacción persiste aunque se caiga el servidor)."

**¿Qué es el FOR UPDATE?**
> "Es una cláusula de PostgreSQL que bloquea la fila que estamos leyendo. Ninguna otra transacción puede leer ni modificar esa fila hasta que la nuestra termine con COMMIT o ROLLBACK."

**¿Qué pasa si el servidor se cae en medio de una transacción?**
> "PostgreSQL hace ROLLBACK automáticamente. Los datos vuelven al estado anterior, como si la operación nunca hubiera ocurrido."

**¿Por qué usaron Node.js y no otro lenguaje?**
> "Node.js es ideal para demostrar concurrencia porque maneja múltiples peticiones al mismo tiempo de forma asíncrona. Eso nos permite simular fácilmente dos compradores simultáneos desde el frontend."

---

## 🗂️ Estructura del proyecto explicada

```
src/
├── config/
│   └── db.js              → Conexión a PostgreSQL (Pool de conexiones)
├── db/
│   ├── init.js            → Crea las tablas automáticamente al arrancar
│   └── schema.sql         → El mismo script en SQL, como referencia
├── middleware/
│   └── auth.js            → Verifica el token JWT en rutas protegidas
├── models/
│   └── User.js            → Operaciones de la tabla users (registro/login)
├── public/
│   └── index.html         → El panel visual que se ve en el navegador
├── routes/
│   ├── auth.js            → POST /api/auth/register y /api/auth/login
│   ├── events.js          → GET /api/events (lista los eventos)
│   ├── reservations.js    → POST /api/reservations/book (con transacción)
│   │                        POST /api/reservations/book-unsafe (sin transacción)
│   │                        GET  /api/reservations (historial)
│   │                        POST /api/reservations/reset/:id (resetear evento)
│   └── users.js           → GET /api/users/profile (ruta protegida con JWT)
└── server.js              → Punto de entrada, registra todas las rutas
```

---

## 🔑 Tecnologías usadas y para qué sirve cada una

| Tecnología | ¿Para qué se usa? |
|---|---|
| **Node.js** | Ejecuta el servidor JavaScript |
| **Express** | Framework para crear las rutas de la API |
| **PostgreSQL** | Base de datos relacional donde se guardan los datos |
| **pg** | Librería que conecta Node.js con PostgreSQL |
| **bcryptjs** | Encripta las contraseñas antes de guardarlas |
| **jsonwebtoken** | Genera tokens JWT para autenticar usuarios |
| **dotenv** | Lee las variables del archivo `.env` |
| **nodemon** | Reinicia el servidor automáticamente al guardar cambios |

---

## ⚠️ Si algo no funciona

**Error: "password authentication failed for user postgres"**
→ La contraseña en `.env` no coincide con la de PostgreSQL. Cambiar `DB_PASSWORD` en el archivo `.env`.

**Error: "database primer_proyecto_api does not exist"**
→ Crear la base de datos en pgAdmin como se explicó arriba.

**Error: "Cannot find module"**
→ Ejecutar `npm install` de nuevo.

**El navegador muestra "This site can't be reached"**
→ El servidor no está corriendo. Ejecutar `npm run dev` en la terminal.

**Los eventos muestran "¡Último asiento!" en todos**
→ Es correcto, así viene configurado para que la demo de concurrencia funcione bien desde el inicio.

---

## 📝 Notas finales

- El botón **"Resetear asientos"** vuelve el evento a 1 asiento disponible y borra las reservas. Úsenlo entre cada demostración.
- La demo insegura **no siempre** muestra el problema en el primer intento porque depende del timing del servidor. Si no se ve el error, reseteen y vuelvan a intentar.
- El historial se actualiza automáticamente después de cada simulación.
- Las tablas se crean solas la primera vez que arrancan el servidor. No necesitan tocar pgAdmin para eso.
