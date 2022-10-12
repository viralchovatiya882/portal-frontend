import { FolderAddOutlined, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { getRequestHeader } from "@helpers/service";
import { numberWithCommas } from "@helpers/utility";
import { Button, Col as AntdCol, message, Progress, Row as AntdRow, Tag, Upload } from "antd";
import axios from "axios";
import { cloneDeep, filter, get, round, toString } from "lodash";
import moment from "moment";
import React, { useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import validator from "validator";
import UploadIcon from "../../../../assets/images/upload-document.png";
import { decimalWithTwoPointsCheck } from "../../../../helpers/utility";
import { CustomInputText as InputChange, CustomInputTextArea as InputText } from "../../../UIComponents/Input/customInput";
import SalesCreateOrderTableUI from "../../../UIComponents/Table/salesCreateOrder";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";
import AddSpiritModal from "../addSpirits";
import { addSpiritMeta, chargesMeta } from "../constants";
import EditCasesModal from "../editCasesModal";
import EditableDocument from "./editableDocument";
import "./orderList.scss";

const { Dragger } = Upload;

const chargeObj = {
  item: "",
  cost_per_unit: "",
  unit: "",
  total_cost: "",
};

const totalValueObj = {
  totalCases: 0,
  totalSpiritValue: 0,
  totalAddCharges: 0,
  totalOrderValue: 0,
};

let uploadedDocList = [];

const AddSpirit = (props) => {
  const [percent, setUploadPercent] = React.useState(0);

  const [openEditQuantityModal, setOpenEditQuantityModal] = React.useState(false);
  const [selectedSpiritValue, setSelectedSpiritValue] = React.useState(null);

  const [visible, setVisible] = useState(false);
  const [chargeDetail, setChargeDetail] = useState(chargeObj);
  const [totalValues, setTotalValues] = useState(totalValueObj);
  const [index, setIndex] = useState(0);
  const [slno, setSlno] = useState(0);
  const [totalValue, setTotalValue] = useState(0.0);
  const [costPerUnitError, setCostPerUnitError] = useState(false);
  const [unitError, setUnitError] = useState(false);
  const [itemError, setItemError] = useState(false);

  const [uploadedDocumentFileList, setUploadedDocumentFileList] = React.useState([]);

  const uploadData = async (options, from) => {
    const { onSuccess, onError, file, onProgress } = options;

    const format = "YYYY/MM/DD";
    const datePath = moment(new Date()).format(format);
    const file_path = `supporting_documents/${datePath}/`;

    let uploadDocumentRequestPayload = new FormData();
    uploadDocumentRequestPayload.append("file_name", get(file, "name"));
    uploadDocumentRequestPayload.append("file_path", file_path);
    uploadDocumentRequestPayload.append("file_binary", file);

    try {
      const resp = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/uploadFile`,
        data: uploadDocumentRequestPayload,
        headers: {
          "Content-Type": "multipart/form-data",
          ...getRequestHeader(),
        },
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);
          setUploadPercent(percent);
          if (percent === 100) {
            setTimeout(() => setUploadPercent(0), 1000);
          }
          onProgress({ percent: (event.loaded / event.total) * 100 });
        },
      }).catch((err) => {
        openNotificationWithIcon("error", "Documents", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      onSuccess("OK");

      if (get(resp, "data.status", false)) {
        const requestObj = {
          document_name: get(file, "name"),
          file_name: get(file, "name"),
          document_url: get(resp, "data.file_url"),
          document_type: "document",
        };

        uploadedDocList = [...uploadedDocList, requestObj];
        setUploadedDocumentFileList(uploadedDocList);

        let newOrderSupportingDocDetails = { ...props.salesOrderState };
        newOrderSupportingDocDetails["supporting_documents"] = uploadedDocList;

        props.isDocumentUploading(false);
        props.updateState(newOrderSupportingDocDetails);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("Error: ", err);
      onError({ err });
    }
  };

  React.useEffect(() => {
    const { salesOrderState } = props;

    setUploadedDocumentFileList(get(salesOrderState, "supporting_documents", []));
    uploadedDocList = get(salesOrderState, "supporting_documents", []);

    let spiritValue, totalAdditionalCharges;
    if (salesOrderState.spiritAdded.length > 0) {
      let cases = salesOrderState.spiritAdded.reduce((prev, cur) => {
        return prev + cur.quantity;
      }, 0);

      spiritValue = salesOrderState.spiritAdded.reduce((prev, cur) => {
        return prev + parseFloat(cur.price);
      }, 0);

      let obj = {
        totalCases: cases,
        totalSpiritValue: spiritValue,
        totalAddCharges: totalValues.totalAddCharges,
        totalOrderValue: totalValues.totalAddCharges + spiritValue,
      };
      setTotalValues(obj);
    }

    if (get(salesOrderState, "additionalCharges", []).length > 0) {
      totalAdditionalCharges = salesOrderState.additionalCharges.reduce((prev, cur) => {
        return prev + parseFloat(cur.total_cost);
      }, 0);
      let obj = {
        totalCases: totalValues.totalCases,
        totalSpiritValue: totalValues.totalSpiritValue,
        totalAddCharges: totalAdditionalCharges,
        totalOrderValue: totalAdditionalCharges + totalValues.totalSpiritValue,
      };
      setTotalValues(obj);
    }
  }, [props.salesOrderState]);

  React.useEffect(() => {
    if (chargeDetail.cost_per_unit && chargeDetail.unit) {
      const total = round(chargeDetail.cost_per_unit * chargeDetail.unit, 2);
      setTotalValue(total);
    } else {
      setTotalValue(0);
    }
  }, [chargeDetail]);

  const handleChargeDetailChange = (key, value) => {
    let newProd = { ...chargeDetail };
    newProd[key] = value;
    setChargeDetail(newProd);
  };

  const getEvaluatedOutput = (arr, index, custom) => {
    let returnArr = [...arr];
    if (returnArr.length > 0 && returnArr[index]) {
      returnArr[index].quantity = get(custom, "newQuantity");
      returnArr[index].price = round(get(custom, "exportPriceInt"), 2);
      returnArr[index].total_price = round(get(custom, "totalPrice"), 2);
      returnArr[index].afterDiscount = round(get(custom, "afterDiscount"), 2);
      returnArr[index].price_after_discount = round(get(custom, "afterDiscount"), 2);
      returnArr[index].whole_case = get(custom, "whole_case", 0);
      returnArr[index].bottles_in_partial_case = round(get(custom, "bottles_in_partial_case"), 2);
    }
    return returnArr[index];
  };

  const handleChange = (key, value) => {
    if (key === "notes" || key === "special_conditions") {
      const { salesOrderState } = props;
      let newProd = { ...salesOrderState };
      newProd[key] = value;
      props.updateState(newProd);
    }

    const checkValue = value ? toString(value) : "";

    if (key === "item" && !validator.isEmpty(checkValue)) {
      setItemError(false);
    }

    if (key === "cost_per_unit" || key === "unit") {
      if (!isNaN(value)) {
        if (key === "cost_per_unit") {
          if (!validator.isEmpty(checkValue)) {
            setCostPerUnitError(false);
          }

          if (!decimalWithTwoPointsCheck(Number(checkValue))) {
            setCostPerUnitError(true);
          }
        }

        if (key === "unit") {
          if (!validator.isEmpty(checkValue) || !validator.isInt(value)) {
            setUnitError(false);
          }
          value = value ? Math.trunc(value) : value;
        }
        handleChargeDetailChange(key, value);
      }
    } else {
      handleChargeDetailChange(key, value);
    }
  };

  const handleCharges = () => {
    let { item, cost_per_unit, unit, total_cost } = chargeDetail;
    // let chargeObj = { item, cost_per_unit, unit, total_cost };

    if (validator.isEmpty(item)) {
      setItemError(true);
      return false;
    }

    if (validator.isEmpty(toString(cost_per_unit)) || isNaN(Number(cost_per_unit))) {
      setCostPerUnitError(true);
      return false;
    }

    if (!decimalWithTwoPointsCheck(Number(cost_per_unit))) {
      setCostPerUnitError(true);
      return false;
    }

    if (validator.isEmpty(unit.toString()) || isNaN(Number(unit)) || !validator.isInt(unit.toString())) {
      setUnitError(true);
      return false;
    }

    if (unit === 0) {
      setUnitError(true);
      return false;
    }

    if (item && cost_per_unit && unit) {
      let newProd = { ...props.salesOrderState };
      newProd.additionalCharges.push({
        ...chargeDetail,
        slno: slno + 1,
        total_cost: totalValue,
      });
      setSlno(slno + 1);
      props.updateState(newProd);
      setChargeDetail(chargeObj);
      setTotalValue(0);
      setIndex(index + 1);
    } else {
      message.info("No items to add");
    }
  };

  const validateBundleOrderItems = async (data) => {
    let newProd = cloneDeep({ ...props.salesOrderState });

    const rest = await axios({
      method: "POST",
      data,
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/validateBundleItems`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      message.success(get(rest, "data.message", "Successfully Changed"));
    }

    if (!get(rest, "data.status")) {
      message.error(get(rest, "data.message", "Something Went Wrong"));
    }

    let dataItems = get(rest, "data.items", []);

    if (dataItems[get(data, "edit_details.index")]) {
      dataItems[get(data, "edit_details.index")].editDiscount = false;
      dataItems[get(data, "edit_details.index")].editPrice = false;
    }

    newProd.spiritAdded = filter(dataItems, function (o) {
      return get(o, "item_tag") !== "new";
    });

    newProd.new_sales_order_items = filter(dataItems, function (o) {
      return get(o, "item_tag") === "new";
    });

    props.updateState(newProd);
  };

  const handleAction = (action, item, key_names_values) => {
    let newProd = cloneDeep({ ...props.salesOrderState });

    let addedSpirits = [...get(newProd, "spiritAdded", []), ...get(newProd, "new_sales_order_items", [])];
    const index = addedSpirits.findIndex((ele) => ele.hash === item.hash);

    if (action !== "editCasePopup") {
      switch (action) {
        case "editDiscount":
          addedSpirits[index].editDiscount = true;
          props.updateState(newProd);
          break;
        case "editPrice":
          addedSpirits[index].editPrice = true;
          props.updateState(newProd);
          break;
        case "blur":
          validateBundleOrderItems({
            items: addedSpirits,
            action: "edit",
            edit_details: {
              index,
              key_names_values,
            },
          });
          break;
        case "quantity":
          validateBundleOrderItems({
            items: addedSpirits,
            action: "edit",
            edit_details: {
              index,
              key_names_values,
            },
          });
          break;
        case "delete":
          validateBundleOrderItems({
            items: addedSpirits,
            action: "delete",
            edit_details: {
              index,
            },
          });
          break;
        default:
          break;
      }
    } else {
      setSelectedSpiritValue(item);
      setOpenEditQuantityModal(true);
    }
  };

  const handleEditQuantity = (data) => {
    if (data) {
      handleAction("quantity", get(data, "item"), [
        {
          key_name: "whole_case",
          key_value: get(data, "chargeObj.whole_case"),
        },
        {
          key_name: "bottles_in_partial_case",
          key_value: get(data, "chargeObj.bottles_in_partial_case"),
        },
      ]);
    }
  };

  const handleAddCharges = (action, item) => {
    let newProd = { ...props.salesOrderState };
    let chargesArr = get(newProd, "additionalCharges", []);
    let objIndex = chargesArr.findIndex((ele) => ele.slno === item.slno);

    if (action === "reduce") {
      if (item.unit > 0) {
        const newQuantity = parseInt(item.unit) - 1;
        const price = newQuantity * round(item.cost_per_unit, 2);

        chargesArr[objIndex].unit = round(newQuantity, 2);
        chargesArr[objIndex].total_cost = round(price, 2);
      } else {
        message.info("Unit should be greater than or equal to 0");
      }
    } else if (action === "add") {
      const newQuantity = parseInt(item.unit) + 1;
      const price = newQuantity * round(item.cost_per_unit, 2);
      chargesArr[objIndex].unit = round(newQuantity, 2);
      chargesArr[objIndex].total_cost = round(price, 2);
    } else {
      chargesArr.splice(objIndex, 1);
    }

    newProd.additionalCharges = chargesArr;
    props.updateState(newProd);
  };

  const getSize = () => {
    const data = [...get(props, "salesOrderState.spiritAdded", []), ...get(props, "salesOrderState.new_sales_order_items", [])];
    return data.length;
  };

  const getSumArrayOFObjWithKey = (arr, key) => {
    let sumValue = arr.reduce((prev, cur) => {
      if (key === "unit") {
        return prev + parseInt(cur[key]);
      } else {
        return prev + round(Number(cur[key]), 2);
      }
    }, 0);
    return sumValue;
  };

  // const calculateTotalCases = () => {
  //   const spiritAdded = [...get(props, "salesOrderState.spiritAdded", []), ...get(props, "salesOrderState.new_sales_order_items", [])];
  //   const totalWholeCases = getSumArrayOFObjWithKey(spiritAdded, "whole_case");
  //   const totalPartCases = getSumArrayOFObjWithKey(spiritAdded, "bottles_in_partial_case");
  //   return totalWholeCases + totalPartCases;
  // };

  const calculateTotalCases = () => {
    const spiritAdded = [...get(props, "salesOrderState.spiritAdded", []), ...get(props, "salesOrderState.new_sales_order_items", [])];
    const totalWholeCases = getSumArrayOFObjWithKey(spiritAdded, "quantity");
    return round(totalWholeCases, 2);
  };

  const calculateTotalSpiritValue = () => {
    const spiritAdded = [...get(props, "salesOrderState.spiritAdded", []), ...get(props, "salesOrderState.new_sales_order_items", [])];
    const totalSpiritValue = getSumArrayOFObjWithKey(spiritAdded, "price_after_discount");
    return round(totalSpiritValue, 2);
  };

  const calculateTotalAdditionalValue = () => {
    const additionalCharges = [...get(props, "salesOrderState.additionalCharges", [])];
    const totalAdditionalCharges = getSumArrayOFObjWithKey(additionalCharges, "total_cost");
    return round(totalAdditionalCharges, 2);
  };
  const calculateTotalOrderValue = () => {
    const total = calculateTotalSpiritValue();

    const additionalCharges = [...get(props, "salesOrderState.additionalCharges", [])];
    const totalAdditionalCharges = getSumArrayOFObjWithKey(additionalCharges, "total_cost");
    return round(totalAdditionalCharges + round(total, 2), 2);
  };

  const getCustomDataWrapper = React.useCallback(() => {
    let responseData = [...get(props, "salesOrderState.spiritAdded", []), ...get(props, "salesOrderState.new_sales_order_items", [])];
    let rowData = [];

    if (responseData && responseData.length > 0) {
      rowData = responseData.map((data, index) => {
        const rowObj = {
          key: index + 1,
          sl_no: index + 1,
          ...data,
        };
        return rowObj;
      });
    }

    return rowData;
  }, [props]);

  const getCount = React.useCallback(() => {
    let responseData = [...get(props, "salesOrderState.spiritAdded", []), ...get(props, "salesOrderState.new_sales_order_items", [])];
    const freeItems = filter(responseData, function (o) {
      return get(o, "free_item", "").toLowerCase() === "yes";
    });
    return { totalCount: responseData.length, freeItemsCount: freeItems.length };
  }, [props]);

  const getCostPerUnitErrorValidationText = () => {
    let { cost_per_unit } = chargeDetail;

    if (costPerUnitError) {
      if (isNaN(cost_per_unit)) {
        return "Cost per unit should be Numeric";
      }
      if (cost_per_unit) {
        return "Invalid Number, accepts only upto two decimals";
      }
      return "Cost per unit cannot be empty";
    }
  };

  const getUnitErrorValidationText = () => {
    let { unit } = chargeDetail;

    if (unitError) {
      if (isNaN(unit)) {
        return "Unit should be Numeric";
      }
      if (unit) {
        return "Invalid Unit, decimals not accepted";
      }
      if (unit === 0) {
        return "Unit Should be greater than 0";
      }
      return "Unit cannot be empty";
    }
  };

  const documentProps = {
    multiple: true,
    listType: "picture",
    showUploadList: false,
    customRequest(options) {
      uploadData(options, "document");
    },
    onChange(info) {
      // eslint-disable-next-line no-console
      console.log("Files List", info.fileList);
    },
    onDrop(e) {
      // eslint-disable-next-line no-console
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const getCustomAdditionalDataWrapper = React.useCallback(() => {
    let responseData = [...get(props, "salesOrderState.additionalCharges", [])];
    let rowData = [];

    if (responseData && responseData.length > 0) {
      responseData.map((data, index) => {
        const rowObj = {
          key: data.id,
          sl_no: index + 1,
          ...data,
        };
        rowData.push(rowObj);
      });
    }

    return rowData;
  }, [props]);

  return (
    <div className="sales-order-list">
      <EditCasesModal
        isOpen={openEditQuantityModal}
        selectedSpiritValue={selectedSpiritValue}
        closeModal={() => {
          setOpenEditQuantityModal(false);
          setSelectedSpiritValue(null);
        }}
        handleAddEditQuantity={handleEditQuantity}
      />
      <AddSpiritModal visible={visible} setVisible={setVisible} salesOrderState={props.salesOrderState} updateState={props.updateState} />
      <div className="common_card_section">
        <div className="d-flex justify-content-between align-items-center">
          <Button className="add-spirit-button" icon={<PlusOutlined />} type="primary" onClick={() => setVisible(true)}>
            Add Spirits
          </Button>
          <b>
            Total Items: <Tag color="processing">{getCount().totalCount} </Tag> FOC Items: <Tag color="processing"> {getCount().freeItemsCount} </Tag>
          </b>
        </div>
        {getSize() === 0 && (
          <div className="info-text mt-2">
            <center>
              <span style={{ color: "#1890ff" }}>
                <InfoCircleOutlined className="pr-2" /> Click on Add Spirits to start building the order.
              </span>
            </center>
          </div>
        )}
        {getSize() > 0 && (
          <div className="mt-3">
            <SalesCreateOrderTableUI data={getCustomDataWrapper()} metaInfo={addSpiritMeta} tableFor="spiritAdded" handleAction={handleAction} />
          </div>
        )}
      </div>
      <div className="common_card_section">
        <div className="additional-charges">
          <h6>Additional Charges</h6>
          <Row className="mt-4">
            <Col xs={12} sm={12} md={12} lg={5}>
              <Row>
                <Col xs={12} sm={6} md={6} lg={6}>
                  <InputChange
                    required
                    validateStatus={itemError && "error"}
                    helpText={itemError && "Item cannot be empty"}
                    handleChange={handleChange}
                    value={chargeDetail.item}
                    type="item"
                    className="mt-0 mb-0"
                    label="Item"
                  />
                </Col>
                <Col xs={12} sm={6} md={6} lg={6}>
                  <InputChange
                    handleChange={handleChange}
                    value={chargeDetail.cost_per_unit}
                    type="cost_per_unit"
                    className="mt-0 mb-0"
                    required
                    validateStatus={costPerUnitError && "error"}
                    helpText={getCostPerUnitErrorValidationText()}
                    label="Cost Per Unit"
                    prefix={<span>&#163; </span>}
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={12} sm={12} md={12} lg={7}>
              <Row>
                <Col xs={12} sm={6} md={6} lg={5}>
                  <InputChange
                    validateStatus={unitError && "error"}
                    helpText={getUnitErrorValidationText()}
                    handleChange={handleChange}
                    value={chargeDetail.unit}
                    type="unit"
                    required
                    className="mt-0 mb-0"
                    label="Units"
                  />
                </Col>
                <Col>
                  <div className="add-total-cost">
                    <label>Total Cost</label>
                    <div className="total-cost">
                      <p>
                        <span>&#163; </span>
                        {round(totalValue, 2)}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col className="add-charges-button">
                  <Button type="primary" onClick={handleCharges} icon={<PlusOutlined />}>
                    Add
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <div className="additional-table">
          {get(props.salesOrderState, "additionalCharges", []).length > 0 && (
            <SalesCreateOrderTableUI index={index} data={getCustomAdditionalDataWrapper()} metaInfo={chargesMeta} tableFor="additionalCharges" handleAddCharges={handleAddCharges} />
          )}
        </div>
      </div>

      <AntdRow>
        <AntdCol xs={{ span: 24 }} sm={{ span: 14 }}>
          <div className="common_card_section" style={{ minHeight: "97%" }}>
            <div className="sales_order__documents_upload mt-0">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={UploadIcon} alt="upload document" style={{ width: "24px", height: "24px" }} />
                <span style={{ fontWeight: 600, fontSize: 15, marginLeft: "10px" }}>UPLOAD DOCUMENTS / IMAGES</span>
              </div>
              <div className={`w-100 mt-3 upload-document-box ${!uploadedDocumentFileList.length > 0 && "doc_not_uploaded"}`}>
                <Dragger {...documentProps} className="mt-4">
                  <p className="ant-upload-drag-icon">
                    <FolderAddOutlined />
                  </p>
                  <p className="ant-upload-text">Drag and drop or Browse your documents</p>
                  <p className="ant-upload-text"> or photos to start uploading </p>
                </Dragger>
                {uploadedDocumentFileList.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    {percent > 0 ? <Progress size="small" className="mb-2" percent={percent} /> : null}
                    <EditableDocument
                      dataSource={uploadedDocumentFileList}
                      handleDocuments={(doc) => {
                        uploadedDocList = doc;
                        setUploadedDocumentFileList(doc);
                        let newOrderSupportingDocDetails = { ...props.salesOrderState };
                        newOrderSupportingDocDetails["supporting_documents"] = uploadedDocList;
                        props.isDocumentUploading(false);
                        props.updateState(newOrderSupportingDocDetails);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </AntdCol>
        <AntdCol xs={{ span: 24 }} sm={{ span: 10 }} style={{ paddingLeft: "15px" }}>
          <div className="common_card_section" style={{ minHeight: "97%" }}>
            <div className="final-detail">
              <label>Total Cases</label>
              <div className="total-cost">
                <p>{calculateTotalCases()}</p>
              </div>
            </div>
            <div className="final-detail">
              <label>Total Spirit Value</label>
              <div className="total-cost">
                <p>
                  <span>&#163; </span>
                  {numberWithCommas(calculateTotalSpiritValue())}
                </p>
              </div>
            </div>
            <div className="final-detail">
              <label>Total Additional Charges</label>
              <div className="total-cost">
                <p>
                  <span>&#163; </span>
                  {numberWithCommas(calculateTotalAdditionalValue())}
                </p>
              </div>
            </div>
            <div className="final-detail">
              <label>Total Order Value</label>
              <div className="total-cost">
                <p>
                  <span>&#163; </span>
                  {numberWithCommas(calculateTotalOrderValue())}
                </p>
              </div>
            </div>
          </div>
        </AntdCol>
      </AntdRow>
      <div className="common_card_section">
        <AntdRow>
          <AntdCol span={24} className="text-area-sales">
            <InputText
              handleChange={handleChange}
              value={get(props, "salesOrderState.special_conditions", "")}
              type="special_conditions"
              note="(Will be printed on Confirmation of Sale document)"
              className="mt-0 mb-0"
              label="Special Conditions"
            />
          </AntdCol>
        </AntdRow>
        <AntdRow>
          <AntdCol span={24} className="text-area-sales">
            <InputText handleChange={handleChange} note="(for internal team visibility)" value={get(props, "salesOrderState.notes", "")} type="notes" className="mt-0 mb-0" label="Notes" />
          </AntdCol>
        </AntdRow>
      </div>
    </div>
  );
};
export default AddSpirit;
