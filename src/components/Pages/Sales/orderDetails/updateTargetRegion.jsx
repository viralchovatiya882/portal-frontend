import { getRequestHeader } from "@helpers/service";
import { getKeyValuePair } from "@helpers/utility";
import { defaultRequestOptions } from "@settings";
import { getCountryList } from "@store/SalesOrder/sale.actions";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { Form, Modal, Select as TagsSelect, Spin, Tag } from "antd";
import axios from "axios";
import { get } from "lodash";
import React from "react";
import { useDispatch } from "react-redux";

const UpdateTargetRegion = (props) => {
  const [loader, setLoader] = React.useState(false);
  const [targetRegion, setTargetRegion] = React.useState(get(props, "record.target_region", ""));
  const [countryList, setCountryList] = React.useState([]);
  const dispatch = useDispatch();

  const updateTargetRegionLog = async () => {
    const rest = await axios({
      method: "POST",
      data: {
        sales_order_id: get(props, "record.sales_order_id"),
        target_region: targetRegion,
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_target_region`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      setLoader(false);
      openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      setLoader(false);
      closeModal();
      openNotificationWithIcon("success", get(rest, "data.message", "Target Region Updated"));
      props.refetchSalesOrderData();
    }

    if (!get(rest, "data.status", true)) {
      setLoader(false);
      openNotificationWithIcon("error", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  React.useEffect(() => {
    getCountryListFunc();
  }, []);

  const handleSave = () => {
    updateTargetRegionLog();
  };

  const closeModal = () => {
    props.handleClose();
  };

  const getCountryListFunc = async () => {
    const requestOptions = {
      ...defaultRequestOptions,
      page: "all",
    };
    const countryListResp = await dispatch(getCountryList(requestOptions));
    setCountryList(get(countryListResp, "response.data"));
    return get(countryListResp, "response.data");
  };

  return (
    <Spin spinning={loader}>
      <Modal
        title={get(props, "title", "Update Target Region")}
        centered
        width={500}
        maskClosable={false}
        visible={get(props, "isOpen", false)}
        onOk={() => {
          setLoader(true);
          handleSave();
        }}
        okText={get(props, "okText", "Update")}
        onCancel={() => closeModal()}
        className="convert_customer__order_details"
      >
        <>
          <Form layout="vertical">
            <Form.Item label="Target Region">
              <TagsSelect
                mode="multiple"
                value={targetRegion ? targetRegion.split(",") : []}
                showArrow
                tagRender={tagRender}
                onChange={(val) => setTargetRegion(val.join(","))}
                onDropdownVisibleChange={() => {
                  if (countryList.length === 0) {
                    getCountryListFunc();
                  }
                }}
                style={{
                  width: "100%",
                }}
                options={getKeyValuePair(countryList, "country_name", false)}
                placeholder="Select Target Region"
              />
            </Form.Item>
          </Form>
        </>
      </Modal>
    </Spin>
  );
};

const tagRender = (props) => {
  const { label, value, closable, onClose } = props;

  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Tag
      color="processing"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{
        marginRight: 3,
      }}
    >
      {label}
    </Tag>
  );
};

export default UpdateTargetRegion;
