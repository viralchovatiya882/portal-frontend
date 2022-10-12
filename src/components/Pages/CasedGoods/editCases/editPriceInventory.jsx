import { InfoCircleOutlined } from "@ant-design/icons";
import { CustomInputNumber as InputNumberChange, CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import { Col, Row, Spin } from "antd";
import { get } from "lodash";
import React from "react";

const EditPriceInventory = (props) => {
    return (
        <div className="mt-2 mb-2 edit_price_inventory">
            <span className="d-flex align-items-center mb-2"> <InfoCircleOutlined /> <b className="pl-2">  All Prices are in GBP </b> </span>
            <Spin spinning={get(props, "loading", false)} size="medium">
                <Row>
                    <Col xs={{ span: 24 }} sm={{ span: 7 }}>
                        <InputNumberChange
                            handleChange={props.handlePriceChange}
                            value={get(props, "price.export_price", "")}
                            type="export_price"
                            label="Export Pricing"
                            onBlur={props.handleExportPrice}
                            handleEnterKey={props.handleExportPrice}
                            className="mt-0 mb-0 w-100"
                            required
                            addonBefore="£"
                            validateStatus={get(props, "priceError.export_price") && "error"}
                            helpText={get(props, "priceError.export_price") && "Export Pricing cannot be empty"}
                        />
                    </Col>
                    <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }}>
                        <InputNumberChange
                            value={get(props, "price.wholesale_price", "")}
                            type="wholesale_price"
                            label="Wholesale M/Up"
                            className="mt-0 mb-0 w-100"
                            disabled
                            required
                            addonBefore="£"
                            validateStatus={get(props, "priceError.wholesale_price") && "error"}
                            helpText={get(props, "priceError.wholesale_price") && "Whole sale cannot be empty"}
                        />
                    </Col>
                    <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }}>
                        <InputNumberChange
                            value={get(props, "price.duty", "")}
                            type="duty"
                            className="mt-0 mb-0 w-100"
                            label="Duty"
                            disabled
                            required
                            addonBefore="£"
                            validateStatus={get(props, "priceError.duty") && "error"}
                            helpText={get(props, "priceError.duty") && "Duty cannot be empty"}
                        />
                    </Col>
                    <Col xs={{ span: 24 }} sm={{ span: 7 }}>
                        <InputNumberChange
                            value={get(props, "price.uk_trade_price", "")}
                            className="mt-0 mb-0 w-100"
                            type="uk_trade_price"
                            label="UK Trade Price"
                            disabled
                            required
                            addonBefore="£"
                            validateStatus={get(props, "priceError.uk_trade_price") && "error"}
                            helpText={get(props, "priceError.uk_trade_price") && "UK Trade Price cannot be empty"}
                        />
                    </Col>
                    <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }}>
                        <InputNumberChange
                            value={get(props, "price.retail_price_case", "")}
                            className="mt-0 mb-0 w-100"
                            type="retail_price_case"
                            label="Retail Price Case"
                            disabled
                            required
                            addonBefore="£"
                            validateStatus={get(props, "priceError.retail_price_case") && "error"}
                            helpText={get(props, "priceError.retail_price_case") && "Retail Price Case cannot be empty"}
                        />
                    </Col>
                    <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }}>
                        <InputNumberChange
                            value={get(props, "price.retail_price_case_incl_vat", "")}
                            className="mt-0 mb-0 w-100"
                            type="retail_price_case_incl_vat"
                            label="Retail Price Case w VAT"
                            disabled
                            required
                            addonBefore="£"
                            validateStatus={get(props, "priceError.retail_price_case_incl_vat") && "error"}
                            helpText={get(props, "priceError.retail_price_case_incl_vat") && "Retail Price Case VAT cannot be empty"}
                        />
                    </Col>
                    <Col xs={{ span: 24 }} sm={{ span: 7 }}>
                        <InputNumberChange
                            value={get(props, "price.retail_price_unit_incl_vat", "")}
                            className="mt-0 mb-0 w-100"
                            type="retail_price_unit_incl_vat"
                            label="Retail Price Unit w VAT"
                            disabled
                            required
                            addonBefore="£"
                            validateStatus={get(props, "priceError.retail_price_unit_incl_vat") && "error"}
                            helpText={get(props, "priceError.retail_price_unit_incl_vat") && "Retail Price Unit VAT cannot be empty"}
                        />
                    </Col>
                    <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }}>
                        <InputNumberChange
                            handleChange={props.handlePriceChange}
                            value={get(props, "price.offer_price", "")}
                            className="mt-0 mb-0 w-100"
                            type="offer_price"
                            label="Offer Price"
                            addonBefore="£"
                        />
                    </Col>
                </Row>
                <InputTextArea
                    handleChange={(key, value) => props.handleChange("comments", props.setComments, value)}
                    className="mt-0 mb-0 w-100"
                    type="comments"
                    value={get(props, "comments")}
                    label="Reason"
                    required
                    validateStatus={get(props, "commentsError") && "error"}
                    helpText={get(props, "commentsError") && "Reason cannot be empty"}
                />
            </Spin>
        </div>
    );
};

export default EditPriceInventory;
