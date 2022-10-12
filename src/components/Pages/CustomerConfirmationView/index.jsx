import { DownloadOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { getFileType } from "@helpers/utility";
import { Button, Tooltip } from "antd";
import axios from "axios";
import { get, has } from "lodash";
import React from "react";
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";
import DocumentViewer from "../Sales/viewDocuments/documentViewer";

/**
 * Renders Customer Confirmation View, public URL
 */
const CustomerConfirmationView = props => {
  const [htmlTemplate, setHTMLTemplate] = React.useState([]);
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const sendConfirmation = async () => {
    const resp = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/order_confirmation_data${get(props, "location.search", "")}`
    }).catch(err => {
      openNotificationWithIcon("error", "Order Details", `${get(err, "message", "Something went wrong")}`);
    });

    if (get(resp, "status") === 200) {
      setHTMLTemplate(get(resp, "data.html"));
    }

    if (get(resp, "data.status", false)) {
      setIsConfirmed(true);
    }

    if (!get(resp, "data.status", true) && has(resp, "data.message")) {
      openNotificationWithIcon("error", "Order Details", `${get(resp, "data.message", "Something went wrong")}`);
    }
  };

  const downloadConfirmationDoc = async () => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/getCustomerConfirmationDocPdf${get(props, "location.search", "")}`
    }).catch(err => {
      openNotificationWithIcon("error", "Confirmation Of Sale Doc", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "status") === 200) {
      var link = document.createElement("a");
      link.setAttribute("href", `${getFileType("pdf")};base64,${get(rest, "data.pdf")}`);
      link.setAttribute("download", `confirmation_of_sale_doc_${new Date().toLocaleString().replace(/[/, ]/g, "_")}.pdf`);
      document.body.appendChild(link); // Required for FF
      link.click();
      openNotificationWithIcon("success", "Confirmation Of Sale Doc", "Download Successful");
    } else {
      openNotificationWithIcon("warning", "Confirmation Of Sale Doc", get(rest, "statusText", "Something went wrong"));
    }
  };

  React.useEffect(() => {
    sendConfirmation();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white p-4 float-left w-100">
        <ErrorBoundary>
          {isConfirmed && (
            <div className="float-right mb-3">
              <Tooltip placement="topLeft" title="Download Confirmation Of Sales Doc">
                <Button type="primary" className="ml-sm-3" icon={<DownloadOutlined />} size="small" onClick={() => downloadConfirmationDoc()}>
                  Download Doc
                </Button>
              </Tooltip>
            </div>
          )}
          <div className="float-left w-100 view__document">
            <DocumentViewer htmlString={htmlTemplate} />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default CustomerConfirmationView;
