import { Drawer } from "antd";
import { get } from "lodash";
import React from "react";
import { withRouter } from "react-router";

const DrawerTray = (props) => {
    return (
        <>
            <Drawer
                title={get(props, "title", "")}
                placement={get(props, "placement", "right")}
                className="sidebar_menu_drawer"
                closable={true}
                onClose={() => props.handleClose()}
                visible={get(props, "visible", false)}
            >
                {props.children}
            </Drawer>
        </>
    );
};

export default withRouter(DrawerTray);