import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { CATEGORIES } from "../types/categories";
import { EditProductModal } from "../components/EditProductModal";
import { DeleteTransactionButton } from "../components/DeleteTransactionButton";

type Product = {
    id?: string;
    name: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    sold?: number;
    used?: number;
    photo?: string;
    category: string;
};

type Barber = {
    id?: string;
    name: string;
};

export const AdminPage = () => {
    const { data: barbers } = useFirestoreCollection<Barber>("barbers");
    const { data: products, addItem } = useFirestoreCollection<Product>("products");

    const [balance, setBalance] = useState(0);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [buyPrice, setBuyPrice] = useState("");
    const [sellPrice, setSellPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    const [photo, setPhoto] = useState("");

    useEffect(() => {
        getDoc(doc(db, "settings", "balance")).then((snap) => {
            if (snap.exists()) setBalance(snap.data().value || 0);
        });
    }, []);

    useEffect(() => {
        getDocs(collection(db, "transactions")).then((snap) => {
            const arr: any[] = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setTransactions(arr);
        });
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPhoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleAdd = async () => {
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

        setName("");
        setBuyPrice("");
        setSellPrice("");
        setStock("");
        setCategory("");
        setPhoto("");
    };

    let totalSoldBuy = 0;
    let totalSoldSell = 0;

    products.forEach((p) => {
        const sold = p.sold || 0;
        totalSoldBuy += sold * p.buyPrice;
        totalSoldSell += sold * p.sellPrice;
    });

    const profit = totalSoldSell - totalSoldBuy;

    useEffect(() => {
        setDoc(doc(db, "settings", "balance"), { value: profit });
        setBalance(profit);
    }, [profit]);

    const handleDeleteProduct = async (p: Product) => {
        if (!p.id) return;

        if (!window.confirm(`Видалити товар "${p.name}"?`)) return;

        setDeletingProductId(p.id);
        await deleteDoc(doc(db, "products", p.id));
        setDeletingProductId(null);
        window.location.reload();
    };

    return (
        <Page>
            <Card>
                <Title>Адмінка товарів</Title>

                <FormRow>
                    <Input placeholder="Назва" value={name} onChange={(e) => setName(e.target.value)} />

                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Категорія</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Select>

                    <Input type="number" placeholder="Вхідна" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
                    <Input type="number" placeholder="Продажна" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                    <Input type="number" placeholder="К-сть" value={stock} onChange={(e) => setStock(e.target.value)} />

                    <FileUploadContainer>
                        <FileLabel htmlFor="photoInput">📷 Фото</FileLabel>
                        <HiddenFileInput id="photoInput" type="file" accept="image/*" onChange={handlePhotoUpload} />
                        <FileName>{photo ? "Фото вибрано" : "Файл не вибрано"}</FileName>
                    </FileUploadContainer>
                </FormRow>

                <AddButton onClick={handleAdd}>Додати товар</AddButton>

                <h3 style={{ marginTop: 30 }}>Товари</h3>

                <TableWrapper>
                    <Table>
                        <thead>
                        <tr>
                            <th>Фото</th>
                            <th>Назва</th>
                            <th>Категорія</th>
                            <th>Вхідна</th>
                            <th>Продаж</th>
                            <th>Залишок</th>
                            <th>Продано</th>
                            <th>Сума</th>
                            <th>Прибуток</th>
                            <th>Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((p) => {
                            const sold = p.sold || 0;
                            const soldAmount = sold * p.sellPrice;
                            const profitRow = soldAmount - sold * p.buyPrice;

                            return (
                                <tr key={p.id}>
                                    <td>{p.photo && <img src={p.photo} alt="" width={50} />}</td>
                                    <td>{p.name}</td>
                                    <td>{p.category}</td>
                                    <td>{p.buyPrice}</td>
                                    <td>{p.sellPrice}</td>
                                    <td>{p.stock}</td>
                                    <td>{sold}</td>
                                    <td>{soldAmount}</td>
                                    <td style={{ color: "#22c55e" }}>{profitRow}</td>
                                    <td>
                                        <Actions>
                                            <EditButton onClick={() => setEditingProduct(p)}>✏️</EditButton>
                                            <DeleteButton
                                                disabled={deletingProductId === p.id}
                                                onClick={() => handleDeleteProduct(p)}
                                            >
                                                ❌
                                            </DeleteButton>
                                        </Actions>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </TableWrapper>

                {editingProduct && (
                    <EditProductModal
                        product={editingProduct}
                        onClose={() => setEditingProduct(null)}
                    />
                )}

                <h3>Продажі</h3>

                {transactions
                    .filter((t) => t.type === "sale")
                    .map((t) => {
                        const product = products.find((p) => p.id === t.productId)?.name ?? "Товар";
                        const barber = barbers.find((b) => b.id === t.barberId)?.name ?? "Барбер";

                        return (
                            <div key={t.id} style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <b>{product}</b> — {t.quantity} — {t.totalSell} грн
                                    <br />
                                    <small>{barber}</small>
                                </div>
                                <DeleteTransactionButton id={t.id} productId={t.productId} quantity={t.quantity} />
                            </div>
                        );
                    })}
            </Card>
        </Page>
    );
};

/* =================== STYLES =================== */


const Page = styled.div`
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        padding: 12px;
        gap: 16px;
    }
`;

const Card = styled.div`
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;

    @media (max-width: 768px) {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 16px;
        border-radius: 16px;
    }
`;

const Title = styled.h2`
    margin-bottom: 20px;

    @media (max-width: 768px) {
        margin-bottom: 14px;
        font-size: 26px;
    }
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
    align-items: start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 10px;
    }
`;

const Input = styled.input`
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #bbb;
    font-size: 16px; /* щоб iOS не зумів */

    @media (max-width: 600px) {
        padding: 12px;
        border-radius: 12px;
    }
`;


const Select = styled.select`
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #bbb;
    font-size: 16px; /* щоб iOS не зумів */

    @media (max-width: 600px) {
        padding: 12px;
        border-radius: 12px;
    }
`;

const FileUploadContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const FileLabel = styled.label`
    background: #3b82f6;
    color: white;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px; /* щоб iOS не зумів */
    text-align: center;

    @media (max-width: 600px) {
        padding: 12px;
        border-radius: 12px;
    }
`;

const HiddenFileInput = styled.input`
    display: none;
`;

const FileName = styled.div`
    font-size: 12px;
    opacity: 0.7;
`;

const AddButton = styled.button`
    background: #4caf50;
    color: white;
    padding: 12px 14px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    width: fit-content;

    @media (max-width: 600px) {
        width: 100%;
        padding: 14px;
    }
`;

const TableWrapper = styled.div`
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 12px;
    border: 1px solid #e5e7eb;

    @media (max-width: 600px) {
        margin-left: -14px;   /* щоб таблиця займала всю ширину екрану */
        margin-right: -14px;
        border-left: none;
        border-right: none;
        border-radius: 0;
    }
`;

const Table = styled.table`
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;

    th,
    td {
        padding: 10px;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
        font-size: 14px;
        vertical-align: middle;
    }

    th {
        position: sticky;  /* зручно при скролі */
        top: 0;
        background: #fff;
        z-index: 1;
    }

    @media (max-width: 600px) {
        th,
        td {
            padding: 8px;
            font-size: 13px;
        }

        img {
            width: 38px !important;
            height: auto;
        }
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;

    @media (max-width: 600px) {
        gap: 6px;
    }
`;

const EditButton = styled.button`
    background: #3b82f6;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;

    @media (max-width: 600px) {
        padding: 8px 10px;
        border-radius: 10px;
    }
`;

const DeleteButton = styled.button`
    background: #ef4444;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;

    @media (max-width: 600px) {
        padding: 8px 10px;
        border-radius: 10px;
    }
`;
