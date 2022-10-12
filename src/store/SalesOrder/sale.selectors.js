import { createSelector } from "reselect";

const salesOrderSelector = (state) => state.salesOrder.casedGoods;

export const salesOrdersSelector = createSelector(
    salesOrderSelector,
    (casedGoods) => {
        console.log(casedGoods);
        return casedGoods;
    }
);