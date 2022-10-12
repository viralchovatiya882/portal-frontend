import { useMsal } from "@azure/msal-react";
import { get } from "lodash";
import React from "react";
import Button from "react-bootstrap/Button";
import { loginRequest } from "../../../config/authConfig";
import { getScreenSize } from "../../../helpers/utility";
import Boot from "../../../config/boot";
import { openNotificationWithIcon } from "../..//UIComponents/Toast/notification";

/**
 * Renders a drop down button with child buttons for logging in with a popup or redirect
 */
export const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = (loginType) => {
        if (loginType === "popup") {
            instance.loginPopup(loginRequest).then((userDetails) => {
                Boot({ name: get(userDetails, "account.name", ""), email: get(userDetails, "account.username", "") });
            }).catch(e => {
                // eslint-disable-next-line no-console
                console.log(e);
                openNotificationWithIcon("error", "Login Error",  "Something Went Wrong");
            });
        } else if (loginType === "redirect") {
            instance.loginRedirect(loginRequest).catch(e => {
                // eslint-disable-next-line no-console
                console.log(e);
            });
        }
    };

    const handleScreenBasedLogin = () => {
        if (getScreenSize() > 769) {
            handleLogin("popup");
        } else {
            handleLogin("redirect");
        }
    };

    return (
        <Button variant="secondary" onClick={() => handleScreenBasedLogin()} style={{ padding: "10px 50px", backgroundColor: "#43425d" }} className="ml-auto mt-4"><b> Sign In </b></Button>
    );
};