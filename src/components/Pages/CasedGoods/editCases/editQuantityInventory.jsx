import { CustomInputText as InputChange, CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import RadioButton from "@ui-components/Radio";
import { get } from "lodash";
import React from "react";
import { YesOrNoValues } from "../utility/constants";
import EditRotationNumber from "./editRotationNumber";

const EditQuantityInventory = (props) => {
  const [partCaseOptionsList, setPartCaseOptionsList] = React.useState([]);
  const [quantityValue, updateQuantityValue] = React.useState(undefined);

  const handlePartCaseOptions = (BPC) => {
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

  React.useEffect(() => {
    handlePartCaseOptions(get(props, "record.bpc", 0));
  }, [props.record.bpc]);

  return (
    <>
      <div className="mt-3 mb-3">
        <EditRotationNumber
          record={get(props, "record", {})}
          partCaseOptions={partCaseOptionsList}
          quantityState={(val) => updateQuantityValue(val)}
          updateSaveDisabled={(val) => props.updateSaveDisabled(val)}
          updateRotationNumber={props.updateRotationNumber}
        />
      </div>
      {!quantityValue ? (
        <>
          <RadioButton
            name="isSalesProcessIdAvailable"
            handleChange={props.handleCheck}
            value={get(props, "isSalesProcessIdAvailable", false)}
            className="mt-0 mb-2"
            type="salesProcessId"
            options={YesOrNoValues}
            label="Do you have an associated Sales Order ID ?"
          />
          <InputChange
            handleChange={(key, value) => props.handleChange("sales_order_id", props.setOrderId, value)}
            className="mt-0 mb-2 w-50"
            required
            disabled={!get(props, "isSalesProcessIdAvailable")}
            validateStatus={get(props, "salesProcessIdError") && "error"}
            helpText={get(props, "salesProcessIdError") && "Sales Order Id Cannot be Empty"}
            type="sales_order_id"
            value={get(props, "sales_order_id")}
            label="Sales Order Id"
          />
        </>
      ) : (
        <>
          <RadioButton
            name="isBottlingProcessIdAvailable"
            handleChange={props.handleCheck}
            value={get(props, "isBottlingProcessIdAvailable", false)}
            className="mt-0 mb-2"
            type="bottlingProcessId"
            options={YesOrNoValues}
            label="Do you have an associated Bottling Process ID ?"
          />
          <InputChange
            handleChange={(key, value) => props.handleChange("bottling_pid", props.setProcessId, value)}
            type="orderId"
            required
            disabled={!get(props, "isBottlingProcessIdAvailable")}
            validateStatus={get(props, "bottlingProcessIdError") && "error"}
            helpText={get(props, "bottlingProcessIdError") && "Bottling Process Id Cannot be Empty"}
            className="mt-0 mb-2 w-50"
            value={get(props, "bottling_pid")}
            label="Bottling Process Id"
          />
        </>
      )}
      <InputTextArea
        handleChange={(key, value) => props.handleChange("comments", props.setComments, value)}
        className="mt-0 mb-0"
        type="comments"
        value={get(props, "comments")}
        label="Reason"
        required
        validateStatus={get(props, "commentsError") && "error"}
        helpText={get(props, "commentsError") && "Reason cannot be empty"}
      />
    </>
  );
};

export default EditQuantityInventory;
