import { capitalizeAllLetter } from "@helpers/utility";
import { get } from "lodash";
import React from "react";

/**
 * Renders Heading / Title component
 * @params
 */
const Heading = props => {
  const HeadingElement = get(props, "variant", "h4");
  const headingText = get(props, "text", "");
  const headingColor = get(props, "color", "");
  const secondaryText = get(props, "secondaryText", "");
  const customText = get(props, "customText", "");
  const style = {
    ...props.style,
    color: headingColor
  };

  return (
    <>
      <HeadingElement
        style={style}
        className={` ${get(props, "className", "")} text-left mb-3 app_heading d-flex justify-content-between align-items-center`}
      >
        <span> {headingText} </span>
        <span className="float-right" style={{ fontSize: "14px" }}>
          {secondaryText}
          {customText && (
            <>
              : <b>{capitalizeAllLetter(customText.replace(/_/g, " "))}</b>
            </>
          )}
        </span>
      </HeadingElement>
    </>
  );
};

export default Heading;
