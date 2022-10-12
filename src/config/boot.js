import { get } from "lodash";
import TagManager from "react-gtm-module";
import { openNotificationWithIcon } from "../components/UIComponents/Toast/notification";
import { clearCookie, getCookie, setCookie } from "../helpers/cookieHelper";
import { defaultRequestKey } from "../settings";
import { userLogin } from "../store/Auth/auth.actions";
import { store } from "../store/rootStore";

const getRouteCheck = () => {
  if (get(location, "pathname") === "/confirmation-view") {
    return false;
  }
  if (get(location, "pathname") === "/proforma-view") {
    return false;
  }
  return true;
};
export default props =>
  new Promise(() => {
    const { name, email, history } = props;
    if (name && email) {
      store.dispatch(userLogin({ name, email, ...defaultRequestKey })).then(userDetails => {
        if (get(userDetails, "response.status")) {
          if (process.env.REACT_APP_ENV === "production") {
            TagManager.initialize({ gtmId: "GTM-T2V7KVL" });
            window.dataLayer.push({ event: "pageview" });
          }
          if (getCookie("access_token")) {
            clearCookie("access_token");
          }
          setCookie("access_token", get(userDetails, "response.data.access_token"));
          if (getRouteCheck()) {
            openNotificationWithIcon("success", name, `${get(userDetails, "response.message", "Login successful")} `);
          }
        }

        if (get(userDetails, "error", false)) {
          if (getRouteCheck()) {
            openNotificationWithIcon("error", name, `${get(userDetails, "error.message", "Something Went Wrong")} `);
          }
        }
      });
    }
  });
