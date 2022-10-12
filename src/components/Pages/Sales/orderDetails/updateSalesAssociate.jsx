import { getKeyValuePair } from "@helpers/utility";
import { getSalesAssociateList } from "@store/SalesOrder/sale.actions";
import { SingleSelect as Select } from "@ui-components/Select/singleSelect";
import { Modal } from "antd";
import { get, find } from "lodash";
import React from "react";
import { useDispatch } from "react-redux";

const UpdateSalesAssociate = props => {
  const [sales_associate, setSalesAssociate] = React.useState(get(props, "record.sales_associate", ""));
  const [salesMemberList, setSalesMemberList] = React.useState([]);
  const dispatch = useDispatch();

  const fetchSalesMemberList = async requestOptions => {
    const salesMemberList = await dispatch(getSalesAssociateList(requestOptions));
    setSalesMemberList(get(salesMemberList, "response.data", []));
    setSalesAssociate(get(getUserObj(get(salesMemberList, "response.data", []), get(props, "record.sales_associate", "")), "name", ""));
    return get(salesMemberList, "response.data");
  };

  const getUserObj = (data, user_email) => {
    const findSelectedKeyObj = find(data, function (o) {
      return get(o, "email") === user_email;
    });

    return findSelectedKeyObj;
  };

  React.useEffect(() => {
    fetchSalesMemberList();
  }, []);

  const handleChange = (key, value) => {
    setSalesAssociate(value);
  };

  const handleSave = () => {
    if (sales_associate) {
      const findSelectedKeyObj = find(salesMemberList, function (o) {
        return get(o, "name") === sales_associate;
      });
      props.handleSubmit(get(findSelectedKeyObj, "email"));
      // closeModal();
    }
  };

  const closeModal = () => {
    props.handleClose();
  };

  return (
    <>
      <Modal
        title={get(props, "title", "Update Sales Associate")}
        centered
        width={500}
        visible={get(props, "isOpen", false)}
        okButtonProps={{
          disabled: sales_associate && sales_associate !== get(props, "record.sales_associate") ? false : true
        }}
        onOk={() => handleSave()}
        okText={get(props, "okText", "Update")}
        onCancel={() => closeModal()}
        className="convert_customer__order_details"
      >
        <>
          <Select
            handleChange={(key, value) => handleChange(key, value)}
            value={sales_associate}
            type="sales_associate"
            label="Sales Associate"
            placeholder="Select Sales Associate"
            maxLength={100}
            loading={false}
            options={getKeyValuePair(salesMemberList, "name")}
            className="mt-0 mb-0"
          />
        </>
      </Modal>
    </>
  );
};

export default UpdateSalesAssociate;
