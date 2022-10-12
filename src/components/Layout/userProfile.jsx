import { useMsal } from "@azure/msal-react";
import Axios from "axios";
import React from "react";
import { loginRequest } from "../../config/authConfig";
// import { graphConfig } from "../../config/authConfig";
// import { callMSGraphProfilePic } from "../../config/graph";
import UserMenu from "../UIComponents/UserMenu";

/**
 * Renders the userprofile component
 */
export const UserProfile = () => {
  const { instance, accounts } = useMsal();
  const [imageUrl, setImageUrl] = React.useState(null);

  React.useEffect(() => {
    RequestProfileData();
  }, []);

  const RequestProfileData = () => {
    // Silently acquires an access token which is then attached to a request for MS Graph data
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      })
      .then(response => {
        getPic(response.accessToken);
      });
  };

  const getPic = token => {
    Axios.get("https://graph.microsoft.com/v1.0/me/photo/$value", {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    }).then(o => {
      const url = window.URL || window.webkitURL;
      const blobUrl = url.createObjectURL(o.data);
      setImageUrl(blobUrl);
    });
  };

  const handleSignOut = () => {
    instance.logout();
  };

  return (
    <>
      <UserMenu handleSignOut={handleSignOut} name={accounts[0].name} profilePic={imageUrl} />
    </>
  );
};
