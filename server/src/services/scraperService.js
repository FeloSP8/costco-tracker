const { sequelize } = require('../config/database');

// Esta función cargará los scrapers dinámicamente
const loadScrapers = async () => {
  try {
    // Obtener todos los supermercados
    const [supermercados] = await sequelize.query(`SELECT * FROM supermercados`);
    
    // Cargamos los scrapers disponibles
    const scrapers = [];
    
    for (const supermercado of supermercados) {
      try {
        // Intentamos cargar el scraper específico para este supermercado
        const scraperName = supermercado.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
        const ScraperClass = require(`../scrapers/${scraperName}Scraper`);
        
        // Si se carga correctamente, lo instanciamos y agregamos al array
        const scraper = new ScraperClass(supermercado.id, supermercado.nombre);
        scrapers.push(scraper);
        console.log(`Scraper cargado para ${supermercado.nombre}`);
      } catch (err) {
        // Si no existe un scraper para este supermercado, simplemente continuamos
        console.log(`No hay scraper disponible para ${supermercado.nombre}`);
      }
    }
    
    return scrapers;
  } catch (error) {
    console.error('Error al cargar scrapers:', error);
    return [];
  }
};

// Función para ejecutar todos los scrapers para un producto
const runScrapers = async (productId, productName, productSearchName) => {
  console.log(`Iniciando proceso de scraping para producto ${productId}: ${productName}`);
  console.log(`Término de búsqueda alternativo: ${productSearchName || 'No disponible'}`);
  
  try {
    // Cargar los scrapers disponibles
    const scrapers = await loadScrapers();
    
    if (scrapers.length === 0) {
      console.log('No se encontraron scrapers disponibles');
      return { success: false, message: 'No se encontraron scrapers disponibles' };
    }
    
    // Resultados por supermercado
    const results = {};
    
    // Ejecutar cada scraper
    for (const scraper of scrapers) {
      try {
        // Inicializar el navegador
        const initialized = await scraper.initialize();
        
        if (!initialized) {
          results[scraper.nombre] = { success: false, message: 'No se pudo inicializar el navegador' };
          continue;
        }
        
        // Realizar scraping
        const result = await scraper.scrapProduct(productId, productName, productSearchName);
        
        // Cerrar el navegador
        await scraper.close();
        
        if (result) {
          results[scraper.nombre] = { success: true, data: result };
        } else {
          results[scraper.nombre] = { success: false, message: 'No se encontró información' };
        }
      } catch (error) {
        console.error(`Error con scraper de ${scraper.nombre}:`, error);
        results[scraper.nombre] = { success: false, message: `Error: ${error.message}` };
        
        // Cerrar el navegador si hubo un error
        try {
          await scraper.close();
        } catch (closeError) {
          console.error(`Error al cerrar navegador de ${scraper.nombre}:`, closeError);
        }
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Error general en el proceso de scraping:', error);
    return { success: false, message: `Error general: ${error.message}` };
  }
};

// Función para ejecutar todas las tareas de scraping programadas
const runScheduledScraping = async () => {
  try {
    console.log('Iniciando scraping programado para todos los productos...');
    
    // Obtener todos los productos
    const [productos] = await sequelize.query(`SELECT * FROM productos`);
    
    for (const producto of productos) {
      try {
        console.log(`Ejecutando scraping para ${producto.nombre} (ID: ${producto.id})`);
        await runScrapers(producto.id, producto.nombre, producto.nombre_busqueda);
      } catch (error) {
        console.error(`Error en scraping programado para producto ${producto.id}:`, error);
      }
    }
    
    console.log('Scraping programado completado');
    return true;
  } catch (error) {
    console.error('Error general en scraping programado:', error);
    return false;
  }
};

module.exports = {
  runScrapers,
  runScheduledScraping
};