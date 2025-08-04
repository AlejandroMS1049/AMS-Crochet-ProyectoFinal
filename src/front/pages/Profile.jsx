import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Modal, Tabs, Tab, Badge, ListGroup } from 'react-bootstrap';
import { Context } from '../hooks/useGlobalReducer.jsx';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    useEffect(() => {
        if (!store.user) {
            navigate('/login');
            return;
        }

        // Cargar datos del usuario
        setFormData(prev => ({
            ...prev,
            email: store.user.email || '',
            first_name: store.user.first_name || '',
            last_name: store.user.last_name || '',
            phone: store.user.phone || '',
            address: store.user.address || ''
        }));

        // Cargar órdenes del usuario
        actions.getOrders();
    }, [store.user, navigate, actions]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar errores cuando el usuario empiece a escribir
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        const errors = [];

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.push('Email inválido');
        }

        // Validar nombres
        if (!formData.first_name || formData.first_name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!formData.last_name || formData.last_name.trim().length < 2) {
            errors.push('El apellido debe tener al menos 2 caracteres');
        }

        // Validar teléfono si se proporciona
        if (formData.phone && formData.phone.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                errors.push('Formato de teléfono inválido');
            }
        }

        return errors;
    };

    const validatePasswordForm = () => {
        const errors = [];

        if (!formData.current_password) {
            errors.push('La contraseña actual es requerida');
        }

        if (!formData.new_password || formData.new_password.length < 6) {
            errors.push('La nueva contraseña debe tener al menos 6 caracteres');
        }

        if (formData.new_password !== formData.confirm_password) {
            errors.push('Las contraseñas no coinciden');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setLoading(true);

        try {
            const profileData = {
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                address: formData.address
            };

            const result = await actions.updateProfile(profileData);
            if (result.success) {
                setSuccess('Perfil actualizado correctamente');
            } else {
                setError(result.message || 'Error al actualizar el perfil');
            }
        } catch (error) {
            setError('Error de conexión');
        }

        setLoading(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationErrors = validatePasswordForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setLoading(true);

        try {
            const result = await actions.changePassword({
                current_password: formData.current_password,
                new_password: formData.new_password
            });

            if (result.success) {
                setSuccess('Contraseña actualizada correctamente');
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                }));
                setShowPasswordModal(false);
            } else {
                setError(result.message || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            setError('Error de conexión');
        }

        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'ELIMINAR') {
            setError('Debes escribir "ELIMINAR" para confirmar');
            return;
        }

        try {
            const result = await actions.deleteAccount();
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Error al eliminar la cuenta');
            }
        } catch (error) {
            setError('Error de conexión');
        }
        setShowDeleteModal(false);
    };

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!store.user) {
        return null;
    }

    return (
        <Container className="py-5">
            <Row>
                <Col md={3}>
                    <Card className="mb-4">
                        <Card.Body className="text-center">
                            <div className="mb-3">
                                <i className="fas fa-user-circle fa-4x text-primary"></i>
                            </div>
                            <h5>{store.user.first_name} {store.user.last_name}</h5>
                            <p className="text-muted">{store.user.email}</p>
                            <div className="text-muted small">
                                <i className="fas fa-calendar me-1"></i>
                                Miembro desde {formatDate(store.user.created_at)}
                            </div>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <h6>Estadísticas</h6>
                            <div className="mb-2">
                                <small className="text-muted">Pedidos realizados:</small>
                                <div><strong>{store.orders?.length || 0}</strong></div>
                            </div>
                            <div className="mb-2">
                                <small className="text-muted">Total gastado:</small>
                                <div><strong>
                                    ${store.orders?.reduce((total, order) =>
                                        total + (order.status === 'paid' ? order.total_amount : 0), 0
                                    ).toFixed(2) || '0.00'}
                                </strong></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={9}>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(tab) => setActiveTab(tab)}
                        className="mb-4"
                    >
                        <Tab eventKey="profile" title={<><i className="fas fa-user me-2"></i>Perfil</>}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">Información Personal</h5>
                                </Card.Header>
                                <Card.Body>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    {success && <Alert variant="success">{success}</Alert>}

                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nombre *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Apellido *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Email *</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Teléfono</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Ej: +34 123 456 789"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Dirección</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Dirección completa para envíos"
                                            />
                                        </Form.Group>

                                        <div className="d-flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                variant="primary"
                                            >
                                                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setShowPasswordModal(true)}
                                            >
                                                Cambiar Contraseña
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="orders" title={<><i className="fas fa-shopping-bag me-2"></i>Mis Pedidos</>}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">Historial de Pedidos</h5>
                                </Card.Header>
                                <Card.Body>
                                    {!store.orders || store.orders.length === 0 ? (
                                        <div className="text-center py-4">
                                            <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                                            <h5>No tienes pedidos aún</h5>
                                            <p className="text-muted">¡Explora nuestro catálogo y realiza tu primer pedido!</p>
                                            <Button
                                                variant="primary"
                                                onClick={() => navigate('/products')}
                                            >
                                                Ver Productos
                                            </Button>
                                        </div>
                                    ) : (
                                        <ListGroup variant="flush">
                                            {store.orders.slice(0, 5).map(order => (
                                                <ListGroup.Item key={order.id} className="px-0">
                                                    <Row className="align-items-center">
                                                        <Col md={2}>
                                                            <strong>#{order.id}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {formatDate(order.created_at)}
                                                            </small>
                                                        </Col>
                                                        <Col md={3}>
                                                            <strong>${order.total_amount.toFixed(2)}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {order.order_items?.length || 0} producto(s)
                                                            </small>
                                                        </Col>
                                                        <Col md={2}>
                                                            {getStatusBadge(order.status)}
                                                        </Col>
                                                        <Col md={3}>
                                                            <small className="text-muted">
                                                                {order.payment_method === 'credit_card' ? 'Tarjeta' :
                                                                    order.payment_method === 'paypal' ? 'PayPal' :
                                                                        'Contra entrega'}
                                                            </small>
                                                        </Col>
                                                        <Col md={2}>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => navigate('/orders')}
                                                            >
                                                                Ver
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}

                                    {store.orders && store.orders.length > 5 && (
                                        <div className="text-center mt-3">
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => navigate('/orders')}
                                            >
                                                Ver Todos los Pedidos
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="security" title={<><i className="fas fa-shield-alt me-2"></i>Seguridad</>}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">Configuración de Seguridad</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-4">
                                        <h6>Contraseña</h6>
                                        <p className="text-muted">
                                            Mantén tu cuenta segura con una contraseña fuerte
                                        </p>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => setShowPasswordModal(true)}
                                        >
                                            <i className="fas fa-key me-2"></i>
                                            Cambiar Contraseña
                                        </Button>
                                    </div>

                                    <hr />

                                    <div className="mb-4">
                                        <h6 className="text-danger">Zona Peligrosa</h6>
                                        <p className="text-muted">
                                            Una vez que elimines tu cuenta, no hay vuelta atrás.
                                            Por favor, ten cuidado.
                                        </p>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            <i className="fas fa-trash me-2"></i>
                                            Eliminar Cuenta
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>

            {/* Modal para cambiar contraseña */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cambiar Contraseña</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePasswordChange}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña Actual *</Form.Label>
                            <Form.Control
                                type="password"
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nueva Contraseña *</Form.Label>
                            <Form.Control
                                type="password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                            <Form.Text className="text-muted">
                                Mínimo 6 caracteres
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar Nueva Contraseña *</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal de confirmación para eliminar cuenta */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Eliminar Cuenta
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="danger">
                        <strong>¡Advertencia!</strong> Esta acción no se puede deshacer.
                    </Alert>

                    <p>
                        Al eliminar tu cuenta se perderán permanentemente:
                    </p>
                    <ul>
                        <li>Tu información personal</li>
                        <li>Historial de pedidos</li>
                        <li>Preferencias guardadas</li>
                    </ul>

                    <p>
                        Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo:
                    </p>
                    <Form.Control
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Escribe ELIMINAR"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'ELIMINAR'}
                    >
                        Eliminar Cuenta Permanentemente
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};