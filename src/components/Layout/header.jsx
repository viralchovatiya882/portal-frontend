import { MenuOutlined } from "@ant-design/icons";
import { useIsAuthenticated } from "@azure/msal-react";
import { get } from "lodash";
import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Link } from "react-router-dom";
import { isMobileOrTab } from "../../constants";
import { getScreenSize } from "../../helpers/utility";
import { siteConfig } from "../../settings";
import { SignInButton } from "../Pages/Login/signInButton";
import AutoCompleteSelect from "../UIComponents/AutoComplete";
import { ResponsiveHeader } from "./responsiveHeader";
// import { SignOutButton } from "../Pages/Login/signOutButton";
import { UserProfile } from "./userProfile";

/**
 * Renders the navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated
 */
export const Header = (props) => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      {getScreenSize() > isMobileOrTab ?
        <div className="app_header ">
          <Row noGutters>
            <Col xl={2} sm={3}>
              <div className="app_header__brand text-white d-flex justify-content-around align-items-center">
                <MenuOutlined onClick={() => props.handleDrawerStatus()} />
                <Link to="/" className="text-white text-decoration-none"><b>{siteConfig.appName}</b></Link>
              </div>
            </Col>
            <Col xl={10} sm={9}>
              {isAuthenticated ?
                <div className="d-flex justify-content-between align-items-center mt-3 ml-3">
                  <AutoCompleteSelect />
                  <UserProfile />
                </div>
                : <SignInButton />
              }
            </Col>
          </Row>
        </div> :
        <>{isAuthenticated ? <ResponsiveHeader loggedInUser={get(props, "loggedInUser")} /> : <SignInButton />}</>
      }
    </>
  );
};
