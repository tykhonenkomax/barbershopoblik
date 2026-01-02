import React, { useState } from "react";
import styled from "styled-components";
import {doc, setDoc, addDoc, collection} from "firebase/firestore";
import { db } from "../firebase";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";

type Product = {
    id?: string;
    name: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
};

export const IncomeProductPage = () => {
    const { data: products } =
        useFirestoreCollection<Product>("products");

    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [buyPrice, setBuyPrice] = useState("");

    const selected = products.find((p) => p.id === productId);

    const handleSave = async () => {
        const q = Number(quantity);
        const bp = buyPrice ? Number(buyPrice) : selected?.buyPrice;

        if (!selected || q <= 0) {
            alert("Вибери товар і кількість");
            return;
        }

        await setDoc(
            doc(db, "products", selected.id!),
            {
                stock: selected.stock + q,
                buyPrice: bp,
            },
            { merge: true }
        );

        await addDoc(collection(db, "transactions"), {
            type: "income",
            productId: selected.id,
            quantity: q,
            buyPrice: bp,
            timestamp: Date.now(),
        });

        alert("➕ Товар додано");
        setProductId("");
        setQuantity("");
        setBuyPrice("");
    };

    return (
        <Page>
            <Card>
                <h2>➕ Додати існуючий товар</h2>

                <Select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                >
                    <option value="">Вибери товар</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </Select>

                <Input
                    type="number"
                    placeholder="Кількість"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />

                {selected && (
                    <Input
                        type="number"
                        placeholder={`Закупка (було ${selected.buyPrice})`}
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                    />
                )}

                <AddButton onClick={handleSave}>Зберегти</AddButton>
            </Card>
        </Page>
    );
};

/* ===== styles (простi, в твоєму стилі) ===== */

const Page = styled.div`
    padding: 20px;
    display: flex;
    justify-content: center;
`;

const Card = styled.div`
    width: 100%;
    max-width: 500px;
    background: white;
    padding: 20px;
    border-radius: 14px;
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
`;

const AddButton = styled.button`
    background: #4caf50;
    color: white;
    padding: 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
`;
