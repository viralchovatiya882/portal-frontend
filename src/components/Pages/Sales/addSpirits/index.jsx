import { getRequestHeader } from "@helpers/service";
import { isBlank, numberWithCommas } from "@helpers/utility";
import { Button, Card, Checkbox, Col, message, Modal, Row, Spin, Table, Tabs, Tag } from "antd";
import axios from "axios";
import { cloneDeep, find, get, has, round, toString } from "lodash";
import { default as React, useEffect } from "react";
import { connect } from "react-redux";
import validator from "validator";
import { MasterDataKeyPair } from "../../../../constants";
import { capitalizeAllLetter, decimalWithTwoPointsCheck, getKeyValuePair } from "../../../../helpers/utility";
import { defaultRequestOptions } from "../../../../settings";
import { getCasedGoodsData } from "../../../../store/SalesOrder/sale.actions";
import { getTaxonomyData, updateAllTaxonomyData } from "../../../../store/Taxonomy/taxonomy.actions";
import { CustomInputNumber as InputNumberChange, CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";
import { SingleSelect as Select } from "../../../UIComponents/Select/singleSelect";
import TableUI from "../../../UIComponents/Table";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";
import { getDynamicDataWrapper } from "../getData";
import { getBundledDataColumns, getCountByKey } from "../helper";
import { getDetailedColumnData } from "../orderDetails/getOrderItemsColumns";
import "./index.scss";
const defaultValue = {
  brand: "",
  distillery: "",
  quantity: "",
  whole_case: "",
  discount: "",
  case_price: "",
  rotation_number: "",
  bottles_in_partial_case: "",
  custom_label_text: "",
  evaluated_bottles_in_partial_case: "",
  free_item: false,
};

const { TabPane } = Tabs;

const AddSpiritModal = (props) => {
  const { visible, setVisible, loading } = props;
  const [expectedData, setExpectedData] = React.useState([]);
  const [metaInfo, setMetaInfo] = React.useState([]);
  const [bundledMetaInfo, setBundledMetaInfo] = React.useState([]);
  const [selectedRow, setSelectedRow] = React.useState({});
  const [newCase, updateCase] = React.useState({ ...defaultValue });
  const [casedGoodItem, updateCasedGoodItem] = React.useState("existing");
  const [currentTab, updateCurrentTab] = React.useState("spirit");
  const [error, updateError] = React.useState({});
  const [enabled, updateEnabled] = React.useState({});
  const [partCaseOptionsList, setPartCaseOptionsList] = React.useState([]);
  const [bundleList, setBundleList] = React.useState([]);
  const [selectedBundle, setSelectedBundle] = React.useState("");
  const [bundleListLoading, setBundleListLoading] = React.useState(true);
  const [noOfBundlesToBeAdded, updateNoOfBundlesToBeAdded] = React.useState(1);
  const [noOfBundlesToBeAddedError, updateNoOfBundlesToBeAddedError] = React.useState(false);

  const fetchTaxonomyData = async (masterKey = "product_distillery", sort_key, sort_order) => {
    let requestOptions = cloneDeep(defaultRequestOptions);
    requestOptions[MasterDataKeyPair.MasterDataKey] = masterKey;
    requestOptions["orderby_field"] = sort_key;
    requestOptions["orderby_value"] = sort_order;
    requestOptions["status_filter"] = "all";

    const taxonomyData = await props.getTaxonomyData(requestOptions);

    if (get(taxonomyData, "error", false)) {
      openNotificationWithIcon("error", `${capitalizeAllLetter(masterKey.replace(/_/g, " "))}`, `${get(taxonomyData, "error.message", "Something Went Wrong")} `);
    }
    const currentDataObj = { [masterKey]: { ...get(taxonomyData, "response"), requestPayload: requestOptions } };
    props.updateAllTaxonomyData(currentDataObj);
  };

  const onChange = React.useCallback(
    (key) => {
      updateCurrentTab(key);
      setDefault();
      if (key === "bundle") {
        fetchBundledCasedGoods();
      }
    },
    [currentTab]
  );

  useEffect(() => {
    if ("brand" in selectedRow || casedGoodItem === "new") {
      const tempObj = cloneDeep(enabled);
      tempObj["quantity"] = true;
      tempObj["case_price"] = true;
      tempObj["discount"] = true;
      updateEnabled(tempObj);
    }
  }, [selectedRow, casedGoodItem]);

  useEffect(() => {
    updateCase({ ...defaultValue });
    updateCasedGoodItem("existing");
  }, []);

  useEffect(() => {
    if ("brand" in selectedRow) {
      const newProds = { ...newCase };
      newProds["brand"] = get(selectedRow, "brand", "");
      newProds["bpc"] = get(selectedRow, "bpc", "");
      newProds["distillery"] = get(selectedRow, "distillery", "");
      newProds["case_price"] = get(selectedRow, "export_price", 0);
      newProds["rotation_number"] = get(selectedRow, "case_reference", "");
      newProds["bottles_in_partial_case"] = "";
      newProds["quantity"] = "";
      newProds["evaluated_bottles_in_partial_case"] = "";
      newProds["whole_case"] = "";
      getError("whole_case", false);
      updateCase(newProds);
      handlePartCaseOptions();
    }
  }, [selectedRow]);

  useEffect(() => {
    if ((newCase.brand && get(newCase, "brand") !== get(selectedRow, "brand")) || (newCase.distillery && get(newCase, "distillery") !== get(selectedRow, "distillery"))) {
      fetchCasedGoods();
    }
  }, [newCase.brand, newCase.distillery]);

  useEffect(() => {
    if (loading) {
      setSelectedRow({});
    }
  }, [loading]);

  const handlePartCaseOptions = (value) => {
    const BPC = selectedRow.bpc || value;
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
      value = Math.trunc(value);
      newProds["bottles_in_partial_case"] = "";
      newProds["evaluated_bottles_in_partial_case"] = "";
      newProds["quantity"] = "";
      value = value || value === 0 ? Math.trunc(Number(value)) : "";
    }

    if (key === "bottles_in_partial_case") {
      const partCaseValue = value.split("/");
      let BPC = Number(get(selectedRow, "bpc"));
      if (casedGoodItem === "new") {
        BPC = get(newCase, "bpc");
      }
      const evaluated_bottles_in_partial_case = round(Number(partCaseValue[0]) / Number(BPC), 2);
      newProds["evaluated_bottles_in_partial_case"] = evaluated_bottles_in_partial_case;
      newProds["quantity"] = round(Number(get(newProds, "whole_case", 0)) + evaluated_bottles_in_partial_case, 2);
    }

    if (key === "whole_case") {
      newProds["quantity"] = round(Number(get(newProds, "evaluated_bottles_in_partial_case", 0)) + Number(value), 2);
    }

    newProds[key] = value;
    updateCase(newProds);
  };

  const handleChange = React.useCallback(
    (key, value) => {
      if (key === "brand" && !isBlank(value)) {
        let newError = { ...error };
        newError["brand"] = "";
        updateError(newError);
      }

      if (key === "bpc") {
        let newError = { ...error };
        newError["bpc"] = "";
        updateError(newError);
        handlePartCaseOptions(Number(Math.trunc(value)));
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
          let BPC = Number(get(selectedRow, "bpc"));
          if (casedGoodItem === "new") {
            BPC = get(newCase, "bpc");
          }
          const partCaseValue = value.split("/");
          const evaluated_bottles_in_partial_case = round(Number(partCaseValue[0]) / BPC, 2);
          totalCaseOrderValue = Number(evaluated_bottles_in_partial_case) + parseInt(get(newCase, "whole_case", 0));
        }
        if (casedGoodItem === "existing") {
          if ((get(selectedRow, "net_cases", 0) < 0 && Number(totalCaseOrderValue) >= 0) || Number(totalCaseOrderValue) > get(selectedRow, "net_cases", 0)) {
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
    [selectedRow, newCase]
  );

  const fetchCasedGoods = async (requestOptions) => {
    const searchable_columns = [
      { field_name: "brand", field_value: get(newCase, "brand", "") },
      { field_name: "distillery", field_value: get(newCase, "distillery", "") },
    ];

    const inventoryResponse = await props.getCasedGoodsData({
      ...requestOptions,
      searchable_columns,
      page: "all",
    });

    if (get(inventoryResponse, "error", false)) {
      openNotificationWithIcon("error", "Inventory", `${get(inventoryResponse, "error.message", "Something Went Wrong")} `);
    }

    if (get(inventoryResponse, "response.status")) {
      setExpectedData(get(inventoryResponse, "response.data"));
      setMetaInfo(get(inventoryResponse, "response.meta.column_info"));
    }
  };

  const fetchBundledCasedGoods = async () => {
    const rest = await axios({
      method: "POST",
      data: { page: "all" },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/casedgood_bundles`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      setBundleListLoading(false);
      openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      setBundleListLoading(false);
      setBundledMetaInfo(getBundledDataColumns(get(rest, "data.meta.column_info", [])));

      const initialItem = get(rest, "data.data", [])[0];
      setBundleList(get(rest, "data.data", []));

      if (initialItem) {
        setSelectedBundle(get(initialItem, "name"));
      }
    }

    if (!get(rest, "data.status")) {
      setBundleListLoading(false);
      openNotificationWithIcon("error", `${get(rest, "data.message", "Something Went Wrong")} `);
    }
  };

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

    if (type === "bottles_in_partial_case") {
      if (isTrue) {
        const tempErrorObj = cloneDeep(error);
        tempErrorObj["bottles_in_partial_case"] = true;
        tempErrorObj["bottlesInPartialCaseErr"] = errorMsg;
        updateError(tempErrorObj);
      } else {
        const tempErrorObj = cloneDeep(error);
        tempErrorObj["bottles_in_partial_case"] = false;
        tempErrorObj["bottlesInPartialCaseErr"] = "";
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

  const getTotalView = () => {
    if (casedGoodItem === "existing") {
      if (get(newCase, "quantity", 0) && get(newCase, "bpc", 0)) {
        return true;
      }
    }
    if (casedGoodItem === "new") {
      if (get(newCase, "bpc")) {
        return true;
      }
    }
    return false;
  };

  const getCasesView = () => {
    if (casedGoodItem === "existing") {
      if ("brand" in selectedRow) {
        return true;
      }
    }
    if (casedGoodItem === "new") {
      if (get(newCase, "brand", "")) {
        return true;
      }
    }
    return false;
  };

  const getCasesSum = () => {
    return round(round(Number(get(newCase, "whole_case", 0)), 2) + round(Number(get(newCase, "evaluated_bottles_in_partial_case", 0)), 2), 2);
  };

  const getBottlesSum = () => {
    const bottles_in_partial_case = get(newCase, "bottles_in_partial_case", ["0/0"]).split("/")[0];
    return Number(get(newCase, "bpc", 0)) * round(Number(get(newCase, "whole_case", 0)), 2) + Number(bottles_in_partial_case);
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

    if (casedGoodItem === "existing") {
      if (value && Number(value) < get(selectedRow, "export_price", 0)) {
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

  const getTotalPrice = (bpc) => {
    const bottles_in_partial_case = Number(get(newCase, "bottles_in_partial_case", ["0/0"]).split("/")[0]);
    const casePrice = Number(get(newCase, "case_price", 0));
    const exportPrice = parseFloat(casePrice ? casePrice : 0);
    let totalPrice = (Number(bpc) * Number(get(newCase, "whole_case")) + Number(bottles_in_partial_case)) * exportPrice;
    totalPrice = round(totalPrice / Number(bpc), 2);
    return totalPrice;
  };

  const calculateTotalCases = (spiritAdded) => {
    const totalCases = getCountByKey(spiritAdded, "quantity");
    return totalCases;
  };

  const calculateTotalOrderValue = (spiritAdded) => {
    const totalSpiritValue = getCountByKey(spiritAdded, "price_after_discount");
    return round(totalSpiritValue, 2);
  };

  const handleNewSpiritsAdded = async (addedNewSpirits) => {
    if (get(addedNewSpirits, "items", []).length > 0) {
      const requestPayload = {
        sales_order_id: get(addedNewSpirits, "sales_order_id"),
        total_case: calculateTotalCases(get(addedNewSpirits, "items", [])),
        total_order_value: calculateTotalOrderValue(get(addedNewSpirits, "items", [])),
        items: get(addedNewSpirits, "items", []),
      };
      if (has(props, "handleSpiritsAdded", false)) {
        props.handleSpiritsAdded(requestPayload);
        setVisible(false);
      } else {
        const addSpiritResponse = await props.addSpirits({ ...defaultRequestOptions, ...requestPayload });

        if (get(addSpiritResponse, "error", false)) {
          openNotificationWithIcon("error", "Order Details", `${get(addSpiritResponse, "error.message", "Something Went Wrong")} `);
        }

        if (get(addSpiritResponse, "response.status")) {
          setVisible(false);
          openNotificationWithIcon("success", "Order Details", `${get(addSpiritResponse, "response.message", "Added Spirits Successfully")} `);
          props.refetchSalesOrderData();
        }
      }
    } else {
      openNotificationWithIcon("error", "Order Details", "Items Not found");
    }
  };

  const validateOrderItems = async (dataItems, record) => {
    const rest = await axios({
      method: "POST",
      data: { items: dataItems },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/consolidate_free_and_non_free_items`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      setVisible(false);
      let newDetails = { ...record };

      if (has(props, "updateState")) {
        newDetails["spiritAdded"] = get(rest, "data.items", []);
        props.updateState(newDetails);
      }

      if (has(props, "handleSpiritsAdded")) {
        newDetails["items"] = get(rest, "data.items", []);
        handleNewSpiritsAdded(newDetails);
      }
    }

    if (!get(rest, "data.status", true)) {
      openNotificationWithIcon("error", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  const setInfo = () => {
    let newProd = { ...get(props, "addedSpiritsDetails") };
    let itemsList = get(newProd, "items", []);

    if (has(props, "updateState")) {
      newProd = { ...props.salesOrderState };
      itemsList = cloneDeep(get(newProd, "spiritAdded", []));
    }

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

    if (validator.isEmpty(get(newCase, "whole_case").toString())) {
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

    if ("brand" in selectedRow && casedGoodItem === "existing") {
      if (has(newCase, "discount")) {
        const value = get(newCase, "discount");
        if (!decimalWithTwoPointsCheck(Number(value))) {
          getError("discount", true, "Invalid Discount, accepts only two decimal points");
        }
      }

      if (newCase.quantity) {
        const exportPrice = round(get(newCase, "case_price", 0), 2);
        const quantity = get(newCase, "quantity", 0);
        const discount = get(newCase, "discount", 0);

        const bottles_in_partial_case = Number(get(newCase, "bottles_in_partial_case", ["0/0"]).split("/")[0]);

        const data = {
          ...selectedRow,
          quantity,
          whole_case: get(newCase, "whole_case"),
          discount: get(newCase, "free_item", false) ? 0 : discount,
          free_item: get(newCase, "free_item", false) ? "yes" : "no",
          bottles_in_partial_case,
          price_per_case: get(newCase, "free_item", false) ? 0 : exportPrice,
          edit: false,
          timestamp: new Date().getTime(),
        };

        const itemsListData = getDetailedColumnData(cloneDeep(data), itemsList.length + 1);
        itemsList.push(itemsListData);
        getError("whole_case");
        validateOrderItems(itemsList, newProd);
      } else {
        getError("whole_case", true, "No. of cases to order cannot be empty");
      }
    }

    if (casedGoodItem === "new" && get(newCase, "brand")) {
      const exportPrice = round(get(newCase, "case_price", 0), 2);
      const discount = get(newCase, "discount", 0);
      const bottles_in_partial_case = Number(get(newCase, "bottles_in_partial_case", ["0/0"]).split("/")[0]);

      const data = {
        brand: get(newCase, "brand"),
        distillery: get(newCase, "distillery"),
        year: get(newCase, "year"),
        age: get(newCase, "age"),
        bpc: get(newCase, "bpc"),
        bottles_in_partial_case,
        whole_case: get(newCase, "whole_case"),
        cask: get(newCase, "cask"),
        abv: get(newCase, "abv"),
        volume: get(newCase, "volume"),
        discount: get(newCase, "free_item", false) ? 0 : discount,
        free_item: get(newCase, "free_item", false) ? "yes" : "no",
        price_per_case: get(newCase, "free_item", false) ? 0 : exportPrice,
        item_tag: "new",
        custom_label_text: get(newCase, "custom_label_text", ""),
        edit: false,
        timestamp: new Date().getTime(),
      };

      const itemsListData = getDetailedColumnData(cloneDeep(data), itemsList.length + 1);
      itemsList.push(itemsListData);
      validateOrderItems(itemsList, newProd);
    }
  };

  const setDefault = () => {
    setExpectedData([]);
    updateCase({ ...defaultValue });
    setSelectedRow({});
    updateNoOfBundlesToBeAdded(1);
    updateCasedGoodItem("existing");
    updateError({});
    updateEnabled({});
    setSelectedBundle("");
    setBundleList([]);
    setBundleListLoading(true);
  };

  const handleClickOnTab = (tab) => {
    if (tab !== casedGoodItem) {
      setSelectedRow({});
      updateError({});
      updateEnabled({});
      const newProds = { ...newCase };
      newProds["bpc"] = "";
      newProds["age"] = "";
      newProds["year"] = "";
      newProds["volume"] = "";
      newProds["quantity"] = "";
      newProds["discount"] = "";
      newProds["case_price"] = "";
      newProds["bottles_in_partial_case"] = "";
      newProds["evaluated_bottles_in_partial_case"] = "";
      newProds["whole_case"] = "";
      updateCase(newProds);
    }
    updateCasedGoodItem(tab);
  };

  const validateBundleOrderItems = async () => {
    if (noOfBundlesToBeAdded) {
      let newProd = { ...get(props, "addedSpiritsDetails") };
      let itemsList = get(newProd, "items", []);

      if (has(props, "updateState")) {
        newProd = { ...props.salesOrderState };
        itemsList = cloneDeep(get(newProd, "spiritAdded", []));
      }

      const rest = await axios({
        method: "POST",
        data: {
          existing_items: itemsList,
          bundle_quantity: noOfBundlesToBeAdded,
          bundle_id_to_add: get(getBundleDataSource(), "bundle_id"),
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/add_bundle_to_order`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        setVisible(false);
        let newDetails = { ...newProd };

        const dataNew = cloneDeep(get(rest, "data.items", [])).map((list) => {
          return {
            ...list,
            afterDiscount: get(list, "price_after_discount"),
            edit: false,
            editPrice: false,
            editDiscount: false,
            uniqueId: new Date().getTime(),
          };
        });

        if (has(props, "updateState")) {
          newDetails["spiritAdded"] = dataNew;
          props.updateState(newDetails);
        }

        if (has(props, "handleSpiritsAdded")) {
          newDetails["items"] = dataNew;
          handleNewSpiritsAdded(newDetails);
        }
      }

      if (!get(rest, "data.status", true)) {
        openNotificationWithIcon("error", get(rest, "data.message", "Something Went Wrong"));
      }
    } else {
      openNotificationWithIcon("error", "Bundles to be added is mandatory");
    }
  };

  const getBundleDataSource = () => {
    const data = find(bundleList, function (o) {
      return get(o, "name") === selectedBundle;
    });
    return data;
  };

  return (
    <Modal
      title=""
      centered
      style={{ top: 10 }}
      visible={visible}
      onOk={() => {
        if (currentTab === "bundle") {
          validateBundleOrderItems();
        } else {
          setInfo(false);
        }
      }}
      onCancel={() => setVisible(false)}
      width={1100}
      className="add__spirit__modal"
      okText="Add"
      maskClosable={false}
      destroyOnClose={true}
      afterClose={() => {
        setDefault();
        updateCurrentTab("spirit");
      }}
    >
      <>
        <Tabs defaultActiveKey="spirit" value={currentTab} onChange={onChange}>
          <TabPane tab="Add Spirit" key="spirit">
            <div className="add-spirit-modal mt-3 w-100">
              <Row gutter={[16, 16]}>
                <Col xs={{ span: 24 }} md={{ span: 12 }}>
                  {/* <label>brand </label>
              <span>( It was popularized in the 1960s with the release )</span> */}
                  <Select
                    style={{ width: "90%" }}
                    handleChange={(key, value) => handleChange(key, value)}
                    value={get(newCase, "brand", "")}
                    type="brand"
                    required
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
                    className="mt-0 mb-1"
                  />
                </Col>
                <Col xs={{ span: 24 }} md={{ span: 12 }}>
                  {/* <label>distillery </label>
              <span>( It was popularized in the 1960s with the release )</span> */}
                  <Select
                    type="distillery"
                    label="Product/Distillery"
                    style={{ width: "90%" }}
                    handleChange={handleChange}
                    value={get(newCase, "distillery", "")}
                    placeholder="Search to Select"
                    onDropdownVisibleChange={() => {
                      if (get(props, "masterAllData.product_distillery.data", []).length === 0 || get(props, "masterAllData.product_distillery.requestPayload.orderby_value", "") !== "ASC") {
                        fetchTaxonomyData("product_distillery", "distillery_name", "ASC");
                      }
                    }}
                    loading={get(props, "isTaxonomyDataLoading", false)}
                    validateStatus={get(error, "product_distillery") && "error"}
                    helpText={get(error, "product_distillery") && "Distilleries cannot be empty"}
                    options={getKeyValuePair(get(props, "masterAllData.product_distillery.data", []), "distillery_name", false)}
                    // className="mt-0 mb-0"
                  />
                </Col>
              </Row>
              <div className="select-case-good-btns">
                <Button type={casedGoodItem === "existing" && "primary"} onClick={() => handleClickOnTab("existing")}>
                  Select from Cased Goods
                </Button>
                <Button type={casedGoodItem === "new" && "primary"} onClick={() => handleClickOnTab("new")} className="ml-sm-3">
                  Not available? Enter details
                </Button>
              </div>
              {casedGoodItem === "existing" && (
                <div className="mt-4">
                  <Row gutter={[16, 16]}>
                    <Col xs={{ span: 24 }} md={{ span: 24 }}>
                      <div className="spirit-table">
                        <TableUI
                          isDefaultType={true}
                          size="small"
                          isActionAvailable={false}
                          scroll={{ x: 1500 }}
                          pageSize={5}
                          isExportEnabled={false}
                          isFilterEnabled={false}
                          rowSelectionType="radio"
                          isSelectionAvailable={true}
                          columns_available={metaInfo}
                          data={getDynamicDataWrapper(expectedData)}
                          className="mt-3"
                          selectedRow={setSelectedRow}
                          isLoading={loading}
                        />
                      </div>
                    </Col>
                  </Row>
                  {"cases" in selectedRow && (
                    <div className="spirit-detail">
                      <Row>
                        <Col xs={{ span: 12 }} md={{ span: 8 }}>
                          <div className="detail-column">
                            <div className="detail-item">
                              <label>Available Cases</label>
                              <span>{selectedRow.cases}</span>
                            </div>
                            <div className="detail-item">
                              <label>Pending Orders</label>
                              <span>{selectedRow.allocations}</span>
                            </div>
                            <div className="detail-item">
                              <label>Net Available Cases</label>
                              <span>{selectedRow.net_cases}</span>
                            </div>
                          </div>
                        </Col>
                        <Col xs={{ span: 12 }} md={{ span: 8 }}>
                          <div className="detail-column pl-2">
                            <div className="detail-item">
                              <label>ABV (%)</label>
                              <span>{selectedRow.abv}</span>
                            </div>
                            <div className="detail-item">
                              <label>BPC</label>
                              <span>{selectedRow.bpc}</span>
                            </div>
                            <div className="detail-item">
                              <label>Volume (In Litres)</label>
                              <span>{selectedRow.volume}</span>
                            </div>
                          </div>
                        </Col>
                        <Col xs={{ span: 12 }} md={{ span: 8 }}>
                          <div className="detail-column-last pl-2">
                            <div className="detail-item">
                              <label>Export Price</label>
                              <span>£ {numberWithCommas(round(selectedRow.export_price, 2))}</span>
                            </div>
                            <div className="detail-item">
                              <label>Retail Price per case incl VAT</label>
                              <span>£ {numberWithCommas(round(selectedRow.retail_price_case_incl_vat, 2))}</span>
                            </div>
                            <div className="detail-item">
                              <label>Retail Price per bottle incl VAT</label>
                              <span>£ {numberWithCommas(round(selectedRow.retail_price_unit_incl_vat, 2))}</span>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              )}
              {casedGoodItem === "new" && (
                <Row className="mt-3" gutter={[16, 16]}>
                  <Col xs={{ span: 12 }} md={{ span: 8 }}>
                    <InputNumberChange
                      handleChange={handleChange}
                      value={get(newCase, "year", "")}
                      type="year"
                      className="mt-0 mb-0 w-100"
                      validateStatus={get(error, "year") && "error"}
                      helpText={get(error, "year") ? get(error, "year") : ""}
                      label="Year"
                    />
                  </Col>
                  <Col xs={{ span: 12 }} md={{ span: 8 }}>
                    <InputNumberChange
                      handleChange={handleChange}
                      value={get(newCase, "age", "")}
                      type="age"
                      className="mt-0 mb-0 w-100"
                      validateStatus={get(error, "age") && "error"}
                      helpText={get(error, "age") ? get(error, "age") : ""}
                      label="Age"
                    />
                  </Col>
                  <Col xs={{ span: 12 }} md={{ span: 8 }}>
                    <InputNumberChange
                      handleChange={handleChange}
                      value={get(newCase, "bpc", "")}
                      type="bpc"
                      required
                      className="mt-0 mb-0 w-100"
                      validateStatus={get(error, "bpc") && "error"}
                      helpText={get(error, "bpc") ? get(error, "bpc") : ""}
                      label="BPC"
                    />
                  </Col>
                  <Col xs={{ span: 12 }} md={{ span: 8 }}>
                    <InputNumberChange
                      handleChange={handleChange}
                      value={get(newCase, "volume", "")}
                      type="volume"
                      className="mt-0 mb-0 w-100"
                      validateStatus={get(error, "volume") && "error"}
                      helpText={get(error, "volume") ? get(error, "volume") : ""}
                      label="Volume (in litres)"
                    />
                  </Col>
                  <Col xs={{ span: 12 }} md={{ span: 8 }}>
                    <InputNumberChange
                      handleChange={handleChange}
                      value={get(newCase, "abv", "")}
                      type="abv"
                      className="mt-0 mb-0 w-100"
                      validateStatus={get(error, "abv") && "error"}
                      helpText={get(error, "abv") ? get(error, "abv") : ""}
                      label="ABV (%)"
                    />
                  </Col>
                  <Col xs={{ span: 12 }} md={{ span: 8 }}>
                    <InputChange
                      handleChange={handleChange}
                      value={get(newCase, "cask", "")}
                      type="cask"
                      className="mt-0 mb-0 w-100"
                      validateStatus={get(error, "cask") && "error"}
                      helpText={get(error, "cask") ? get(error, "cask") : ""}
                      label="Cask"
                    />
                  </Col>
                  <Col xs={{ span: 12 }} md={{ span: 8 }}>
                    <InputChange
                      handleChange={handleChange}
                      value={get(newCase, "custom_label_text", "")}
                      type="custom_label_text"
                      className="mt-0 mb-0 w-100"
                      validateStatus={get(error, "custom_label_text") && "error"}
                      helpText={get(error, "custom_label_text") ? get(error, "custom_label_text") : ""}
                      label="Custom Label Text"
                    />
                  </Col>
                </Row>
              )}

              {getCasesView() && (
                <>
                  <hr style={{ backgroundColor: "#ece6e6" }} />

                  {get(props, "isFOCEditable", true) && (
                    <Checkbox onChange={(e) => handleChange("free_item", e.target.checked)}>
                      <b>Add this as a Free of Charge (FOC) item</b>
                    </Checkbox>
                  )}

                  <div className="quantity-section mt-3">
                    <Row gutter={[16, 16]}>
                      <Col xs={{ span: 12 }} md={{ span: 8 }}>
                        <Row gutter={[16, 16]}>
                          <Col xs={{ span: 12 }} md={{ span: 12 }}>
                            <InputNumberChange
                              handleChange={handleChange}
                              value={get(newCase, "whole_case", "")}
                              type="whole_case"
                              required
                              className="mt-0 mb-0 w-100"
                              validateStatus={get(error, "whole_case") && "error"}
                              helpText={get(error, "whole_case") ? get(error, "wholeCaseErr") : ""}
                              label="Whole Cases"
                              disabled={!"brand" in selectedRow}
                            />
                          </Col>
                          <Col xs={{ span: 12 }} md={{ span: 12 }}>
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
                              className="mb-0 mt-0 part-case-field"
                            />
                          </Col>
                        </Row>
                      </Col>
                      {!get(newCase, "free_item", true) && (
                        <>
                          <Col xs={{ span: 12 }} md={{ span: 8 }}>
                            <InputNumberChange
                              handleChange={handleChange}
                              value={get(newCase, "case_price", "")}
                              type="case_price"
                              required
                              className="mt-0 mb-0 w-100"
                              validateStatus={get(error, "case_price") && "error"}
                              helpText={get(error, "case_price") ? get(error, "case_price") : ""}
                              label="Case Price ( &#163; )"
                              disabled={!"brand" in selectedRow}
                            />
                          </Col>
                          <Col xs={{ span: 12 }} md={{ span: 8 }}>
                            <InputNumberChange
                              handleChange={handleChange}
                              value={get(newCase, "discount", "")}
                              type="discount"
                              className="mt-0 mb-0 w-100"
                              validateStatus={get(error, "discount") && "error"}
                              helpText={get(error, "discount") ? get(error, "discountErr") : ""}
                              label="Discount ( % )"
                              disabled={!"brand" in selectedRow}
                            />
                          </Col>
                        </>
                      )}
                    </Row>

                    {getTotalView() && (
                      <Row gutter={[16, 16]}>
                        <Col xs={{ span: 12 }} md={{ span: 4 }}>
                          <div className="total-case-detail">
                            <b className="pr-1"> Total Cases:</b>
                            <Tag color="blue">{getCasesSum()}</Tag>
                          </div>
                        </Col>
                        <Col xs={{ span: 12 }} md={{ span: 6 }}>
                          <div>
                            <b className="pr-1"> Total Bottles:</b>
                            <Tag color="blue"> {getBottlesSum()} </Tag>
                          </div>
                        </Col>
                      </Row>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabPane>
          <TabPane tab="Add Bundle" key="bundle">
            <Spin spinning={bundleListLoading}>
              <div className="site-card-wrapper mb-4">
                <Row gutter={[16, 16]}>
                  {bundleList.map((list, index) => {
                    return (
                      <Col span={8} key={index}>
                        {/* {get(list, "name") === selectedBundle ? (
                          <Badge.Ribbon text="Active">
                            <Card title={get(list, "name")} size="small">
                              {get(list, "description", "")}
                            </Card>
                          </Badge.Ribbon>
                        ) : ( */}
                        <Card
                          title={get(list, "name")}
                          style={{
                            cursor: "pointer",
                          }}
                          className={get(list, "name") === selectedBundle ? "bundle_selection active" : "bundle_selection"}
                          size="small"
                          onClick={() => setSelectedBundle(get(list, "name"))}
                        >
                          {get(list, "description", "")}
                        </Card>
                        {/* )} */}
                      </Col>
                    );
                  })}
                </Row>
              </div>
              {/* <div className="d-flex align-items-center justify-content-between add__bundle__order">
                <Select
                  type="bundle"
                  label="Select Bundle"
                  handleChange={(key, value) => setSelectedBundle(value)}
                  placeholder="Search to Select"
                  value={selectedBundle}
                  loading={bundleListLoading}
                  onDropdownVisibleChange={() => {
                    if (bundleList.length === 0) {
                      fetchBundledCasedGoods();
                    }
                  }}
                  options={getKeyValuePair(bundleList, "name", false)}
                  className="mt-3 mb-2 w-100"
                />
                <b>{get(getBundleDataSource(), "description", "")}</b>
              </div> */}
              <Table
                scroll={{ y: 200 }}
                pagination={{
                  position: ["none", "none"],
                }}
                size="small"
                // loading={bundleListLoading}
                dataSource={get(getBundleDataSource(), "bundle_items_json", [])}
                columns={bundledMetaInfo}
              />
              <div className="mt-4 mb-0" style={{ width: "30%" }}>
                <InputNumberChange
                  handleChange={(key, value) => {
                    updateNoOfBundlesToBeAdded(value);
                    if (value) {
                      updateNoOfBundlesToBeAddedError(false);
                    } else {
                      updateNoOfBundlesToBeAddedError(true);
                    }
                  }}
                  value={noOfBundlesToBeAdded}
                  type="noOfBundlesToBeAddedError"
                  className="mt-0 mb-0 w-100"
                  validateStatus={noOfBundlesToBeAddedError && "error"}
                  helpText={noOfBundlesToBeAddedError ? "Bundles should be greater than 0" : ""}
                  label="Bundles to be Added"
                />
              </div>
            </Spin>
          </TabPane>
        </Tabs>
      </>
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
  { getTaxonomyData, updateAllTaxonomyData, getCasedGoodsData }
)(AddSpiritModal);
