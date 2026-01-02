import React, { useState } from "react";
import styled from "styled-components";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";

type Barber = { id?: string; name: string };

export const BarbersPage = () => {
    const { data: barbers, addItem, deleteItem } =
        useFirestoreCollection<Barber>("barbers");

    const [name, setName] = useState("");

    const handleAdd = () => {
        if (!name.trim()) return;
        addItem({ name });
        setName("");
    };

    return (
        <Wrapper>
            <Card>
                <Title>Барбери</Title>

                <Input
                    placeholder="Ім’я барбера"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <AddButton onClick={handleAdd}>Додати</AddButton>

                <TableWrapper>
                    <Table>
                        <thead>
                        <tr>
                            <th>Барбер</th>
                            <th>Дія</th>
                        </tr>
                        </thead>

                        <tbody>
                        {barbers.map((b) => (
                            <tr key={b.id}>
                                <td>{b.name}</td>
                                <td>
                                    <DeleteBtn onClick={() => deleteItem(b.id!)}>
                                        ✖
                                    </DeleteBtn>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </TableWrapper>
            </Card>
        </Wrapper>
    );
};

/* ---------------- STYLES ---------------- */

const Wrapper = styled.div`
    width: 100%;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
`;

const Card = styled.div`
    width: 100%;
    max-width: 650px;
    background: #fff;
    padding: 22px;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const Title = styled.h2`
    text-align: center;
    margin-bottom: 18px;
    font-size: 1.8rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #cfcfcf;
    font-size: 1.05rem;
    box-sizing: border-box;
    margin-bottom: 14px;
    background: #fff;

    &:focus {
        border-color: #4b9cff;
        outline: none;
        box-shadow: 0 0 0 3px rgba(76, 142, 255, 0.25);
    }

    @media (max-width: 450px) {
        padding: 10px;
        font-size: 1rem;
    }
`;

const AddButton = styled.button`
    width: 100%;
    background: #22c55e;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 22px;
`;

const TableWrapper = styled.div`
    width: 100%;
    overflow-x: auto; /* ← FIX for mobile */
`;

const Table = styled.table`
    width: 100%;
    min-width: 100%;
    border-collapse: collapse;

    th, td {
        padding: 14px;
        border-bottom: 1px solid #ececec;
        text-align: left;
        font-size: 1.1rem;
    }

    th {
        background: #f3f6fa;
        font-size: 1.2rem;
        font-weight: 600;
    }
`;

const DeleteBtn = styled.button`
    background: #ef4444;
    color: white;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;
