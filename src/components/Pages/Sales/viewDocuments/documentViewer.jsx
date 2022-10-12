import React from "react";
import "./reviewDocument.scss";
import {get} from "lodash";

const DocumentViewer = props => {
  const html = props.htmlString;
  return (
    <div className="document-view" style={get(props, "style")}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
export default DocumentViewer;
