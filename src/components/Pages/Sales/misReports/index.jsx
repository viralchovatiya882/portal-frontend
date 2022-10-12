import { DownloadOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import Heading from "@components/UIComponents/Heading";
import { isMobileOrTab } from "@constants";
import { exportToCSV } from "@helpers/exportToCSV";
import { getRequestHeader } from "@helpers/service";
import { getScreenSize, getFileType } from "@helpers/utility";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { Button, message } from "antd";
import axios from "axios";
import { get } from "lodash";
import React from "react";

/**
 * Renders MIS REPORT component
 */
const MISReport = props => {
  const handleDownload = async type => {
    let url = `${process.env.REACT_APP_API_ENDPOINT}/api/mis/download_order_details_excel`;
    if (type === "sales_summary") {
      url = `${process.env.REACT_APP_API_ENDPOINT}/api/mis/download_order_summary_excel`;
    }

    const rest = await axios({
      method: "GET",
      url,
      headers: { ...getRequestHeader() }
    }).catch(err => {
      openNotificationWithIcon("error", `${get(err, "data.message", "Something Went Wrong")} `);
    });

    // if (get(rest, "data.status")) {
    //   // handleCSVDownload(get(rest, "data.data"), type);
    // }

    if (get(rest, "data.status")) {
      var link = document.createElement("a");

      link.setAttribute("href", `${getFileType("xlsx")};base64,${get(rest, "data.file")}`);
      link.setAttribute("download", `${type}_${new Date().toLocaleString().replace(/[/, ]/g, "_")}.xlsx`);
      document.body.appendChild(link); // Required for FF
      link.click();

      openNotificationWithIcon("success", `${get(rest, "data.message", "Download Successful")} `);
    }

    if (!get(rest, "data.status", true)) {
      openNotificationWithIcon("error", `${get(err, "data.message", "Something Went Wrong")} `);
    }
  };


  const handleCSVDownload = (exportData, type) => {
    if (exportData.length > 0) {
      exportToCSV(exportData, type);
    } else {
      message.warning("No data available");
    }
  };

  return (
    <>
      <Heading text="MIS Reports" variant="h4" />
      <div className="bg-white p-sm-4 table-responsive-padding">
        <ErrorBoundary>
          <>
            <Button type="primary" onClick={() => handleDownload("sales_summary")} icon={<DownloadOutlined />}>
              Download Sales Summary
            </Button>
            <Button
              type="primary"
              className={getScreenSize() > isMobileOrTab ? "ml-3" : "mt-3"}
              icon={<DownloadOutlined />}
              onClick={() => handleDownload("sales_details")}
            >
              Sales Order with details
            </Button>
          </>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default MISReport;
