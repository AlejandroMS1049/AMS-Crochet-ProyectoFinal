import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL;

const ProductCrud = () => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category_id: "", image_url: "" });

    // Listar productos
    useEffect(() => {
        fetch(`${API}/api/products`)
            .then(res => res.json())
            .then(data => setProducts(data));
    }, []);

    // Crear producto
    const handleCreate = e => {
        e.preventDefault();
        fetch(`${API}/api/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(newProduct => setProducts([...products, newProduct]));
    };

    // Eliminar producto
    const handleDelete = id => {
        fetch(`${API}/api/products/${id}`, { method: "DELETE" })
            .then(() => setProducts(products.filter(p => p.id !== id)));
    };

    // Actualizar producto (ejemplo simple)
    const handleUpdate = (id, updatedFields) => {
        fetch(`${API}/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedFields)
        })
            .then(res => res.json())
            .then(updated => setProducts(products.map(p => p.id === id ? updated : p)));
    };

    return (
        <div>
            <h2>CRUD Productos</h2>
            <form onSubmit={handleCreate}>
                <input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <input placeholder="Precio" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                <input placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                <input placeholder="ID Categoría" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} />
                <input placeholder="Imagen URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                <button type="submit">Crear</button>
            </form>
            <ul>
                {products.map(product => (
                    <li key={product.id}>
                        {product.name} - {product.price} €
                        <button onClick={() => handleDelete(product.id)}>Eliminar</button>
                        <button onClick={() => handleUpdate(product.id, { name: product.name + " (edit)" })}>Editar nombre</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductCrud;
