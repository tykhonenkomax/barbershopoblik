import React, { useState } from "react";
import styled from "styled-components";
import {useLocalStorage} from "../hooks/useLocalStorage";
import {Barber} from "../types/barber";
import {Product} from "../types/product";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
    margin: 20px auto;
    input, select, button {
        padding: 8px;
        border-radius: 8px;
        border: 1px solid #ccc;
    }
`;

interface Props {
    products: Product[];
    onSale: (id: string, qty: number, barber: string) => void;
}

export const SaleForm: React.FC<Props> = ({ products, onSale }) => {
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedBarber, setSelectedBarber] = useState("");
    const [quantity, setQuantity] = useState("");
    const [barbers] = useLocalStorage<Barber[]>("barbers", []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !selectedBarber || !quantity) return;
        onSale(selectedProduct, Number(quantity), selectedBarber);
        setQuantity("");
    };

    return (
        <Form onSubmit={handleSubmit}>
            <select value={selectedBarber} onChange={(e) => setSelectedBarber(e.target.value)}>
                <option value="">Вибери барбера</option>
                {barbers.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                ))}
            </select>

            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Вибери товар</option>
                {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>

            <input
                type="number"
                min="1"
                placeholder="Кількість"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />

            <button type="submit">Продати</button>
        </Form>
    );
};
