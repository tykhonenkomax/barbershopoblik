// src/components/DeleteProductButton.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

type Props = {
    productId: string;
    productName?: string;
};

export const DeleteProductButton: React.FC<Props> = ({ productId, productName }) => {
    const [loading, setLoading] = useState(false);

    const handleHide = async () => {
        const name = productName ? ` "${productName}"` : "";
        if (!window.confirm(`Прибрати товар${name}? (він зникне зі списків продажу/адмінки)`)) return;

        setLoading(true);
        try {
            await updateDoc(doc(db, "products", productId), {
                active: false,
            });

            alert("Товар прибрано");
            window.location.reload();
        } catch (err: any) {
            alert("Помилка: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button disabled={loading} onClick={handleHide} title="Сховати товар">
            🗑 Прибрати
        </Button>
    );
};

const Button = styled.button`
  padding: 6px 10px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
