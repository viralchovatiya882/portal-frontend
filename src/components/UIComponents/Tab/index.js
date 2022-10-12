import React from "react";
import "./style.scss";

const Tabs = ({ clickHandler, data, selected }) => {
  return (
    <div className="tab-container">
      {data.map((value) =>
        selected === value ? (
          <div className="tabs-active" onClick={() => clickHandler(value)}>
            <a>{value}</a>
          </div>
        ) : (
          <div className="tabs-default" onClick={() => clickHandler(value)}>
            <a>{value}</a>
          </div>
        )
      )}
    </div>
  );
};

export default Tabs;
