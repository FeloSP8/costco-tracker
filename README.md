# Costco Tracker

Aplicación para seguimiento de precios de productos en Costco y comparación con otros supermercados.

## Características

- Registro y seguimiento de tickets de compra
- Extracción automática de productos y precios mediante OCR
- Seguimiento de precios históricos
- Comparación de precios con otros supermercados (Alcampo, Carrefour, etc.)
- Búsqueda de productos por nombre y código
- Asociación de productos con supermercados
- Gráficos de evolución de precios

## Tecnologías

### Frontend

- React
- TypeScript
- Chart.js para gráficas
- Tailwind CSS para estilos

### Backend

- Node.js
- Express
- MySQL/Sequelize
- OCR para extracción de texto
- Web scraping con Cheerio

## Instalación

### Requisitos

- Node.js (v18+)
- MySQL

### Pasos

1. Clonar el repositorio

```bash
git clone https://github.com/FeloSP8/costco-tracker.git
cd costco-tracker
```

2. Instalar dependencias del servidor

```bash
cd server
npm install
```

3. Configurar la base de datos

- Crear un archivo `.env` en la carpeta `server` con las credenciales de la base de datos:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tucontraseña
DB_NAME=costco_tracker_dev
DB_PORT=3306
PORT=3001
```

4. Ejecutar migraciones

```bash
npx sequelize-cli db:migrate
```

5. Instalar dependencias del cliente

```bash
cd ../client
npm install
```

6. Configurar las variables de entorno del cliente

- Crear un archivo `.env` en la carpeta `client`:

```
VITE_API_URL=http://localhost:3001/api
```

## Uso

1. Iniciar el servidor

```bash
cd server
npm run dev
```

2. Iniciar el cliente

```bash
cd client
npm run dev
```

3. Abrir la aplicación en el navegador: `http://localhost:5173`

## Estructura del Proyecto

```
costco-tracker/
├── client/                # Frontend React
│   ├── public/            # Archivos estáticos
│   ├── src/               # Código fuente
│   │   ├── components/    # Componentes React
│   │   ├── services/      # Servicios API
│   │   ├── types/         # Interfaces TypeScript
│   │   └── ...            # Otros archivos
│   └── ...
├── server/                # Backend Node.js
│   ├── src/               # Código fuente
│   │   ├── controllers/   # Controladores
│   │   ├── db/            # Configuración de base de datos
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Rutas API
│   │   └── ...            # Otros archivos
│   ├── uploads/           # Directorio para uploads de imágenes
│   └── ...
└── ...
```

## Desarrollo

- Los pulls requests son bienvenidos
- Para cambios importantes, abrir primero un issue para discutir los cambios

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)