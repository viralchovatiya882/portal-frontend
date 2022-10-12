import "antd/dist/antd.css";
import Amplify from "aws-amplify";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom";
import AdminPortal from "./adminPortal";
import "./assets/styles/app.scss";
import "./assets/styles/index.scss";
import { configStaging } from "./config/awsConfig";

Amplify.configure(configStaging);

ReactDOM.render(
  <AdminPortal />,
  document.getElementById("root")
);
