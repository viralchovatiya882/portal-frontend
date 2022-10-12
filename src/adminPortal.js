import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import React, { Suspense } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Loader from "./components/UIComponents/Loader";
import { msalConfig } from "./config/authConfig";
import { clearCookie } from "./helpers/cookieHelper";
import Router from "./router";
import Boot from "./config/boot";
import { history, store } from "./store/rootStore";
/**
 * Initialize a PublicClientApplication instance which is provided to the MsalProvider component
 * We recommend initializing this outside of your root component to ensure it is not re-initialized on re-renders
 */
const msalInstance = new PublicClientApplication(msalConfig);
const account = msalInstance.getAllAccounts()[0];
const { name, username } = account ? account : { name: "", username: "" };
clearCookie("access_token");

const AdminPortal = () => {
    return (
        <MsalProvider instance={msalInstance}>
            <Provider store={store}>
                <BrowserRouter>
                    <Suspense fallback={<Loader />}>
                        <Router history={history} />
                    </Suspense>
                </BrowserRouter>
            </Provider>
        </MsalProvider>
    );
};

Boot({ name, email: username, history })
    .then(() => AdminPortal())
    // eslint-disable-next-line no-console
    .catch(error => console.error(error));

export default AdminPortal;