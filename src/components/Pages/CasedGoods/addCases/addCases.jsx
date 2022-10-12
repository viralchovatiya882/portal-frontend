import { ArrowRightOutlined, InfoCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { AddCasesTabs, defaultTaxonomyMasterDataListName, MasterDataKeyPair } from "@constants";
import { capitalizeAllLetter, getKeyValuePair } from "@helpers/utility";
import { defaultRequestKey, defaultRequestOptions } from "@settings";
import { addInventory, getCasedGoods, getCasedGoodsTags, getPricingParameters } from "@store/CasedGoods/casedGoods.actions";
import { getTaxonomyData, updateAllTaxonomyData } from "@store/Taxonomy/taxonomy.actions";
import { CustomDatePicker } from "@ui-components/DatePicker";
import ErrorBoundary from "@ui-components/ErrorBoundary";
import Heading from "@ui-components/Heading";
import {
  CustomInputNumber as InputNumberChange,
  CustomInputText as InputChange,
  CustomInputTextArea as InputTextArea
} from "@ui-components/Input/customInput";
import { SingleSelect as Select } from "@ui-components/Select/singleSelect";
import EditableTagGroup from "@ui-components/Tags/editableTags";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { Button, Divider, Tabs } from "antd";
import { cloneDeep, find, get } from "lodash";
import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { connect } from "react-redux";
import "../index.scss";
import { defaultValue } from "../utility/constants";
import { checkBottlingDate, getAge, getBottles, getLoA, getTags } from "../utility/helper";
import Preview from "./preview";

const { TabPane } = Tabs;

/**
 * Renders Cased Goods Add Cases component
 */
const AddCases = props => {
  const defaultFieldsToBeValidated = { ...defaultValue.basic, ...defaultValue.case };
  const [newCase, updateCase] = React.useState({ ...defaultFieldsToBeValidated, ...defaultValue.price, ...defaultValue.others });
  const [activeKey, setActiveKey] = React.useState(AddCasesTabs.Basics);
  const [basicValidationStatus, setBasicValidationStatus] = React.useState(false);
  const [isTagsCleared, setIsTagsCleared] = React.useState(false);
  const [caseValidationStatus, setCaseValidationStatus] = React.useState(false);
  const [priceValidationStatus, setPriceValidationStatus] = React.useState(false);
  const [error, updateError] = React.useState({});
  const [clonedTags, updateClonedTags] = React.useState([]);
  const [partCaseOptionsList, setPartCaseOptionsList] = React.useState([]);

  const handlePartCaseOptions = BPC => {
    if (BPC) {
      let partCaseOptions = [];
      for (let i = 1; i < BPC; i++) {
        partCaseOptions.push({
          label: `${i} / ${BPC}`,
          value: `${i}/${BPC}`
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

  const handleChange = React.useCallback(
    (key, value) => {
      const newProds = { ...newCase };
      newProds[key] = value;
      if (newProds["ays"] && newProds["bottling_date"] && key !== "age") {
        const yearData = { ays: newProds["ays"], bottling_date: newProds["bottling_date"] };
        newProds["age"] = getAge(yearData);
        updateError({ ...error, ays: checkBottlingDate(yearData) });
      }

      if (!newProds["ays"] || !newProds["bottling_date"]) {
        // newProds["age"] = "";
        updateError({ ...error, ays: false });
      }

      if (key === "bpc") {
        newProds["evaluated_bottles_in_partial_case"] = "";
        newProds["bottles_in_partial_case"] = "";
        newProds["bpc"] = value || value === 0 ? Math.trunc(Number(value)) : "";
        handlePartCaseOptions(Number(Math.trunc(value)));
      }

      if (key === "whole_case") {
        newProds["whole_case"] = value || value === 0 ? Math.trunc(Number(value)) : "";
      }

      if (key === "bottles_in_partial_case") {
        const partCaseValue = value.split("/");
        newProds["evaluated_bottles_in_partial_case"] = partCaseValue[0] ? Number(partCaseValue[0]) : 0;
      }

      if (!newProds["whole_case"] || !newProds["evaluated_bottles_in_partial_case"]) {
        newProds["bottles"] =
          getBottles(newProds["bpc"], Number(get(newProds, "whole_case", 0))) + Number(get(newProds, "evaluated_bottles_in_partial_case", 0));
      }

      if (newProds["bpc"] && (newProds["whole_case"] || newProds["evaluated_bottles_in_partial_case"])) {
        const BIPC = get(newProds, "evaluated_bottles_in_partial_case", 0);
        newProds["bottles"] = getBottles(newProds["bpc"], Number(get(newProds, "whole_case", 0))) + Number(BIPC);
      }

      if (!newProds["abv"] || !newProds["bpc"] || !newProds["volume"]) {
        newProds["loA"] = "";
      }

      if (newProds["abv"] && newProds["bpc"] && newProds["volume"]) {
        newProds["loA"] = getLoA(newProds["abv"], newProds["bpc"], newProds["volume"]);
      }

      updateCase(newProds);
    },
    [newCase]
  );

  const fetchTaxonomyData = async (masterKey = defaultTaxonomyMasterDataListName, sort_key = "", sort_order = "ASC") => {
    let requestOptions = cloneDeep(defaultRequestOptions);
    requestOptions[MasterDataKeyPair.MasterDataKey] = masterKey;
    requestOptions["orderby_field"] = sort_key;
    requestOptions["orderby_value"] = sort_order;
    const taxonomyData = await props.getTaxonomyData(requestOptions);

    if (get(taxonomyData, "error", false)) {
      openNotificationWithIcon(
        "error",
        `${capitalizeAllLetter(masterKey.replace(/_/g, " "))}`,
        `${get(taxonomyData, "error.message", "Something Went Wrong")} `
      );
    }

    const currentDataObj = { [masterKey]: { ...get(taxonomyData, "response"), requestPayload: requestOptions } };
    props.updateAllTaxonomyData(currentDataObj);
  };

  const fetchPricingParameters = async requestOptions => {
    const pricingParametersResponse = await props.getPricingParameters(requestOptions);
    updateCase({ ...newCase, ...get(pricingParametersResponse, "response.data") });
  };

  const fetchTags = async () => {
    const requestOptions = { page: "all" };
    const tagsResponse = await props.getCasedGoodsTags(requestOptions);

    if (get(tagsResponse, "response.status")) {
      updateTags(get(tagsResponse, "response.data"));
      setIsTagsCleared(true);
    }

    if (!get(tagsResponse, "response.status")) {
      openNotificationWithIcon("info", "Inventory", `${get(tagsResponse, "response.message", "Something Went Wrong")} `);
    }

    if (get(tagsResponse, "error", false)) {
      openNotificationWithIcon("error", "Inventory", `${get(tagsResponse, "error.message", "Something Went Wrong")} `);
    }
  };

  const updateTags = tagsResponse => {
    updateClonedTags(getTags(tagsResponse));
  };

  React.useEffect(() => {
    if (get(props, "casedGoodsTags.data", []).length === 0) {
      fetchTags();
    } else {
      updateTags(get(props, "casedGoodsTags.data", []));
    }
  }, []);

  const handleExportPrice = React.useCallback(
    (key, value) => {
      if (key && value) {
        const newProds = { ...newCase };
        newProds[key] = value;
        updateCase(newProds);
        const { abv, volume, bpc } = newProds;

        if (key === "export_price") {
          const options = { export_price: value, abv, volume, bpc };
          const requestOptions = { ...options, ...defaultRequestKey };
          fetchPricingParameters(requestOptions);
        }
      }
    },
    [newCase]
  );

  React.useEffect(() => {
    if (activeKey === AddCasesTabs.Basics) {
      setBasicValidationStatus(false);
      setCaseValidationStatus(false);
      setPriceValidationStatus(false);

      const basicTabsFields = Object.keys(get(defaultValue, "basic", {}));
      const basicTabValidation = find(basicTabsFields, function (o) {
        return !newCase[o];
      });

      if (!basicTabValidation) {
        setBasicValidationStatus(true);
      }

      if (get(error, "ays")) {
        setBasicValidationStatus(false);
      }
    }

    if (activeKey === AddCasesTabs.Case) {
      setCaseValidationStatus(false);
      setPriceValidationStatus(false);
      let caseFields = cloneDeep(get(defaultValue, "case", {}));
      // delete caseFields["bottles_in_partial_case"];

      let caseTabsFields = Object.keys(caseFields);
      const caseTabValidation = find(caseTabsFields, function (o) {
        if (o === "whole_case" && newCase[o] === 0) {
          return false;
        }
        if (o === "bottles_in_partial_case") {
          return false;
        }
        if (!newCase["whole_case"] && !newCase["bottles_in_partial_case"]) {
          return true;
        }
        return !newCase[o];
      });

      if (!caseTabValidation) {
        setCaseValidationStatus(true);
        setPriceValidationStatus(true);
      }
    }

    // if (activeKey === AddCasesTabs.Price) {
    //     setPriceValidationStatus(false);
    //     const priceTabsFields = Object.keys(get(defaultValue, "price", {}));
    //     const priceTabValidation = find(priceTabsFields, function (o) {
    //         return !newCase[o];
    //     });

    //     if (!priceTabValidation) {
    //         setPriceValidationStatus(true);
    //     }
    // }

    const previewTabValidation = find(Object.keys(defaultFieldsToBeValidated), function (o) {
      return !newCase[o];
    });

    if (!previewTabValidation) {
      setCaseValidationStatus(true);
      setPriceValidationStatus(true);
    }
  }, [newCase, activeKey, error]);

  const handleSave = async () => {
    setIsTagsCleared(false);
    let newCaseValues = { ...newCase };
    newCaseValues["bottles_in_partial_case"] = newCaseValues["evaluated_bottles_in_partial_case"]
      ? newCaseValues["evaluated_bottles_in_partial_case"]
      : 0;
    delete newCaseValues["evaluated_bottles_in_partial_case"];
    let requestOptions = { ...newCaseValues, ...defaultRequestKey };
    const addInventoryData = await props.addInventory(requestOptions);

    if (get(addInventoryData, "error", false)) {
      openNotificationWithIcon("error", "Failed to add inventory", `${get(addInventoryData, "error.message", "Something Went Wrong")} `);
    }

    if (get(addInventoryData, "response.status", false)) {
      clearData();
      fetchTags();
      const searchable_columns = [{ field_name: "deleted", field_value: "no" }];
      const casedGoodInventory = await props.getCasedGoods({ ...defaultRequestOptions, searchable_columns });

      if (get(casedGoodInventory, "error", false)) {
        openNotificationWithIcon("error", "Inventory", `${get(casedGoodInventory, "error.message", "Something Went Wrong")} `);
      }

      openNotificationWithIcon("success", "Add Inventory", get(addInventoryData, "response.message", "Added Successfully"));
    } else {
      openNotificationWithIcon("warning", "Add Inventory", get(addInventoryData, "response.message", "Something went wrong"));
    }
  };

  const clearData = () => {
    const newRecords = { ...defaultValue.basic, ...defaultValue.case, ...defaultValue.price, ...defaultValue.others };
    updateCase(newRecords);
    setActiveKey(AddCasesTabs.Basics);
    setBasicValidationStatus(false);
    setCaseValidationStatus(false);
    setPriceValidationStatus(false);
  };

  const handleNext = tabName => {
    if (tabName === AddCasesTabs.Basics) {
      setActiveKey(AddCasesTabs.Case);
    }

    if (tabName === AddCasesTabs.Case) {
      setActiveKey(AddCasesTabs.Price);
    }

    if (tabName === AddCasesTabs.Price) {
      setActiveKey(AddCasesTabs.Preview);
    }

    if (tabName === AddCasesTabs.Preview) {
      handleSave();
    }
  };

  const callback = key => {
    setActiveKey(key);
  };

  return (
    <>
      <Heading text="Add New Cases to the Inventory" variant="h4" />
      <div className="bg-white p-4 inventory__add_cases">
        <ErrorBoundary>
          <Tabs defaultActiveKey="1" onChange={callback} activeKey={activeKey}>
            <TabPane tab={AddCasesTabs.Basics} key={AddCasesTabs.Basics}>
              <Row>
                <Col sm={6} xs={12} md={6} lg={4}>
                  <Select
                    handleChange={(key, value) => handleChange(key, value)}
                    value={get(newCase, "brand", "")}
                    type="brand"
                    label="Brand Name"
                    required
                    onDropdownVisibleChange={() => {
                      if (
                        get(props, "masterAllData.brand.data", []).length === 0 ||
                        get(props, "masterAllData.brand.requestPayload.orderby_value", "") !== "ASC"
                      ) {
                        fetchTaxonomyData("brand", "brand_name", "ASC");
                      }
                    }}
                    loading={get(props, "isTaxonomyDataLoading", false)}
                    validateStatus={get(error, "brand") && "error"}
                    helpText={get(error, "brand") && "Brand cannot be empty"}
                    options={getKeyValuePair(get(props, "masterAllData.brand.data", []), "brand_name", false)}
                    className="mt-0 mb-0"
                  />
                  <Select
                    handleChange={handleChange}
                    value={get(newCase, "distillery", "")}
                    onDropdownVisibleChange={() => {
                      if (
                        get(props, `masterAllData.${defaultTaxonomyMasterDataListName}.data`, []).length === 0 ||
                        get(props, `masterAllData.${defaultTaxonomyMasterDataListName}.requestPayload.orderby_value"`) !== "ASC"
                      ) {
                        fetchTaxonomyData(defaultTaxonomyMasterDataListName, "distillery_name", "ASC");
                      }
                    }}
                    loading={get(props, "isTaxonomyDataLoading", false)}
                    type="distillery"
                    required
                    validateStatus={get(error, "distillery") && "error"}
                    helpText={get(error, "distillery") && "Distillery cannot be empty"}
                    label="Distillery"
                    className="mt-0 mb-0"
                    options={getKeyValuePair(get(props, `masterAllData.${defaultTaxonomyMasterDataListName}.data`, []), "distillery_name", false)}
                  />
                  <Select
                    handleChange={(key, value) => handleChange(key, value)}
                    value={get(newCase, "gift_box", "")}
                    type="gift_box"
                    label="Gift Box"
                    required
                    onDropdownVisibleChange={() => {
                      if (get(props, "masterAllData.gift_box.data", []).length === 0) {
                        fetchTaxonomyData("gift_box");
                      }
                    }}
                    loading={get(props, "isTaxonomyDataLoading", false)}
                    validateStatus={get(error, "gift_box") && "error"}
                    helpText={get(error, "gift_box") && "Gift Box cannot be empty"}
                    options={getKeyValuePair(get(props, "masterAllData.gift_box.data", []), "name")}
                    className="mt-0 mb-0"
                  />
                  <CustomDatePicker
                    handleChange={handleChange}
                    value={get(newCase, "ays", "")}
                    type="ays"
                    placeholder="A.Y.S (YYYY-MM-DD)"
                    validateStatus={get(error, "ays") && "error"}
                    helpText={get(error, "ays") ? "A.Y.S should be less than Bottling Date" : ""}
                    className="mt-0 mb-0 w-100"
                    label="A.Y.S (YYYY-MM-DD)"
                  />
                  <InputNumberChange handleChange={handleChange} value={get(newCase, "age", "")} type="age" className="mt-0 mb-0 w-100" label="Age" />
                </Col>
                <Col sm={6} xs={12} md={6} lg={4}>
                  <Select
                    handleChange={handleChange}
                    value={get(newCase, "spirit_type", "")}
                    type="spirit_type"
                    onDropdownVisibleChange={() => {
                      if (get(props, "masterAllData.spirit_type.data", []).length === 0) {
                        fetchTaxonomyData("spirit_type");
                      }
                    }}
                    loading={get(props, "isTaxonomyDataLoading", false)}
                    required
                    validateStatus={get(error, "spirit_type") && "error"}
                    helpText={get(error, "spirit_type") && "Spirit cannot be empty"}
                    label="Spirit Type"
                    className="mt-0 mb-0"
                    options={getKeyValuePair(get(props, "masterAllData.spirit_type.data", []), "spirit_type")}
                  />

                  <InputChange handleChange={handleChange} value={get(newCase, "cask", "")} type="cask" className="mt-0 mb-0" label="Cask" />
                  <Select
                    handleChange={handleChange}
                    value={get(newCase, "cask_type", "")}
                    type="cask_type"
                    onDropdownVisibleChange={() => {
                      if (get(props, "masterAllData.cask_type.data", []).length === 0) {
                        fetchTaxonomyData("cask_type");
                      }
                    }}
                    loading={get(props, "isTaxonomyDataLoading", false)}
                    className="mt-0 mb-0"
                    label="Cask Type"
                    options={getKeyValuePair(get(props, "masterAllData.cask_type.data", []), "cask_type_name")}
                  />

                  <CustomDatePicker
                    handleChange={handleChange}
                    value={get(newCase, "bottling_date", "")}
                    type="bottling_date"
                    className="mt-0 mb-0 w-100"
                    label="Bottling Date (YYYY-MM-DD)"
                    placeholder="Bottling Date (YYYY-MM-DD)"
                  />
                </Col>
                <Col sm={12} xs={12} md={12} lg={4}>
                  <Divider orientation="left">Tags</Divider>
                  <EditableTagGroup tags={clonedTags} type="tags" isCleared={isTagsCleared} handleChange={handleChange} />
                </Col>
              </Row>
              <Button
                type="primary"
                className="mt-1"
                disabled={!basicValidationStatus}
                icon={<ArrowRightOutlined />}
                onClick={() => handleNext(AddCasesTabs.Basics)}
              >
                Next
              </Button>
            </TabPane>
            <TabPane tab={AddCasesTabs.Case} disabled={!basicValidationStatus} key={AddCasesTabs.Case}>
              <Row>
                <Col sm={6} xs={12} md={6} lg={4}>
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "abv", "")}
                    type="abv"
                    required
                    className="mt-0 mb-0 w-100"
                    validateStatus={get(error, "abv") && "error"}
                    helpText={get(error, "abv") && "ABV cannot be empty"}
                    label="ABV (%)"
                  />
                  <Row>
                    <Col md={7} sm={7} xs={12}>
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
                    <Col md={5} sm={5} xs={12}>
                      <Select
                        handleChange={(key, value) => handleChange(key, value)}
                        type="bottles_in_partial_case"
                        label="Part Case"
                        placeholder="Part Case"
                        value={get(newCase, "bottles_in_partial_case", 0)}
                        helpText={get(error, "bottles_in_partial_case") ? get(error, "bottlesInPartialCaseErr") : ""}
                        options={partCaseOptionsList}
                        disabled={Number(get(newCase, "bpc", 0)) < 2}
                        validateStatus={get(error, "bottles_in_partial_case") && "error"}
                        className="mb-2 part-case-field"
                      />
                    </Col>
                  </Row>
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "volume", "")}
                    type="volume"
                    required
                    className="mt-0 mb-0 w-100"
                    validateStatus={get(error, "volume") && "error"}
                    helpText={get(error, "volume") && "Volume cannot be empty"}
                    label="Volume (in litres)"
                  />
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "loA", "")}
                    type="loA"
                    className="mt-0 mb-0 w-100"
                    required
                    disabled
                    validateStatus={get(error, "loA") && "error"}
                    helpText={get(error, "loA") && "loA cannot be empty"}
                    label=" LoA per Case"
                  />
                </Col>
                <Col sm={6} xs={12} md={6} lg={4}>
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "bpc", "")}
                    type="bpc"
                    required
                    className="mt-0 mb-0 w-100"
                    validateStatus={get(error, "bpc") && "error"}
                    helpText={get(error, "bpc") && "BPC cannot be empty"}
                    label="BPC"
                  />

                  <InputChange
                    handleChange={handleChange}
                    value={get(newCase, "case_reference", "")}
                    type="case_reference"
                    required
                    className="mt-0 mb-0"
                    validateStatus={get(error, "case_reference") && "error"}
                    helpText={get(error, "case_reference") && "Case Ref cannot be empty"}
                    label="Case Reference / Rotation Number"
                  />
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "bottles", "")}
                    type="bottles"
                    className="mt-0 mb-0 w-100"
                    required
                    disabled
                    validateStatus={get(error, "bottles") && "error"}
                    helpText={get(error, "bottles") && "Bottles cannot be empty"}
                    label="Bottles"
                  />
                  <InputTextArea handleChange={handleChange} value={get(newCase, "comments", "")} type="comments" label="Comments" />
                </Col>
              </Row>
              <Button
                type="primary"
                className="mt-1"
                disabled={!caseValidationStatus}
                icon={<ArrowRightOutlined />}
                onClick={() => handleNext(AddCasesTabs.Case)}
              >
                Next
              </Button>
            </TabPane>
            <TabPane
              tab={AddCasesTabs.Price}
              // <span>
              //     <Popover placement="topLeft" title="Price Details" content="All Prices are in GBP">
              //         <InfoCircleOutlined />
              //         {AddCasesTabs.Price}
              //     </Popover>
              // </span>
              disabled={!caseValidationStatus}
              key={AddCasesTabs.Price}
            >
              <label>
                <InfoCircleOutlined /> <b> All Prices are in GBP </b>
              </label>
              <Row>
                <Col sm={6} xs={12} md={6} lg={4}>
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "export_price", "")}
                    type="export_price"
                    label="Export Pricing"
                    addonBefore="£"
                    onBlur={handleExportPrice}
                    handleEnterKey={handleExportPrice}
                    className="mt-0 mb-0 w-100"
                    validateStatus={get(error, "export_price") && "error"}
                    helpText={get(error, "export_price") && "Export Pricing cannot be empty"}
                  />
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "wholesale_price", "")}
                    type="wholesale_price"
                    label="Wholesale M/Up"
                    addonBefore="£"
                    className="mt-0 mb-0 w-100"
                    disabled
                    validateStatus={get(error, "wholesale_price") && "error"}
                    helpText={get(error, "wholesale_price") && "Whole sale cannot be empty"}
                  />
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "duty", "")}
                    type="duty"
                    addonBefore="£"
                    className="mt-0 mb-0 w-100"
                    label="Duty"
                    disabled
                    validateStatus={get(error, "duty") && "error"}
                    helpText={get(error, "duty") && "Duty cannot be empty"}
                  />
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "uk_trade_price", "")}
                    className="mt-0 mb-0 w-100"
                    type="uk_trade_price"
                    addonBefore="£"
                    label="UK Trade Price"
                    disabled
                    validateStatus={get(error, "uk_trade_price") && "error"}
                    helpText={get(error, "uk_trade_price") && "UK Trade Price cannot be empty"}
                  />
                </Col>
                <Col sm={6} xs={12} md={6} lg={4}>
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "retail_price_case", "")}
                    className="mt-0 mb-0 w-100"
                    addonBefore="£"
                    type="retail_price_case"
                    label="Retail Price Case"
                    disabled
                    validateStatus={get(error, "retail_price_case") && "error"}
                    helpText={get(error, "retail_price_case") && "Retail Price Case cannot be empty"}
                  />
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "retail_price_case_incl_vat", "")}
                    className="mt-0 mb-0 w-100"
                    addonBefore="£"
                    type="retail_price_case_incl_vat"
                    label="Retail Price Case w VAT"
                    disabled
                    validateStatus={get(error, "retail_price_case_incl_vat") && "error"}
                    helpText={get(error, "retail_price_case_incl_vat") && "Retail Price Case VAT cannot be empty"}
                  />
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "retail_price_unit_incl_vat", "")}
                    className="mt-0 mb-0 w-100"
                    addonBefore="£"
                    type="retail_price_unit_incl_vat"
                    label="Retail Price Unit w VAT"
                    disabled
                    validateStatus={get(error, "retail_price_unit_incl_vat") && "error"}
                    helpText={get(error, "retail_price_unit_incl_vat") && "Retail Price Unit VAT cannot be empty"}
                  />
                  <InputNumberChange
                    handleChange={handleChange}
                    value={get(newCase, "offer_price", "")}
                    className="mt-0 mb-0 w-100"
                    addonBefore="£"
                    type="offer_price"
                    label="Offer Price"
                  />
                </Col>
              </Row>
              <Button
                type="primary"
                className="mt-1"
                disabled={!priceValidationStatus}
                icon={<ArrowRightOutlined />}
                onClick={() => handleNext(AddCasesTabs.Price)}
              >
                Next
              </Button>
            </TabPane>
            <TabPane tab={AddCasesTabs.Preview} disabled={!priceValidationStatus} key={AddCasesTabs.Preview}>
              <Preview addedCase={newCase} loading={get(props, "loading", false)} />
              <Button
                type="primary"
                className="mt-3"
                disabled={!priceValidationStatus}
                icon={<SaveOutlined />}
                onClick={() => handleNext(AddCasesTabs.Preview)}
              >
                Save
              </Button>
            </TabPane>
          </Tabs>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  state => ({
    loading: state.casedGoods.loading,
    error: state.casedGoods.error,
    taxonomyError: state.taxonomy.error,
    isTaxonomyDataLoading: state.taxonomy.loading,
    masterAllData: state.taxonomy.masterAllData,
    casedGoods: state.casedGoods.pricingParameters,
    casedGoodsTags: state.casedGoods.tags
  }),
  {
    getCasedGoodsTags,
    getPricingParameters,
    getTaxonomyData,
    updateAllTaxonomyData,
    addInventory,
    getCasedGoods
  }
)(AddCases);
