import { get } from "lodash";
import { createSelector } from "reselect";

const helpSelector = (state) => get(state, "help.helpDetails", []);

export const getHelpDetails = createSelector(
    helpDetails,
    (help) => {
        return help;
    }
);