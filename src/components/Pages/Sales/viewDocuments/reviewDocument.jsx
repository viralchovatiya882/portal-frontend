import { Col, Row, Tabs } from "antd";
import { get, round } from "lodash";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getAosSopHtml, getProductDesc } from "../../../../store/SalesOrder/sale.actions";
import { CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";
import DocumentViewer from "./documentViewer";
import "./reviewDocument.scss";

const { TabPane } = Tabs;
const ReactDOMServer = require("react-dom/server");
const HtmlToReactParser = require("html-to-react").Parser;

var htmlInput = "";
var htmlToReactParser = new HtmlToReactParser();
var reactElement = htmlToReactParser.parse(htmlInput);
var reactHtml = ReactDOMServer.renderToStaticMarkup(reactElement);

const ReviewComponent = props => {
  const [productDesc, setProductDesc] = useState("");
  const [aosHtml, setAosHtml] = useState("");
  const [sopHtml, setSopHtml] = useState("");

  const getSumArrayOFObjWithKey = (arr, key) => {
    let sumValue = arr.reduce((prev, cur) => {
      if (key === "unit" || key === "quantity") {
        return prev + parseInt(cur[key]);
      } else {
        return prev + round(cur[key], 2);
      }
    }, 0);
    return sumValue;
  };
  
  const calculateTotalOrderValue = () => {
    const spiritAdded = [...props.salesOrderState.spiritAdded];
    const totalDiscount = getSumArrayOFObjWithKey(spiritAdded, "discount");
    const totalSpiritValue = getSumArrayOFObjWithKey(spiritAdded, "total_price");
    const total = totalSpiritValue - (totalSpiritValue * totalDiscount) / 100;

    const additionalCharges = [...props.salesOrderState.additionalCharges];
    const totalAdditionalCharges = getSumArrayOFObjWithKey(additionalCharges, "total_cost");
    return totalAdditionalCharges + round(total,2);
  };
  const calculateTotalCases = () => {
    const spiritAdded = [...props.salesOrderState.spiritAdded];
    const totalCases = getSumArrayOFObjWithKey(spiritAdded, "quantity");
    return totalCases;
  };
  const getAOSANDSOPHTML = async req => {
    const aosAndSopHtmlReq = await props.getAosSopHtml(req);
    const aos = aosAndSopHtmlReq.response.aosHtml;
    let htmlToReactParser = new HtmlToReactParser();
    let reactElement = htmlToReactParser.parse(aos);
    let aosHtml = ReactDOMServer.renderToStaticMarkup(reactElement);
    setAosHtml(aosHtml);
    const sop = aosAndSopHtmlReq.response.sopHtml;
    let htmlToReactParser1 = new HtmlToReactParser();
    let reactElement1 = htmlToReactParser1.parse(sop);
    let sopHtml = ReactDOMServer.renderToStaticMarkup(reactElement1);
    setSopHtml(sopHtml);
  };
  const getProductDesc = async requestBody => {
    const productDescResp = await props.getProductDesc(requestBody);
    setProductDesc(productDescResp.response);
    let newProd = { ...props.salesOrderState };
    newProd.productDesc = productDescResp.response.data;
    props.updateState(newProd);

    const obj = {
      customer_details: props.salesOrderState.customerDetails,
      shipping_details: props.salesOrderState.shippingDetails,
      items: productDescResp.response.data,
      additional_charges: props.salesOrderState.additionalCharges,
      supporting_documents: props.salesOrderState.supporting_documents,
      total_case: calculateTotalCases(),
      total_order_value: calculateTotalOrderValue(),
      notes: props.salesOrderState.notes,
    };
    getAOSANDSOPHTML(obj);
  };

  const getProductDescReqBody = () => {
    return props.salesOrderState.spiritAdded.map(item => {
      return {
        cased_goods_id: item.id,
        quantity: item.quantity,
        discount: item.discount,
      };
    });
  };

  useEffect(() => {
    const casedGoodArr = getProductDescReqBody();
    if (casedGoodArr.length > 0) {
      const reqObj = {
        cased_goods_array: casedGoodArr,
      };
      getProductDesc(reqObj);
    }
    // getAOSANDSOPHTML();
  }, []);

  const callback = key => {
    // console.log(key);
  };
  const handleChange = (key, value) => {};
  return (
    <div className="review-document">
      {/* {reactHtml} */}
      <div className="view-document">
        <Tabs defaultActiveKey="1" onChange={callback}>
          <TabPane tab="Review AOS Document" key="1">
            <DocumentViewer htmlString={aosHtml} />
            {/* <AOSDoc aos={aosHtml} /> */}
            {/* <div>On Submit, an automated email will be triggered to the customer for electronic signature. Please conﬁrm the contact details before Submitting</div> */}
          </TabPane>
          <TabPane tab="Review SOP Document" key="2">
            <DocumentViewer htmlString={sopHtml} />
            {/* <AOSDoc aos={aosHtml} /> */}
          </TabPane>
        </Tabs>
      </div>
      <div>
        <p style={{ color: "#007bff", fontSize: 12, marginBottom: 35 }}>
          <span style={{ color: "red", marginRight: 3 }}>*</span>On Submit, an automated email will be triggered to the customer for electronic
          signature. Please confirm the contact details before Submitting.
        </p>
      </div>
      <div className="customer-detaol">
        <Row>
          <Col className="pl-3" span={8}>
            <InputChange
              handleChange={handleChange}
              value={get(props.salesOrderState.customerDetails, "contact_name", "")}
              type="contact_name"
              className="mt-0 mb-0 w-100"
              label="CONTACT NAME"
              disabled
            />
          </Col>
          <Col className="pl-3" span={8}>
            <InputChange
              handleChange={handleChange}
              value={get(props.salesOrderState.customerDetails, "phone_no", "")}
              type="phone_no"
              className="mt-0 mb-0 w-100"
              label="PHONE"
              disabled
            />
          </Col>
          <Col className="pl-3" span={8}>
            <InputChange
              handleChange={handleChange}
              value={get(props.salesOrderState.customerDetails, "email", "")}
              type="email"
              className="mt-0 mb-0 w-100"
              label="EMAIL"
              disabled
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};
const mapStateToProps = state => {
  return {
    productDesc: state.salesOrder.productDesc,
  };
};

export default connect(mapStateToProps, { getProductDesc, getAosSopHtml })(ReviewComponent);
