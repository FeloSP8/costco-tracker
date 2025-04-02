import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { Product } from '../../types';
import { apiClient } from '../../services/apiClient';

interface ProductFormProps {
  product?: Product;
  onSave: (savedProduct: Product) => void;
  onCancel: () => void;
}

const initialProductState: Product = {
  id: 0,
  nombre: '',
  nombre_busqueda: '',
  codigo: '',
  imagen: '',
  url: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Product>(product || initialProductState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isNewProduct = !product?.id;

  useEffect(() => {
    if (product) {
      setFormData(product);
      if (product.imagen) {
        setImagePreview(product.imagen.startsWith('http') 
          ? product.imagen 
          : `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}${product.imagen}`);
      }
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar el error del campo cuando el usuario escribe algo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let savedProduct: Product;
      
      if (imageFile) {
        const formDataObj = new FormData();
        formDataObj.append('image', imageFile);
        
        if (isNewProduct) {
          formDataObj.append('nombre', formData.nombre);
          formDataObj.append('nombre_busqueda', formData.nombre_busqueda || '');
          formDataObj.append('codigo', formData.codigo || '');
          formDataObj.append('url', formData.url || '');
          
          savedProduct = await apiClient.createProductWithImage(formDataObj);
        } else {
          formDataObj.append('nombre', formData.nombre);
          formDataObj.append('nombre_busqueda', formData.nombre_busqueda || '');
          formDataObj.append('codigo', formData.codigo || '');
          formDataObj.append('url', formData.url || '');
          
          savedProduct = await apiClient.updateProductWithImage(formData.id, formDataObj);
        }
      } else {
        if (isNewProduct) {
          savedProduct = await apiClient.createProduct(formData);
        } else {
          savedProduct = await apiClient.updateProduct(formData.id, formData);
        }
      }
      
      onSave(savedProduct);
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      // Aquí podrías manejar errores específicos o mostrar un mensaje
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isNewProduct ? 'Nuevo Producto' : 'Editar Producto'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="nombre"
              name="nombre"
              label="Nombre del Producto"
              value={formData.nombre}
              onChange={handleChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="nombre_busqueda"
              name="nombre_busqueda"
              label="Nombre para Búsqueda (opcional)"
              value={formData.nombre_busqueda || ''}
              onChange={handleChange}
              helperText="Este nombre se usará para buscar en los scrapers. Si está vacío, se usará el nombre normal."
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="codigo"
              name="codigo"
              label="Código (opcional)"
              value={formData.codigo || ''}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="url"
              name="url"
              label="URL (opcional)"
              value={formData.url || ''}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ mt: 1, mb: 2 }}
            >
              {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            
            {imagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '4px'
                  }} 
                />
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProductForm;