import { DatePicker, Form } from "antd";
import { get } from "lodash";
import moment from "moment";
import React from "react";

const dateFormat = "YYYY-MM-DD";

export const CustomDatePicker = props => {
  const onDateChange = (date, dateString) => {
    props.handleChange(get(props, "type", ""), dateString);
  };

  const disabledDate = current => {
    if (current) {
      if (get(props, "enableFutureDate", false)) {
        return current < moment("1960-01-01");
      }

      if (get(props, "enable7DaysFromCurrent", false)) {
        let prevDate = new Date();
        prevDate.setDate(new Date().getDate() - 1);

        let nextDate = new Date();
        nextDate.setDate(new Date().getDate() + 6);

        return current < moment(prevDate) || current > moment(nextDate);
      }

      if (get(props, "enableOnlyFutureDate", false)) {
        let yesterday = new Date();
        yesterday.setDate(new Date().getDate() - 1);
        return current < moment(yesterday);
      }

      return current > moment() || current < moment("1960-01-01");
    }
  };

  const getDefaultValue = () => {
    if (get(props, "defaultValue")) {
      return moment(get(props, "defaultValue"), dateFormat);
    }
    return null;
  };

  return (
    <Form layout="vertical">
      <Form.Item
        label={<span>{get(props, "label", "")} </span>}
        validateStatus={get(props, "validateStatus", "")}
        help={get(props, "helpText", "")}
        required={get(props, "required", false)}
        className={get(props, "className", "")}
        style={get(props, "style", {})}
      >
        <DatePicker
          value={get(props, "value") && moment(get(props, "value"), dateFormat)}
          disabledDate={disabledDate}
          defaultValue={getDefaultValue()}
          disabled={get(props, "disabled", false)}
          onChange={onDateChange}
          placeholder={`Select ${get(props, "placeholder", "Date (YYYY-MM-DD)")}`}
          format={dateFormat}
          className={get(props, "className", "")}
        />
      </Form.Item>
    </Form>
  );
};
