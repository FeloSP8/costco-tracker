const puppeteer = require('puppeteer');
const { sequelize } = require('../config/database');

class BaseScraper {
  constructor(supermercadoId, nombre) {
    this.supermercadoId = supermercadoId;
    this.nombre = nombre;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      
      // Configuración del navegador
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await this.page.setViewport({ width: 1366, height: 768 });
      
      console.log(`Navegador inicializado para ${this.nombre}`);
      return true;
    } catch (error) {
      console.error(`Error al inicializar el navegador para ${this.nombre}:`, error);
      return false;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log(`Navegador cerrado para ${this.nombre}`);
    }
  }

  // Métodos que deben ser implementados por las clases hijas
  async searchProduct(productName) {
    throw new Error('El método searchProduct debe ser implementado por la clase hija');
  }

  async extractPrice() {
    throw new Error('El método extractPrice debe ser implementado por la clase hija');
  }

  async scrapProduct(productId, productName, productSearchName) {
    console.log(`Iniciando scraping de ${productName} en ${this.nombre}`);
    
    // Usar nombre_busqueda si está disponible, sino usar nombre
    const searchName = productSearchName || productName;
    console.log(`Usando término de búsqueda: "${searchName}"`);
    
    try {
      const url = await this.searchProduct(searchName);
      
      if (!url) {
        console.log(`No se encontró el producto ${productName} en ${this.nombre}`);
        return null;
      }
      
      const price = await this.extractPrice();
      
      if (!price) {
        console.log(`No se pudo extraer el precio para ${productName} en ${this.nombre}`);
        return null;
      }
      
      // Guardar o actualizar la asociación con el supermercado
      await this.saveAssociation(productId, url, price);
      
      // Guardar en el historial de precios
      await this.savePriceHistory(productId, price);
      
      console.log(`Scraping exitoso para ${productName} en ${this.nombre}: $${price}`);
      return { url, price };
    } catch (error) {
      console.error(`Error durante el scraping de ${productName} en ${this.nombre}:`, error);
      return null;
    }
  }

  async saveAssociation(productId, url, price) {
    try {
      const [association] = await sequelize.query(`
        INSERT INTO producto_supermercado (producto_id, supermercado_id, precio, url, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        precio = ?, 
        url = ?, 
        updatedAt = NOW()
      `, {
        replacements: [productId, this.supermercadoId, price, url, price, url]
      });
      
      console.log(`Asociación guardada/actualizada para producto ${productId} con ${this.nombre}`);
      return true;
    } catch (error) {
      console.error(`Error al guardar asociación para producto ${productId} con ${this.nombre}:`, error);
      return false;
    }
  }

  async savePriceHistory(productId, price) {
    try {
      const [history] = await sequelize.query(`
        INSERT INTO preciohistoricos (producto_id, supermercado_id, precio, fecha, createdAt, updatedAt)
        VALUES (?, ?, ?, CURDATE(), NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        precio = ?, 
        updatedAt = NOW()
      `, {
        replacements: [productId, this.supermercadoId, price, price]
      });
      
      console.log(`Historial de precios guardado para producto ${productId} con ${this.nombre}`);
      return true;
    } catch (error) {
      console.error(`Error al guardar historial para producto ${productId} con ${this.nombre}:`, error);
      return false;
    }
  }
}

module.exports = BaseScraper;