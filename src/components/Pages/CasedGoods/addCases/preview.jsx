import { CheckSquareTwoTone, CloseSquareTwoTone } from "@ant-design/icons";
import { numberWithCommas } from "@helpers/utility";
import { Spin } from "antd";
import { get, round } from "lodash";
import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { defaultValue } from "../utility/constants";
import { getName, getValue, getValueCheck } from "../utility/helper";

export default props => {
  const basicTabsFields = Object.keys(get(defaultValue, "basic", {}));
  const caseTabsFields = Object.keys(get(defaultValue, "case", {}));
  const priceTabsFields = Object.keys(get(defaultValue, "price", {}));

  const getTabValue = tab => {
    if (tab === "total_cases") {
      const BPC = Number(get(props, "addedCase.bpc", 0));
      let BIPC = get(props, "addedCase.bottles_in_partial_case", ["0/0"]);
      if (BIPC) {
        BIPC = BIPC.split("/");
        BIPC = Number(BIPC[0]);
      }
      const wholeCase = Number(get(props, "addedCase.whole_case", 0));
      return round(wholeCase + BIPC / BPC, 2);
    } else {
      return get(props, `addedCase.${tab}`);
    }
  };

  const renderData = (index, tab, type = "") => {
    return (
      <div key={index} className="p-2">
        <b className="pr-1">
          {getValueCheck(get(props, `addedCase.${tab}`, tab)) ? (
            <CheckSquareTwoTone twoToneColor="#52c41a" className="pr-1" />
          ) : (
            <CloseSquareTwoTone twoToneColor="#ff4d4f" className="pr-1" />
          )}
          {getName(tab)} :
        </b>
        {type === "price" ? <>£ {numberWithCommas(getValue(getTabValue(tab), tab))}</> : getValue(getTabValue(tab), tab)}
      </div>
    );
  };

  return (
    <Spin spinning={get(props, "loading", false)}>
      <Row>
        <Col sm={6} xs={12} md={6} lg={4}>
          {[...basicTabsFields, "cask", "cask_type", "ays", "bottling_date", "age", "tags"].map((tab, index) => {
            return renderData(index, tab);
          })}
        </Col>
        <Col sm={6} xs={12} md={6} lg={4}>
          {[...caseTabsFields, "total_cases", "comments"].map((tab, index) => {
            return renderData(index, tab);
          })}
        </Col>
        <Col sm={6} xs={12} md={6} lg={4}>
          {priceTabsFields.map((tab, index) => {
            return renderData(index, tab, "price");
          })}
        </Col>
      </Row>
    </Spin>
  );
};
