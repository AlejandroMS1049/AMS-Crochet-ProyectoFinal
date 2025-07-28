import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../hooks/useGlobalReducer.jsx';

export const ProductDetail = () => {
    const { store, actions } = useContext(Context);
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const result = await actions.getProduct(productId);
            if (result.success) {
                setProduct(result.data);
            } else {
                setError('Producto no encontrado');
            }
        } catch (error) {
            setError('Error al cargar el producto');
        }
        setLoading(false);
    };

    const handleAddToCart = async () => {
        if (!store.user) {
            navigate('/login');
            return;
        }

        setError('');
        setSuccess('');

        const result = await actions.addToCart(product.id, quantity);
        if (result.success) {
            setSuccess('Producto agregado al carrito');
        } else {
            setError(result.message || 'Error al agregar al carrito');
        }
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <h4>Cargando producto...</h4>
                </div>
            </Container>
        );
    }

    if (error && !product) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <h4>Producto no encontrado</h4>
                    <Button onClick={() => navigate('/products')}>
                        Volver al catálogo
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col md={6}>
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="img-fluid rounded"
                            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
                        />
                    ) : (
                        <Card className="text-center p-5">
                            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <h5 className="text-muted">Sin imagen</h5>
                            </div>
                        </Card>
                    )}
                </Col>

                <Col md={6}>
                    <div className="ps-md-4">
                        <h1>{product.name}</h1>

                        <div className="mb-3">
                            {product.category && (
                                <Badge bg="secondary" className="me-2">
                                    {product.category.name}
                                </Badge>
                            )}
                            <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                                {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                            </Badge>
                        </div>

                        <h2 className="text-primary mb-4">
                            ${product.price.toFixed(2)}
                        </h2>

                        <p className="lead">{product.description}</p>

                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        {product.stock > 0 && store.user && (
                            <Row className="mb-3">
                                <Col xs={6} md={4}>
                                    <Form.Group>
                                        <Form.Label>Cantidad</Form.Label>
                                        <Form.Select
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        >
                                            {[...Array(Math.min(10, product.stock))].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {i + 1}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <div className="d-flex gap-2">
                            <Button onClick={() => navigate('/products')} variant="outline-secondary">
                                Volver al catálogo
                            </Button>

                            {product.stock > 0 && (
                                store.user ? (
                                    <Button
                                        onClick={handleAddToCart}
                                        size="lg"
                                    >
                                        Agregar al carrito
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => navigate('/login')}
                                        size="lg"
                                    >
                                        Inicia sesión para comprar
                                    </Button>
                                )
                            )}
                        </div>

                        {product.stock === 0 && (
                            <Alert variant="warning" className="mt-3">
                                Este producto está agotado temporalmente
                            </Alert>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
