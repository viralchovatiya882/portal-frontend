import { Modal } from "antd";
import { get, has } from "lodash";

const info = (props) => {
    Modal.info({
        closable: true,
        title: get(props, "title", ""),
        centered: true,
        content: get(props, "message", ""),
        width: get(props, "width", ""),
        onOk() {
            if (has(props, "confirm")) {
                props.confirm();
            }
        },
    });
};

const success = (props) => {
    Modal.success({
        closable: true,
        centered: true,
        title: get(props, "title", ""),
        content: get(props, "message", "")
    });
};

const error = (props) => {
    Modal.error({
        closable: true,
        centered: true,
        title: get(props, "title", ""),
        content: get(props, "message", "")
    });
};

const warning = (props) => {
    Modal.warning({
        closable: true,
        centered: true,
        title: get(props, "title", ""),
        content: get(props, "message", "")
    });
};

export { info, success, error, warning };

