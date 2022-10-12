import { LinkOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { Button, Col, Row, Spin, Tooltip, Typography } from "antd";
import { get } from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import "./index.scss";

const { Text } = Typography;

/**
 * Renders Customer Summary Component
 */
const CustomerSummary = props => {
  const getValue = val => {
    return val ? val : "NA";
  };
  return (
    <ErrorBoundary>
      <div className="common_card_section">
        <Spin spinning={get(props, "loading", false)}>
          <Row style={{ fontSize: "0.9rem" }}>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Customer ID:</Text>
              <Tooltip placement="topLeft" title={get(props, "customer_id", "NA")}>
                <p> # {getValue(get(props, "customer_id", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Customer Entity Name:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "customer_entity_name", "NA"))}>
                <p> {getValue(get(props, "customer_entity_name", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Contact Name:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "contact_name", "NA"))}>
                <p> {getValue(get(props, "contact_name", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Country:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "country", "NA"))}>
                <p> {getValue(get(props, "country", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">State:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "state", "NA"))}>
                <p> {getValue(get(props, "state", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">City:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "city", "NA"))}>
                <p className="text-overflow"> {getValue(get(props, "city", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Phone:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "phone_no", "NA"))}>
                <p> {getValue(get(props, "phone_no", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Email:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "email", "NA"))}>
                <p> {getValue(get(props, "email", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Postbox Code:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "postBox_code", "NA"))}>
                <p>{getValue(get(props, "postBox_code", "NA"))}</p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Invoice Address 1:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "invoice_address1", "NA"))}>
                <p> {getValue(get(props, "invoice_address1", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Invoice Address 2:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "invoice_address2", "NA"))}>
                <p> {getValue(get(props, "invoice_address2", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Mapped Lead Id:</Text>
              <Tooltip placement="topLeft" title={`View Lead Details - # ${getValue(get(props, "mapped_lead_id", "NA"))}`}>
                <p>
                  {get(props, "mapped_lead_id") ? (
                    <Link to={{ pathname: `/lead-details/${get(props, "mapped_lead_id", "NA")}`, state: { prevPath: "customer_details" } }}>
                      <Button type="link" icon={<LinkOutlined className="pr-2" />}>
                        {getValue(get(props, "mapped_lead_id", "NA"))}
                      </Button>
                    </Link>
                  ) : (
                    getValue(get(props, "mapped_lead_id", "NA"))
                  )}
                </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Created Date:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "created_date", "NA"))}>
                <p> {getValue(get(props, "created_date", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Created By:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "created_by", "NA"))}>
                <p> {getValue(get(props, "created_by", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Active Orders:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "active_orders", "NA"))}>
                <p> {getValue(get(props, "active_orders", "NA"))} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Total Orders:</Text>
              <Tooltip placement="topLeft" title={getValue(get(props, "total_orders", "NA"))}>
                <p> {getValue(get(props, "total_orders", "NA"))} </p>
              </Tooltip>
            </Col>
          </Row>
        </Spin>
      </div>
    </ErrorBoundary>
  );
};

export default CustomerSummary;
