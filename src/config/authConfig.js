import { LogLevel } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */
export const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_LOCAL_CLIENT_ID,
        authority: process.env.REACT_APP_LOCAL_AUTHORITY,
        redirectUri: process.env.REACT_APP_REDIRECTURL
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        // eslint-disable-next-line no-console	
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        // eslint-disable-next-line no-console
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        // eslint-disable-next-line no-console
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        // eslint-disable-next-line no-console
                        console.warn(message);
                        return;
                }
            }
        }
    }
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */

export const loginRequest = {
    scopes: ["openid", "email", "profile", "User.Read", "User.ReadWrite", "User.ReadBasic.All"]
};

// Add scopes here for access token to be used at Microsoft Graph API endpoints.
export const tokenRequest = {
    scopes: ["User.Read", "Mail.Read", "profile", "User.ReadWrite", "User.ReadBasic.All"]
};

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphMeProfilePic: "https://graph.microsoft.com/v1.0/me/photo/$value"
};
