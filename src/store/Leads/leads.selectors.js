import { createSelector } from "reselect";

const leadsSelector = (state) => state.leads.activeLeads;

export const getActiveLeadsSelector = createSelector(
    leadsSelector,
    (leads) => {
        console.log(leads);
        return leads;
    }
);