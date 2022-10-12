
import { has, get } from "lodash";
import { capitalizeFirstLetter } from "../../../helpers/utility";

export const getDataWrapperDeprecated  = (responseData) => {
    let rowData = [];
    if (responseData && responseData.length > 0) {
        responseData.map((data, index) => {
            const rowObj = {
                key: index,
                id: get(data, "id", ""),
                name: capitalizeFirstLetter(get(data, "name", "")),
                email: get(data, "email", ""),
                role: capitalizeFirstLetter(get(data, "role", ""))
            };
            rowData.push(rowObj);
        });
    };
    return rowData;
};

export const getDataWrapper = (responseData) => {
    let rowData = [];
    if (responseData && responseData.length > 0) {
        responseData.map((data, index) => {
            // if (has(data, "user_permissions")) {
            //     Object.keys(get(data, "user_permissions", [])).map((permissionKey) => {
            //         data[permissionKey] = get(data, `user_permissions.${permissionKey}`, []).join(", ");
            //     });
            // }
            
            delete data["user_permissions"];

            const rowObj = {
                key: index,
                ...data
            };
            rowData.push(rowObj);
        });
    };
    return rowData;
};
