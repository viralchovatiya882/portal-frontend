import { EditOutlined } from "@ant-design/icons";
import { capitalizeAllLetter } from "../../../helpers/utility";

/**
 * Users Columns
 * @param
 * @returns user columns
 */
export const CustomUsersColumns = (getColumnSearchProps, columnData, callback) => {
    let evaluatedColumnData = [];
    let columnKeys = columnData.length > 0 ? Object.keys(columnData[0]) : [];
    columnKeys.shift();
    evaluatedColumnData = columnKeys.map((data) => {
        return {
            title: capitalizeAllLetter(data.replace("_", " ")),
            dataIndex: data,
            key: data,
            ellipsis: {
                showTitle: false,
            },
            sorter: (a, b) => a.data && b.data && a.data.localeCompare(b.data),
            width: "50%",
            ...getColumnSearchProps(data)
        };
    });
    evaluatedColumnData.push({
        title: "Edit",
        dataIndex: "edit",
        key: "edit",
        className: "text-center",
        width: "20%",
        render: (text, record) => (
            <EditOutlined onClick={() => callback(record)} />
        )
    });
    return evaluatedColumnData;
};


/**
 * Users Columns
 * @param
 * @returns user columns
 */
export const UsersColumns = (getColumnSearchProps, columnData, callback) => [
    {
        title: "Id",
        dataIndex: "user_id",
        key: "user_id",
        ellipsis: {
            showTitle: false,
        },
        sorter: (a, b) => a.user_id && b.user_id && a.user_id.localeCompare(b.user_id),
        width: "30%",
        ...getColumnSearchProps("user_id"),
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        ellipsis: {
            showTitle: false,
        },
        sorter: (a, b) => a.email && b.email && a.email.localeCompare(b.email),
        width: "60%",
        ...getColumnSearchProps("email"),
    },
    {
        title: "Name",
        dataIndex: "name",
        ellipsis: {
            showTitle: false,
        },
        sorter: (a, b) => a.name && b.name && a.name.localeCompare(b.name),
        key: "name",
        width: "60%",
        ...getColumnSearchProps("name"),
    },
    {
        title: "Role",
        dataIndex: "role",
        ellipsis: {
            showTitle: false,
        },
        sorter: (a, b) => a.role && b.role && a.role.localeCompare(b.role),
        key: "role",
        width: "30%",
        ...getColumnSearchProps("role"),
    },
    {
        title: "Taxonomy",
        dataIndex: "taxonomy",
        key: "taxonomy",
        sorter: (a, b) => a.taxonomy && b.taxonomy && a.taxonomy.localeCompare(b.taxonomy),
        width: "50%",
        ...getColumnSearchProps("taxonomy"),
    },
    {
        title: "Cased Goods",
        dataIndex: "cased_goods",
        key: "cased_goods",
        sorter: (a, b) => a.cased_goods && b.cased_goods && a.cased_goods.localeCompare(b.cased_goods),
        width: "60%",
        ...getColumnSearchProps("cased_goods"),
    },
    {
        title: "Action",
        dataIndex: "edit",
        key: "edit",
        width: "50%",
        render: (text, record) => (
            <a onClick={() => callback(record)}><EditOutlined /> Edit</a>
        ),
    }
];