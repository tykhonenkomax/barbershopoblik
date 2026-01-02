import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { CATEGORIES } from "../types/categories";


type WithId = {
    id?: string;
};
type Product = WithId & {
    name: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    sold?: number;
    used?: number;
    photo?: string;
    category: string;
};

export const AddProductPage = () => {
    const navigate = useNavigate();
    const { addItem } = useFirestoreCollection<Product>("products");

    const [name, setName] = useState("");
    const [buyPrice, setBuyPrice] = useState("");
    const [sellPrice, setSellPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    const [photo, setPhoto] = useState<string>("");

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPhoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        const bp = Number(buyPrice);
        const sp = Number(sellPrice);
        const st = Number(stock);

        if (!name || !category || bp <= 0 || sp <= 0 || st <= 0) {
            alert("Заповніть всі поля");
            return;
        }

        await addItem({
            name,
            buyPrice: bp,
            sellPrice: sp,
            stock: st,
            sold: 0,
            used: 0,
            photo,
            category,
        });

        navigate("/admin");
    };

    return (
        <Page>
            <Card>
                <h2>➕ Новий товар</h2>

                <Input placeholder="Назва" value={name} onChange={(e) => setName(e.target.value)} />

                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Категорія</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </Select>

                <Input type="number" placeholder="Вхідна ціна" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
                <Input type="number" placeholder="Продажна ціна" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                <Input type="number" placeholder="Кількість" value={stock} onChange={(e) => setStock(e.target.value)} />

                <label>
                    📷 Фото
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                </label>

                <Buttons>
                    <BtnSave onClick={handleSave}>Зберегти</BtnSave>
                    <BtnCancel onClick={() => navigate("/admin")}>Скасувати</BtnCancel>
                </Buttons>
            </Card>
        </Page>
    );
};

/* ===== styles (простi, можеш замiнити своїми) ===== */

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

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
`;

const Buttons = styled.div`
  display: flex;
  gap: 10px;
`;

const BtnSave = styled.button`
  flex: 1;
  background: #4caf50;
  color: white;
  padding: 12px;
  border-radius: 8px;
  border: none;
`;

const BtnCancel = styled(BtnSave)`
  background: #ef4444;
`;
