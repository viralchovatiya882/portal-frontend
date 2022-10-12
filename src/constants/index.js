export const isMobileOrTab = 769;
export const defaultTaxonomyMasterDataListName = "product_distillery";

export const SearchType = {
  isClient: true,
  isServer: false,
};

export const TableColumnsList = {
  Inventory: "Inventory",
  DeletedInventory: "Deleted Inventory",
  Users: "Users",
  Taxonomy: "Taxonomy",
  ChangeLog: "Change Log",
  TaxonomyDistillery: "Taxonomy Distillery",
  HelpTicket: "Help Tickets",
  ViewSalesOrders: "View Sales Orders",
  TrackOrder: "Track Order",
  ManageOrders: "Manage Orders",
  ActiveLeads: "Active Leads",
  CustomerList: "Customer List",
  CustomerDetails: "Customer Details",
  CompletedOrders: "Completed Orders",
  CancelledOrders: "Cancelled Orders",
  AdditionalCharges: "Additional Charges",
  CompletedLeads: "Completed Leads",
  OrderDetailsNewItems: "Order Details New Items",
  OrderDetailsExistingItems: "Order Details Existing Items",
};

export const AddCasesTabs = {
  Basics: "Basic Details",
  Case: "Case Details",
  Price: "Price Details",
  Preview: "Preview",
};

export const ChangeLogTabs = {
  Addition: "Cases Added",
  Deletion: "Cases Reduced",
  Price: "Price Changes",
};

export const MasterDataKeyPair = {
  MasterDataKey: "masterdata_key",
};

export const UserRoleOptions = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "employee",
    label: "Employee",
  },
];

export const ActionOptions = {
  Delete: "delete",
  Quantity: "quantity",
  Price: "price",
  RotationNumber: "rotation number",
};

export const availableModules = [
  "taxonomy",
  "add_new_cases",
  "archived_inventory",
  "inventory_change_log",
  "live_inventory",
  "user_management",
  "sales_order",
  "new_sales_order",
  "track_order",
  "customer_list",
  "manage_orders",
  "cancelled_orders",
  "active_leads",
  "completed_orders",
  "mis_reports",
  "completed_leads",
  "sales_order_management",
  "help_tickets",
  "view_sales_orders",
  "add_new_store",
  "view_stores",
  "store_locator",
];

export const staticTextInventory = "All Dates are in <b>YYYY-MM-DD</b> and all Prices are in <b>GBP</b>";

export const newValue = [
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
];

export const oldValue = [
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
];

export const processId = [
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
];
