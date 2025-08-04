import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Context } from '../hooks/useGlobalReducer.jsx';

export const Admin = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Verificar si el usuario es admin (puedes ajustar esta lógica)
        if (!store.user || store.user.email !== 'admin@amscrochet.com') {
            navigate('/');
            return;
        }

        // Cargar datos
        actions.getProducts();
        actions.getCategories();
        actions.getAllUsers();
        actions.getOrders();
    }, [store.user, navigate, actions]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category_id: '',
            image_url: '',
            is_active: true
        });
        setEditingProduct(null);
        setError('');
        setSuccess('');
    };

    const handleShowModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                stock: product.stock.toString(),
                category_id: product.category_id.toString(),
                image_url: product.image_url || '',
                is_active: product.is_active
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.name.trim()) errors.push('El nombre es requerido');
        if (!formData.description.trim()) errors.push('La descripción es requerida');
        if (!formData.price || parseFloat(formData.price) <= 0) errors.push('El precio debe ser mayor a 0');
        if (!formData.stock || parseInt(formData.stock) < 0) errors.push('El stock debe ser mayor o igual a 0');
        if (!formData.category_id) errors.push('La categoría es requerida');

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
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category_id: parseInt(formData.category_id),
                image_url: formData.image_url.trim(),
                is_active: formData.is_active
            };

            let result;
            if (editingProduct) {
                result = await actions.updateProduct(editingProduct.id, productData);
            } else {
                result = await actions.createProduct(productData);
            }

            if (result.success) {
                setSuccess(editingProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
                handleCloseModal();
                actions.getProducts(); // Recargar productos
            } else {
                setError(result.message || 'Error al guardar el producto');
            }
        } catch (error) {
            setError('Error de conexión');
        }

        setLoading(false);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        try {
            const result = await actions.deleteProduct(productId);
            if (result.success) {
                setSuccess('Producto eliminado correctamente');
                actions.getProducts(); // Recargar productos
            } else {
                setError(result.message || 'Error al eliminar el producto');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    const toggleProductStatus = async (productId, currentStatus) => {
        try {
            const result = await actions.updateProduct(productId, { is_active: !currentStatus });
            if (result.success) {
                setSuccess('Estado del producto actualizado');
                actions.getProducts();
            } else {
                setError(result.message || 'Error al actualizar el estado');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    if (!store.user || store.user.email !== 'admin@amscrochet.com') {
        return null;
    }

    return (
        <Container className="py-5">
            <Row>
                <Col>
                    <h2 className="mb-4">
                        <i className="fas fa-cog me-2"></i>
                        Panel de Administración
                    </h2>

                    {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
                    {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

                    <Tabs
                        activeKey={activeTab}
                        onSelect={(tab) => setActiveTab(tab)}
                        className="mb-4"
                    >
                        <Tab eventKey="products" title={<><i className="fas fa-box me-2"></i>Productos</>}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Gestión de Productos</h5>
                                    <Button variant="primary" onClick={() => handleShowModal()}>
                                        <i className="fas fa-plus me-2"></i>
                                        Nuevo Producto
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {store.products && store.products.length > 0 ? (
                                        <Table responsive striped hover>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Imagen</th>
                                                    <th>Nombre</th>
                                                    <th>Categoría</th>
                                                    <th>Precio</th>
                                                    <th>Stock</th>
                                                    <th>Estado</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {store.products.map(product => (
                                                    <tr key={product.id}>
                                                        <td>{product.id}</td>
                                                        <td>
                                                            {product.image_url ? (
                                                                <img
                                                                    src={product.image_url}
                                                                    alt={product.name}
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                    className="rounded"
                                                                />
                                                            ) : (
                                                                <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                                                    style={{ width: '50px', height: '50px' }}>
                                                                    <small className="text-muted">Sin imagen</small>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <strong>{product.name}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {product.description.length > 50
                                                                    ? product.description.substring(0, 50) + '...'
                                                                    : product.description
                                                                }
                                                            </small>
                                                        </td>
                                                        <td>
                                                            {store.categories?.find(cat => cat.id === product.category_id)?.name || 'N/A'}
                                                        </td>
                                                        <td>${product.price.toFixed(2)}</td>
                                                        <td>
                                                            <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                                                                {product.stock}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge bg={product.is_active ? 'success' : 'secondary'}>
                                                                {product.is_active ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    onClick={() => handleShowModal(product)}
                                                                    title="Editar"
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </Button>
                                                                <Button
                                                                    variant={product.is_active ? "outline-warning" : "outline-success"}
                                                                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                                                                    title={product.is_active ? "Desactivar" : "Activar"}
                                                                >
                                                                    <i className={product.is_active ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    onClick={() => handleDelete(product.id)}
                                                                    title="Eliminar"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p>No hay productos registrados</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="orders" title={<><i className="fas fa-shopping-cart me-2"></i>Pedidos</>}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">Gestión de Pedidos</h5>
                                </Card.Header>
                                <Card.Body>
                                    {store.orders && store.orders.length > 0 ? (
                                        <Table responsive striped hover>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Usuario</th>
                                                    <th>Total</th>
                                                    <th>Estado</th>
                                                    <th>Fecha</th>
                                                    <th>Método de Pago</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {store.orders.map(order => (
                                                    <tr key={order.id}>
                                                        <td>#{order.id}</td>
                                                        <td>{order.user?.email || 'N/A'}</td>
                                                        <td>${order.total_amount.toFixed(2)}</td>
                                                        <td>
                                                            <Badge bg={
                                                                order.status === 'paid' ? 'success' :
                                                                    order.status === 'pending' ? 'warning' :
                                                                        order.status === 'shipped' ? 'info' :
                                                                            order.status === 'delivered' ? 'success' :
                                                                                'danger'
                                                            }>
                                                                {order.status === 'pending' ? 'Pendiente' :
                                                                    order.status === 'paid' ? 'Pagado' :
                                                                        order.status === 'shipped' ? 'Enviado' :
                                                                            order.status === 'delivered' ? 'Entregado' :
                                                                                order.status}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            {new Date(order.created_at).toLocaleDateString('es-ES')}
                                                        </td>
                                                        <td>
                                                            {order.payment_method === 'credit_card' ? 'Tarjeta' :
                                                                order.payment_method === 'paypal' ? 'PayPal' :
                                                                    'Contra entrega'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p>No hay pedidos registrados</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="users" title={<><i className="fas fa-users me-2"></i>Usuarios</>}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">Gestión de Usuarios</h5>
                                </Card.Header>
                                <Card.Body>
                                    {store.users && store.users.length > 0 ? (
                                        <Table responsive striped hover>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Nombre</th>
                                                    <th>Email</th>
                                                    <th>Fecha de Registro</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {store.users.map(user => (
                                                    <tr key={user.id}>
                                                        <td>{user.id}</td>
                                                        <td>{user.first_name} {user.last_name}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            {new Date(user.created_at).toLocaleDateString('es-ES')}
                                                        </td>
                                                        <td>
                                                            <Badge bg="success">Activo</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p>No hay usuarios registrados</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>

            {/* Modal para crear/editar producto */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoría *</Form.Label>
                                    <Form.Select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {store.categories?.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Precio *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>URL de Imagen</Form.Label>
                            <Form.Control
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                label="Producto activo"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};
