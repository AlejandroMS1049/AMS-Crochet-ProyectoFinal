import React from "react";

const Footer = () => {
	return (
		<footer className="bg-dark text-light py-4 mt-5">
			<div className="container text-center">
				<h5>AMS Crochet</h5>
				<p>¡Gracias por visitar nuestra tienda! Síguenos en redes sociales:</p>
				<div className="d-flex justify-content-center gap-3 mb-2">
					<a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light">
						<i className="fab fa-instagram"></i> Instagram
					</a>
					<a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light">
						<i className="fab fa-facebook"></i> Facebook
					</a>
					<a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-light">
						<i className="fab fa-twitter"></i> Twitter
					</a>
				</div>
				<small>&copy; {new Date().getFullYear()} AMS Crochet. Todos los derechos reservados.</small>
			</div>
		</footer>
	);
};

export default Footer;
