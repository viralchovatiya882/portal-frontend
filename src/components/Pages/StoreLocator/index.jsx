import React from "react";
import Heading from "@ui-components/Heading";
import AddNewStore from "./addNewStore";

const StoreLocator = () => {
  return (
    <>
      <Heading text="Add New Store" variant="h4"/>
      <div className="bg-white p-4">
        <AddNewStore/>
      </div>
    </>
  );
}

export default StoreLocator;
