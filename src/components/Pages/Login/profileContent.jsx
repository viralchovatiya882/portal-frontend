import { CheckSquareOutlined } from "@ant-design/icons";
import { useMsal } from "@azure/msal-react";
import { Button } from "antd";
import React, { useState } from "react";
import "../../../assets/styles/app.scss";
import { warning } from "../../UIComponents/Message";
// import { loginRequest } from "../../../config/authConfig";
// import { callMsGraph } from "../../../config/graph";
// import { ProfileData } from "./profileData";

/**
 * Renders information about the signed-in user or a button to retrieve data about the user
 */
const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);

    // function RequestProfileData() {
    //     // Silently acquires an access token which is then attached to a request for MS Graph data
    //     instance.acquireTokenSilent({
    //         ...loginRequest,
    //         account: accounts[0]
    //     }).then((response) => {
    //         callMsGraph(response.accessToken).then(response => setGraphData(response));
    //     });
    // }

    return (
        <>
            <h5 className="card-title">Welcome, <b> {accounts[0].name} </b></h5>
            <Button
                type="primary"
                className="mt-1"
                icon={<CheckSquareOutlined />}
                onClick={() => warning("IN PROGRESS")}
            >
                Request Access
            </Button>
            {/* graphData ?
                <ProfileData graphData={graphData} />
                :
                <Button variant="secondary" onClick={RequestProfileData}>Request Profile Information</Button>
            */}
        </>
    );
};

export default ProfileContent;