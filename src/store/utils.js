export const parseError = (error) => {
    if (Object.keys(error).length === 0) { return "Unexpected server error"; } else {
        return Object.keys(error).reduce(
            (prev, curr) => prev.concat(`${curr}: ${Array.isArray(error[curr]) ? error[curr].join(", ") : error[curr]}`),
            []
        ).join("; ");
    }
};

export const parseErrorMsg = (error) => {
    const errorMsg = JSON.parse(error);
    return errorMsg.msg;
};
