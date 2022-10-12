import React from "react";
import { useMsal } from "@azure/msal-react";
import Button from "react-bootstrap/Button";

/**
 * Renders a sign-out button
 */
export const SignOutButton = () => {
    const { instance } = useMsal();
    return (
        <Button variant="dark" onClick={() => instance.logout()} className="ml-auto">Sign Out</Button>
    );
};