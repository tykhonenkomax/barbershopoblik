// src/components/DeleteTransactionButton.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

type Props = {
    id: string;        // id транзакції
    productId: string; // id товару
    quantity: number;  // скільки продали
};

export const DeleteTransactionButton: React.FC<Props> = ({ id, productId, quantity }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Видалити цей продаж?")) return;

        setLoading(true);
        try {
            // 1) Повертаємо товар на склад + забираємо зі "sold"
            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, {
                stock: increment(quantity),
                sold: increment(-quantity),
            });

            // 2) Видаляємо транзакцію
            await deleteDoc(doc(db, "transactions", id));

            alert("✅ Продаж видалено");
            window.location.reload();
        } catch (err: any) {
            alert("Помилка: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button disabled={loading} onClick={handleDelete} title="Видалити продаж">
            ❌ Видалити
        </Button>
    );
};

const Button = styled.button`
    padding: 6px 10px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        opacity: 0.85;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
