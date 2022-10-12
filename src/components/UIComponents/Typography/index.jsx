import { Typography } from 'antd';
import { get } from 'lodash-es';

const { Title, Text } = Typography;

export const CustomHeading = (props) => {
    return (
        <Title
            level={get(props, "level", 4)}
            type={get(props, "type", "")}
            onClick={handleTitleClick}
            editable={get(props, "editable", false)}
            copyable={get(props, "copyable", false)}
            underline={get(props, "underline", false)}
            italic={get(props, "italic", false)}
            ellipsis={get(props, "ellipsis", false)}
            disabled={get(props, "disabled", false)}
        >
            {props.children}
        </Title>
    );
};

export const CustomText = (props) => {
    return (
        <Text
            level={get(props, "level", 4)}
            type={get(props, "type", "")}
            onClick={handleTitleClick}
            editable={get(props, "editable", false)}
            copyable={get(props, "copyable", false)}
            underline={get(props, "underline", false)}
            strong={get(props, "strong", false)}
            italic={get(props, "italic", false)}
            ellipsis={get(props, "ellipsis", false)}
            disabled={get(props, "disabled", false)}
        >
            {props.children}
        </Text>
    );
};