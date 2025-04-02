const path = require('path');
const fs = require('fs');
const { sequelize } = require('../config/database');
const { runScrapers } = require('../services/scraperService');

// Controlador para los productos
const productController = {
  // Obtener todos los productos
  async getAllProducts(req, res) {
    try {
      const [productos] = await sequelize.query(`
        SELECT * FROM productos 
        ORDER BY nombre ASC
      `);
      
      res.json(productos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
  },

  // Obtener un producto por ID
  async getProductById(req, res) {
    const { id } = req.params;
    
    try {
      const [productos] = await sequelize.query(`
        SELECT * FROM productos 
        WHERE id = ?
      `, {
        replacements: [id]
      });
      
      if (productos.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      res.json(productos[0]);
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      res.status(500).json({ message: 'Error al obtener producto', error: error.message });
    }
  },

  // Crear un nuevo producto
  async createProduct(req, res) {
    const { nombre, nombre_busqueda, codigo, url } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }
    
    try {
      const [result] = await sequelize.query(`
        INSERT INTO productos (nombre, nombre_busqueda, codigo, url, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [nombre, nombre_busqueda || null, codigo || null, url || null]
      });
      
      const productId = result;
      
      const [newProduct] = await sequelize.query(`
        SELECT * FROM productos WHERE id = ?
      `, {
        replacements: [productId]
      });
      
      res.status(201).json(newProduct[0]);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
  },

  // Crear un producto con imagen
  async createProductWithImage(req, res) {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }
    
    const { nombre, nombre_busqueda, codigo, url } = req.body;
    const imagen = `/uploads/products/${req.file.filename}`;
    
    if (!nombre) {
      // Eliminar la imagen si no se proporciona un nombre
      fs.unlinkSync(path.join(__dirname, '..', '..', imagen));
      return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }
    
    try {
      const [result] = await sequelize.query(`
        INSERT INTO productos (nombre, nombre_busqueda, codigo, url, imagen, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [nombre, nombre_busqueda || null, codigo || null, url || null, imagen]
      });
      
      const productId = result;
      
      const [newProduct] = await sequelize.query(`
        SELECT * FROM productos WHERE id = ?
      `, {
        replacements: [productId]
      });
      
      res.status(201).json(newProduct[0]);
    } catch (error) {
      console.error('Error al crear producto con imagen:', error);
      res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
  },

  // Actualizar un producto
  async updateProduct(req, res) {
    const { id } = req.params;
    const { nombre, nombre_busqueda, codigo, url } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }
    
    try {
      await sequelize.query(`
        UPDATE productos
        SET nombre = ?, nombre_busqueda = ?, codigo = ?, url = ?, updatedAt = NOW()
        WHERE id = ?
      `, {
        replacements: [nombre, nombre_busqueda || null, codigo || null, url || null, id]
      });
      
      const [updatedProduct] = await sequelize.query(`
        SELECT * FROM productos WHERE id = ?
      `, {
        replacements: [id]
      });
      
      if (updatedProduct.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      res.json(updatedProduct[0]);
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error);
      res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
  },

  // Actualizar un producto con imagen
  async updateProductWithImage(req, res) {
    const { id } = req.params;
    const { nombre, nombre_busqueda, codigo, url } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }
    
    try {
      // Verificar si el producto existe y obtener la imagen actual
      const [existingProduct] = await sequelize.query(`
        SELECT * FROM productos WHERE id = ?
      `, {
        replacements: [id]
      });
      
      if (existingProduct.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      let imagen = existingProduct[0].imagen;
      
      // Si se proporciona una nueva imagen, actualizar y eliminar la anterior
      if (req.file) {
        // Eliminar la imagen anterior si existe
        if (imagen && fs.existsSync(path.join(__dirname, '..', '..', imagen))) {
          fs.unlinkSync(path.join(__dirname, '..', '..', imagen));
        }
        
        imagen = `/uploads/products/${req.file.filename}`;
      }
      
      // Actualizar el producto
      await sequelize.query(`
        UPDATE productos
        SET nombre = ?, nombre_busqueda = ?, codigo = ?, url = ?, imagen = ?, updatedAt = NOW()
        WHERE id = ?
      `, {
        replacements: [nombre, nombre_busqueda || null, codigo || null, url || null, imagen, id]
      });
      
      const [updatedProduct] = await sequelize.query(`
        SELECT * FROM productos WHERE id = ?
      `, {
        replacements: [id]
      });
      
      res.json(updatedProduct[0]);
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error);
      res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
  },

  // Eliminar un producto
  async deleteProduct(req, res) {
    const { id } = req.params;
    
    try {
      // Obtener la información del producto para eliminar la imagen
      const [existingProduct] = await sequelize.query(`
        SELECT * FROM productos WHERE id = ?
      `, {
        replacements: [id]
      });
      
      if (existingProduct.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Eliminar la imagen si existe
      const imagen = existingProduct[0].imagen;
      if (imagen && fs.existsSync(path.join(__dirname, '..', '..', imagen))) {
        fs.unlinkSync(path.join(__dirname, '..', '..', imagen));
      }
      
      // Eliminar el producto
      await sequelize.query(`
        DELETE FROM productos WHERE id = ?
      `, {
        replacements: [id]
      });
      
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error);
      res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
  },

  // Buscar productos por nombre
  async searchProducts(req, res) {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Es necesario proporcionar un término de búsqueda' });
    }
    
    try {
      const [productos] = await sequelize.query(`
        SELECT * FROM productos 
        WHERE nombre LIKE ? OR codigo LIKE ?
        ORDER BY nombre ASC
      `, {
        replacements: [`%${query}%`, `%${query}%`]
      });
      
      res.json(productos);
    } catch (error) {
      console.error(`Error al buscar productos con término "${query}":`, error);
      res.status(500).json({ message: 'Error al buscar productos', error: error.message });
    }
  },

  // Asociar un producto con un supermercado
  async associateWithSupermarket(req, res) {
    const { productId, supermarketId } = req.params;
    const { precio, url } = req.body;
    
    try {
      // Verificar si el producto existe
      const [producto] = await sequelize.query(`
        SELECT * FROM productos WHERE id = ?
      `, {
        replacements: [productId]
      });
      
      if (producto.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Verificar si el supermercado existe
      const [supermercado] = await sequelize.query(`
        SELECT * FROM supermercados WHERE id = ?
      `, {
        replacements: [supermarketId]
      });
      
      if (supermercado.length === 0) {
        return res.status(404).json({ message: 'Supermercado no encontrado' });
      }
      
      // Crear o actualizar la asociación
      await sequelize.query(`
        INSERT INTO producto_supermercado (producto_id, supermercado_id, precio, url, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        precio = ?,
        url = ?,
        updatedAt = NOW()
      `, {
        replacements: [productId, supermarketId, precio, url, precio, url]
      });
      
      // Registrar el precio en el historial
      try {
        await sequelize.query(`
          INSERT INTO preciohistoricos (producto_id, supermercado_id, precio, fecha, createdAt, updatedAt)
          VALUES (?, ?, ?, CURDATE(), NOW(), NOW())
          ON DUPLICATE KEY UPDATE 
          precio = ?,
          updatedAt = NOW()
        `, {
          replacements: [productId, supermarketId, precio, precio]
        });
      } catch (error) {
        console.error('Error al registrar precio en historial:', error);
        // No interrumpir el flujo principal si falla el historial
      }
      
      // Obtener la asociación actualizada
      const [association] = await sequelize.query(`
        SELECT ps.*, s.nombre as supermercado_nombre, s.logo as supermercado_logo 
        FROM producto_supermercado ps
        JOIN supermercados s ON ps.supermercado_id = s.id
        WHERE ps.producto_id = ? AND ps.supermercado_id = ?
      `, {
        replacements: [productId, supermarketId]
      });
      
      res.json(association[0]);
    } catch (error) {
      console.error(`Error al asociar producto ${productId} con supermercado ${supermarketId}:`, error);
      res.status(500).json({ message: 'Error al asociar producto con supermercado', error: error.message });
    }
  },

  // Obtener productos asociados a un producto específico
  async getAssociatedProducts(req, res) {
    const { productId } = req.params;
    
    try {
      console.log(`Buscando asociaciones para el producto con ID ${productId}`);
      
      // Obtener asociaciones con supermercados
      const supermarketAssociations = await sequelize.query(`
        SELECT ps.*, s.nombre as supermercado_nombre, s.logo as supermercado_logo, s.url as supermercado_url
        FROM producto_supermercado ps
        JOIN supermercados s ON ps.supermercado_id = s.id
        WHERE ps.producto_id = ?
      `, {
        replacements: [productId],
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`Tipo de supermarketAssociations: ${typeof supermarketAssociations}`);
      console.log(`¿Es un array? ${Array.isArray(supermarketAssociations)}`);
      console.log(`Longitud: ${supermarketAssociations.length}`);
      console.log('Contenido:', JSON.stringify(supermarketAssociations, null, 2));
      
      res.json(supermarketAssociations);
    } catch (error) {
      console.error(`Error al obtener productos asociados para el producto ${productId}:`, error);
      res.status(500).json({ message: 'Error al obtener productos asociados', error: error.message });
    }
  },

  // Ejecutar scrappers para un producto
  async scrapProduct(req, res) {
    const { productId } = req.params;
    
    try {
      // Verificar si el producto existe
      const [producto] = await sequelize.query(`
        SELECT * FROM productos WHERE id = ?
      `, {
        replacements: [productId]
      });
      
      if (producto.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Ejecutar scrappers
      const results = await runScrapers(
        productId, 
        producto[0].nombre,
        producto[0].nombre_busqueda
      );
      
      res.json({ 
        message: 'Proceso de scraping completado', 
        results 
      });
    } catch (error) {
      console.error(`Error al ejecutar scraping para el producto ${productId}:`, error);
      res.status(500).json({ message: 'Error al ejecutar scraping', error: error.message });
    }
  },

  // Obtener el historial de precios de un producto
  async getPriceHistory(req, res) {
    const { productId } = req.params;
    
    try {
      const [priceHistory] = await sequelize.query(`
        SELECT ph.*, s.nombre as supermercado_nombre, s.logo as supermercado_logo
        FROM preciohistoricos ph
        JOIN supermercados s ON ph.supermercado_id = s.id
        WHERE ph.producto_id = ?
        ORDER BY ph.fecha DESC
      `, {
        replacements: [productId]
      });
      
      res.json(priceHistory);
    } catch (error) {
      console.error(`Error al obtener historial de precios para el producto ${productId}:`, error);
      res.status(500).json({ message: 'Error al obtener historial de precios', error: error.message });
    }
  }
};

module.exports = productController;