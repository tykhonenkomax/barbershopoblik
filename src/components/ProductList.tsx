// src/components/ProductList/ProductList.tsx
import React from "react";
import styled from "styled-components";
import {Product} from "../types/product";

const Table = styled.table`
    width: 90%;
    margin: 20px auto;
    border-collapse: collapse;
    th, td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        text-align: left;
    }
    img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }
    button {
        background: #c0392b;
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 5px 10px;
        cursor: pointer;
    }
`;

interface Props {
    products: Product[];
    onDelete?: (id: string) => void;
}

export const ProductList: React.FC<Props> = ({ products, onDelete }) => {
    if (products.length === 0)
        return <p style={{ textAlign: "center" }}>Поки що немає товарів</p>;

    return (
        <Table>
            <thead>
            <tr>
                <th>Фото</th>
                <th>Назва</th>
                <th>Закупка</th>
                <th>Продаж</th>
                <th>Кількість</th>
                {onDelete && <th></th>}
            </tr>
            </thead>
            <tbody>
            {products.map((p) => (
                <tr key={p.id}>
                    <td>{p.photo && <img src={p.photo} alt={p.name} />}</td>
                    <td>{p.name}</td>
                    <td>{p.buyPrice} грн</td>
                    <td>{p.sellPrice} грн</td>
                    <td>{p.quantity}</td>
                    {onDelete && (
                        <td>
                            <button onClick={() => onDelete(p.id)}>Видалити</button>
                        </td>
                    )}
                </tr>
            ))}
            </tbody>
        </Table>
    );
};
