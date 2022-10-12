import SuperFetch from "../../superFetch";
class TaxonomyService {
    getData = async (method, url) => {
        return SuperFetch(method, url).then(response => {
            return response;
        }).catch(error => {
            return error;
        });
    };
};

export default new TaxonomyService();