import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;

    useEffect(() => {
        if (!order) {
            navigate('/');
        }
    }, [order, navigate]);

    if (!order) {
        return null;
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <div className="mb-4">
                                <i className="fas fa-check-circle fa-5x text-success"></i>
                            </div>

                            <h2 className="mb-4">¡Pedido Realizado con Éxito!</h2>

                            <Alert variant="success" className="mb-4">
                                <strong>Número de pedido: #{order.id}</strong>
                                <br />
                                Tu pedido ha sido procesado correctamente y pronto recibirás un email de confirmación.
                            </Alert>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <h5>Detalles del Pedido</h5>
                                    <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
                                    <p><strong>Método de pago:</strong> {
                                        order.payment_method === 'credit_card' ? 'Tarjeta de Crédito' :
                                            order.payment_method === 'paypal' ? 'PayPal' :
                                                'Pago contra entrega'
                                    }</p>
                                    <p><strong>Estado:</strong>
                                        <span className="badge bg-success ms-2">Pagado</span>
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <h5>Envío</h5>
                                    <p><strong>Dirección:</strong></p>
                                    <p className="text-muted">{order.shipping_address}</p>
                                    <p><strong>Tiempo estimado:</strong> 3-5 días hábiles</p>
                                </Col>
                            </Row>

                            <Card className="mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">Productos Ordenados</h5>
                                </Card.Header>
                                <ListGroup variant="flush">
                                    {order.order_items?.map(item => (
                                        <ListGroup.Item key={item.id}>
                                            <Row className="align-items-center">
                                                <Col>
                                                    <strong>{item.product?.name}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                                                    </small>
                                                </Col>
                                                <Col xs="auto">
                                                    <strong>${(item.quantity * item.price).toFixed(2)}</strong>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card>

                            <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                                <Link to="/orders" className="btn btn-primary">
                                    Ver Mis Pedidos
                                </Link>
                                <Link to="/products" className="btn btn-outline-primary">
                                    Seguir Comprando
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
