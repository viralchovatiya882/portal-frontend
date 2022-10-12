import { MenuOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import { get, isEqual } from "lodash";
import React from "react";
import { withRouter } from "react-router";
import Sidebar from "../../Layout/sidebar";
import { siteConfig } from "../../../settings";

class MenuDrawer extends React.Component {
    state = { visible: false };

    componentDidUpdate(prevProps) {
        const currentRoute = get(this.props, "location.pathname", "");
        const prevRoute = get(prevProps, "location.pathname", "");
        if (!isEqual(currentRoute, prevRoute)) {
            this.onClose();
        }
    };

    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    render() {

        return (
            <>
                <MenuOutlined onClick={this.showDrawer} />
                <Drawer
                    title={siteConfig.appName}
                    placement="left"
                    className="sidebar_menu_drawer"
                    closable={true}
                    onClose={this.onClose}
                    visible={this.state.visible}
                >
                    <Sidebar loggedInUser={get(this, "props.loggedInUser")} />
                </Drawer>
            </>
        );
    }
}

export default withRouter(MenuDrawer);