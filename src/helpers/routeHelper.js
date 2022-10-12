import { filter, get, has } from "lodash";
import { availableModules } from "../constants";
import { availableRoutes } from "../constants/routes";
import { checkUserPermission } from "../helpers/utility";

export const routeHelper = userObj => {
  let authorisedRoutes = filter(availableRoutes, function (o) {
    return get(o, "default");
  });
  availableModules.map(module => {
    if (has(userObj, `user_permissions.${module}`, false)) {
      const getCheckValue = checkUserPermission(get(userObj, `user_permissions.${module}`, []));
      if (getCheckValue) {
        let filteredRoutes = [];
        filteredRoutes = filter(availableRoutes, function (o) {
          return get(o, "name", "") === module;
        });
        authorisedRoutes = [...authorisedRoutes, ...filteredRoutes];
      }
    }
  });
  return userObj ? authorisedRoutes : availableRoutes;
};
