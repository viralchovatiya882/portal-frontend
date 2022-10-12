import { createSelector } from "reselect";

const casedGoodsSelector = (state) => state.casedGoods.casedGoods;

export const casedGoodsSelector = createSelector(
    casedGoodsSelector,
    (casedGoods) => {
        console.log(casedGoods);
        return casedGoods;
    }
);