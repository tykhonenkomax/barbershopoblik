import React, { useState } from "react";
import styled from "styled-components";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

type Props = {
    product: any;
    onClose: () => void;
};

export const EditProductModal: React.FC<Props> = ({ product, onClose }) => {
    const [name, setName] = useState(product.name);
    const [category, setCategory] = useState(product.category || "");
    const [buyPrice, setBuyPrice] = useState(product.buyPrice);
    const [sellPrice, setSellPrice] = useState(product.sellPrice);
    const [stock, setStock] = useState(product.stock);

    const save = async () => {
        const ref = doc(db, "products", product.id);

        await updateDoc(ref, {
            name,
            category,
            buyPrice: Number(buyPrice),
            sellPrice: Number(sellPrice),
            stock: Number(stock),
        });

        onClose();
    };

    return (
        <Overlay>
            <Modal>
                <Title>Редагувати товар</Title>

                <Label>Назва</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />

                <Label>Категорія</Label>
                <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />

                <Label>Вхідна ціна</Label>
                <Input
                    type="number"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                />

                <Label>Продажна ціна</Label>
                <Input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                />

                <Label>Залишок</Label>
                <Input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                />

                <Buttons>
                    <Cancel onClick={onClose}>Скасувати</Cancel>
                    <Save onClick={save}>Зберегти</Save>
                </Buttons>
            </Modal>
        </Overlay>
    );
};

/* STYLES */

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
`;

const Modal = styled.div`
    width: 90%;
    max-width: 420px;
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
`;

const Title = styled.h2`
    text-align: center;
    margin-bottom: 16px;
`;

const Label = styled.div`
    margin: 6px 0 4px;
    font-weight: 600;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 10px;
`;

const Buttons = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 14px;
`;

const Cancel = styled.button`
    flex: 1;
    margin-right: 10px;
    padding: 10px;
    background: #ccc;
    border: none;
    border-radius: 8px;
    font-weight: 600;
`;

const Save = styled.button`
    flex: 1;
    padding: 10px;
    background: #22c55e;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
`;
