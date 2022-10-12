import React from "react";
import { Modal, Button } from "antd";
import { CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";
import "./addNewCustomer.scss";
import { isEmpty } from "lodash";

class AddNewCustomer extends React.Component {
  state = {
    loading: false,
    visible: false,
    nameError: "",
    name: "",
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, visible: false });
    }, 3000);
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };
  handleChange = (key, value) => {
    this.setState({
      name: value,
      nameError: "",
    });
  };
  handleCreateCustomer = () => {
    const obj = {
      name: this.state.name,
    };
    if (this.state.name) {
      this.props.addCustomerFunc(obj);
      this.setState({
        name: "",
        nameError: "",
      });
    } else {
      this.setState({ nameError: "Please Enter Name" });
    }
  };

  render() {
    const { visible, setModalOpen, addNewCustomerRes } = this.props;
    return (
      <>
        <Modal
          visible={visible}
          title="Add New Customer"
          onOk={() => setModalOpen(false)}
          onCancel={() => {
            this.setState({ nameError: "" });
            setModalOpen(false);
          }}
          footer={[
            !isEmpty(addNewCustomerRes) && addNewCustomerRes.status && (
              <div className="customer-footer-text">
                <p>Your Id has been generated successfully</p>
                <Button type="link" onClick={() => setModalOpen(false)}>
                  Click here to Continue.
                </Button>
              </div>
            ),
          ]}
        >
          <div className="sales-order-modal">
            <div>
              <InputChange
                handleChange={this.handleChange}
                value={this.state.name}
                type="name"
                className="mt-0 mb-0 w-100"
                label="Customer Entity Name"
              />
              {!isEmpty(addNewCustomerRes) && !addNewCustomerRes.status && (
                <div className="add_new-customer-error">
                  <span>Error!</span>
                  <span> This name already exists. Please try another name.</span>
                </div>
              )}
              {this.state.nameError && (
                <div className="add_new-customer-error">
                  <span>Error!</span>
                  <span>{this.state.nameError} </span>
                </div>
              )}
            </div>
            <div className="customer-footer-button">
              <Button type="text" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="primary" onClick={this.handleCreateCustomer}>
                GENERATE CUSTOMER ID
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default AddNewCustomer;
