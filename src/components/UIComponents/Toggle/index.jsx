import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Switch } from "antd";
import { get } from "lodash";

const Toggle = (props) => {

    const onChange = (checked) => {
        props.onToggleChange(checked);
    };

    return (
        <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked={get(props, "defaultChecked", false)}
            onChange={onChange}
        />
    );
};

export default Toggle;



