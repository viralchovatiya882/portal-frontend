import { graphConfig } from "./authConfig";

/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken 
 */
export async function callMsGraph(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphConfig.graphMeEndpoint, options)
        .then(response => response.json())
        .catch(error =>
            // eslint-disable-next-line no-console
            console.log(error)
        );
}

/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user profile pic
 * @param accessToken 
 */
export async function callMSGraphProfilePic(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", "image/jpg");

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphConfig.graphMeProfilePic, options)
        .catch(error =>
            // eslint-disable-next-line no-console
            console.log(error)
        );
}