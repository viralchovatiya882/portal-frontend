import { openNotificationWithIcon } from "../components/UIComponents/Toast/notification";

/**
 * Export To CSV function, supports array of objects
 * @param
 */
export const exportToCSV = (data = {}, label = "") => {
    if (Object.keys(data).length > 0) {
        let csvContent = "data:text/csv;charset=utf-8,";

        let header = Object.keys(data[0]).join(",");
        let values = data.map(o => Object.values(o).join(",")).join("\n");
        csvContent += header + "\n" + values;

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${label}_data_${new Date().toLocaleString().replace(/[/, ]/g, "_")}.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();
        openNotificationWithIcon("success", label, "Download Successful");
    } else {
        openNotificationWithIcon("error", label, "Error in downloading");
    }
};

