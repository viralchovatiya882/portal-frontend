import React, { lazy } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

/**
 * Application Routes Configuration
 * @param props
 */
const PublicRoutes = () => {
  return (
    <BrowserRouter>
      <>
        <Switch>
          <Route path="/confirmation-view" component={lazy(() => import("./components/Pages/CustomerConfirmationView"))} />
          <Route path="/proforma-view" component={lazy(() => import("./components/Pages/ProformaConfirmationView"))} />
          <Route path="/" component={lazy(() => import("./App"))} />
          <Route exact path="/505" component={lazy(() => import("./components/Pages/505"))} />
          <Route exact path="/401" component={lazy(() => import("./components/Pages/401"))} />
        </Switch>
      </>
    </BrowserRouter>
  );
};

export default PublicRoutes;
