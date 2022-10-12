import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { get } from "lodash";
import React, { Suspense } from "react";
import { connect } from "react-redux";
import AppRouter from "./appRouter";
import Logo from "./assets/images/duncan-taylor-logo.svg";
// import { Footer } from "./components/Layout/footer";
import { Header } from "./components/Layout/header";
import { PageLayout } from "./components/Layout/pageLayout";
import { SignInButton } from "./components/Pages/Login/signInButton";
import Loader from "./components/UIComponents/Loader";
import { siteConfig } from "./settings";

/**
 * If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
 */
const MainContent = (props) => {
    const [isDrawerOpen, setDrawerStatus] = React.useState(true);

    const handleDrawerStatus = () => {
        setDrawerStatus(!isDrawerOpen);
    };

    return (
        <div className="App">
            <AuthenticatedTemplate>
                <Header
                    handleDrawerStatus={handleDrawerStatus}
                    loggedInUser={get(props, "loggedInUser")}
                />
                <PageLayout
                    isOpen={isDrawerOpen}
                    loggedInUser={get(props, "loggedInUser")}
                >
                    <AppRouter
                        loggedInUser={get(props, "loggedInUser")}
                    />
                </PageLayout>
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <div className="welcome_note">
                    <img src={Logo} alt={siteConfig.appName} width="250" height="250" />
                    <h2>{siteConfig.appName}</h2>
                    <h5 className="card-title">Please sign in to your account using your Duncan Taylor email credentials</h5>
                    <SignInButton />
                </div>
                {/* <Footer /> */}
            </UnauthenticatedTemplate>
        </div>
    );
};

/**
 * Application Entry Component
 * @param props 
 */
function App(props) {
    const { loggedInUser } = props;
    return (
        <Suspense fallback={<Loader />}>
            <MainContent history={props.history} loggedInUser={loggedInUser} />
        </Suspense>
    );
}

export default connect((state) => ({
    loggedInUser: get(state, "auth.loggedInUserDetails", false)
}), {})(App);