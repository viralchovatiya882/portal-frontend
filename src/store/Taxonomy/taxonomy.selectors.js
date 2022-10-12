import { get } from "lodash";
import { createSelector } from "reselect";

const taxonomyListSelector = (state) => state.taxonomy.masterDataList;

export const getTaxonomyList = createSelector(
    taxonomyListSelector,
    (masterList) => get(masterList, "data", []).map((list) => ({
        label: list.display_name,
        value: list.masterdata_key
    }))
);