import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { capitalizeAllLetter } from "@helpers/utility";
import { Col, Row, Spin, Tag, Tooltip, Typography } from "antd";
import { get } from "lodash";
import React from "react";
import { status_color_map } from "../constants";
import "./index.scss";

const { Text } = Typography;

/**
 * Renders Lead Summary Component
 */
const LeadSummary = props => {
  const getStatus = get(status_color_map, get(props, "status", "").toLowerCase());
  const getText = str => {
    return capitalizeAllLetter(str.replace(/_/g, " "));
  };
  return (
    <>
      <ErrorBoundary>
        <div className="common_card_section">
          <Spin spinning={get(props, "loading", false)}>
            <Row style={{ fontSize: "0.9rem" }}>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Lead ID:</Text>
                <Tooltip placement="topLeft" title={get(props, "id", "NA")}>
                  <p> # {get(props, "lead_id", "NA")} </p>
                </Tooltip>
              </Col>

              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Lead Source:</Text>
                <Tooltip placement="topLeft" title={getText(get(props, "lead_source", "NA"))}>
                  <p> {getText(get(props, "lead_source", "NA"))} </p>
                </Tooltip>
              </Col>

              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Mapped Sales Associate:</Text>
                <Tooltip placement="topLeft" title={getText(get(props, "sales_associate", "NA"))}>
                  <p> {getText(get(props, "sales_associate", "NA"))} </p>
                </Tooltip>
              </Col>

              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Follow Up Date:</Text>
                <Tooltip placement="topLeft" title={get(props, "follow_up_date", "NA")}>
                  <p> {get(props, "follow_up_date", "NA")} </p>
                </Tooltip>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Created At:</Text>
                <Tooltip placement="topLeft" title={get(props, "created_date", "NA")}>
                  <p> {get(props, "created_date", "NA")} </p>
                </Tooltip>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Contact Name:</Text>
                <Tooltip placement="topLeft" title={get(props, "contact_name", "NA")}>
                  <p> {get(props, "contact_name", "NA")} </p>
                </Tooltip>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Email:</Text>
                <Tooltip placement="topLeft" title={get(props, "email", "NA")}>
                  <p className="text-overflow"> {get(props, "email", "NA")} </p>
                </Tooltip>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Phone:</Text>
                <Tooltip placement="topLeft" title={get(props, "phone", "NA")}>
                  <p> {get(props, "phone", "NA")} </p>
                </Tooltip>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">City:</Text>
                <Tooltip placement="topLeft" title={get(props, "city", "NA")}>
                  <p> {get(props, "city", "NA") ? get(props, "city", "NA") : "NA"} </p>
                </Tooltip>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Status:</Text>
                <Tooltip placement="topLeft" title={getText(get(props, "status", "NA"))}>
                  <p>
                    <Tag color={getStatus}>{getText(get(props, "status", "NA"))}</Tag>
                  </p>
                </Tooltip>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Last Updated:</Text>
                <Tooltip placement="topLeft" title={get(props, "last_updated", "NA")}>
                  <p> {get(props, "last_updated", "NA")} </p>
                </Tooltip>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                <Text type="secondary">Last Updated By:</Text>
                <Tooltip placement="topLeft" title={get(props, "last_updated_by", "NA")}>
                  <p> {get(props, "last_updated_by", "NA")} </p>
                </Tooltip>
              </Col>
            </Row>
          </Spin>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default LeadSummary;
