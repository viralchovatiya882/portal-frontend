export const data = [
    {
        id: "1",
        name: "ABC",
        email: "abc@gmail.com",
        role: "Admin",
        taxonomy: "no",
        cased_goods: "yes",
    },
    {
        id: "2",
        name: "XYZ",
        email: "xyz@gmail.com",
        role: "Admin",
        taxonomy: "no",
        cased_goods: "yes",
    },
    {
        id: "3",
        name: "Subramanya Dixit",
        email: "subbudixith@gmail.com",
        role: "Admin",
        taxonomy: "no",
        cased_goods: "yes",
    }
];

export const user_permissions = {
    dashboard: ["view"],
    taxonomy: ["view"],
    user_management: [],
    cased_goods: ["view"],
    live_inventory: ["edit"],
    add_new_cases: ["add"],
    inventory_change_log: ["view"],
    archived_inventory: ["edit"],
    help_tickets: []
};