import { get } from "lodash";
import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Select from "react-select";


const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" }
];

export default class SingleSelect extends Component {

    handleChange = (newValue, actionMeta) => {
        this.props.handleChange(get(this.props, "label", ""), newValue.value);
    };

    handleInputChange = (inputValue, actionMeta) => {
        // eslint-disable-next-line no-console	
        console.log(inputValue);
    };

    render() {
        return (
            <>
                <Form.Label className="mt-3"><b>{get(this.props, "label", "")} : </b></Form.Label>
                <Select
                    isClearable
                    placeholder={`Select ${get(this.props, "label", "")}`}
                    onChange={this.handleChange}
                    onInputChange={this.handleInputChange}
                    options={options}
                />
            </>
        );
    };
};