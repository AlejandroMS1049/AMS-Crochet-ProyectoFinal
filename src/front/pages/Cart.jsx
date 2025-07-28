import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Context } from '../hooks/useGlobalReducer.jsx';

export const Cart = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!store.user) {
            navigate('/login');
            return;
        }
        actions.getCart();
    }, [store.user, navigate]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const result = await actions.updateCartItem(itemId, newQuantity);
        if (!result.success) {
            setError(result.message || 'Error al actualizar cantidad');
        }
    };

    const handleRemoveItem = async (itemId) => {
        const result = await actions.removeFromCart(itemId);
        if (!result.success) {
            setError(result.message || 'Error al eliminar item');
        }
    };

    const calculateTotal = () => {
        return store.cartItems?.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0) || 0;
    };

    const handleCheckout = () => {
        // Por ahora solo navegar a checkout, implementaremos la pasarela más adelante
        navigate('/checkout');
    };

    if (!store.user) {
        return null;
    }

    if (!store.cartItems || store.cartItems.length === 0) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} className="text-center">
                        <Card>
                            <Card.Body className="py-5">
                                <h3>Tu carrito está vacío</h3>
                                <p>¡Descubre nuestros productos y agrega algunos al carrito!</p>
                                <Button onClick={() => navigate('/products')}>
                                    Ver productos
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col md={8}>
                    <h2 className="mb-4">Mi Carrito</h2>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card>
                        <ListGroup variant="flush">
                            {store.cartItems.map(item => (
                                <ListGroup.Item key={item.id} className="py-3">
                                    <Row className="align-items-center">
                                        <Col md={2}>
                                            {item.product.image_url ? (
                                                <img
                                                    src={item.product.image_url}
                                                    alt={item.product.name}
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-light rounded d-flex align-items-center justify-content-center"
                                                    style={{ height: '80px' }}
                                                >
                                                    <small className="text-muted">Sin imagen</small>
                                                </div>
                                            )}
                                        </Col>

                                        <Col md={4}>
                                            <h6 className="mb-1">{item.product.name}</h6>
                                            <small className="text-muted">
                                                ${item.product.price.toFixed(2)} c/u
                                            </small>
                                        </Col>

                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label size="sm">Cantidad</Form.Label>
                                                <Form.Select
                                                    size="sm"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                                                >
                                                    {[...Array(Math.min(10, item.product.stock))].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            {i + 1}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={2}>
                                            <strong>${(item.product.price * item.quantity).toFixed(2)}</strong>
                                        </Col>

                                        <Col md={1}>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                ×
                                            </Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Resumen del pedido</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Envío:</span>
                                <span>Gratis</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <strong>Total:</strong>
                                <strong>${calculateTotal().toFixed(2)}</strong>
                            </div>

                            <Button
                                className="w-100 mb-2"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : 'Proceder al pago'}
                            </Button>

                            <Button
                                variant="outline-secondary"
                                className="w-100"
                                onClick={() => navigate('/products')}
                            >
                                Seguir comprando
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
