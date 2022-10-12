import { Modal, Tag } from "antd";
import { get, round, toString } from "lodash";
import React, { useEffect, useState } from "react";
import validator from "validator";
import { decimalWithTwoPointsCheck } from "../../../../helpers/utility";
import { CustomInputNumber as InputNumberChange, CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";

const AddAdditionalCharges = props => {
  const [item, setItem] = useState("");
  const [cost_per_unit, setCostPerUnit] = useState("");
  const [unit, setUnit] = useState("");
  const [isChanged, setIsChanged] = useState(false);

  const [itemError, setItemError] = useState(false);
  const [costPerUnitError, setCostPerUnitError] = useState(false);
  const [unitError, setUnitError] = useState(false);
  const [totalValue, setTotalValue] = useState(0.0);

  useEffect(() => {
    if (cost_per_unit && unit) {
      const total = round(cost_per_unit * unit, 2);
      setTotalValue(total);
    } else {
      setTotalValue(0);
    }
  }, [cost_per_unit, unit]);

  useEffect(() => {
    setItem(get(props, "selectedRecord.item", ""));
    setCostPerUnit(toString(get(props, "selectedRecord.cost_per_unit", "")));
    setUnit(toString(get(props, "selectedRecord.unit", "")));
    setTotalValue(get(props, "selectedRecord.total_cost", ""));
  }, [props.selectedRecord]);

  const handleChange = React.useCallback((name, func, value) => {
    const checkValue = value ? value.toString() : "";
    if (name === "item" && !validator.isEmpty(checkValue)) {
      setItemError(false);
    }

    if (name === "cost_per_unit") {
      if (!validator.isEmpty(checkValue)) {
        setCostPerUnitError(false);
      }
      if (!decimalWithTwoPointsCheck(Number(checkValue))) {
        setCostPerUnitError(true);
      }
    }

    if (name === "unit") {
      if (!validator.isEmpty(checkValue) || !validator.isInt(checkValue)) {
        setUnitError(false);
      }
      value = value ? Math.trunc(value) : value;
    }

    setIsChanged(true);
    func(value);
  });

  const getCostPerUnitErrorValidationText = () => {
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

  const handleSave = () => {
    let chargeObj = { item, cost_per_unit, unit, total_cost: totalValue, action: get(props, "actionType", "add") };

    if (!item || validator.isEmpty(item)) {
      setItemError(true);
      return false;
    }

    if (!cost_per_unit || validator.isEmpty(cost_per_unit.toString()) || isNaN(Number(cost_per_unit))) {
      setCostPerUnitError(true);
      return false;
    }

    if (!decimalWithTwoPointsCheck(Number(cost_per_unit))) {
      setCostPerUnitError(true);
      return false;
    }

    if (!unit || validator.isEmpty(unit.toString()) || isNaN(Number(unit)) || !validator.isInt(unit.toString())) {
      setUnitError(true);
      return false;
    }

    if (unit === 0) {
      setUnitError(true);
      return false;
    }

    if (get(chargeObj, "action") === "update") {
      chargeObj["id"] = get(props, "selectedRecord.id", "");
    }

    props.handleSubmit(chargeObj, isChanged);
    closeModal();
  };

  const closeModal = () => {
    setItem("");
    setCostPerUnit("");
    setUnit("");
    setTotalValue(0.0);
    props.handleClose();
  };

  const getConditionCheck = () => {
    if (cost_per_unit && unit) {
      return true;
    }
    return false;
  };

  return (
    <>
      <Modal
        title={get(props, "title", "Add Additional Charges")}
        centered
        visible={get(props, "isOpen", false)}
        onOk={() => handleSave()}
        okText={get(props, "okText", "Add")}
        onCancel={() => closeModal()}
        className="user_management__edit_user"
      >
        <>
          <InputChange
            value={item}
            type="item"
            required
            className="mt-0"
            validateStatus={itemError && "error"}
            helpText={itemError && "Item cannot be empty"}
            handleChange={(key, value) => handleChange("item", setItem, value)}
            label="Item"
          />
          <InputNumberChange
            value={cost_per_unit}
            required
            type="cost_per_unit"
            className="mt-0 mb-0 w-100"
            validateStatus={costPerUnitError && "error"}
            helpText={getCostPerUnitErrorValidationText()}
            handleChange={(key, value) => handleChange("cost_per_unit", setCostPerUnit, value)}
            label="Cost per unit (&#163;)"
            prefix={<span>&#163; </span>}
          />
          <InputNumberChange
            value={unit}
            type="unit"
            required
            className="mt-0 mb-0 w-100"
            validateStatus={unitError && "error"}
            helpText={getUnitErrorValidationText()}
            handleChange={(key, value) => handleChange("unit", setUnit, value)}
            label="Unit"
          />
          {getConditionCheck() ? (
            <div className="mt-2">
              Total Cost: &#163; <Tag color="blue">{totalValue}</Tag>
            </div>
          ) : (
            <></>
          )}
        </>
      </Modal>
    </>
  );
};

export default AddAdditionalCharges;
