import { Result } from "antd";
import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import "./index.scss";

/**
 * Renders Dashboard overview component
 */
const DashboardOverview = (props) => {

  return (
    <div className="dashboard_overview">
      <Result
        status="success"
        title="Welcome,"
        subTitle={
          <>
            <b> {get(props, "loggedInUser.data.name", "").toUpperCase()} </b>
            <br />
            {get(props, "loggedInUser.data.email", "")}
          </>
        }
      />
    </div>
  );
};
export default connect((state) => ({ loggedInUser: get(state, "auth.loggedInUserDetails") }), {})(DashboardOverview);
