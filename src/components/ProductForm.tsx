import React, { useState } from "react";
import styled from "styled-components";
import {Product} from "../types/product";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    max-width: 400px;
    margin: 20px auto;
    background: #fafafa;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);

    input, button {
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #ccc;
    }

    button {
        background: #222;
        color: #fff;
        cursor: pointer;
        transition: 0.2s;

        &:hover {
            background: #444;
        }
    }

    @media (max-width: 600px) {
        max-width: 90%;
    }
`;

export const ProductForm: React.FC<{ onAdd: (p: Product) => void }> = ({ onAdd }) => {
    const [name, setName] = useState("");
    const [photo, setPhoto] = useState<string>("");
    const [buyPrice, setBuyPrice] = useState("");
    const [sellPrice, setSellPrice] = useState("");
    const [quantity, setQuantity] = useState("");

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPhoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !buyPrice || !sellPrice || !quantity) return;

        onAdd({
            id: Date.now().toString(),
            name,
            photo,
            buyPrice: Number(buyPrice),
            sellPrice: Number(sellPrice),
            quantity: Number(quantity), // ✅ кількість з поля
        });

        setName("");
        setPhoto("");
        setBuyPrice("");
        setSellPrice("");
        setQuantity("");
    };

    return (
        <Form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Назва товару"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input type="file" accept="image/*" onChange={handlePhoto} />
            <input
                type="number"
                placeholder="Ціна закупки"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
            />
            <input
                type="number"
                placeholder="Ціна продажу"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
            />
            <input
                type="number"
                placeholder="Кількість (прихід)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />
            <button type="submit">Додати товар</button>
        </Form>
    );
};
