import React, { useCallback, useState, useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Heading from "@ui-components/Heading";
import { connect } from "react-redux";
import { CustomInputText as CustomTextInput, CustomInputNumber as CustomNumberInput } from "@ui-components/Input/customInput";
import { SaveOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { get, cloneDeep } from "lodash";
import { SingleSelect as Select } from "../../UIComponents/Select/singleSelect";
import { MultiSelect as MultiSelect } from "../../UIComponents/Select/multiSelect";
import axios from "axios";
import { getCookie } from "../../../helpers/cookieHelper";
import { acceptOnlyNumbers, acceptNumbersAndHyphen, validateForm, extractNOFromSTR } from "../../../helpers/utility";
import LocationMarker from "./locationMarker";
import { useHistory } from "react-router-dom";
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";

const newStoreObject = {
  name: "",
  adress_line_1: "",
  adress_line_2: "",
  postal_code: "",
  city_id: "",
  state_id: "",
  country_id: "",
  stl_category_id: "",
  phone_number: "",
  website: "",
  email_address: "",
  image_url: "",
  remark: "",
  lattitude: 42.15613343,
  longitude: -87.80298683,
  product_lines: ""
};

let headers = {
  "Accept": "application/json, text/plain, */*",
  "Content-Type": "application/json",
  "Authorization": "Bearer " + getCookie("access_token")
}
let BlackbullAxios = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
  headers: headers
})

const AddNewStore = () => {
  const history = useHistory();
  const [newStore, setNewStore] = useState(newStoreObject);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [productFilterList, setProductFilterList] = useState([]);
  const [errors, setErrors] = useState({})
  const [selectedData, setSelectedData] = useState({});
  const [isAdd, setIsAdd] = useState(true);
  const [mapType, setMapType] = useState("maps");

  const handleChange = useCallback((key, value) => {
    const newStoreLocation = { ...newStore };
    if (key === "phone_number" || key === "postal_code") {
      let val = acceptOnlyNumbers(value)
      newStoreLocation[key] = val;
    } else if (key === "lattitude" || key === "longitude") {
      let val = acceptNumbersAndHyphen(value)
      newStoreLocation[key] = val;
    } else {
      newStoreLocation[key] = value;
    }
    setNewStore(newStoreLocation)
  }, [newStore])

  const submitForm = async () => {
    let result = await validateForm(newStore, "adress_line_2")
    if (result === true) {
      if (isAdd) {
        addNewStore()
      } else {
        editStore()
      }
      setErrors({})
    } else {
      setErrors(result)
    }
  }

  const addNewStore = () => {
    let json = cloneDeep(newStore)
    BlackbullAxios.post("/api/store-locator", json)
      .then(res => {
        if (res.data && res.data?.data) {
          openNotificationWithIcon("success", "Store", "Added Successfully");
          setNewStore(newStoreObject)
          history.push("/view-stores");
        }
      })
      .catch(error => {
        console.log(error)
        openNotificationWithIcon("error", "Store", "Something Went Wrong");
      })
  }

  const editStore = () => {
    let json = cloneDeep(newStore)
    let id = json?.id
    delete json?.id
    delete json?.category
    delete json?.city_name
    delete json?.state_name
    delete json?.country_name
    BlackbullAxios.put(`/api/store-locator/${id}`, json)
      .then(res => {
        if (res.data && res.data?.data) {
          openNotificationWithIcon("success", "Store", "Updated Successfully");
          setNewStore(newStoreObject)
          history.push("/view-stores");
        }
      })
      .catch(error => {
        console.log(error)
        openNotificationWithIcon("error", "Store", "Something Went Wrong");
      })
  }

  const getCountryList = () => {
    let json = { page: "all" }
    BlackbullAxios.post("/api/country", json)
      .then(res => {
        if (res.data && res.data?.data) {
          setCountryList(res.data.data)
          setStateList([])
          setCityList([])
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  const getStateListByCountryId = (id) => {
    let json = { country_id: id, page: "all" }
    BlackbullAxios.post("/api/state", json)
      .then(res => {
        if (res.data && res.data?.data) {
          setStateList(res.data.data)
          setCityList([])
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  const getCityListByStateId = (id) => {
    let json = { state_id: id, page: "all" }
    BlackbullAxios.post("/api/city", json)
      .then(res => {
        if (res.data && res.data?.data) {
          setCityList(res.data.data)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  const getCategoryList = () => {
    BlackbullAxios.get("api/stl-category?page=all")
      .then(res => {
        if (res.data && res.data?.data) {
          setCategoryList(res.data.data)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  const getProductFilterList = () => {
    BlackbullAxios.get("api/stl-product-line?page=all")
      .then(res => {
        if (res.data && res.data?.data) {
          setProductFilterList(res.data.data)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  const handleSelectChange = (key, value) => {
    const newStoreLocation = { ...newStore };
    if (key === "country_id") {
      getStateListByCountryId(value)
      newStoreLocation["state_id"] = "";
      newStoreLocation["city_id"] = "";
    } else if (key === "state_id") {
      getCityListByStateId(value)
      newStoreLocation["city_id"] = "";
    }
    newStoreLocation[key] = value;
    setNewStore(newStoreLocation)
  }

  const callBackGetCoords = (json) => {
    const newStoreLocation = { ...newStore };
    newStoreLocation["lattitude"] = json?.lat;
    newStoreLocation["longitude"] = json?.lng;
    setNewStore(newStoreLocation)
  }

  useEffect(() => {
    if (history?.location && history?.location?.pathname) {
      let split = history?.location?.pathname.split("/")
      let id = parseInt(split[split.length - 1])
      if (!isNaN(id)) {
        BlackbullAxios.get(`/api/store-locator/${id}`)
          .then(res => {
            if (res.data && res.data?.data) {
              let data = cloneDeep(res.data.data)
              console.log("data", data)
              if (data?.country_id) {
                getStateListByCountryId(data.country_id)
              }
              if (data?.state_id) {
                getCityListByStateId(data.state_id)
              }
              let arr = []
              if (data?.product_lines?.length) {
                data?.product_lines.forEach(el => {
                  arr.push(el?.id)
                })
              }
              data["product_lines"] = arr
              setSelectedData(data)
              setNewStore(data)
              setIsAdd(false)
            }
          })
          .catch(error => {
            console.log(error)
            setSelectedData({})
            history.push("/view-stores");
          })
      }
    }
    getCountryList()
    getCategoryList()
    getProductFilterList()
  }, []);

  return (
    <div>
      <Heading text="Address Details" variant="h6" />
      <Row>
        <Col lg={3} md={6} sm={6} xs={12}>
          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "name", "")}
            validateStatus={errors?.name && "error"}
            helpText={errors?.name}
            type="name"
            className="mt-0 mb-0"
            label="Name"
          />

          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "adress_line_2", "")}
            validateStatus={errors?.adress_line_2 && "error"}
            helpText={errors?.adress_line_2}
            type="adress_line_2"
            className="mt-0 mb-0"
            label="Address Line 2"
          />
          {/* <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "state", "")}
            type="state"
            className="mt-0 mb-0"
            label="State / Province"
          /> */}
          <Select
            handleChange={(key, value) => handleSelectChange(key, value)}
            validateStatus={errors?.state_id && "error"}
            helpText={errors?.state_id}
            className="mt-0 mb-0"
            type="state_id"
            options={stateList?.length ? stateList.map(el => { return { value: el?.id, label: el?.state_name } }) : []}
            value={newStore?.state_id}
            label="State"
          />
          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "postal_code", "")}
            validateStatus={errors?.postal_code && "error"}
            helpText={errors?.postal_code}
            type="postal_code"
            className="mt-0 mb-0"
            label="Postal / Zip code"
          />
        </Col>
        <Col lg={3} md={6} sm={6} xs={12}>
          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "adress_line_1", "")}
            validateStatus={errors?.adress_line_1 && "error"}
            helpText={errors?.adress_line_1}
            type="adress_line_1"
            className="mt-0 mb-0"
            label="Address Line 1"
          />
          <Select
            handleChange={(key, value) => handleSelectChange(key, value)}
            validateStatus={errors?.country_id && "error"}
            helpText={errors?.country_id}
            className="mt-0 mb-0"
            type="country_id"
            options={countryList?.length ? countryList.map(el => { return { value: el?.id, label: el?.country_name } }) : []}
            value={newStore?.country_id}
            label="Country"
          />
          <Select
            handleChange={(key, value) => handleSelectChange(key, value)}
            validateStatus={errors?.city_id && "error"}
            helpText={errors?.city_id}
            className="mt-0 mb-0"
            type="city_id"
            options={cityList?.length ? cityList.map(el => { return { value: el?.id, label: el?.city_name } }) : []}
            value={newStore?.city_id}
            label="City"
          />
          {/* <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "country", "")}
            type="country"
            className="mt-0 mb-0"
            label="Country"
          />
          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "city", "")}
            type="city"
            className="mt-0 mb-0"
            label="City"
          /> */}
        </Col>
        <Col lg={6} md={12} sm={12} xs={12}>
          <div>
            <h6>Google Map here</h6>
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                Select Coordinates using
                <div className="d-flex align-items-center ml-3" onClick={() => setMapType("maps")}>
                  <input onChange={(e) => setMapType(e?.target?.value)} value="maps" type="radio" checked={mapType == "maps"} />
                  <label className="mb-0 ml-1" htmlFor="maps">Map</label>
                </div>
                <div className="d-flex align-items-center ml-3" onClick={() => setMapType("manually")}>
                  <input onChange={(e) => setMapType(e?.target?.value)} value="manually" type="radio" checked={mapType == "manually"} />
                  <label className="mb-0 ml-1" htmlFor="manually">Manually</label>
                </div>
              </div>
              <small><b>Map</b> - Using google maps , <b>Manually</b> - Using text fields</small>
              <LocationMarker
                draggableState={mapType === "maps" ? true : false}
                callBackGetCoords={callBackGetCoords}
                latlong={{ lat: parseFloat(newStore?.lattitude), lng: parseFloat(newStore?.longitude) }}
              />
            </div>
            <Row>
              <Col md={6}>
                <CustomTextInput
                  handleChange={handleChange}
                  value={get(newStore, "lattitude", "")}
                  validateStatus={errors?.lattitude && "error"}
                  helpText={errors?.lattitude}
                  disabled={mapType === "maps" ? true : false}
                  type="lattitude"
                  className="mt-0 mb-0 maps-input"
                  label="Lattitude"
                />
              </Col>
              <Col md={6}>
                <CustomTextInput
                  handleChange={handleChange}
                  value={get(newStore, "longitude", "")}
                  validateStatus={errors?.longitude && "error"}
                  helpText={errors?.longitude}
                  disabled={mapType === "maps" ? true : false}
                  type="longitude"
                  className="mt-0 mb-0 maps-input opacity-50"
                  label="Longitude"
                />
              </Col>
            </Row>
          </div>
          <Select
            handleChange={(key, value) => handleSelectChange(key, value)}
            validateStatus={errors?.stl_category_id && "error"}
            helpText={errors?.stl_category_id ? "Category is required" : ""}
            className="mt-2 mb-0"
            type="stl_category_id"
            options={categoryList?.length ? categoryList.map(el => { return { value: el?.id, label: el?.name } }) : []}
            value={newStore?.stl_category_id}
            label="Select Category"
          />
          <MultiSelect
            handleChange={(key, value) => handleSelectChange(key, value)}
            validateStatus={errors?.product_lines && "error"}
            helpText={errors?.product_lines ? "Product Filter is required" : ""}
            className="mt-2 mb-0"
            type="product_lines"
            options={productFilterList?.length ? productFilterList.map(el => { return { value: el?.id, label: el?.name } }) : []}
            value={newStore?.product_lines}
            label="Select Product Filters"
          />
        </Col>
      </Row>
      <Heading text="Store Details" variant="h6"></Heading>
      <Row>
        <Col sm={6} xs={12} md={8} lg={6}>
          <CustomTextInput
            handleChange={handleChange}
            validateStatus={errors?.phone_number && "error"}
            helpText={errors?.phone_number}
            value={get(newStore, "phone_number", "")}
            type="phone_number"
            className="mt-0 mb-0"
            label="Phone Number"
          />
          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "website", "")}
            validateStatus={errors?.website && "error"}
            helpText={errors?.website}
            type="website"
            className="mt-0 mb-0"
            label="Website"
          />
          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "email_address", "")}
            validateStatus={errors?.email_address && "error"}
            helpText={errors?.email_address}
            type="email_address"
            className="mt-0 mb-0"
            label="Email Address"
          />
          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "image_url", "")}
            validateStatus={errors?.image_url && "error"}
            helpText={errors?.image_url}
            type="image_url"
            className="mt-0 mb-0"
            label="Image / Logo Url"
          />
          <CustomTextInput
            handleChange={handleChange}
            value={get(newStore, "remark", "")}
            validateStatus={errors?.remark && "error"}
            helpText={errors?.remark}
            type="remark"
            className="mt-0 mb-0"
            label="Remarks"
          />
        </Col>
      </Row>
      <Button
        type="primary"
        className="mt-3"
        icon={<SaveOutlined />}
        onClick={() => submitForm()}
      >
        Save Location
      </Button>
    </div>
  );
}

export default AddNewStore;
