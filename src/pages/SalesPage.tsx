import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
    collection,
    doc,
    updateDoc,
    addDoc,
    increment,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../types/categories";

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

type Barber = { id: string; name: string };

export const SalesPage = () => {
    const { data: products } = useFirestoreCollection<Product>("products");
    const { data: barbers } = useFirestoreCollection<Barber>("barbers");

    const [barberId, setBarberId] = useState("");
    const [category, setCategory] = useState("");
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [sales, setSales] = useState<any[]>([]);
    const [openBarber, setOpenBarber] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ✅ NEW: usage transactions (для підсумків по списаннях)
    const [usages, setUsages] = useState<any[]>([]);

    const navigate = useNavigate();

    // FILTERED PRODUCTS BY CATEGORY
    const filteredProducts = useMemo(() => {
        return category ? products.filter((p) => p.category === category) : [];
    }, [category, products]);

    // Load sales WITH ID (only "sale")
    const loadSales = async () => {
        const qy = query(collection(db, "transactions"), where("type", "==", "sale"));
        const snap = await getDocs(qy);
        const arr: any[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setSales(arr);
    };

    // ✅ NEW: Load usages WITH ID (only "usage")
    const loadUsages = async () => {
        const qy = query(collection(db, "transactions"), where("type", "==", "usage"));
        const snap = await getDocs(qy);
        const arr: any[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setUsages(arr);
    };

    useEffect(() => {
        loadSales();
        loadUsages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GROUP BY BARBER (sales)
    const grouped = useMemo(() => {
        return sales.reduce((acc: any, t: any) => {
            if (!acc[t.barberId]) acc[t.barberId] = [];
            acc[t.barberId].push(t);
            return acc;
        }, {});
    }, [sales]);

    // ✅ NEW: usage totals per barber (units)
    const usageTotalsByBarber = useMemo(() => {
        const map: Record<string, number> = {};
        for (const t of usages) {
            const bId = t.barberId || "unknown";
            map[bId] = (map[bId] || 0) + Number(t.quantity || 0);
        }
        return map;
    }, [usages]);

    /* ==============================================================
       HANDLE TRANSACTION
    ============================================================== */
    const handleTransaction = async (type: "sale" | "usage") => {
        if (!barberId || !productId || quantity <= 0) {
            alert("Заповніть всі поля");
            return;
        }

        setLoading(true);
        try {
            const ref = doc(db, "products", productId);
            const snap = await getDoc(ref);

            if (!snap.exists()) throw new Error("Товар не знайдено");

            const product = snap.data() as Product;

            if ((product.stock ?? 0) < quantity) {
                throw new Error("Недостатня кількість товару");
            }

            const totalBuy = (product.buyPrice ?? 0) * quantity;
            const totalSell = (product.sellPrice ?? 0) * quantity;

            // ✅ update only fields that change
            const updates: any = { stock: (product.stock ?? 0) - quantity };
            if (type === "sale") updates.sold = increment(quantity);
            if (type === "usage") updates.used = increment(quantity);

            await updateDoc(ref, updates);

            await addDoc(collection(db, "transactions"), {
                type,
                productId,
                barberId,
                quantity,
                totalBuy,
                totalSell,
                timestamp: Date.now(),
            });

            if (type === "sale") {
                await loadSales();
                navigate("/payment", {
                    state: {
                        barberId,
                        productId,
                        quantity,
                        totalSell,
                        productName: product.name,
                    },
                });
            } else {
                // ✅ IMPORTANT: показати алерт і НЕ робити navigate, бо інакше його "не видно"
                alert(`✅ Ви успішно списали: ${product.name} — ${quantity} шт`);

                // ✅ оновити підсумкову табличку списань
                await loadUsages();

                // ✅ опційно: скинути форму після списання
                setQuantity(1);
                setProductId("");
                // category і barber лишаємо щоб було швидко списувати ще раз
            }
        } catch (err: any) {
            alert(err?.message || "Помилка");
        } finally {
            setLoading(false);
        }
    };

    const getBarberName = (id: string) =>
        barbers.find((b) => b.id === id)?.name || "Невідомий барбер";

    return (
        <Wrapper>
            <Card>
                <Title>Продаж / Списання</Title>

                {/* BARBER */}
                <Label>Барбер</Label>
                <InputWrapper>
                    <Select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
                        <option value="">Виберіть барбера</option>
                        {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </Select>
                </InputWrapper>

                {/* CATEGORY */}
                <Label>Категорія</Label>
                <InputWrapper>
                    <Select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setProductId("");
                        }}
                    >
                        <option value="">Виберіть категорію</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </Select>
                </InputWrapper>

                {/* PRODUCT */}
                <Label>Товар</Label>
                <InputWrapper>
                    <Select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        disabled={!category}
                    >
                        <option value="">
                            {category ? "Виберіть товар" : "Спочатку виберіть категорію"}
                        </option>

                        {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} — {p.sellPrice} грн
                            </option>
                        ))}
                    </Select>
                </InputWrapper>

                {/* QUANTITY */}
                <Label>Кількість</Label>
                <InputWrapper>
                    <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </InputWrapper>

                <Buttons>
                    <GreenButton disabled={loading} onClick={() => handleTransaction("sale")}>
                        💸 Продати
                    </GreenButton>
                    <RedButton disabled={loading} onClick={() => handleTransaction("usage")}>
                        🧴 Списати
                    </RedButton>
                </Buttons>
            </Card>

            {/* ================= BARBER SUMMARY (sales) ================ */}
            <StatsCard>
                <SubTitle>Підсумки по барберах (продажі)</SubTitle>

                {Object.keys(grouped).length === 0 ? (
                    <Empty>Немає даних</Empty>
                ) : (
                    Object.keys(grouped).map((bId) => {
                        const barberName = barbers.find((b) => b.id === bId)?.name || "Барбер";

                        const totalQty = grouped[bId].reduce(
                            (s: number, x: any) => s + (x.quantity || 0),
                            0
                        );
                        const totalSum = grouped[bId].reduce(
                            (s: number, x: any) => s + (x.totalSell || 0),
                            0
                        );

                        const isOpen = openBarber === bId;

                        return (
                            <div key={bId}>
                                <AccordionHeader onClick={() => setOpenBarber(isOpen ? null : bId)}>
                                    <b>{barberName}</b>
                                    <span>{totalQty} шт</span>
                                    <span>{totalSum} грн</span>
                                    <Chevron>{isOpen ? "▲" : "▼"}</Chevron>
                                </AccordionHeader>

                                {isOpen && (
                                    <AccordionBody>
                                        {grouped[bId].map((t: any, i: number) => {
                                            const productName =
                                                products.find((p) => p.id === t.productId)?.name || "Товар";

                                            const dt = new Date(t.timestamp);
                                            const date = dt.toLocaleDateString("uk-UA");
                                            const time = dt.toLocaleTimeString("uk-UA", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            });

                                            return (
                                                <DetailRow key={t.id || i}>
                                                    <div>
                                                        {date} — {time}
                                                    </div>
                                                    <div>{productName}</div>
                                                    <div>{t.quantity} шт</div>
                                                    <div>{t.totalSell} грн</div>
                                                    <div />
                                                </DetailRow>
                                            );
                                        })}
                                    </AccordionBody>
                                )}
                            </div>
                        );
                    })
                )}
            </StatsCard>

            {/* ✅ NEW: Usage totals table */}
            <BottomCard>
                <SubTitle>Списання по барберам (всього одиниць)</SubTitle>

                {barbers.length === 0 ? (
                    <Empty>Немає барберів</Empty>
                ) : (
                    <UsageTable>
                        <thead>
                        <tr>
                            <th>Барбер</th>
                            <th>Списано (шт)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {barbers.map((b) => (
                            <tr key={b.id}>
                                <td>{b.name}</td>
                                <td>
                                    <b>{usageTotalsByBarber[b.id] || 0}</b>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </UsageTable>
                )}

                {/* якщо є списання без барбера */}
                {usageTotalsByBarber["unknown"] ? (
                    <div style={{ marginTop: 10, opacity: 0.75 }}>
                        Невідомий барбер: <b>{usageTotalsByBarber["unknown"]}</b> шт
                    </div>
                ) : null}
            </BottomCard>
        </Wrapper>
    );
};

/* ================================ STYLES ================================ */
const Wrapper = styled.div`
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
    text-align: center;
    margin-bottom: 18px;
`;

const Label = styled.div`
    font-weight: 700;
    margin-bottom: 6px;
`;

const InputWrapper = styled.div`
    margin-bottom: 14px;
`;

const Select = styled.select`
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #d1d5db;
    font-size: 1rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid #d1d5db;
    font-size: 1rem;
    background: white;
    box-sizing: border-box;

    &:focus {
        border-color: #4f8cff;
        box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.2);
        outline: none;
    }

    @media (max-width: 480px) {
        padding: 10px 12px;
        font-size: 0.95rem;
        border-radius: 10px;
    }
`;

const Buttons = styled.div`
    display: flex;
    gap: 12px;

    @media (max-width: 480px) {
        flex-direction: column;
    }
`;

const GreenButton = styled.button`
    flex: 1;
    background: #22c55e;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        opacity: 0.9;
    }
`;

const RedButton = styled.button`
    flex: 1;
    background: #ef4444;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        opacity: 0.9;
    }
`;

const StatsCard = styled.div`
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 550px;

    @media (max-width: 768px) {
        max-width: 100%;
    }
`;

const BottomCard = styled.div`
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 990px;

    @media (max-width: 768px) {
        max-width: 100%;
    }
`;

const SubTitle = styled.h3`
    margin-bottom: 12px;
`;

const Empty = styled.div`
    opacity: 0.6;
    text-align: center;
`;

const AccordionHeader = styled.div`
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    padding: 12px 14px;
    background: #f1f5f9;
    border-radius: 12px;
    margin-bottom: 8px;
    cursor: pointer;

    &:hover {
        background: #e5e9f0;
    }
`;

const Chevron = styled.div`
    opacity: 0.6;
`;

const AccordionBody = styled.div`
    background: #fafbfc;
    padding: 12px;
    border-left: 3px solid #d1d5db;
    margin-bottom: 10px;
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.6fr 0.8fr auto;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
  align-items: center;
`;

const UsageTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border-bottom: 1px solid #eee;
    padding: 10px 8px;
    text-align: left;
  }

  th {
    background: #f8fafc;
  }
`;
