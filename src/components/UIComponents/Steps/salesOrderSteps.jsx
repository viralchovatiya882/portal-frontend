import { CheckOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { isMobileOrTab } from "@constants";
import { getScreenSize } from "@helpers/utility";
import { Button, Steps } from "antd";
import { get } from "lodash";
import React from "react";
import "./index.scss";

const { Step } = Steps;

/**
 * Renders Progress Steps component
 */
const CustomStepsProgress = (props) => {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (props.setToInitial) {
      setCurrent(0);
    }
  }, [props]);

  const next = () => {
    props.handleNext();
  };

  const prev = () => {
    props.handlePrev();
  };

  const handleSubmit = () => {
    props.onSubmit();
  };

  const onChange = (current) => {
    if (get(props, "current") > current) {
      props.handlePrev();
    } else {
      props.handleNext();
    }
  };

  const StepsTabs = get(props, "data", []);

  return (
    <>
      <Steps
        current={props.current}
        // type="navigation"
        progressDot={getScreenSize() < isMobileOrTab}
        onChange={onChange}
        size="small"
        className="site-navigation-steps"
      >
        {StepsTabs.map((item, index) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{get(StepsTabs, `${[props.current]}.content`, "")}</div>
      <div className="steps-action">
        {props.current > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()} icon={<LeftOutlined />}>
            Previous
          </Button>
        )}
        {props.current < StepsTabs.length - 1 && (
          <Button type="primary" onClick={() => next()} disabled={get(props, "nextDisableStatus", false)}>
            Next <RightOutlined />
          </Button>
        )}
        {props.current === StepsTabs.length - 1 && (
          <Button type="primary" onClick={() => handleSubmit()} icon={<CheckOutlined />}>
            Submit
          </Button>
        )}
      </div>
    </>
  );
};

export default CustomStepsProgress;
