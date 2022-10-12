import { Input } from "antd";
import { get } from "lodash";
import React from "react";

const { Search } = Input;

/**
 * Global level search component
 * @param
 * @returns searched values 
 */
export const SearchInput = (props) => {
    const [value, setValue] = React.useState("");

    React.useEffect(() => {
        if (props.clearSearchString) {
            setValue("");
        }
    }, [props]);

    const onChange = (e) => {
        setValue(e.target.value);
    };

    const onSearch = searchString => {
        let filteredData = [];
        const isClient = get(props, "isClient", true);
        if (isClient) {
            filteredData = get(props, "data", []).filter((obj) =>
                Object.values(obj).some((val) => {
                    const valueString = val ? val.toString() : "";
                    return valueString.toLowerCase().includes(searchString.toLowerCase());
                }),
            );
        }
        const returnSearchValues = { searchString, filteredData, isClient };
        props.handleSearch(returnSearchValues);
    };

    return (
        <Search
            placeholder={`${get(props, "label", "Type to search")}`}
            allowClear
            enterButton
            value={value}
            onChange={onChange}
            onSearch={onSearch}
            style={{ maxWidth: 400 }}
        />
    );
};