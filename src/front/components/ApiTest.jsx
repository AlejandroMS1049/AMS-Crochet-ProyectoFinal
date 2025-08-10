import React, { useEffect, useState } from "react";

const ApiTest = () => {
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/test-db`)
            .then(res => res.json())
            .then(data => setResult(data))
            .catch(err => setResult({ status: "error", message: err.message }));
    }, []);

    return (
        <div>
            <h2>API Test</h2>
            {result ? (
                <div>
                    <p>Status: {result.status}</p>
                    <p>Mensaje: {result.message}</p>
                </div>
            ) : (
                <p>Verificando conexión...</p>
            )}
        </div>
    );
};

export default ApiTest;
