import { SingleSelect as Select } from "@ui-components/Select/singleSelect";
import { message, Modal, Tag } from "antd";
import { get, round, toString } from "lodash";
import React from "react";
import { Col, Row } from "react-bootstrap";
import validator from "validator";
import Heading from "../../../UIComponents/Heading";
import { CustomInputNumber as InputNumberChange } from "../../../UIComponents/Input/customInput";

const EditCasesModal = props => {
  const [wholeCase, setWholeCase] = React.useState("");
  const [partCase, setPartCase] = React.useState(0);
  const [partCaseOption, setPartCaseOption] = React.useState([]);
  const [wholeCaseError, setWholeCaseError] = React.useState(false);

  React.useEffect(() => {
    const BPC = Number(get(props, "selectedSpiritValue.bpc", 0));
    if (BPC) {
      let partCaseOptionsArray = [];
      let i = 1;
      for (i = 1; i < BPC; i++) {
        partCaseOptionsArray.push({ label: `${i} / ${BPC}`, value: `${i}/${BPC}` });
      }
      if (partCaseOptionsArray.length === 0) {
        setPartCaseOption([]);
      } else {
        setPartCaseOption([...partCaseOptionsArray]);
      }
    }
    setWholeCase(get(props, "selectedSpiritValue.whole_case", 0));

    if (get(props, "selectedSpiritValue.bottles_in_partial_case", 0) > 0) {
      setPartCase(`${get(props, "selectedSpiritValue.bottles_in_partial_case", 0)}/${get(props, "selectedSpiritValue.bpc", 0)}`);
    } else {
      setPartCase("");
    }
  }, [props]);

  const handleChange = React.useCallback((name, func, value) => {
    const checkValue = value || value === 0 ? value.toString() : "";

    if (name === "whole_Case") {
      if (!validator.isEmpty(toString(checkValue))) {
        setWholeCaseError(false);
      }
      value = value || value === 0 ? Math.trunc(Number(value)) : "";
    }

    func(value);
  });

  const handleSave = () => {
    const chargeObj = { whole_case: wholeCase, bottles_in_partial_case: partCase };

    if (validator.isEmpty(wholeCase.toString())) {
      setWholeCaseError("Whole Cases cannot be empty");
      return false;
    }

    if (!wholeCase & (Number(wholeCase) !== 0)) {
      setWholeCaseError("Whole Cases cannot be empty");
      return false;
    }

    if (partCase !== 0) {
      chargeObj["bottles_in_partial_case"] = parseInt(getPartCaseValue());
    }

    chargeObj["quantity"] = Number(wholeCase) + getRevisedPartialCases();
    
    if (getRevisedBottles() <= 0) {
      message.info("Revised bottles should be greater than 0");
      return false;
    }

    const data = {
      chargeObj,
      item: get(props, "selectedSpiritValue", "")
    };

    props.handleAddEditQuantity(data);
    closeModal();
  };

  const closeModal = () => {
    setWholeCase("");
    setWholeCaseError(false);
    setPartCase(0);
    props.closeModal();
  };

  const getPartCaseValue = () => {
    const splitValue = partCase.split("/");
    return splitValue ? Number(splitValue[0]) : 0;
  };

  const getRevisedPartialCases = () => {
    const partCaseValue = partCase.split("/");
    const BPC = get(props, "selectedSpiritValue.bpc", 0);
    return round(Number(partCaseValue[0]) / Number(BPC), 2);
  };

  const getRevisedBottles = () => {
    return Number(get(props, "selectedSpiritValue.bpc", 0)) * Number(wholeCase) + getPartCaseValue();
  };

  const currentBottles =
    get(props, "selectedSpiritValue.whole_case", 0) * get(props, "selectedSpiritValue.bpc", 0) +
    get(props, "selectedSpiritValue.bottles_in_partial_case", 0);

  return (
    <>
      <Modal
        title="Edit Quantity"
        centered
        visible={get(props, "isOpen", false)}
        onOk={() => handleSave()}
        okText="Save"
        onCancel={() => closeModal()}
      >
        <>
          <Heading text="Current Order Quantity " variant="h4" className="text-black mt-0" style={{ fontSize: "15px" }} />
          <div className="d-flex flex-wrap edit-quantity-cases">
            <div className="mb-2 pr-2">
              Added Cases <Tag color="blue">{get(props, "selectedSpiritValue.quantity", 0)}</Tag>
            </div>
            <div className="mb-2 pr-2">
              BPC <Tag color="blue">{get(props, "selectedSpiritValue.bpc", 0)}</Tag>
            </div>
            {currentBottles ? (
              <div className="mb-2 pr-2">
                Added Bottles <Tag color="blue">{currentBottles}</Tag>
              </div>
            ) : (
              <></>
            )}
          </div>
          <Heading text="Enter Revised Order Quantity " variant="h4" className=" text-black-edit-quantity mt-3" style={{ fontSize: "15px" }} />
          <Row>
            <Col xs={12} sm={6}>
              <InputNumberChange
                value={wholeCase}
                required
                className="w-100 mb-0"
                validateStatus={wholeCaseError && "error"}
                helpText={wholeCaseError && "Whole Cases cannot be empty"}
                handleChange={(key, value) => handleChange("whole_Case", setWholeCase, value)}
                label="Whole Cases"
              />
            </Col>
            <Col xs={12} sm={6}>
              <Select
                handleChange={(key, value) => handleChange("bottles_in_partial_case", setPartCase, value)}
                type="bottles_in_partial_case"
                label="Part Cases"
                className="w-100 mb-0 edit-quantity-input-field"
                placeholder="Select part case value"
                value={partCase}
                disabled={get(props, "selectedSpiritValue.bpc", 0) < 2}
                options={partCaseOption}
              />
            </Col>
          </Row>

          {wholeCase || wholeCase === 0 ? (
            <div className="d-flex flex-wrap">
              <div className="mb-2 mr-1 text-small">
                <span>Revised Cases</span> <Tag color="blue"> {Number(wholeCase) + getRevisedPartialCases()} </Tag>
              </div>
              {get(props, "selectedSpiritValue.bpc", 0) && (
                <div className="mb-2 text-small">
                  <span>Revised Bottles</span> <Tag color="blue"> {getRevisedBottles()} </Tag>
                </div>
              )}
            </div>
          ) : (
            <></>
          )}
        </>
      </Modal>
    </>
  );
};
export default EditCasesModal;
