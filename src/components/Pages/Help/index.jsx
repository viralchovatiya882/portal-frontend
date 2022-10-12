import { get } from "lodash";
import React from "react";
import validator from "validator";
import { getKeyValuePairFromArray } from "../../../helpers/utility";
import { CustomInputTextArea as InputTextArea } from "../../UIComponents/Input/customInput";
import { error, success } from "../../UIComponents/Message";
import { SingleSelect as Select } from "../../UIComponents/Select/singleSelect";

let uploadedFile = "";

const Help = (props) => {
    const [url, setURL] = React.useState("");
    const [comments, setComments] = React.useState("");

    const customProps = {
        onChange(info) {
            if (info.file.status !== "uploading") {
                // eslint-disable-next-line no-console	
                console.log(info.file, info.fileList);
            }
            if (info.file.status === "done") {
                success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === "error") {
                error(`${info.file.name} file upload failed.`);
            }
        },
        progress: {
            strokeColor: {
                "0%": "#108ee9",
                "100%": "#87d068",
            },
            strokeWidth: 3,
            format: percent => `${parseFloat(percent.toFixed(2))}%`,
        },
    };

    const handleChange = React.useCallback((key, value) => {

        if (key === "url" && !validator.isEmpty(value)) {
            props.handleError("urlError");
        }

        if (key === "comments" && !validator.isEmpty(value)) {
            props.handleError("commentsError");
        }

        if (key === "url") {
            setURL(value);
        }

        if (key === "comments") {
            setComments(value);
        }
        props.handleChange({ key, value });
    });

    return (
        <>
            <Select
                handleChange={(key, value) => handleChange("url", value)}
                className="mt-0 mb-3"
                type="url"
                validateStatus={get(props, "urlError") && "error"}
                helpText={get(props, "urlError") && "Select Area Path"}
                options={getKeyValuePairFromArray([...get(props, "options"), "others"])}
                value={url}
                required
                label="Pages"
            />
            <InputTextArea
                type="comments"
                className="mt-2 mb-3"
                label="Issue Description"
                required
                value={comments}
                handleChange={handleChange}
                validateStatus={get(props, "commentsError") && "error"}
                helpText={get(props, "commentsError") && "Comments  cannot be empty"}
            />
            {/* <Upload
                {...customProps}
                listType="picture"
                maxCount={1}
                onRemove={(file) => {
                    uploadedFile = "";
                }}
                beforeUpload={(file) => {
                    if (
                        file.type === "image/png" ||
                        file.type === "image/jpg" ||
                        file.type === "image/jpeg"
                    ) {
                        uploadedFile = file;
                        props.handleUploadImage(file);
                    } else {
                        error(`${file.name} is not a supported file`);
                    }
                    return false;
                }}
            >
                <Button icon={<UploadOutlined />}>
                    Upload Image
                </Button>
            </Upload> */}
        </>
    );
};

export default Help;