export const getDataWrapper = (responseData) => {
    let rowData = [];
    if (responseData && responseData.length > 0) {
        responseData.map((data, index) => {
            const rowObj = {
                key: index,
                ...data
            };
            rowData.push(rowObj);
        });
    };
    return rowData;
};
