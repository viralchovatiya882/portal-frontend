import { SearchOutlined } from "@ant-design/icons";
import { AutoComplete } from "antd";
import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

const renderTitle = (title, url) => {
    return (<Link to={url} className="text-decoration-none text-black-50">{title}</Link>);
};

const options = [
    {
        label: renderTitle("User Management", "/users"),
        value: "users",
    },
    {
        label: renderTitle("View Inventory", "/view-inventory"),
        value: "view-inventory",
    },
    {
        label: renderTitle("Taxonomy", "/taxonomy"),
        value: "taxonomy",
    },
    {
        label: renderTitle("Change Logs", "/cases-change-log"),
        value: "cases-change-log",
    },
    {
        label: renderTitle("Add Cases", "/add-cases"),
        value: "add-cases",
    },
];


const AutoCompleteSelect = (props) => {
    const [value, setValue] = React.useState("");
    const { history } = props;

    const onChange = (data) => {
        setValue(data);
    };

    return (
        <div className="position-relative d-flex align-items-center invisible">
            <SearchOutlined className="ml-2" style={{ color: "gray", fontSize: "20px" }} />
            <AutoComplete
                style={{
                    width: 300
                }}
                value={value}
                options={options}
                bordered={false}
                allowClear
                onChange={onChange}
                onSelect={(value, option) => {
                    setValue("");
                    history.push(`/${value}`);
                }}
                placeholder="Type to Search"
                filterOption={(inputValue, option) =>
                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
            />
        </div>
    );
};

export default withRouter(AutoCompleteSelect);