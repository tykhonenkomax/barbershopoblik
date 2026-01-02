import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import styled from "styled-components";

import { SalesPage } from "./pages/SalesPage";
import { AdminPage } from "./pages/AdminPage";
import { AddProductPage } from "./pages/AddProductPage";
import { BarbersPage } from "./pages/BarbersPage";
import { StatsPage } from "./pages/StatsPage";
import { PaymentPage } from "./pages/PaymentPage";
import { ProtectedLayout } from "./pages/ProtectedLayout";
import { IncomeProductPage } from "./components/IncomeModal";

export const App = () => {
    const [open, setOpen] = useState(false);

    return (
        <Wrapper>
            <Nav>
                <Brand>💈</Brand>

                <Burger onClick={() => setOpen(!open)}>
                    <span />
                    <span />
                    <span />
                </Burger>

                <NavLinks open={open} onClick={() => setOpen(false)}>
                    <NavLink to="/sale">Продаж</NavLink>
                    <NavLink to="/admin">Адмінка</NavLink>
                    <NavLink to="/admin/add">🆕 Новий товар</NavLink>
                    <NavLink to="/admin/income">➕ Додати товар</NavLink>
                    <NavLink to="/barbers">Барбери</NavLink>
                    <NavLink to="/stats">Статистика</NavLink>
                </NavLinks>
            </Nav>

            <Routes>
                {/* 🔓 ВІДКРИТІ */}
                <Route path="/" element={<Navigate to="/sale" replace />} />
                <Route path="/sale" element={<SalesPage />} />

                {/* ✅ ВІДКРИТИЙ QR-ЕКРАН ПІСЛЯ ПРОДАЖУ */}
                <Route path="/payment" element={<PaymentPage />} />

                {/* 🔒 ВСЕ НИЖЧЕ — ПІД ПАРОЛЕМ */}
                <Route element={<ProtectedLayout />}>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/add" element={<AddProductPage />} />
                    <Route path="/admin/income" element={<IncomeProductPage />} />
                    <Route path="/barbers" element={<BarbersPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                </Route>

                {/* fallback */}
                <Route path="*" element={<Navigate to="/sale" replace />} />
            </Routes>
        </Wrapper>
    );
};

/* =================== STYLES =================== */

const Wrapper = styled.div`
    width: 100%;
    min-height: 100vh;
    background: #f6f8fa;
`;

const Nav = styled.nav`
    padding: 12px 20px;
    background: #222;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
`;

const Brand = styled.div`
    color: white;
    font-size: 22px;
    font-weight: bold;
`;

const NavLinks = styled.div<{ open: boolean }>`
    display: flex;
    gap: 20px;

    @media (max-width: 768px) {
        position: absolute;
        top: 56px;
        left: 0;
        width: 100%;
        background: #222;
        flex-direction: column;
        padding: 16px;
        gap: 12px;
        display: ${({ open }) => (open ? "flex" : "none")};
    }
`;

const NavLink = styled(Link)`
    color: #fff;
    text-decoration: none;
    font-size: 18px;
`;

const Burger = styled.button`
    display: none;
    background: none;
    border: none;

    span {
        display: block;
        width: 24px;
        height: 3px;
        background: white;
        margin: 4px 0;
    }

    @media (max-width: 768px) {
        display: block;
    }
`;
