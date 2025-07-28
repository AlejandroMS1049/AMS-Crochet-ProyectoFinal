import React, { useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Context } from '../hooks/useGlobalReducer.jsx';

export const Home = () => {
	const { store, actions } = useContext(Context);

	useEffect(() => {
		// Cargar productos destacados y categorías
		actions.getProducts();
		actions.getCategories();
	}, []);

	const featuredProducts = store.products?.slice(0, 6) || [];

	return (
		<>
			{/* Hero Section */}
			<section className="bg-primary text-white py-5">
				<Container>
					<Row className="align-items-center">
						<Col md={6}>
							<h1 className="display-4 fw-bold mb-4">
								Bienvenido a AMS Crochet
							</h1>
							<p className="lead mb-4">
								Descubre nuestra colección de productos únicos hechos con amor y dedicación.
								Artesanías de crochet que le darán un toque especial a tu hogar.
							</p>
							<div>
								<Link to="/products" className="btn btn-light btn-lg me-3">
									Ver Catálogo
								</Link>
								{!store.user && (
									<Link to="/register" className="btn btn-outline-light btn-lg">
										Crear Cuenta
									</Link>
								)}
							</div>
						</Col>
						<Col md={6}>
							<div className="text-center">
								<img
									src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
									alt="Crochet products"
									className="img-fluid rounded shadow"
								/>
							</div>
						</Col>
					</Row>
				</Container>
			</section>

			{/* Categorías */}
			<section className="py-5">
				<Container>
					<Row className="mb-4">
						<Col>
							<h2 className="text-center">Nuestras Categorías</h2>
							<p className="text-center text-muted">
								Explora nuestras diferentes categorías de productos
							</p>
						</Col>
					</Row>
					<Row>
						{store.categories?.slice(0, 4).map(category => (
							<Col key={category.id} md={3} className="mb-4">
								<Card className="h-100 text-center border-0 shadow-sm">
									<Card.Body>
										<div className="mb-3">
											<i className="fas fa-heart fa-3x text-primary"></i>
										</div>
										<Card.Title>{category.name}</Card.Title>
										<Card.Text>
											{category.description || 'Productos únicos y especiales'}
										</Card.Text>
										<Link
											to={`/products?category=${category.id}`}
											className="btn btn-outline-primary"
										>
											Ver productos
										</Link>
									</Card.Body>
								</Card>
							</Col>
						))}
					</Row>
				</Container>
			</section>

			{/* Productos Destacados */}
			<section className="py-5 bg-light">
				<Container>
					<Row className="mb-4">
						<Col>
							<h2 className="text-center">Productos Destacados</h2>
							<p className="text-center text-muted">
								Descubre nuestros productos más populares
							</p>
						</Col>
					</Row>
					<Row>
						{featuredProducts.length > 0 ? (
							featuredProducts.map(product => (
								<Col key={product.id} md={4} className="mb-4">
									<Card className="h-100 shadow-sm">
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
											<div className="d-flex justify-content-between align-items-center">
												<h5 className="text-primary mb-0">
													${product.price.toFixed(2)}
												</h5>
												<Link
													to={`/product/${product.id}`}
													className="btn btn-primary"
												>
													Ver detalles
												</Link>
											</div>
										</Card.Body>
									</Card>
								</Col>
							))
						) : (
							<Col className="text-center">
								<p>Cargando productos...</p>
							</Col>
						)}
					</Row>
					<Row>
						<Col className="text-center">
							<Link to="/products" className="btn btn-primary btn-lg">
								Ver todos los productos
							</Link>
						</Col>
					</Row>
				</Container>
			</section>

			{/* About Section */}
			<section className="py-5">
				<Container>
					<Row className="align-items-center">
						<Col md={6}>
							<img
								src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
								alt="Artisan working"
								className="img-fluid rounded shadow"
							/>
						</Col>
						<Col md={6}>
							<h2>Acerca de AMS Crochet</h2>
							<p className="lead">
								Somos una tienda especializada en productos de crochet hechos a mano
								con la más alta calidad y dedicación.
							</p>
							<p>
								Cada pieza es única y está creada con materiales de primera calidad.
								Nuestro compromiso es brindar productos que no solo sean hermosos,
								sino también duraderos y funcionales.
							</p>
							<ul className="list-unstyled">
								<li><i className="fas fa-check text-success me-2"></i> Productos 100% hechos a mano</li>
								<li><i className="fas fa-check text-success me-2"></i> Materiales de alta calidad</li>
								<li><i className="fas fa-check text-success me-2"></i> Envío gratuito</li>
								<li><i className="fas fa-check text-success me-2"></i> Garantía de satisfacción</li>
							</ul>
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
}; 