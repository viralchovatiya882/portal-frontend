export const configStaging = {
    Auth: {
        // endpoint: "https://dtstage.s3.ap-south-1.amazonaws.com/",
        identityPoolId: "ap-south-1:65c206dc-edb4-40bf-bdc5-90d95e68a025", // REQUIRED - Amazon Cognito Identity Pool ID
        region: "ap-south-1", // REQUIRED - Amazon Cognito Region
        userPoolId: "", // OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: "", // OPTIONAL - Amazon Cognito Web Client ID
    },
    Storage: {
        AWSS3: {
            bucket: "help_images", // REQUIRED -  Amazon S3 bucket name
            region: "ap-south-1", // OPTIONAL -  Amazon service region
        },
    }
};