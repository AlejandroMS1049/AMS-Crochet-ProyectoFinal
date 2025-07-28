import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Badge, Container } from 'react-bootstrap';
import { Context } from '../hooks/useGlobalReducer.jsx';

export const Navbar = () => {
	const { store, actions } = useContext(Context);
	const navigate = useNavigate();

	const handleLogout = () => {
		actions.logout();
		navigate('/');
	};

	const cartItemsCount = store.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

	return (
		<BootstrapNavbar bg="white" expand="lg" className="shadow-sm">
			<Container>
				<BootstrapNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
					<i className="fas fa-heart me-2"></i>
					AMS Crochet
				</BootstrapNavbar.Brand>

				<BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
				<BootstrapNavbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link as={Link} to="/">Inicio</Nav.Link>
						<Nav.Link as={Link} to="/products">Productos</Nav.Link>
						<NavDropdown title="Categorías" id="categories-dropdown">
							{store.categories?.map(category => (
								<NavDropdown.Item
									key={category.id}
									as={Link}
									to={`/products?category=${category.id}`}
								>
									{category.name}
								</NavDropdown.Item>
							))}
							<NavDropdown.Divider />
							<NavDropdown.Item as={Link} to="/products">
								Ver todas
							</NavDropdown.Item>
						</NavDropdown>
					</Nav>

					<Nav className="ms-auto">
						{store.user ? (
							<>
								<Nav.Link as={Link} to="/cart" className="position-relative">
									<i className="fas fa-shopping-cart"></i>
									{cartItemsCount > 0 && (
										<Badge
											bg="danger"
											pill
											className="position-absolute top-0 start-100 translate-middle"
										>
											{cartItemsCount}
										</Badge>
									)}
								</Nav.Link>

								<NavDropdown
									title={
										<span>
											<i className="fas fa-user me-1"></i>
											{store.user.first_name}
										</span>
									}
									id="user-dropdown"
									align="end"
								>
									<NavDropdown.Item as={Link} to="/profile">
										<i className="fas fa-user-edit me-2"></i>
										Mi Perfil
									</NavDropdown.Item>
									<NavDropdown.Item as={Link} to="/orders">
										<i className="fas fa-list me-2"></i>
										Mis Pedidos
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item onClick={handleLogout}>
										<i className="fas fa-sign-out-alt me-2"></i>
										Cerrar Sesión
									</NavDropdown.Item>
								</NavDropdown>
							</>
						) : (
							<>
								<Nav.Link as={Link} to="/login">
									<i className="fas fa-sign-in-alt me-1"></i>
									Iniciar Sesión
								</Nav.Link>
								<Nav.Link as={Link} to="/register">
									<i className="fas fa-user-plus me-1"></i>
									Registrarse
								</Nav.Link>
							</>
						)}
					</Nav>
				</BootstrapNavbar.Collapse>
			</Container>
		</BootstrapNavbar>
	);
};