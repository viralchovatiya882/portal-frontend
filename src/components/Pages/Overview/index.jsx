import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import ProfileContent from "../Login/profileContent";

/**
 * Renders Dashboard overview component
 */
const DashboardOverview = (props) => {

    if (get(props, "loggedInUser.data.role") === "admin" && window.location.pathname === "/") {
        return (<Redirect to={{ pathname: "/dashboard" }} />);
    }
    
    return (
        <>
            <ProfileContent />
        </>
    );
};

export default connect((state) => ({
    loggedInUser: get(state, "auth.loggedInUserDetails")
}), {})(DashboardOverview);
