-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS costco_tracker;
USE costco_tracker;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  nombre_busqueda VARCHAR(255),
  codigo VARCHAR(50),
  imagen VARCHAR(255),
  url VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de supermercados
CREATE TABLE IF NOT EXISTS supermercados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  url VARCHAR(255),
  logo VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para asociar productos con supermercados
CREATE TABLE IF NOT EXISTS producto_supermercado (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  supermercado_id INT NOT NULL,
  precio DECIMAL(10, 2),
  url VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (supermercado_id) REFERENCES supermercados(id) ON DELETE CASCADE,
  UNIQUE KEY unique_producto_supermercado (producto_id, supermercado_id)
);

-- Tabla de historial de precios
CREATE TABLE IF NOT EXISTS preciohistoricos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  supermercado_id INT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (supermercado_id) REFERENCES supermercados(id) ON DELETE CASCADE,
  UNIQUE KEY unique_precio_fecha (producto_id, supermercado_id, fecha)
);

-- Tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  imagen VARCHAR(255),
  notas TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para almacenar productos en tickets
CREATE TABLE IF NOT EXISTS ticket_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Insertar supermercados por defecto
INSERT IGNORE INTO supermercados (nombre, url, logo) VALUES
('Costco', 'https://www.costco.com.mx', '/uploads/supermarkets/costco-logo.png'),
('Chedraui', 'https://www.chedraui.com.mx', '/uploads/supermarkets/chedraui-logo.png'),
('Walmart', 'https://www.walmart.com.mx', '/uploads/supermarkets/walmart-logo.png'),
('Soriana', 'https://www.soriana.com', '/uploads/supermarkets/soriana-logo.png'),
('La Comer', 'https://www.lacomer.com.mx', '/uploads/supermarkets/lacomer-logo.png'),
('City Market', 'https://www.citymarket.com.mx', '/uploads/supermarkets/citymarket-logo.png'),
('HEB', 'https://www.heb.com.mx', '/uploads/supermarkets/heb-logo.png'),
('Sam\'s Club', 'https://www.sams.com.mx', '/uploads/supermarkets/sams-logo.png');