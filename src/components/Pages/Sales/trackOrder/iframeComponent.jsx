import React from "react";

const AmazonFrame = ({ src, width, height }) => (
  <iframe src={src} width={width} height={height} scrolling="no"></iframe>
);
export default AmazonFrame;