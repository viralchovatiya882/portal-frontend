import React from "react";

const rtl = document.getElementsByTagName("body")[0].getAttribute("dir");
const withDirection = Component => props => {
    return <Component {...props} data-rtl={rtl} />;
};

withDirection.displayName = "withDirection";

export default withDirection;
export { rtl };
