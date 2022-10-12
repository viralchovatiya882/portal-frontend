import { get } from "lodash";
import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { isMobileOrTab } from "../../constants";
import { getScreenSize } from "../../helpers/utility";
import Sidebar from "./sidebar";

/**
 * Renders the navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated
 * @param props
 */
export const PageLayout = props => {
  const [height, setHeight] = React.useState("100vh");

  React.useEffect(() => {
    getHeight();
  }, [props.children]);

  const getHeight = () => {
    const client = document.getElementById("app_content_page_view");
    if (client && client.offsetHeight > 400) {
      setHeight("100%");
    } else {
      setHeight("100vh");
    }
  };

  return (
    <div className="app_pagelayout">
      {getScreenSize() > isMobileOrTab && get(props, "isOpen", true) ? (
        <div className="app_pagelayout__with-sidebar">
          <Row noGutters style={{ height: "100vh" }}>
            <Col xl={2} sm={3} className={`${get(props, "isOpen", true) ? "sidebar_lg slide-in" : "slide-out"}`}>
              <Sidebar loggedInUser={get(props, "loggedInUser")} />
            </Col>
            <Col xl={10} sm={9} className="p-4" id="app_content_page_view">
              {props.children}
            </Col>
          </Row>
        </div>
      ) : (
        <div className="p-3 app_pageLayout__no-sidebar custom-slide-out">{props.children}</div>
      )}
    </div>
  );
};
