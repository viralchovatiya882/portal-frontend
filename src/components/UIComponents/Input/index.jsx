import { get } from "lodash";
import React from "react";
import Form from "react-bootstrap/Form";

export const InputChange = (props) => {
    return (
        <>
            <Form.Label className="mt-3"><b>{get(props, "label", "")} :</b></Form.Label>
            <Form.Control
                size="sm"
                type="text"
                placeholder={`Enter ${get(props, "label", "")}`}
                onChange={(e) => props.handleChange(get(props, "label", ""), e.target.value)}
            />
        </>
    );
};

export const InputTextArea = (props) => {
    return (
        <>
            <Form.Label className="mt-3"><b>{get(props, "label", "")} : </b></Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
                onChange={(e) => props.handleChange(get(props, "label", ""), e.target.value)}
            />
        </>
    );
};