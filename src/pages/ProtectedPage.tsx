// src/pages/ProtectedPage.tsx
import React, { useState } from "react";

type Props = {
    children: React.ReactNode;
    code: string; // код доступу (наприклад: "emma502237")
};

export const ProtectedPage: React.FC<Props> = ({ children, code }) => {
    const [input, setInput] = useState("");
    const saved = localStorage.getItem("accessCode");

    const handleEnter = () => {
        if (input === code) {
            localStorage.setItem("accessCode", code);
            window.location.reload();
        } else {
            alert("Невірний код доступу");
        }
    };

    // якщо код вже введено — пускаємо в компонент
    if (saved === code) {
        return <>{children}</>;
    }

    return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <h2>Введіть код доступу</h2>

            <input
                style={{
                    padding: 10,
                    fontSize: 18,
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    width: 200
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <br />
            <button
                style={{
                    marginTop: 15,
                    padding: "10px 20px",
                    fontSize: 16,
                    borderRadius: 8,
                    cursor: "pointer"
                }}
                onClick={handleEnter}
            >
                Увійти
            </button>
        </div>
    );
};
