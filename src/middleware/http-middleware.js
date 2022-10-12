import { get } from "lodash";
import http from "./http";

export default store => next => async action => {
  const { request, types, ...rest } = action;

  if (!request) {
    return next(action);
  }

  const [REQUEST, SUCCESS, FAILURE] = types;
  next({ ...rest, type: REQUEST });

  try {
    const response = await store.dispatch(request.bind(null, http, store));
    if (get(response, "status", false)) {
      return next({ ...rest, response, type: SUCCESS });
    } else {
      return next({ ...rest, error: response, type: FAILURE });
    }
  } catch (error) {
    return next({ ...rest, error, type: FAILURE });
  }
};
