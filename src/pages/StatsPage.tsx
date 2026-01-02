import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";

export const StatsPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [barbers, setBarbers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [cashout, setCashout] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const prodSnap = await getDocs(collection(db, "products"));
        const barbSnap = await getDocs(collection(db, "barbers"));
        const tranSnap = await getDocs(collection(db, "transactions"));
        const cashSnap = await getDoc(doc(db, "settings", "cashout"));

        setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setBarbers(barbSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTransactions(tranSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        if (cashSnap.exists()) setCashout(cashSnap.data().value || 0);
    };

    // ---------------- GLOBAL STATS ----------------
    const moneyInStockBuy = products.reduce(
        (s, p) => s + (p.stock || 0) * (p.buyPrice || 0),
        0
    );
    const moneyInStockSell = products.reduce(
        (s, p) => s + (p.stock || 0) * (p.sellPrice || 0),
        0
    );

    const soldTransactions = transactions.filter(
        (t) => String(t.type || "").toLowerCase().trim() === "sale"
    );

    const usageTransactions = transactions.filter((t) => {
        const type = String(t.type || "").toLowerCase().trim();
        return (
            type === "usage" ||
            type === "use" ||
            type === "used" ||
            type.startsWith("usag") ||
            type.includes("спис")
        );
    });

    const totalSoldSum = soldTransactions.reduce(
        (s, t) => s + (t.totalSell || 0),
        0
    );
    const totalSoldAfterCashout = totalSoldSum - cashout;

    const groupBy = (list: any[]) =>
        list.reduce((acc: any, t: any) => {
            const key = t.barberId || "unknown";
            if (!acc[key]) acc[key] = [];
            acc[key].push(t);
            return acc;
        }, {});

    const groupedSales = groupBy(soldTransactions);
    const groupedUsage = groupBy(usageTransactions);

    const applyCashout = async (value: number) => {
        const newValue = cashout + value;
        await setDoc(doc(db, "settings", "cashout"), { value: newValue });
        setCashout(newValue);
        alert("Інкасація виконана!");
    };

    const getProductName = (productId: string) =>
        products.find((p) => p.id === productId)?.name || "Товар";

    // ✅ DELETE USAGE + RETURN STOCK BACK
    const deleteUsageAndReturnStock = async (t: any) => {
        const productName = getProductName(t.productId);
        const ok = window.confirm(
            `Видалити списання: "${productName}" (${t.quantity} шт) і повернути на склад?`
        );
        if (!ok) return;

        try {
            const productRef = doc(db, "products", t.productId);
            const tranRef = doc(db, "transactions", t.id);

            await runTransaction(db, async (tx) => {
                const prodSnap = await tx.get(productRef);

                // якщо товар видалили — просто видаляємо транзакцію
                if (!prodSnap.exists()) {
                    tx.delete(tranRef);
                    return;
                }

                const prod = prodSnap.data() as any;
                const qty = Number(t.quantity || 0);

                const newStock = Number(prod.stock || 0) + qty;
                const newUsed = Math.max(Number(prod.used || 0) - qty, 0);

                tx.update(productRef, { stock: newStock, used: newUsed });
                tx.delete(tranRef);
            });

            await loadData();
            alert("✅ Списання видалено, товар повернуто на склад");
        } catch (e) {
            console.error(e);
            alert("❌ Помилка при видаленні списання");
        }
    };

    // ✅ DELETE SALE + RETURN STOCK BACK + ROLLBACK SOLD
    const deleteSaleAndReturnStock = async (t: any) => {
        const productName = getProductName(t.productId);
        const ok = window.confirm(
            `Видалити продаж: "${productName}" (${t.quantity} шт, ${t.totalSell || 0} грн) і повернути товар на склад?`
        );
        if (!ok) return;

        try {
            const productRef = doc(db, "products", t.productId);
            const tranRef = doc(db, "transactions", t.id);

            await runTransaction(db, async (tx) => {
                const prodSnap = await tx.get(productRef);

                // якщо товар видалили — просто видаляємо транзакцію
                if (!prodSnap.exists()) {
                    tx.delete(tranRef);
                    return;
                }

                const prod = prodSnap.data() as any;
                const qty = Number(t.quantity || 0);

                const newStock = Number(prod.stock || 0) + qty;
                const newSold = Math.max(Number(prod.sold || 0) - qty, 0);

                tx.update(productRef, { stock: newStock, sold: newSold });
                tx.delete(tranRef);
            });

            await loadData();
            alert("✅ Продаж видалено, товар повернуто на склад");
        } catch (e) {
            console.error(e);
            alert("❌ Помилка при видаленні продажу");
        }
    };

    return (
        <Wrapper>
            <Card>
                <Title>Статистика</Title>

                {/* ---------------- GLOBAL STATS BLOCK ---------------- */}
                <StatsGrid>
                    <StatCard>
                        <Label>Грошей у товарі (закупка)</Label>
                        <Value>{moneyInStockBuy} грн</Value>
                    </StatCard>

                    <StatCard>
                        <Label>Грошей у товарі (продаж)</Label>
                        <Value>{moneyInStockSell} грн</Value>
                    </StatCard>

                    <StatCard>
                        <Label>Продано на суму</Label>
                        <Value>{totalSoldAfterCashout} грн</Value>
                        <CashoutInfo>Інкасовано: {cashout} грн</CashoutInfo>
                        <IncassoButton
                            onClick={() => {
                                const v = Number(prompt("Сума інкасації:"));
                                if (!v) return;
                                applyCashout(v);
                            }}
                        >
                            Інкасація
                        </IncassoButton>
                    </StatCard>

                    <StatCard>
                        <Label>Продаж по барберам</Label>
                        {barbers.map((b) => {
                            const list = groupedSales[b.id] || [];
                            const sum = list.reduce((s: number, x: any) => s + (x.totalSell || 0), 0);
                            return (
                                <BarberRow key={b.id}>
                                    {b.name}: <strong>{sum} грн</strong>
                                </BarberRow>
                            );
                        })}
                    </StatCard>
                </StatsGrid>

                <Divider />

                {/* ---------------- SALES DETAIL ---------------- */}
                <h3>Деталізація по барберам</h3>

                {barbers.map((b) => {
                    const list = groupedSales[b.id] || [];
                    return (
                        <div key={b.id} style={{ marginTop: 20 }}>
                            <h4>{b.name}</h4>

                            {list.length === 0 ? (
                                <div style={{ opacity: 0.6 }}>Немає продажів</div>
                            ) : (
                                <DetailTable>
                                    <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Товар</th>
                                        <th>Кількість</th>
                                        <th>Сума</th>
                                        <th></th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {list.map((t: any) => {
                                        const date = new Date(t.timestamp).toLocaleString("uk-UA");
                                        const product = getProductName(t.productId);

                                        return (
                                            <tr key={t.id}>
                                                <td>{date}</td>
                                                <td>{product}</td>
                                                <td>{t.quantity}</td>
                                                <td>{t.totalSell} грн</td>
                                                <td>
                                                    <DeleteButton onClick={() => deleteSaleAndReturnStock(t)}>
                                                        🗑️
                                                    </DeleteButton>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </DetailTable>
                            )}
                        </div>
                    );
                })}

                <Divider />

                {/* ---------------- USAGE DETAIL + DELETE ---------------- */}
                <h3>Списання по барберам</h3>

                {barbers.map((b) => {
                    const list = groupedUsage[b.id] || [];
                    return (
                        <div key={b.id} style={{ marginTop: 20 }}>
                            <h4>{b.name}</h4>

                            {list.length === 0 ? (
                                <div style={{ opacity: 0.6 }}>Немає списань</div>
                            ) : (
                                <DetailTable>
                                    <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Товар</th>
                                        <th>Кількість</th>
                                        <th>Собівартість</th>
                                        <th></th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {list.map((t: any) => {
                                        const date = new Date(t.timestamp).toLocaleString("uk-UA");
                                        const product = getProductName(t.productId);
                                        const totalBuy =
                                            t.totalBuy ??
                                            ((products.find((p) => p.id === t.productId)?.buyPrice || 0) *
                                                (t.quantity || 0));

                                        return (
                                            <tr key={t.id}>
                                                <td>{date}</td>
                                                <td>{product}</td>
                                                <td>{t.quantity}</td>
                                                <td>{totalBuy} грн</td>
                                                <td>
                                                    <DeleteButton onClick={() => deleteUsageAndReturnStock(t)}>
                                                        🗑️
                                                    </DeleteButton>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </DetailTable>
                            )}
                        </div>
                    );
                })}

                {/* якщо є транзакції без барбера */}
                {groupedUsage["unknown"] && (
                    <>
                        <Divider />
                        <h3>Інші списання (без барбера)</h3>
                        <DetailTable>
                            <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Товар</th>
                                <th>Кількість</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {groupedUsage["unknown"].map((t: any) => {
                                const date = new Date(t.timestamp).toLocaleString("uk-UA");
                                const product = getProductName(t.productId);
                                return (
                                    <tr key={t.id}>
                                        <td>{date}</td>
                                        <td>{product}</td>
                                        <td>{t.quantity}</td>
                                        <td>
                                            <DeleteButton onClick={() => deleteUsageAndReturnStock(t)}>
                                                🗑️
                                            </DeleteButton>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </DetailTable>
                    </>
                )}
            </Card>
        </Wrapper>
    );
};

/* ===================== STYLES ===================== */

const Wrapper = styled.div`
    padding: 20px;
    display: flex;
    justify-content: center;
`;

const Card = styled.div`
    width: 100%;
    max-width: 900px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
    margin-bottom: 20px;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
`;

const StatCard = styled.div`
    background: #f1f5f9;
    padding: 16px;
    border-radius: 10px;
`;

const Label = styled.div`
    opacity: 0.7;
    margin-bottom: 6px;
`;

const Value = styled.div`
    font-weight: 700;
    font-size: 1.3rem;
`;

const CashoutInfo = styled.div`
    margin-top: 6px;
    font-size: 0.9rem;
    opacity: 0.6;
`;

const BarberRow = styled.div`
    margin-top: 4px;
`;

const IncassoButton = styled.button`
    margin-top: 10px;
    background: #ef4444;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
`;

const Divider = styled.div`
    height: 1px;
    background: #ddd;
    margin: 25px 0;
`;

const DetailTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        border-bottom: 1px solid #eee;
        padding: 8px 6px;
    }

    th {
        background: #f8fafc;
    }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #ef4444;
  transition: 0.2s;

  &:hover {
    transform: scale(1.15);
  }
`;
