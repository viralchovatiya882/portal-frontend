import { Popconfirm } from "antd";
import { get } from "lodash-es";

const PopConfirm = (props) => {
    return (
        <Popconfirm
            placement="topRight"
            title={get(props, "title", "")}
            onConfirm={props.confirm}
            okText={get(props, "okText", "Ok")}
            cancelText={get(props, "cancelText", "Cancel")}
        >
            <Button>LB</Button>
        </Popconfirm>
    );
};

export default PopConfirm;