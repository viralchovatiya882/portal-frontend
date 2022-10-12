import { notification } from "antd";

/**
 * Notification function
 * @param
 */

export const openNotificationWithIcon = (type="info", message = "", description = "") => {
    notification[type]({ message, description });
};
