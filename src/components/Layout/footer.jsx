import React from "react";
import Navbar from "react-bootstrap/Navbar";

/**
 * Renders the Footer
 */
export const Footer = () => {

  return (
    <>
      <div className="footer">
        <center dangerouslySetInnerHTML={{ "__html": "&copy; Duncan Taylor &middot; Company Registration No 36622" }} />
      </div>
    </>
  );
};
