import React, { useState } from "react";

function Upload() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [image, setImage] = useState("");
    const [error, setError] = useState("");

    const insertItem = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("https://localhost:3000/products/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, description, price, quantity}),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Sikeres feltöltés");
                setName("");
                setDescription("");
                setPrice("");
                setQuantity("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Hiba a feltöltés közben!");
        }
    };
    return (


        <div>
            <h1>Termékek feltöltése</h1>
            {error && <p>{error}</p>}
            <form onSubmit={insertItem}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Neve"
                />
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Leírása"
                />
                <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ára"
                />
                <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="darabszám"
                />
                <button type="submit">Feltöltés</button>
            </form>
        </div>
    );
}

export default Upload;