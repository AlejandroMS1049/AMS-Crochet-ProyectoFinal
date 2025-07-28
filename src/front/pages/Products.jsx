import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Context } from '../hooks/useGlobalReducer.jsx';

export const Products = () => {
    const { store, actions } = useContext(Context);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        actions.getProducts();
        actions.getCategories();
    }, []);

    useEffect(() => {
        if (store.products) {
            let filtered = store.products;

            if (searchTerm) {
                filtered = filtered.filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            if (selectedCategory) {
                filtered = filtered.filter(product =>
                    product.category_id === parseInt(selectedCategory)
                );
            }

            setFilteredProducts(filtered);
        }
    }, [store.products, searchTerm, selectedCategory]);

    const handleAddToCart = async (productId) => {
        if (!store.user) {
            // Redirigir al login si no está autenticado
            return;
        }

        const result = await actions.addToCart(productId, 1);
        if (result.success) {
            // Mostrar mensaje de éxito
        }
    };

    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col>
                    <h2>Catálogo de Productos</h2>
                </Col>
            </Row>

            {/* Filtros */}
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col md={4}>
                    <Form.Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        {store.categories?.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                        }}
                    >
                        Limpiar
                    </Button>
                </Col>
            </Row>

            {/* Productos */}
            <Row>
                {filteredProducts.length === 0 ? (
                    <Col>
                        <div className="text-center py-5">
                            <h4>No se encontraron productos</h4>
                            <p>Intenta con otros términos de búsqueda</p>
                        </div>
                    </Col>
                ) : (
                    filteredProducts.map(product => (
                        <Col key={product.id} md={6} lg={4} className="mb-4">
                            <Card className="h-100">
                                {product.image_url && (
                                    <Card.Img
                                        variant="top"
                                        src={product.image_url}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{product.name}</Card.Title>
                                    <Card.Text className="flex-grow-1">
                                        {product.description.length > 100
                                            ? product.description.substring(0, 100) + '...'
                                            : product.description
                                        }
                                    </Card.Text>

                                    <div className="mb-2">
                                        {product.category && (
                                            <Badge bg="secondary" className="me-2">
                                                {product.category.name}
                                            </Badge>
                                        )}
                                        <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                                            {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                                        </Badge>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 text-primary">
                                            ${product.price.toFixed(2)}
                                        </h5>
                                        <div>
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="btn btn-outline-primary btn-sm me-2"
                                            >
                                                Ver Detalles
                                            </Link>
                                            {store.user && product.stock > 0 && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddToCart(product.id)}
                                                >
                                                    Agregar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
};
