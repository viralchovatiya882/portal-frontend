import { CopyOutlined, DeleteOutlined, EyeOutlined, SwapOutlined } from "@ant-design/icons";

export const fixedColumnWidth30 = [
  "id",
  "cased_goods_id",
  "item_id",
  "role",
  "cask",
  "abv",
  "year",
  "price_after_discount",
  "price",
  "discount",
  "age",
  "bpc",
  "quantity",
  "volume",
  "cases",
  "bottles",
  "total_price",
  "s_no",
  "duty",
  "offer_price",
  "loa_per_case",
  "wholesale_price",
  "last_location",
  "offers",
  "log_id",
  "region",
  "status",
  "active_status",
];

export const highlightColumns = ["cases", "bottles"];

export const namingList = [
  {
    value: "distillery",
    label: "Product/Distillery",
  },
  {
    value: "volume",
    label: "Vol (ltr)",
  },
  {
    value: "quantity",
    label: "Qty (Cases)",
  },
  {
    value: "discount",
    label: "Disc (%)",
  },
  {
    value: "s_no",
    label: "Sl No",
  },
  {
    value: "total_price",
    label: "Total Price (£)",
  },
];

export const changeLogColumnOptions = {
  new_value: [
    {
      id: 1,
      text: "Updated # of available cases",
      label: "New Case",
    },
    {
      id: 2,
      text: "Updated # of available cases",
      label: "Qty Add",
    },
    {
      id: 3,
      text: "Updated # of available cases",
      label: "Qty Reduce",
    },
    {
      id: 4,
      text: "New Export Price in GBP",
      label: "Export Price Change",
    },
    {
      id: 5,
      text: "New Offer Price in GBP",
      label: "Offer Price Change",
    },
    {
      id: 6,
      text: "NA",
      label: "Archive",
    },
    {
      id: 7,
      text: "NA",
      label: "Restore",
    },
  ],
  old_value: [
    {
      id: 1,
      text: "Previous # of available cases is 0",
      label: "New Case",
    },
    {
      id: 2,
      text: "Previous # of available cases",
      label: "Qty Add",
    },
    {
      id: 3,
      text: "Previous # of available cases",
      label: "Qty Reduce",
    },
    {
      id: 4,
      text: "Previous Export Price in GBP",
      label: "Export Price Change",
    },
    {
      id: 5,
      text: "Previous Offer Price in GBP",
      label: "Offer Price Change",
    },
    {
      id: 6,
      text: "NA",
      label: "Archive",
    },
    {
      id: 7,
      text: "NA",
      label: "Restore",
    },
  ],
  process_ID: [
    {
      id: 1,
      text: "NA",
      label: "New Case",
    },
    {
      id: 2,
      text: "Bottling Process ID",
      label: "Qty Add",
    },
    {
      id: 3,
      text: "Sales Order ID",
      label: "Qty Reduce",
    },
    {
      id: 4,
      text: "NA",
      label: "Export Price Change",
    },
    {
      id: 5,
      text: "NA",
      label: "Offer Price Change",
    },
    {
      id: 6,
      text: "NA",
      label: "Archive",
    },
    {
      id: 7,
      text: "NA",
      label: "Restore",
    },
  ],
};

export const TrackOrderAction = [
  {
    item: "View Documents",
    component: <CopyOutlined />,
    pathname: "/track-order/view-order-documents",
    type: "review",
  },
  // {
  //   item: "Review Signed Documents",
  //   component: <FileTextOutlined />,
  //   pathname: "/track-order/view-order-documents",
  //   type: "view",
  // },
  // {
  //   item: "Edit Order",
  //   component: <EditOutlined />,
  //   disabled: true,
  //   type: "edit",
  // },
  {
    item: "Cancel Order",
    component: <DeleteOutlined />,
    type: "cancel",
  },
];

export const TrackActiveLeadAction = [
  {
    item: "View Details",
    component: <EyeOutlined />,
    pathname: "#",
    type: "review",
  },
  {
    item: "Convert to Customer",
    component: <SwapOutlined />,
    type: "conversion",
  },
];

export const SalesOrderFulFillmentStatusData = [
  {
    title: "New",
    color: "#ffbc58",
    value: "new",
  },
  {
    title: "In Progress",
    color: "#ff9258",
    value: "in_progress",
  },
  {
    title: "Packed",
    color: "#30c9ca",
    value: "packed",
  },
  {
    title: "Shipped",
    color: "#81ba11",
    value: "shipped",
  },
  {
    title: "Cancelled",
    color: "#a5a5a5",
    value: "cancelled",
  },
];

export const ActiveLeadStatusData = [
  {
    title: "New",
    color: "#108ee9",
    value: "new",
  },
  {
    title: "Interested",
    color: "#ffbc58",
    value: "interested",
  },
  {
    title: "Hot",
    color: "#ff3838",
    value: "hot",
  },
  {
    title: "Warm",
    color: "#fce83a",
    value: "warm",
  },
  {
    title: "Cold",
    color: "#1b7a99",
    value: "cold",
  },
  {
    title: "Hold",
    color: "#30c9ca",
    value: "hold",
  },
  {
    title: "Completed",
    color: "#81ba11",
    value: "completed",
  },
  {
    title: "Cancelled",
    color: "#a5a5a5",
    value: "cancelled",
  },
];

export const CaseReferenceColumns = [
  {
    title: "Rotation Number",
    dataIndex: "rotation_number",
    width: "40%",
  },
  {
    title: "Available Cases",
    dataIndex: "quantity",
    width: "30%",
  },
  {
    title: "Allocated Cases",
    dataIndex: "allocated_quantity",
    width: "30%",
  },
];
