import { get } from "lodash";

export const getConvertToCustomerValues = obj => {
  return {
    customer_entity_name: get(obj, "customer_entity_name", ""),
    lead_id: get(obj, "id", "") || get(obj, "lead_id", ""),
    contact_name: get(obj, "contact_name", ""),
    phone: get(obj, "phone", ""),
    email: get(obj, "email", ""),
    invoice_address1: get(obj, "invoice_address1", ""),
    invoice_address2: get(obj, "invoice_address2", ""),
    postal_code: get(obj, "postal_code", ""),
    country: get(obj, "country", ""),
    state: get(obj, "state", ""),
    city: get(obj, "city", ""),
  };
};
export const postalRegEx = input => {
  // const regExp = new RegExp("^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$");
  // return regExp.test(input);
  return true;
};
