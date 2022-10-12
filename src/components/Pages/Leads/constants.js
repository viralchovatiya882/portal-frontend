export const statusOptions = [
  {
    label: "New",
    value: "new",
  },
  {
    label: "Interested",
    value: "interested",
  },
  {
    label: "On Hold",
    value: "on_hold",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
  {
    label: "Completed",
    value: "completed",
  },
];

export const status_color_map = {
  cancelled: "#a5a5a5",
  confirmed: "#30c9ca",
  interested: "#ffbc58",
  new: "#108ee9",
  hold: "#30c9ca",
  completed: "#81ba11",
  hot: "#ff3838",
  warm: "#fce83a",
  cold: "#1b7a99",
};

export const leadSourceOptions = [
  {
    label: "DT Corporate Event",
    value: "dt_corporate_event",
  },
  {
    label: "Marketing Campaign",
    value: "marketing_campaign",
  },
  {
    label: "Digital Events",
    value: "digital_events",
  },
];

export const defaultConvertToCustomerValues = {
  customer_entity_name: "",
  contact_name: "",
  phone: "",
  email: "",
  invoice_address1: "",
  invoice_address2: "",
  postal_code: "",
  country: "",
  state: "",
  city: "",
};

export const defaultAddCustomerValues = {
  name: "",
  contact_name: "",
  phone_no: "",
  email: "",
  invoice_address1: "",
  invoice_address2: "",
  postal_code: "",
  country: "",
  state: "",
  city: "",
};
