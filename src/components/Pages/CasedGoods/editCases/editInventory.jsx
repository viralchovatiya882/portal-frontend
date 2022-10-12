import { ActionOptions } from "@constants";
import { isBlank } from "@helpers/utility";
import { defaultRequestKey } from "@settings";
import { Col, Modal, Row, Tag } from "antd";
import { get } from "lodash";
import React from "react";
import "../index.scss";
import { defaultValue } from "../utility/constants";
import { getYearFromDate } from "../utility/helper";
import EditPriceInventory from "./editPriceInventory";
import EditQuantityInventory from "./editQuantityInventory";

const EditInventory = (props) => {
  const [price, updatePrice] = React.useState({ ...defaultValue.price });
  const [sales_order_id, setOrderId] = React.useState("");
  const [comments, setComments] = React.useState("");
  const [bottling_pid, setProcessId] = React.useState("");
  const [salesProcessIdError, setSalesProcessIdError] = React.useState(false);
  const [bottlingProcessIdError, setBottlingProcessIdError] = React.useState(false);
  const [isChanged, setIsChanged] = React.useState(false);
  const [commentsError, updateCommentsError] = React.useState(false);
  const [isBottlingProcessIdAvailable, setIsBottlingProcessIdAvailable] = React.useState(false);
  const [isSalesProcessIdAvailable, setIsSalesProcessIdAvailable] = React.useState(false);
  const [priceError, updatePriceError] = React.useState({});
  const [rotationNumber, updateRotationNumber] = React.useState([]);
  const [isSaveDisabled, setIsSaveDisabled] = React.useState(false);

  React.useEffect(() => {
    const priceDetails = {
      export_price: get(props, "record.export_price", ""),
      wholesale_price: get(props, "record.wholesale_price", ""),
      duty: get(props, "record.duty", ""),
      offer_price: get(props, "record.offer_price", ""),
      uk_trade_price: get(props, "record.uk_trade_price", ""),
      retail_price_case: get(props, "record.retail_price_case", ""),
      retail_price_case_incl_vat: get(props, "record.retail_price_case_incl_vat", ""),
      retail_price_unit_incl_vat: get(props, "record.retail_price_unit_incl_vat", ""),
    };
    updatePrice(priceDetails);
  }, []);

  const handleChange = React.useCallback((name, func, value) => {
    setIsChanged(true);

    if (name === "comments" && !isBlank(value)) {
      updateCommentsError(false);
    }

    if (get(props, "actionType", ActionOptions.Quantity) === "quantity") {
      if (name === "sales_order_id") {
        setSalesProcessIdError(false);
      }

      if (name === "bottling_pid") {
        setBottlingProcessIdError(false);
      }
    }
    func(value);
  });

  const handleSave = () => {
    let responseObj = { id: get(props, "record.id") };
    let checkValueChange = isChanged;

    if (get(props, "actionType", ActionOptions.Quantity) === "quantity") {
      let inventoryObj = {
        sales_order_id,
        reason: comments,
        bottling_pid,
        rotation_numbers: rotationNumber,
      };

      if (isBottlingProcessIdAvailable && isBlank(bottling_pid)) {
        setBottlingProcessIdError(true);
        return false;
      }

      if (isSalesProcessIdAvailable && isBlank(sales_order_id)) {
        setSalesProcessIdError(true);
        return false;
      }

      if (isBlank(comments)) {
        updateCommentsError(true);
        return false;
      }

      responseObj = { ...responseObj, ...inventoryObj };
    }

    if (get(props, "actionType", ActionOptions.Quantity) === "price") {
      let inventoryObj = { ...price, reason: comments };

      if (isBlank(price["export_price"])) {
        updatePriceError({ export_price: true });
        return false;
      }

      if (isBlank(comments)) {
        updateCommentsError(true);
        return false;
      }

      responseObj = { ...responseObj, ...inventoryObj };
    }

    props.handleSubmit(responseObj, checkValueChange);
  };

  const handleClear = () => {
    updatePrice({ ...defaultValue.price });
    setComments("");
    setOrderId("");
    setProcessId("");
    setIsChanged(false);
    setSalesProcessIdError(false);
    setBottlingProcessIdError(false);
    updateCommentsError(false);
    setIsBottlingProcessIdAvailable(false);
    setIsSalesProcessIdAvailable(false);
  };

  const handleCheck = (data) => {
    if (get(data, "type") === "bottlingProcessId") {
      setIsBottlingProcessIdAvailable(get(data, "value"));
      if (!get(data, "value")) {
        setBottlingProcessIdError(false);
        setProcessId("");
      }
    }
    if (get(data, "type") === "salesProcessId") {
      setIsSalesProcessIdAvailable(get(data, "value"));
      if (!get(data, "value")) {
        setSalesProcessIdError(false);
        setOrderId("");
      }
    }
  };

  const handlePriceChange = React.useCallback(
    (key, value) => {
      let newPrice = { ...price };
      newPrice[key] = value;
      updatePriceError({ export_price: false });
      updatePrice(newPrice);
    },
    [price]
  );

  const fetchPricingParameters = async (requestOptions) => {
    const pricingParametersResponse = await props.getPricingParameters(requestOptions);
    setIsChanged(true);
    updatePrice({
      ...price,
      ...get(pricingParametersResponse, "response.data"),
    });
  };

  const handleExportPrice = React.useCallback(
    (key, value) => {
      if (key && value) {
        if (key === "export_price") {
          updatePriceError({ export_price: false });
          const options = {
            export_price: value,
            abv: get(props, "record.abv", ""),
            volume: get(props, "record.volume", ""),
            bpc: get(props, "record.bpc", ""),
          };
          const requestOptions = { ...options, ...defaultRequestKey };
          fetchPricingParameters(requestOptions);
        }
      }
    },
    [price]
  );

  return (
    <>
      <Modal
        title=""
        centered
        visible={get(props, "isOpen", false)}
        onOk={() => handleSave()}
        okButtonProps={{
          disabled: isSaveDisabled,
        }}
        closable={false}
        okText="Update"
        width={850}
        destroyOnClose={true}
        style={{ top: 10 }}
        maskClosable={false}
        onCancel={() => props.handleClose(false)}
        className="view_inventory__edit_inventory"
      >
        <div className="mt-2">
          <Row gutter={[16, 16]}>
            <Col>
              <span>
                Cased Goods ID:
                <b className="ml-1">
                  <Tag color="#108ee9">{get(props, "record.id") ? get(props, "record.id") : "NIL"}</Tag>
                </b>
              </span>
            </Col>
            <Col>
              <span>
                Year: <b> {getYearFromDate(get(props, "record.year", ""))} </b>
              </span>
            </Col>
            <Col>
              <span>
                Brand: <b> {get(props, "record.brand", "NIL")}</b>
              </span>
            </Col>
            <Col>
              <span>
                Distillery: <b> {get(props, "record.distillery", "NIL")}</b>
              </span>
            </Col>
            <Col>
              <span>
                Available Cases:
                <b className="ml-1">
                  <Tag color="#108ee9">{get(props, "record.cases") ? get(props, "record.cases") : 0}</Tag>
                </b>
              </span>
            </Col>
            <Col>
              <span>
                Allocated Cases:
                <b className="ml-1">
                  <Tag color="#108ee9">{get(props, "record.allocations") ? get(props, "record.allocations") : 0}</Tag>
                </b>
              </span>
            </Col>
            <Col>
              <span>
                Net Cases:
                <b className="ml-1">
                  <Tag color="#108ee9">{get(props, "clonedCaseRecord") ? get(props, "clonedCaseRecord") : 0}</Tag>
                </b>
              </span>
            </Col>
            <Col>
              <span>
                BPC:
                <b className="ml-1">
                  <Tag color="#108ee9">{get(props, "record.bpc", 0)}</Tag>
                </b>
              </span>
            </Col>
            <Col>
              <span>
                Bottles:
                <b className="ml-1">
                  <Tag color="#108ee9">{get(props, "record.bottles", 0)}</Tag>
                </b>
              </span>
            </Col>
          </Row>
          {get(props, "actionType", ActionOptions.Quantity) === ActionOptions.Quantity && (
            <EditQuantityInventory
              handleCheck={handleCheck}
              record={get(props, "record", 0)}
              handleChange={handleChange}
              isSalesProcessIdAvailable={isSalesProcessIdAvailable}
              salesProcessIdError={salesProcessIdError}
              sales_order_id={sales_order_id}
              setOrderId={setOrderId}
              updateSaveDisabled={(val) => setIsSaveDisabled(val)}
              updateRotationNumber={(rotationList) => {
                setIsSaveDisabled(false);
                updateRotationNumber(rotationList);
              }}
              isBottlingProcessIdAvailable={isBottlingProcessIdAvailable}
              bottlingProcessIdError={bottlingProcessIdError}
              bottling_pid={bottling_pid}
              setProcessId={setProcessId}
              comments={comments}
              setComments={setComments}
              commentsError={commentsError}
            />
          )}
          {get(props, "actionType", ActionOptions.Quantity) === ActionOptions.Price && (
            <EditPriceInventory
              loading={get(props, "pricingParametersLoading", false)}
              handlePriceChange={handlePriceChange}
              price={price}
              handleChange={handleChange}
              clonedCaseRecord={get(props, "clonedCaseRecord", 0)}
              record={get(props, "record", 0)}
              handleExportPrice={handleExportPrice}
              priceError={priceError}
              comments={comments}
              setComments={setComments}
              commentsError={commentsError}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default EditInventory;
