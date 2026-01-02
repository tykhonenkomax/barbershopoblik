import React from "react";
import { Outlet } from "react-router-dom";
import { ProtectedPage } from "./ProtectedPage";

export const ProtectedLayout = () => {
    return (
        <ProtectedPage code="emma502237">
            <Outlet />
        </ProtectedPage>
    );
};
