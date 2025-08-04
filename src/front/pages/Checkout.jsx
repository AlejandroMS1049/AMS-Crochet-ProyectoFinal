import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Context } from '../hooks/useGlobalReducer.jsx';

export const Checkout = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        shipping_address: '',
        payment_method: 'credit_card',
        cardholder_name: '',
        card_number: '',
        expiry_date: '',
        cvv: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!store.user) {
            navigate('/login');
            return;
        }

        if (!store.cartItems || store.cartItems.length === 0) {
            navigate('/cart');
            return;
        }

        // Pre-llenar dirección si está en el perfil
        if (store.user.address) {
            setFormData(prev => ({
                ...prev,
                shipping_address: store.user.address
            }));
        }
    }, [store.user, store.cartItems, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatCardNumber = (value) => {
        // Remover espacios y limitarlo a 16 dígitos
        const v = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setFormData(prev => ({
            ...prev,
            card_number: formatted
        }));
    };

    const calculateTotal = () => {
        return store.cartItems?.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0) || 0;
    };

    const validateForm = () => {
        if (!formData.shipping_address.trim()) {
            setError('La dirección de envío es requerida');
            return false;
        }

        if (formData.payment_method === 'credit_card') {
            if (!formData.cardholder_name.trim()) {
                setError('El nombre del titular es requerido');
                return false;
            }
            if (!formData.card_number || formData.card_number.replace(/\s/g, '').length !== 16) {
                setError('Número de tarjeta inválido');
                return false;
            }
            if (!formData.expiry_date || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiry_date)) {
                setError('Fecha de expiración inválida (MM/AA)');
                return false;
            }
            if (!formData.cvv || formData.cvv.length < 3) {
                setError('CVV inválido');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const result = await actions.checkout({
                shipping_address: formData.shipping_address,
                payment_method: formData.payment_method,
                payment_details: formData.payment_method === 'credit_card' ? {
                    cardholder_name: formData.cardholder_name,
                    card_number: formData.card_number.replace(/\s/g, ''),
                    expiry_date: formData.expiry_date,
                    cvv: formData.cvv
                } : null
            });

            if (result.success) {
                navigate('/order-success', { state: { order: result.order } });
            } else {
                setError(result.message || 'Error al procesar el pago');
            }
        } catch (error) {
            setError('Error de conexión');
        }

        setLoading(false);
    };

    if (!store.user || !store.cartItems || store.cartItems.length === 0) {
        return null;
    }

    return (
        <Container className="py-5">
            <Row>
                <Col lg={8}>
                    <Card>
                        <Card.Header>
                            <h4>Finalizar Compra</h4>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                {/* Dirección de Envío */}
                                <div className="mb-4">
                                    <h5>Dirección de Envío</h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Dirección Completa *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="shipping_address"
                                            value={formData.shipping_address}
                                            onChange={handleChange}
                                            required
                                            placeholder="Calle, número, ciudad, código postal, país"
                                        />
                                    </Form.Group>
                                </div>

                                {/* Método de Pago */}
                                <div className="mb-4">
                                    <h5>Método de Pago</h5>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="radio"
                                            id="credit_card"
                                            name="payment_method"
                                            value="credit_card"
                                            checked={formData.payment_method === 'credit_card'}
                                            onChange={handleChange}
                                            label="Tarjeta de Crédito/Débito"
                                        />
                                        <Form.Check
                                            type="radio"
                                            id="paypal"
                                            name="payment_method"
                                            value="paypal"
                                            checked={formData.payment_method === 'paypal'}
                                            onChange={handleChange}
                                            label="PayPal"
                                        />
                                        <Form.Check
                                            type="radio"
                                            id="cash_on_delivery"
                                            name="payment_method"
                                            value="cash_on_delivery"
                                            checked={formData.payment_method === 'cash_on_delivery'}
                                            onChange={handleChange}
                                            label="Pago contra entrega"
                                        />
                                    </Form.Group>
                                </div>

                                {/* Detalles de Tarjeta */}
                                {formData.payment_method === 'credit_card' && (
                                    <div className="mb-4">
                                        <h5>Detalles de la Tarjeta</h5>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nombre del Titular *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="cardholder_name"
                                                        value={formData.cardholder_name}
                                                        onChange={handleChange}
                                                        placeholder="Nombre como aparece en la tarjeta"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Número de Tarjeta *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="card_number"
                                                        value={formData.card_number}
                                                        onChange={handleCardNumberChange}
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength={19}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Fecha de Expiración *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="expiry_date"
                                                        value={formData.expiry_date}
                                                        onChange={handleChange}
                                                        placeholder="MM/AA"
                                                        maxLength={5}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>CVV *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="cvv"
                                                        value={formData.cvv}
                                                        onChange={handleChange}
                                                        placeholder="123"
                                                        maxLength={4}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                <div className="d-grid gap-2">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={loading}
                                        variant="success"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" />
                                                Procesando pago...
                                            </>
                                        ) : (
                                            `Pagar $${calculateTotal().toFixed(2)}`
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Resumen del Pedido */}
                <Col lg={4}>
                    <Card>
                        <Card.Header>
                            <h5>Resumen del Pedido</h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {store.cartItems.map(item => (
                                    <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                                        <div>
                                            <div className="fw-bold">{item.product.name}</div>
                                            <small className="text-muted">Cantidad: {item.quantity}</small>
                                        </div>
                                        <div>${(item.product.price * item.quantity).toFixed(2)}</div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <hr />

                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Envío:</span>
                                <span>Gratis</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <strong>Total:</strong>
                                <strong>${calculateTotal().toFixed(2)}</strong>
                            </div>
                        </Card.Body>
                    </Card>

                    <div className="mt-3">
                        <div className="d-flex align-items-center text-muted">
                            <i className="fas fa-lock me-2"></i>
                            <small>Pago seguro con encriptación SSL</small>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
