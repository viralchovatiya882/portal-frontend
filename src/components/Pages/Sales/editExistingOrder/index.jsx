import { InfoCircleOutlined } from "@ant-design/icons";
import { getRequestHeader } from "@helpers/service";
import { isBlank } from "@helpers/utility";
import { Checkbox, message, Modal, Spin, Tag } from "antd";
import axios from "axios";
import { cloneDeep, get, has, round, toString } from "lodash";
import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { connect } from "react-redux";
import validator from "validator";
import { MasterDataKeyPair } from "../../../../constants";
import { capitalizeAllLetter, decimalWithTwoPointsCheck, getKeyValuePair } from "../../../../helpers/utility";
import { defaultRequestOptions } from "../../../../settings";
import { getCasedGoodsData, getCasedGoodsDataForOrderDetails } from "../../../../store/SalesOrder/sale.actions";
import { getTaxonomyData, updateAllTaxonomyData } from "../../../../store/Taxonomy/taxonomy.actions";
import { CustomInputNumber as InputNumberChange, CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";
import { SingleSelect as Select } from "../../../UIComponents/Select/singleSelect";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";

const defaultValue = {
  cased_goods_id: "",
  brand: "",
  distillery: "",
  quantity: "",
  whole_case: "",
  discount: "",
  abv: "",
  volume: "",
  bpc: "",
  age: "",
  year: "",
  case_price: "",
  rotation_number: "",
  bottles_in_partial_case: "",
  custom_label_text: "",
  evaluated_bottles_in_partial_case: "",
};

const EditExistingOrderModal = (props) => {
  const { visible, setVisible, loading } = props;
  const [newCase, updateCase] = React.useState({ ...defaultValue });
  const [error, updateError] = React.useState({});
  const [partCaseOptionsList, setPartCaseOptionsList] = React.useState([]);
  const [spiritsLoader, setSpiritsLoader] = React.useState(false);
  const [isChanged, setIsChanged] = React.useState(false);

  const checkValue = (value, key) => {
    if (key === "export_price" && !get(props, "record.cased_goods_id", true)) {
      return "NA";
    }
    return value ? value : "NA";
  };

  const handlePartCaseOptions = (value) => {
    const BPC = value || get(props, "record.bpc");
    if (BPC) {
      let partCaseOptions = [];
      for (let i = 1; i < BPC; i++) {
        partCaseOptions.push({
          label: `${i} / ${BPC}`,
          value: `${i}/${BPC}`,
        });
      }
      if (partCaseOptions.length === 0) {
        partCaseOptions = [{ label: 0, value: 0 }];
        setPartCaseOptionsList([...partCaseOptions]);
      } else {
        setPartCaseOptionsList([...partCaseOptions]);
      }
    }
  };

  const handleKeyChangeUpdate = (key, value) => {
    const newProds = { ...newCase };

    if (key === "bpc") {
      newProds["bottles_in_partial_case"] = "";
      newProds["evaluated_bottles_in_partial_case"] = "";
      newProds["quantity"] = "";
    }

    if (key === "bottles_in_partial_case") {
      const partCaseValue = value.split("/");
      let BPC = Number(get(props, "record.bpc"));
      if (!get(props, "record.cased_goods_id")) {
        BPC = get(newCase, "bpc");
      }
      const evaluated_bottles_in_partial_case = round(Number(partCaseValue[0]) / Number(BPC), 2);
      newProds["evaluated_bottles_in_partial_case"] = evaluated_bottles_in_partial_case;
      newProds["quantity"] = Number(get(newProds, "whole_case", 0)) + evaluated_bottles_in_partial_case;
    }

    if (key === "whole_case") {
      newProds["quantity"] = Number(get(newProds, "evaluated_bottles_in_partial_case", 0)) + Number(value);
    }

    newProds[key] = value;
    updateCase(newProds);
  };

  const handleChange = React.useCallback(
    (key, value) => {
      setIsChanged(true);
      if (key === "brand" && !isBlank(value)) {
        let newError = { ...error };
        newError["brand"] = "";
        updateError(newError);
      }
      if (key === "bpc") {
        let newError = { ...error };
        newError["bpc"] = "";
        updateError(newError);
        value = value || value === 0 ? Math.trunc(Number(value)) : "";
        handlePartCaseOptions(Number(value));
      }

      if (key === "age" || key === "year") {
        value = value || value === 0 ? Math.trunc(Number(value)) : "";
      }

      if (key === "case_price") {
        getCasePriceCheck(Number(value));
      }

      if (key === "whole_case" || key === "bottles_in_partial_case") {
        getError("whole_case");
        if (key === "whole_case") {
          value = value || value === 0 ? Math.trunc(Number(value)) : "";
        }

        let totalCaseOrderValue = Number(get(newCase, "evaluated_bottles_in_partial_case", 0)) + parseInt(value);

        if (key === "bottles_in_partial_case") {
          let BPC = Number(get(props, "record.bpc"));
          if (!get(props, "record.cased_goods_id")) {
            BPC = get(newCase, "bpc");
          }
          const partCaseValue = value.split("/");
          const evaluated_bottles_in_partial_case = round(Number(partCaseValue[0]) / BPC, 2);
          totalCaseOrderValue = Number(evaluated_bottles_in_partial_case) + parseInt(get(newCase, "whole_case", 0));
        }
        if (get(props, "record.cased_goods_id")) {
          if ((Number(get(props, "record.net_cases", 0)) < 0 && Number(totalCaseOrderValue) >= 0) || Number(totalCaseOrderValue) > get(props, "record.net_cases", 0)) {
            getError("whole_case", true, "Ordered Cases is more than Net Available Cases");
          } else {
            getError("whole_case", false);
          }
        }
      }

      if (key === "discount") {
        if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) {
          getError(key, true, "Invalid Discount");
        } else if (!decimalWithTwoPointsCheck(Number(value))) {
          getError(key, true, "Invalid Discount, accepts only two decimal points");
        } else {
          getError(key, false);
        }
      }

      handleKeyChangeUpdate(key, value);
    },
    [newCase]
  );

  const getError = (type, isTrue = false, errorMsg = "") => {
    if (type === "whole_case") {
      if (isTrue) {
        const tempErrorObj = cloneDeep(error);
        tempErrorObj["whole_case"] = true;
        tempErrorObj["wholeCaseErr"] = errorMsg;
        updateError(tempErrorObj);
      } else {
        const tempErrorObj = cloneDeep(error);
        tempErrorObj["whole_case"] = false;
        tempErrorObj["wholeCaseErr"] = "";
        updateError(tempErrorObj);
      }
    }

    if (type === "discount") {
      if (isTrue) {
        const tempErrorObj = cloneDeep(error);
        tempErrorObj["discount"] = true;
        tempErrorObj["discountErr"] = errorMsg;
        updateError(tempErrorObj);
      } else {
        const tempErrorObj = cloneDeep(error);
        tempErrorObj["discount"] = false;
        tempErrorObj["discountErr"] = "";
        updateError(tempErrorObj);
      }
    }
  };

  const setDefault = () => {
    updateCase({ ...defaultValue });
    updateError({});
  };

  const getCasesSum = () => {
    return round(Number(get(newCase, "whole_case", 0)) + Number(get(newCase, "evaluated_bottles_in_partial_case", 0)), 2);
  };

  const getBottlesSum = () => {
    const bottles_in_partial_case = get(newCase, "bottles_in_partial_case", ["0/0"]).split("/")[0];
    return round(Number(get(newCase, "bpc", 0)) * Number(get(newCase, "whole_case", 0)), 2) + Number(bottles_in_partial_case);
  };

  const getPriceDetails = () => {
    const bottles_in_partial_case = get(newCase, "bottles_in_partial_case", ["0/0"]).split("/")[0];
    const casePrice = Number(get(newCase, "case_price", 0));
    const availableDiscount = Number(get(newCase, "discount", 0));
    const exportPrice = parseFloat(casePrice ? casePrice : 0);
    const quantity = Number(get(newCase, "quantity", 0)) ? get(newCase, "quantity", 0) : 0;
    const discount = Number(availableDiscount ? availableDiscount : 0);
    const price = round(quantity * exportPrice, 2);

    let totalPrice = (Number(get(newCase, "bpc")) * Number(get(newCase, "whole_case")) + Number(bottles_in_partial_case)) * exportPrice;
    totalPrice = round(totalPrice / Number(get(newCase, "bpc")), 2);
    const afterDiscount = round(totalPrice - (totalPrice * discount) / 100, 2);

    return { price, totalPrice, exportPrice, discount, quantity, afterDiscount };
  };

  const setInfo = () => {
    if (isBlank(get(newCase, "brand"))) {
      let newError = { ...error };
      newError["brand"] = "Brand cannot be empty";
      updateError(newError);
      return false;
    }

    if (!get(newCase, "bpc")) {
      let newError = { ...error };
      newError["bpc"] = "BPC should be greater than 0";
      updateError(newError);
      return false;
    }

    if (!get(newCase, "free_item", true)) {
      if (!getCasePriceCheck(get(newCase, "case_price"))) {
        return false;
      }
    }

    if (validator.isEmpty(get(newCase, "whole_case", 0).toString())) {
      getError("whole_case", true, "Whole Case cannot be empty");
      return false;
    }

    if (!get(newCase, "whole_case") && Number(get(newCase, "whole_case")) !== 0) {
      getError("whole_case", true, "Whole Case cannot be empty");
      return false;
    }

    if (getBottlesSum() <= 0) {
      message.info("Total bottles should be greater than 0");
      return false;
    }

    if (has(newCase, "discount")) {
      const value = get(newCase, "discount");
      if (!decimalWithTwoPointsCheck(Number(value))) {
        getError("discount", true, "Invalid Discount, accepts only two decimal points");
      }
    }

    const priceDetails = getPriceDetails();
    const bottles_in_partial_case = Number(get(newCase, "bottles_in_partial_case", ["0/0"]).split("/")[0]);

    const data = {
      quantity: get(priceDetails, "quantity", 0),
      item_id: get(props, "record.item_id", ""),
      sales_order_id: get(props, "sales_order_id"),
      brand: get(newCase, "brand"),
      distillery: get(newCase, "distillery"),
      age: get(newCase, "age"),
      volume: get(newCase, "volume"),
      year: get(newCase, "year"),
      abv: get(newCase, "abv"),
      bpc: get(newCase, "bpc"),
      free_item: get(newCase, "free_item", false) ? "yes" : "no",
      whole_case: get(newCase, "whole_case"),
      bottles_in_partial_case,
      price: get(priceDetails, "price", 0),
      price_per_case: get(priceDetails, "exportPrice", 0),
      discount: get(priceDetails, "discount", 0),
      price_after_discount: round(get(priceDetails, "afterDiscount", 0), 2),
      cask: get(newCase, "cask", ""),
      custom_label_text: get(newCase, "custom_label_text", ""),
    };

    setSpiritsLoader(true);
    handleSubmit(data);
  };

  const handleSubmit = async (data) => {
    if (isChanged) {
      const rest = await axios({
        method: "POST",
        data,
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_spirit`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        setSpiritsLoader(false);
        openNotificationWithIcon("error", "Order Details", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        setSpiritsLoader(false);
        setVisible(false);
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", "Order Details", get(rest, "data.message", "Order Details updated successfully"));
      }

      if (!get(rest, "data.status", true)) {
        setSpiritsLoader(false);
        openNotificationWithIcon("error", "Order Details", get(rest, "data.message", "Something Went Wrong"));
      }
    } else {
      openNotificationWithIcon("info", "Order Details", "Nothing to update");
      setSpiritsLoader(false);
    }
  };

  const getCasePriceCheck = (value) => {
    let tempErrorObj = cloneDeep(error);
    tempErrorObj["case_price"] = "";

    if (validator.isEmpty(toString(value))) {
      tempErrorObj["case_price"] = "Case Price cannot be empty";
    }

    if (!validator.isEmpty(toString(value)) && Number(value) === 0) {
      tempErrorObj["case_price"] = "Case Price should be greater than 0";
    }

    if (isNaN(value)) {
      tempErrorObj["case_price"] = "Invalid Case Price";
    } else if (!decimalWithTwoPointsCheck(Number(value))) {
      tempErrorObj["case_price"] = "Invalid Number, accepts only upto two decimals";
    }

    if (get(props, "record.cased_goods_id")) {
      if (value && Number(value) < get(props, "record.export_price", 0)) {
        tempErrorObj["case_price"] = "Case Price is less than Export price";
      }
    }

    updateError(tempErrorObj);

    if (get(tempErrorObj, "case_price")) {
      return false;
    } else {
      return true;
    }
  };

  React.useEffect(() => {
    if (get(props, "record", {})) {
      const newProd = { ...newCase };
      Object.keys(get(props, "record", {})).map((list) => {
        if (list === "bottles_in_partial_case") {
          newProd[list] = get(props, `record.${list}`) > 0 ? `${get(props, `record.${list}`)}/${get(props, "record.bpc")}` : "";
          newProd["evaluated_bottles_in_partial_case"] = get(props, `record.${list}`) > 0 ? get(props, `record.${list}`, 0) / get(props, "record.bpc", 0) : 0;
        } else {
          newProd[list] = get(props, `record.${list}`);
        }
      });
      newProd["case_price"] = get(props, "record.price_per_case", 0);
      newProd["free_item"] = get(props, "record.free_item", "").toLowerCase() === "yes" ? true : false;
      handlePartCaseOptions();
      updateCase(newProd);
    }
  }, [props.record]);

  const fetchTaxonomyData = async (masterKey = "product_distillery", orderby_field, orderby_value) => {
    let requestOptions = cloneDeep(defaultRequestOptions);
    requestOptions[MasterDataKeyPair.MasterDataKey] = masterKey;
    requestOptions["orderby_field"] = orderby_field;
    requestOptions["orderby_value"] = orderby_value;
    requestOptions["status_filter"] = "all";

    const taxonomyData = await props.getTaxonomyData(requestOptions);

    if (get(taxonomyData, "error", false)) {
      openNotificationWithIcon("error", `${capitalizeAllLetter(masterKey.replace(/_/g, " "))}`, `${get(taxonomyData, "error.message", "Something Went Wrong")} `);
    }
    const currentDataObj = { [masterKey]: { ...get(taxonomyData, "response"), requestPayload: requestOptions } };
    props.updateAllTaxonomyData(currentDataObj);
  };

  const getDisabledCheck = () => {
    return get(props, "record.cased_goods_id");
  };

  return (
    <Modal
      title={
        <div className="edit-order-title-text">
          Edit Order
          <span className="d-flex align-items-center float-right mr-sm-5">
            <InfoCircleOutlined /> <b className="pl-2"> All Prices are in GBP </b>
          </span>
        </div>
      }
      centered
      className="inventory__add_cases"
      style={{ top: 10 }}
      visible={visible}
      onOk={() => setInfo(false)}
      onCancel={() => setVisible(false)}
      width={900}
      okText="Update"
      maskClosable={false}
      destroyOnClose={true}
      afterClose={() => setDefault()}
    >
      <Spin spinning={spiritsLoader}>
        <div className="add-spirit-modal">
          <Row>
            <Col md={4} sm={4} xs={12}>
              <InputChange
                handleChange={handleChange}
                value={get(newCase, "cased_goods_id", "")}
                type="cased_goods_id"
                className="mt-0 mb-0 w-100"
                disabled
                validateStatus={get(error, "cased_goods_id") && "error"}
                helpText={get(error, "cased_goods_id") ? get(error, "cased_goods_id") : ""}
                label="Cased Goods Id"
              />
            </Col>
            <Col md={4} sm={4} xs={12}>
              <Select
                style={{ width: "90%" }}
                handleChange={(key, value) => handleChange(key, value)}
                value={get(newCase, "brand", "")}
                type="brand"
                required
                disabled={getDisabledCheck()}
                label="Brand Name"
                onDropdownVisibleChange={() => {
                  if (get(props, "masterAllData.brand.data", []).length === 0 || get(props, "masterAllData.brand.requestPayload.orderby_value", "") !== "ASC") {
                    fetchTaxonomyData("brand", "brand_name", "ASC");
                  }
                }}
                placeholder="Search to Select"
                loading={get(props, "isTaxonomyDataLoading", false)}
                validateStatus={get(error, "brand") && "error"}
                helpText={get(error, "brand") && "Brand cannot be empty"}
                options={getKeyValuePair(get(props, "masterAllData.brand.data", []), "brand_name", false)}
                className="mt-0 mb-0"
              />
            </Col>
            <Col md={4} sm={4} xs={12}>
              <Select
                type="distillery"
                label="Product/Distillery"
                style={{ width: "90%" }}
                handleChange={handleChange}
                disabled={getDisabledCheck()}
                value={get(newCase, "distillery", "")}
                placeholder="Search to Select"
                onDropdownVisibleChange={() => {
                  if (get(props, "masterAllData.product_distillery.data", []).length === 0 || get(props, "masterAllData.product_distillery.requestPayload.orderby_value", "") !== "ASC") {
                    fetchTaxonomyData("product_distillery", "distillery_name", "ASC");
                  }
                }}
                className="mt-0 mb-0"
                loading={get(props, "isTaxonomyDataLoading", false)}
                validateStatus={get(error, "product_distillery") && "error"}
                helpText={get(error, "product_distillery") && "Distilleries cannot be empty"}
                options={getKeyValuePair(get(props, "masterAllData.product_distillery.data", []), "distillery_name", false)}
              />
            </Col>
            <Col md={4} sm={4} xs={12}>
              <InputNumberChange
                handleChange={handleChange}
                value={get(newCase, "year", "")}
                type="year"
                disabled={getDisabledCheck()}
                className="mt-0 mb-0 w-100"
                validateStatus={get(error, "year") && "error"}
                helpText={get(error, "year") ? get(error, "year") : ""}
                label="Year"
              />
            </Col>
            <Col md={4} sm={4} xs={12}>
              <InputNumberChange
                handleChange={handleChange}
                value={get(newCase, "age", "")}
                type="age"
                disabled={getDisabledCheck()}
                className="mt-0 mb-0 w-100"
                validateStatus={get(error, "age") && "error"}
                helpText={get(error, "age") ? get(error, "age") : ""}
                label="Age"
              />
            </Col>
            <Col md={4} sm={4} xs={12}>
              <InputNumberChange
                handleChange={handleChange}
                value={get(newCase, "bpc", "")}
                type="bpc"
                required
                disabled={getDisabledCheck()}
                className="mt-0 mb-0 w-100"
                validateStatus={get(error, "bpc") && "error"}
                helpText={get(error, "bpc") ? get(error, "bpc") : ""}
                label="BPC"
              />
            </Col>
            <Col md={4} sm={4} xs={12}>
              <InputNumberChange
                handleChange={handleChange}
                value={get(newCase, "volume", "")}
                type="volume"
                disabled={getDisabledCheck()}
                className="mt-0 mb-0 w-100"
                validateStatus={get(error, "volume") && "error"}
                helpText={get(error, "volume") ? get(error, "volume") : ""}
                label="Volume (ltr)"
              />
            </Col>
            <Col md={4} sm={4} xs={12}>
              <InputChange
                handleChange={handleChange}
                value={get(newCase, "cask", "")}
                type="cask"
                disabled={getDisabledCheck()}
                className="mt-0 mb-0 w-100"
                validateStatus={get(error, "cask") && "error"}
                helpText={get(error, "cask") ? get(error, "cask") : ""}
                label="Cask"
              />
            </Col>
            <Col md={4} sm={4} xs={12}>
              <InputNumberChange
                handleChange={handleChange}
                value={get(newCase, "abv", "")}
                type="abv"
                disabled={getDisabledCheck()}
                className="mt-0 mb-0 w-100"
                validateStatus={get(error, "abv") && "error"}
                helpText={get(error, "abv") ? get(error, "abv") : ""}
                label="ABV"
              />
            </Col>
            <Col md={5} sm={5} xs={12}>
              <InputChange
                handleChange={handleChange}
                value={get(newCase, "custom_label_text", "")}
                type="custom_label_text"
                disabled={getDisabledCheck()}
                className="mt-0 mb-0 w-100"
                validateStatus={get(error, "custom_label_text") && "error"}
                helpText={get(error, "custom_label_text") ? get(error, "custom_label_text") : ""}
                label="Custom Label Text"
              />
            </Col>
          </Row>

          <Row>
            <Col md={5} sm={5} xs={12}>
              {get(props, "isFOCEditable", true) && (
                <Col md={{ span: 12 }} className="p-0">
                  <Checkbox checked={get(newCase, "free_item", false)} onChange={(e) => handleChange("free_item", e.target.checked)}>
                    <b>Add this as a Free of Charge (FOC) item</b>
                  </Checkbox>
                </Col>
              )}
              <div className="spirit-detail">
                <Row>
                  <Col xs={12} sm={12}>
                    <div className="detail-column1">
                      <div className="detail-item1">
                        <label>Available Cases</label>
                        <span>{checkValue(get(props, "record.cases", 0))}</span>
                      </div>
                      <div className="detail-item1">
                        <label>Pending Orders</label>
                        <span>{checkValue(get(props, "record.allocations", 0))}</span>
                      </div>
                      <div className="detail-item1">
                        <label>Net Available Cases</label>
                        <span>{checkValue(get(props, "record.net_cases", 0))}</span>
                      </div>
                      <div className="detail-item1">
                        <label>Export Price</label>
                        <span>
                          {get(props, "record.cased_goods_id", false) && "£ "}
                          {checkValue(get(props, "record.export_price", 0), "export_price")}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={7} sm={7} xs={12}>
              <Row>
                <Col md={6} sm={6} xs={12}>
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "whole_case", "")}
                    type="whole_case"
                    required
                    className="mt-0 mb-0 w-100"
                    validateStatus={get(error, "whole_case") && "error"}
                    helpText={get(error, "whole_case") ? get(error, "wholeCaseErr") : ""}
                    label="Whole Cases"
                  />
                </Col>

                <Col md={6} sm={6} xs={12}>
                  <Select
                    handleChange={(key, value) => handleChange(key, value)}
                    type="bottles_in_partial_case"
                    label="Part Case"
                    placeholder="Part Case"
                    value={get(newCase, "bottles_in_partial_case", 0)}
                    helpText={get(error, "bottles_in_partial_case") ? get(error, "bottlesInPartialCaseErr") : ""}
                    options={partCaseOptionsList}
                    disabled={get(newCase, "bpc") < 2}
                    validateStatus={get(error, "bottles_in_partial_case") && "error"}
                    className="mb-0 part-case-field"
                  />
                </Col>
                {!get(newCase, "free_item", true) && (
                  <>
                    <Col md={6} sm={6} xs={12}>
                      <InputNumberChange
                        handleChange={handleChange}
                        value={get(newCase, "case_price", "")}
                        type="case_price"
                        required
                        className="mt-0 mb-0 w-100"
                        validateStatus={get(error, "case_price") && "error"}
                        helpText={get(error, "case_price") ? get(error, "case_price") : ""}
                        label="Case Price ( &#163; )"
                      />
                    </Col>
                    <Col md={6} sm={6} xs={12}>
                      <InputNumberChange
                        handleChange={handleChange}
                        value={get(newCase, "discount", "")}
                        type="discount"
                        className="mt-0 mb-0 w-100"
                        validateStatus={get(error, "discount") && "error"}
                        helpText={get(error, "discount") ? get(error, "discountErr") : ""}
                        label="Discount ( % )"
                      />
                    </Col>
                  </>
                )}
              </Row>
            </Col>
            <Col md={{ span: 7, offset: 5 }} style={get(newCase, "free_item", false) ? { marginTop: "-10%" } : {}}>
              <Row>
                <Col md={5} sm={5} xs={6} className="mb-2">
                  <b className="pr-1"> Total Cases:</b>
                  <Tag color="blue">{getCasesSum()}</Tag>
                </Col>
                <Col md={7} sm={7} xs={6} className="mb-2">
                  <b className="pr-1">Total Price:</b>
                  <Tag color="blue">{getPriceDetails().totalPrice}</Tag>
                </Col>
                <Col md={5} sm={5} xs={6} className="mb-2">
                  <b className="pr-1"> Total Bottles:</b>
                  <Tag color="blue"> {getBottlesSum()} </Tag>
                </Col>
                <Col md={7} sm={7} xs={6} className="mb-2">
                  <b className="pr-1"> Price After Discount:</b>
                  <Tag color="blue"> {getPriceDetails().afterDiscount} </Tag>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Spin>
    </Modal>
  );
};
export default connect(
  (state) => ({
    taxonomyError: get(state, "taxonomy.error", false),
    isTaxonomyDataLoading: get(state, "taxonomy.loading", false),
    masterAllData: get(state, "taxonomy.masterAllData", []),
    casedGoodsError: get(state, "salesOrder.error", false),
    loading: get(state, "salesOrder.loading", false),
    casedGoods: get(state, "salesOrder.casedGoods", []),
  }),
  { getTaxonomyData, updateAllTaxonomyData, getCasedGoodsDataForOrderDetails, getCasedGoodsData }
)(EditExistingOrderModal);
