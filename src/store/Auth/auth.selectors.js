import { get } from "lodash";
import { createSelector } from "reselect";

const authUserSelector = (state) => get(state, "auth.loggedInUserDetails", []);

export const getLoggedInSelector = createSelector(
    authUserSelector,
    (users) => {
        return users;
    }
);