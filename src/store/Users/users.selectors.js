import { get } from "lodash";
import { createSelector } from "reselect";

const usersListSelector = (state) => get(state, "users.usersDataList", []);

export const usersSelector = createSelector(
    usersListSelector,
    (users) => {
        return users;
    }
);