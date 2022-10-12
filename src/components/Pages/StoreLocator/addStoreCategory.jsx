import { Modal } from "antd";
import { get } from "lodash";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import validator from "validator";
import { slugify, validateForm } from "../../../helpers/utility";
import { CustomInputText as InputChange } from "../../UIComponents/Input/customInput";

const AddStoreCategory = (props) => {
    const { page, showModal, closeModal, isAdd, selectedData, submitCallBack } = props
    const form = {
        name: "",
        title: "",
        slug: ""
    }
    const [category, setCategory] = useState(form)
    const [errors, setErrors] = useState({})

    const hideModal = () => {
        resetData()
        closeModal()
    }

    const resetData = () => {
        setCategory(form)
        setErrors({})
    }

    const handleChange = (name, value) => {
        if(name === "name") {
            setCategory({
                ...category,
                [name]: value,
                ["slug"]: slugify(value)
            })
        } else {
            setCategory({
                ...category,
                [name]: value
            })
        }
    };

    const handleSave = async () => {
        let result = await validateForm(category)
        if(result === true) {
            setErrors({})
            submitCallBack(category)
        } else {
            setErrors(result)
        }
    };

    useEffect(()=> {
        if(!isAdd && Object.keys(selectedData).length) {
            setCategory(selectedData)
        } else if(isAdd) {
            resetData()
        } else {
            resetData() 
        }
    },[isAdd, selectedData])

    return (
        <>
            <Modal
                title={isAdd ? `Add ${page}` : `Edit ${page}`}
                centered
                visible={showModal}
                onOk={handleSave}
                okText={"Save"}
                onCancel={hideModal}
                className="user_management__edit_user"
            >
                <div className="mt-3">
                    <InputChange
                        handleChange={(key, value) => handleChange(key, value)}
                        type="name"
                        className="mt-2"
                        required
                        validateStatus={errors?.name && "error"}
                        helpText={errors?.name}
                        value={category?.name}
                        label="Name"
                    />
                    <InputChange
                        handleChange={(key, value) => handleChange(key, value)}
                        type="title"
                        className="mt-2"
                        required
                        validateStatus={errors?.title && "error"}
                        helpText={errors?.title}
                        value={category?.title}
                        label="Title"
                    />
                </div>
            </Modal>
        </>
    );
};

export default AddStoreCategory;