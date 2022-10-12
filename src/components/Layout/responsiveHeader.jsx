import { useMsal } from "@azure/msal-react";
import { get } from "lodash";
import React from "react";
import { graphConfig } from "../../config/authConfig";
import { siteConfig } from "../../settings";
import MenuDrawer from "../UIComponents/Drawer/menuDrawer";
import UserMenu from "../UIComponents/UserMenu";

/**
 * Renders the userprofile component
 */
export const ResponsiveHeader = (props) => {
    const { instance } = useMsal();

    const handleSignOut = () => {
        instance.logout();
    };

    return (
        <div className="responsive_header d-flex justify-content-between align-items-center">
            <MenuDrawer loggedInUser={get(props, "loggedInUser")} />
            <center className="ml-sm-5"><b>{siteConfig.appName}</b></center>
            <UserMenu handleSignOut={handleSignOut} profilePic={graphConfig.graphMeProfilePic} />
        </div>
    );
};
