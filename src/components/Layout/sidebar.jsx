import {
  AuditOutlined,
  BarChartOutlined,
  BranchesOutlined,
  CloseSquareOutlined,
  FieldTimeOutlined,
  FileDoneOutlined,
  FileSyncOutlined,
  IssuesCloseOutlined,
  PlusSquareOutlined,
  RiseOutlined,
  SnippetsOutlined,
  UnorderedListOutlined,
  UsergroupAddOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Menu, Tooltip } from "antd";
import { get } from "lodash";
import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { checkUserPermission } from "../../helpers/utility";
import { AppRoutes, SidebarList } from "../../settings";
import "./index.scss";

const { SubMenu } = Menu;

/**
 * Renders Sidebar
 */
const Sidebar = (props) => {
  const { location, loggedInUser } = props;
  let currentTab = AppRoutes.Dashboard,
    subMenu = "";

  if (get(location, "pathname") !== AppRoutes.Dashboard) {
    currentTab = get(location, "pathname", "").slice(1);
  }

  if (currentTab === AppRoutes.ViewInventory || currentTab === AppRoutes.AddCases || currentTab === AppRoutes.CasesChangeLog) {
    subMenu = "sub1";
  }

  if (currentTab === AppRoutes.TrackOrder || currentTab === AppRoutes.NewSalesOrder || currentTab === AppRoutes.TrackOrder || currentTab === AppRoutes.SalesOrderManagement) {
    subMenu = "sub2";
  }

  if (currentTab === AppRoutes.AddLead || currentTab === AppRoutes.ManageLeads) {
    subMenu = "sub_menu_leads";
  }

  const { AddNewStore, EditStore, ViewStores, ViewStoreCategory, ViewProductFilter } = AppRoutes;
  if ([AddNewStore, EditStore, ViewStores, ViewStoreCategory, ViewProductFilter].includes(currentTab)) {
    subMenu = "sub3";
  }

  return (
    <>
      <Menu defaultSelectedKeys={[currentTab]} defaultOpenKeys={[subMenu]} mode="inline" theme="dark" inlineIndent={14} selectedKeys={[currentTab]} className="sidebar__menu">
        <Menu.Item key={AppRoutes.Dashboard} icon={<BarChartOutlined />}>
          <Tooltip placement="right" title={SidebarList.Dashboard} color="#a3a0fb">
            <Link to={`/${AppRoutes.Dashboard}`} className="text-decoration-none">
              {SidebarList.Dashboard}
            </Link>
          </Tooltip>
        </Menu.Item>
        {checkUserPermission(get(loggedInUser, "data.user_permissions.taxonomy")) && (
          <Menu.Item key={AppRoutes.Taxonomy} icon={<BranchesOutlined />}>
            <Tooltip placement="right" title={SidebarList.Taxonomy} color="#a3a0fb">
              <Link to={`/${AppRoutes.Taxonomy}`} className="text-decoration-none">
                {SidebarList.Taxonomy}
              </Link>
            </Tooltip>
          </Menu.Item>
        )}
        {checkUserPermission(get(loggedInUser, "data.user_permissions.user_management")) && (
          <Menu.Item key={AppRoutes.Users} icon={<UserOutlined />}>
            <Tooltip placement="right" title={SidebarList.Users} color="#a3a0fb">
              <Link to={`/${AppRoutes.Users}`} className="text-decoration-none">
                {SidebarList.Users}
              </Link>
            </Tooltip>
          </Menu.Item>
        )}
        {checkUserPermission(get(loggedInUser, "data.user_permissions.cased_goods")) && (
          <SubMenu key="sub1" icon={<SnippetsOutlined />} className="sidebar__submenu" title={SidebarList.CasedGoods}>
            {checkUserPermission(get(loggedInUser, "data.user_permissions.live_inventory")) && (
              <Menu.Item key={AppRoutes.ViewInventory} icon={<AuditOutlined />}>
                <Tooltip placement="right" title={SidebarList.ViewInventory} color="#a3a0fb">
                  <Link to={`/${AppRoutes.ViewInventory}`} className="text-decoration-none">
                    {SidebarList.ViewInventory}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.add_new_cases")) && (
              <Menu.Item key={AppRoutes.AddCases} icon={<PlusSquareOutlined />}>
                <Tooltip placement="right" title={SidebarList.AddCases} color="#a3a0fb">
                  <Link to={`/${AppRoutes.AddCases}`} className="text-decoration-none">
                    {SidebarList.AddCases}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.inventory_change_log")) && (
              <Menu.Item key={AppRoutes.CasesChangeLog} icon={<FileSyncOutlined />}>
                <Tooltip placement="right" title={SidebarList.CasesChangeLog} color="#a3a0fb">
                  <Link to={`/${AppRoutes.CasesChangeLog}`} className="text-decoration-none">
                    {SidebarList.CasesChangeLog}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.archived_inventory")) && (
              <Menu.Item key={AppRoutes.ViewDeletedInventory} icon={<CloseSquareOutlined />}>
                <Tooltip placement="right" title={SidebarList.ViewDeletedInventory} color="#a3a0fb">
                  <Link to={`/${AppRoutes.ViewDeletedInventory}`} className="text-decoration-none">
                    {SidebarList.ViewDeletedInventory}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
          </SubMenu>
        )}
        {checkUserPermission(get(loggedInUser, "data.user_permissions.sales_order")) && (
          <SubMenu key="sub2" icon={<RiseOutlined />} className="sidebar__submenu" title={SidebarList.SalesOrder}>
            {checkUserPermission(get(loggedInUser, "data.user_permissions.new_sales_order")) && (
              <Menu.Item key={AppRoutes.NewSalesOrder} icon={<PlusSquareOutlined />}>
                <Tooltip placement="right" title={SidebarList.NewSalesOrder} color="#a3a0fb">
                  <Link to={`/${AppRoutes.NewSalesOrder}`} className="text-decoration-none">
                    {SidebarList.NewSalesOrder}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.sales_order_management")) && (
              <Menu.Item key={AppRoutes.SalesOrderManagement} icon={<UnorderedListOutlined />}>
                <Tooltip placement="right" title={SidebarList.SalesOrderManagement} color="#a3a0fb">
                  <Link to={`/${AppRoutes.SalesOrderManagement}`} className="text-decoration-none">
                    {SidebarList.SalesOrderManagement}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.track_order")) && (
              <Menu.Item key={AppRoutes.TrackOrder} icon={<UnorderedListOutlined />}>
                <Tooltip placement="right" title={SidebarList.TrackOrder} color="#a3a0fb">
                  <Link to={`/${AppRoutes.TrackOrder}`} className="text-decoration-none">
                    {SidebarList.TrackOrder}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.manage_orders")) && (
              <Menu.Item key={AppRoutes.ManageOrders} icon={<SnippetsOutlined />}>
                <Tooltip placement="right" title={SidebarList.ManageOrders} color="#a3a0fb">
                  <Link to={`/${AppRoutes.ManageOrders}`} className="text-decoration-none">
                    {SidebarList.ManageOrders}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.completed_orders")) && (
              <Menu.Item key={AppRoutes.CompletedOrders} icon={<FileDoneOutlined />}>
                <Tooltip placement="right" title={SidebarList.CompletedOrders} color="#a3a0fb">
                  <Link to={`/${AppRoutes.CompletedOrders}`} className="text-decoration-none">
                    {SidebarList.CompletedOrders}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.cancelled_orders")) && (
              <Menu.Item key={AppRoutes.CancelledOrders} icon={<CloseSquareOutlined />}>
                <Tooltip placement="right" title={SidebarList.CancelledOrders} color="#a3a0fb">
                  <Link to={`/${AppRoutes.CancelledOrders}`} className="text-decoration-none">
                    {SidebarList.CancelledOrders}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.mis_reports")) && (
              <Menu.Item key={AppRoutes.MisReports} icon={<SnippetsOutlined />}>
                <Tooltip placement="right" title={SidebarList.MisReports} color="#a3a0fb">
                  <Link to={`/${AppRoutes.MisReports}`} className="text-decoration-none">
                    {SidebarList.MisReports}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
          </SubMenu>
        )}
        {checkUserPermission(get(loggedInUser, "data.user_permissions.leads")) && (
          <SubMenu key="sub_menu_leads" icon={<UsergroupAddOutlined />} className="sidebar__submenu" title={SidebarList.Leads}>
            {checkUserPermission(get(loggedInUser, "data.user_permissions.active_leads")) && (
              <Menu.Item key={AppRoutes.ActiveLeads} icon={<SnippetsOutlined />}>
                <Tooltip placement="right" title={SidebarList.ActiveLeads} color="#a3a0fb">
                  <Link to={`/${AppRoutes.ActiveLeads}`} className="text-decoration-none">
                    {SidebarList.ActiveLeads}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.completed_leads")) && (
              <Menu.Item key={AppRoutes.CompletedLeads} icon={<FileDoneOutlined />}>
                <Tooltip placement="right" title={SidebarList.CompletedLeads} color="#a3a0fb">
                  <Link to={`/${AppRoutes.CompletedLeads}`} className="text-decoration-none">
                    {SidebarList.CompletedLeads}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.customer_list")) && (
              <Menu.Item key={AppRoutes.CustomerList} icon={<UnorderedListOutlined />}>
                <Tooltip placement="right" title={SidebarList.CustomerList} color="#a3a0fb">
                  <Link to={`/${AppRoutes.CustomerList}`} className="text-decoration-none">
                    {SidebarList.CustomerList}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
          </SubMenu>
        )}
        {checkUserPermission(get(loggedInUser, "data.user_permissions.store_locator")) && (
          <SubMenu key="sub3" icon={<RiseOutlined />} className="sidebar__submenu" title={SidebarList.StoreLocator}>
            {checkUserPermission(get(loggedInUser, "data.user_permissions.add_new_store")) && (
              <Menu.Item key={AppRoutes.AddNewStore} icon={<PlusSquareOutlined />}>
                <Tooltip placement="right" title={SidebarList.AddNewStore} color="#a3a0fb">
                  <Link to={`/${AppRoutes.AddNewStore}`} className="text-decoration-none">
                    {SidebarList.AddNewStore}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.view_stores")) && (
              <Menu.Item key={AppRoutes.ViewStores} icon={<FieldTimeOutlined />}>
                <Tooltip placement="right" title={SidebarList.ViewStores} color="#a3a0fb">
                  <Link to={`/${AppRoutes.ViewStores}`} className="text-decoration-none">
                    {SidebarList.ViewStores}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.view_stores_category")) && (
              <Menu.Item key={AppRoutes.ViewStoreCategory} icon={<FieldTimeOutlined />}>
                <Tooltip placement="right" title={SidebarList.ViewStoreCategory} color="#a3a0fb">
                  <Link to={`/${AppRoutes.ViewStoreCategory}`} className="text-decoration-none">
                    {SidebarList.ViewStoreCategory}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
            {checkUserPermission(get(loggedInUser, "data.user_permissions.view_product_filter")) && (
              <Menu.Item key={AppRoutes.ViewProductFilter} icon={<FieldTimeOutlined />}>
                <Tooltip placement="right" title={SidebarList.ViewProductFilter} color="#a3a0fb">
                  <Link to={`/${AppRoutes.ViewProductFilter}`} className="text-decoration-none">
                    {SidebarList.ViewProductFilter}
                  </Link>
                </Tooltip>
              </Menu.Item>
            )}
          </SubMenu>
        )}
        {checkUserPermission(get(loggedInUser, "data.user_permissions.help_tickets")) && (
          <Menu.Item key={AppRoutes.HelpTickets} icon={<IssuesCloseOutlined />}>
            <Tooltip placement="right" title={SidebarList.HelpTickets} color="#a3a0fb">
              <Link to={`/${AppRoutes.HelpTickets}`} className="text-decoration-none">
                {SidebarList.HelpTickets}
              </Link>
            </Tooltip>
          </Menu.Item>
        )}
      </Menu>
    </>
  );
};

export default withRouter(Sidebar);
