
const { alias } = require("react-app-rewire-alias");

module.exports = function override(config) {
  alias({
    "@components": "src/components",
    "@assets": "src/assets",
    "@store": "src/store",
    "@helpers": "src/helpers",
    "@pages": "src/components/Pages",
    "@middleware": "src/middleware",
    "@settings": "src/settings",
    "@config": "src/config",
    "@constants": "src/constants",
    "@ui-components": "src/components/UIComponents"
  })(config);

  return config;
};
