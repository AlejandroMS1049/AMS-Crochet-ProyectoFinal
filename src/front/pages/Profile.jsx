import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Modal } from 'react-bootstrap';
import { Context } from '../hooks/useGlobalReducer.jsx';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (!store.user) {
            navigate('/login');
            return;
        }

        // Cargar datos del usuario
        setFormData({
            email: store.user.email || '',
            first_name: store.user.first_name || '',
            last_name: store.user.last_name || '',
            phone: store.user.phone || '',
            address: store.user.address || ''
        });
    }, [store.user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await actions.updateProfile(formData);
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

    const handleDeleteAccount = async () => {
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

    if (!store.user) {
        return null;
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">
                                <h3>Mi Perfil</h3>
                            </Card.Title>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nombre</Form.Label>
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
                                            <Form.Label>Apellido</Form.Label>
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
                                    <Form.Label>Email</Form.Label>
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
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Dirección</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                                        </Button>
                                    </Col>
                                    <Col className="text-end">
                                        <Button
                                            variant="danger"
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            Eliminar Cuenta
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal de confirmación para eliminar cuenta */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        Eliminar Cuenta
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
