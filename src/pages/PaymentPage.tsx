import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

// Підтягуємо файлик QR через require
const qr = require("../assets/banka.jpg");

export const PaymentPage = () => {
    return (
        <Wrapper>
            <Card>
                <Title>Оплата товару</Title>

                <QR src={qr} alt="QR Code" />

                <Text>Відскануйте QR-код для оплати</Text>

                <HomeButton to="/">На головну</HomeButton>
            </Card>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: 20px;
`;

const Card = styled.div`
    background: white;
    width: 100%;
    max-width: 420px;
    padding: 24px;
    border-radius: 14px;
    text-align: center;
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
`;

const Title = styled.h2`
    margin-bottom: 16px;
`;

const QR = styled.img`
    width: 100%;
    border-radius: 12px;
    margin-bottom: 16px;
`;

const Text = styled.div`
    margin-bottom: 18px;
`;

const HomeButton = styled(Link)`
    background: #3b82f6;
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;

    &:hover {
        opacity: 0.9;
    }
`;
