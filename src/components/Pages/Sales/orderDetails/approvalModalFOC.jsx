import { getRequestHeader } from "@helpers/service";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { Modal, Spin, Table } from "antd";
import axios from "axios";
import { get } from "lodash";
import React from "react";
import { useDispatch } from "react-redux";

const ApproveFOCModal = (props) => {
  const [loader, setLoader] = React.useState(false);
  const dispatch = useDispatch();

  const updateApproveFOCOrderItems = async () => {
    const rest = await axios({
      method: "POST",
      data: {
        sales_order_id: get(props, "sales_order_id", ""),
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/approve_free_items`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      setLoader(false);
      openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      setLoader(false);
      closeModal();
      openNotificationWithIcon("success", get(rest, "data.message", "Free Items Approved"));
      props.refetchSalesOrderData();
    }

    if (!get(rest, "data.status", true)) {
      setLoader(false);
      openNotificationWithIcon("error", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  const handleSave = () => {
    updateApproveFOCOrderItems();
  };

  const closeModal = () => {
    props.handleClose();
  };

  const columns = [
    {
      title: "Cased Goods Id",
      dataIndex: "cased_goods_id",
      ellipsis: true,
      render: (text, record) => {
        return text ? text : "---";
      },
    },
    {
      title: "Brand",
      dataIndex: "brand",
      ellipsis: true,
      render: (text, record) => {
        return text ? text : "---";
      },
    },
    {
      title: "Distillery",
      dataIndex: "distillery",
      ellipsis: true,
      render: (text, record) => {
        return text ? text : "---";
      },
    },
    {
      title: "Year",
      dataIndex: "year",
      ellipsis: true,
      render: (text, record) => {
        return text ? text : "---";
      },
    },
    {
      title: "ABV",
      dataIndex: "abv",
      ellipsis: true,
      render: (text, record) => {
        return text ? text : "---";
      },
    },
    {
      title: "BPC",
      dataIndex: "bpc",
      ellipsis: true,
      render: (text, record) => {
        return text ? text : "---";
      },
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      ellipsis: true,
      render: (text, record) => {
        return text ? text : "---";
      },
    },
  ];

  const data = get(props, "items", []);

  return (
    <Spin spinning={loader}>
      <Modal
        title={get(props, "title", "Approve FOC Items")}
        centered
        width={900}
        maskClosable={false}
        visible={get(props, "isOpen", false)}
        onOk={() => {
          setLoader(true);
          handleSave();
        }}
        okText={get(props, "okText", "Approve")}
        onCancel={() => closeModal()}
        className="convert_customer__order_details"
      >
        <>
          <Table
            columns={columns}
            dataSource={data}
            scroll={{  y: 200 }}
            pagination={{
              position: ["none", "none"],
            }}
          />
          <p className="mt-4">Once approved, the feature to send Proforma Doc and converting the reservation to Sales Order will be enabled for the Sales Associate.</p>
          <p>
            <b>You will still be able to add more Free of Charge Items to the order or edit the current ones after this approval.</b>
          </p>
        </>
      </Modal>
    </Spin>
  );
};

export default ApproveFOCModal;
