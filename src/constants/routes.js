import { lazy } from "react";
import { AppRoutes } from "../settings";

export const availableRoutes = [
  {
    name: "home",
    path: AppRoutes.Home,
    component: lazy(() => import("../components/Pages/Overview")),
    default: true,
  },
  {
    name: "dashboard",
    path: AppRoutes.Dashboard,
    component: lazy(() => import("../components/Pages/Dashboard")),
    default: true,
  },
  {
    name: "taxonomy",
    path: AppRoutes.Taxonomy,
    component: lazy(() => import("../components/Pages/Taxonomy")),
  },
  {
    name: "user_management",
    path: AppRoutes.Users,
    component: lazy(() => import("../components/Pages/Users")),
  },
  {
    name: "live_inventory",
    path: AppRoutes.ViewInventory,
    component: lazy(() => import("../components/Pages/CasedGoods")),
  },
  {
    name: "archived_inventory",
    path: AppRoutes.ViewDeletedInventory,
    component: lazy(() => import("../components/Pages/CasedGoods/archiveCases/deletedCasedGoods")),
  },
  {
    name: "inventory_change_log",
    path: AppRoutes.CasesChangeLog,
    component: lazy(() => import("../components/Pages/CasedGoods/changeLog/changeLog")),
  },
  {
    name: "add_new_cases",
    path: AppRoutes.AddCases,
    component: lazy(() => import("../components/Pages/CasedGoods/addCases/addCases")),
  },
  {
    name: "new_sales_order",
    path: AppRoutes.NewSalesOrder,
    component: lazy(() => import("../components/Pages/Sales")),
  },
  {
    name: "track_order",
    path: AppRoutes.TrackOrder,
    component: lazy(() => import("../components/Pages/Sales/trackOrder")),
  },
  {
    name: "manage_orders",
    path: AppRoutes.ManageOrders,
    component: lazy(() => import("../components/Pages/Sales/manageOrders")),
  },
  {
    name: "cancelled_orders",
    path: AppRoutes.CancelledOrders,
    component: lazy(() => import("../components/Pages/Sales/cancelledOrders"))
  },
  {
    name: "completed_orders",
    path: AppRoutes.CompletedOrders,
    component: lazy(() => import("../components/Pages/Sales/completedOrders")),
  },
  {
    name: "mis_reports",
    path: AppRoutes.MisReports,
    component: lazy(() => import("../components/Pages/Sales/misReports")),
  },
  {
    name: "view_order_documents",
    path: `${AppRoutes.TrackOrder}/${AppRoutes.ViewOrderDocuments}`,
    component: lazy(() => import("../components/Pages/Sales/viewDocuments/documentViewWithId")),
    default: true,
  },
  {
    name: "order_details",
    path: `${AppRoutes.OrderDetails}/:id`,
    component: lazy(() => import("../components/Pages/Sales/orderDetails")),
    default: true,
  },
  {
    name: "active_leads",
    path: AppRoutes.ActiveLeads,
    component: lazy(() => import("../components/Pages/Leads")),
  },
  {
    name: "completed_leads",
    path: AppRoutes.CompletedLeads,
    component: lazy(() => import("../components/Pages/Leads/completedLeads")),
  },
  {
    name: "customer_list",
    path: AppRoutes.CustomerList,
    component: lazy(() => import("../components/Pages/Leads/customerData")),
  },
  {
    name: "lead_details",
    path: `${AppRoutes.LeadDetails}/:id`,
    component: lazy(() => import("../components/Pages/Leads/leadDetails")),
    default: true,
  },
  {
    name: "customer_details",
    path: `${AppRoutes.CustomerDetails}/:id`,
    component: lazy(() => import("../components/Pages/Leads/customerData/customerDetails")),
    default: true,
  },
  {
    name: "help_tickets",
    path: AppRoutes.HelpTickets,
    component: lazy(() => import("../components/Pages/Help/helpTickets")),
  },
  {
    name: "add_new_store",
    path: AppRoutes.AddNewStore,
    component: lazy(() => import("@pages/StoreLocator/index")),
  },
  {
    name: "add_new_store",
    path: AppRoutes.EditStore,
    component: lazy(() => import("@pages/StoreLocator/index")),
  },
  {
    name: "view_stores",
    path: AppRoutes.ViewStores,
    component: lazy(() => import("@pages/StoreLocator/storeList")),
  },
  {
    name: "store_locator",
    path: AppRoutes.ViewStoreCategory,
    component: lazy(() => import("@pages/StoreLocator/viewStoreCategory")),
  },
  {
    name: "store_locator",
    path: AppRoutes.ViewProductFilter,
    component: lazy(() => import("@pages/StoreLocator/viewProductFilter")),
  },
  {
    name: "403",
    path: AppRoutes.NoAccess,
    component: lazy(() => import("../components/Pages/403")),
    default: true,
  },
  {
    name: "404",
    path: AppRoutes.NotFound,
    component: lazy(() => import("../components/Pages/404/custom404")),
    default: true,
  },
];
