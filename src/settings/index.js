const siteConfig = {
    appName: "DUNCAN TAYLOR"
};

const AppRoutes = {
    Home: "/",
    NotFound: "404",
    NoAccess: "403",
    Dashboard: "dashboard",
    Taxonomy: "taxonomy",
    Users: "users",
    ViewInventory: "view-live-inventory",
    AddCases: "add-new-cases",
    CasesChangeLog: "inventory-change-log",
    ViewDeletedInventory: "view-archived-inventory",
    NewSalesOrder: "create-new-order",
    TrackOrder: "track-order",
    ManageOrders: "manage-orders",
    CompletedOrders: "completed-orders",
    CancelledOrders: "cancelled-orders",
    CompletedLeads: "completed-leads",
    CustomerList: "customer-list",
    ActiveLeads: "active-leads",
    OrderDetails: "order-details",
    LeadDetails: "lead-details",
    MisReports: "mis-reports",
    CustomerDetails: "customer-details",
    ViewOrderDocuments: "view-order-documents",
    HelpTickets: "help-tickets",
    SalesOrderManagement: "sales-order-management",
    ViewSalesOrders: "view-sales-orders",
    AddNewStore: "add-new-store",
    EditStore: "add-new-store/:id",
    ViewStores: "view-stores",
    ViewStoreCategory: "view-store-category",
    ViewProductFilter: "view-product-filter",
};

const SidebarList = {
    Home: "/",
    Dashboard: "Dashboard",
    Taxonomy: "Taxonomy",
    Users: "User Management",
    CasedGoods: "Cased Goods",
    ViewInventory: "Live Inventory",
    ViewDeletedInventory: "Archived Inventory",
    AddCases: "Add New Cases",
    CasesChangeLog: "Inventory Change Log",
    SalesOrder: "Sales Orders",
    Leads: "Customer Data",
    ActiveLeads: "Active Leads",
    CustomerList: "Customer List",
    NewSalesOrder: "Create New Order",
    ViewOrders: "View Orders",
    HelpTickets: "Help Tickets",
    TrackOrder: "Track Your Order",
    ManageOrders: "Manage Orders",
    CompletedOrders: "Completed Orders",
    CancelledOrders: "Cancelled Orders",
    CompletedLeads: "Completed Leads",
    OrderDetails: "Order Details",
    LeadDetails: "Lead Details",
    MisReports: "MIS Reports",
    CustomerDetails: "Customer Details",
    SalesOrderManagement: "Order Management",
    ViewSalesOrders: "View Sales Orders",
    StoreLocator: "Store Locator",
    AddNewStore: "Add New Store",
    ViewStores: "View Stores",
    ViewStoreCategory: "Veiw Store Category",
    ViewProductFilter: "View Product Filters",
};

const defaultRequestOptions = {
    "page": "all",
    "security_key": process.env.REACT_APP_SECURITY_KEY
};

const defaultRequestKey = {
    "security_key": process.env.REACT_APP_SECURITY_KEY
};

export { siteConfig, SidebarList, AppRoutes, defaultRequestOptions, defaultRequestKey };

