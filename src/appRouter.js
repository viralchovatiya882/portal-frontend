import { AuthenticatedTemplate } from "@azure/msal-react";
import { find, get } from "lodash";
import React, { Suspense } from "react";
import { withRouter } from "react-router";
import { Redirect, Route } from "react-router-dom";
import Loader from "./components/UIComponents/Loader";
import { routeHelper } from "./helpers/routeHelper";

const AppRouter = (props) => {
  const { location } = props;
  let currentPath = get(location, "pathname", "");

  if (currentPath !== "/") {
    currentPath = currentPath.slice(1);
  }

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [availableRoutes, setAvailableRoutes] = React.useState([]);
  const [isPathAvailable, setIsPathAvailable] = React.useState(true);

  React.useEffect(() => {
    const logginStatus = get(props, "loggedInUser.is_authorised", false);
    const userdata = get(props, "loggedInUser.data", null);
    setIsLoggedIn(logginStatus);
    const routesObj = routeHelper(userdata);
    setAvailableRoutes(routesObj);
  }, [props.loggedInUser]);

  React.useEffect(() => {
    if (availableRoutes.length > 0 && isLoggedIn) {
      const path = find(availableRoutes, function (o) {
        return o.path === currentPath || o.default;
      });
      if (path) {
        setIsPathAvailable(true);
      } else {
        setIsPathAvailable(false);
      }
    }
  }, [isLoggedIn, availableRoutes]);

  return (
    <Suspense fallback={<Loader />}>
      <>
        <AuthenticatedTemplate>
          {!isPathAvailable && <Redirect to={{ pathname: "/404" }} />}
          {isLoggedIn &&
            availableRoutes.map((singleRoute, index) => {
              const { path, exact, ...otherProps } = singleRoute;
              if (!path) {
                return <Redirect to={{ pathname: "/404" }} />;
              }
              return <Route exact={exact === false ? false : true} key={index} path={`/${singleRoute.path}`} {...otherProps} />;
            })}
        </AuthenticatedTemplate>
      </>
    </Suspense>
  );
};

export default withRouter(AppRouter);
