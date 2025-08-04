import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../hooks/useGlobalReducer.jsx';

export const Orders = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!store.user) {
            navigate('/login');
            return;
        }
        actions.getOrders();
    }, [store.user, navigate]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { variant: 'warning', text: 'Pendiente' },
            'paid': { variant: 'success', text: 'Pagado' },
            'shipped': { variant: 'info', text: 'Enviado' },
            'delivered': { variant: 'success', text: 'Entregado' },
            'cancelled': { variant: 'danger', text: 'Cancelado' },
            'payment_failed': { variant: 'danger', text: 'Pago Fallido' }
        };
        
        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!store.user) {
        return null;
    }

    return (
        <Container className="py-5">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Mis Pedidos</h2>
                        <Link to="/products" className="btn btn-primary">
                            Seguir Comprando
                        </Link>
                    </div>

                    {!store.orders || store.orders.length === 0 ? (
                        <Card className="text-center py-5">
                            <Card.Body>
                                <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                                <h4>No tienes pedidos aún</h4>
                                <p className="text-muted">¡Explora nuestro catálogo y realiza tu primer pedido!</p>
                                <Link to="/products" className="btn btn-primary">
                                    Ver Productos
                                </Link>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {store.orders.map(order => (
                                <Card key={order.id} className="mb-3">
                                    <Card.Body>
                                        <Row className="align-items-center">
                                            <Col md={2}>
                                                <div>
                                                    <strong>Pedido #{order.id}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {formatDate(order.created_at)}
                                                    </small>
                                                </div>
                                            </Col>
                                            
                                            <Col md={3}>
                                                <div>
                                                    <strong>${order.total_amount.toFixed(2)}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {order.order_items?.length || 0} producto(s)
                                                    </small>
                                                </div>
                                            </Col>
                                            
                                            <Col md={2}>
                                                {getStatusBadge(order.status)}
                                            </Col>
                                            
                                            <Col md={3}>
                                                <small className="text-muted">
                                                    {order.payment_method === 'credit_card' ? 'Tarjeta de Crédito' :
                                                     order.payment_method === 'paypal' ? 'PayPal' :
                                                     'Pago contra entrega'}
                                                </small>
                                            </Col>
                                            
                                            <Col md={2} className="text-end">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleViewOrder(order)}
                                                >
                                                    Ver Detalles
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Col>
            </Row>

            {/* Modal de Detalles del Pedido */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Pedido #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6>Información del Pedido</h6>
                                    <p><strong>Fecha:</strong> {formatDate(selectedOrder.created_at)}</p>
                                    <p><strong>Estado:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                    <p><strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}</p>
                                    <p><strong>Método de pago:</strong> {
                                        selectedOrder.payment_method === 'credit_card' ? 'Tarjeta de Crédito' :
                                        selectedOrder.payment_method === 'paypal' ? 'PayPal' :
                                        'Pago contra entrega'
                                    }</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Dirección de Envío</h6>
                                    <p className="text-muted">{selectedOrder.shipping_address}</p>
                                </Col>
                            </Row>

                            <h6>Productos</h6>
                            <ListGroup>
                                {selectedOrder.order_items?.map(item => (
                                    <ListGroup.Item key={item.id}>
                                        <Row className="align-items-center">
                                            <Col>
                                                <div>
                                                    <strong>{item.product?.name}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        ${item.price.toFixed(2)} × {item.quantity}
                                                    </small>
                                                </div>
                                            </Col>
                                            <Col xs="auto">
                                                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            {selectedOrder.status === 'paid' && (
                                <div className="mt-3">
                                    <small className="text-muted">
                                        <i className="fas fa-truck me-2"></i>
                                        Tu pedido será enviado en 1-2 días hábiles. Tiempo estimado de entrega: 3-5 días hábiles.
                                    </small>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={() => setShowModal(false)}>
                        <Link to="/products" className="text-white text-decoration-none">
                            Comprar de Nuevo
                        </Link>
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
