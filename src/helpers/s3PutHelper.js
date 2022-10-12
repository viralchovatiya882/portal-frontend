import { Storage } from "aws-amplify";
import { get } from "lodash";

Storage.configure({
    AWSS3: {
        bucket: "help_images", // bucket ARN;
        region: "ap-south-1", // Specify the region your bucket was created in;
    },
});

export const onPutToS3 = (currentUser, upload_file, file_id) => {
    const { email, name } = currentUser;
    let s3_metaData = {
        email, name,
        fileName: upload_file.name,
    };
    if (upload_file) {
        Storage.put(file_id, upload_file, {
            contentType: upload_file.type,
            metadata: {
                ...s3_metaData,
            },
        }).then((result) => {
            // eslint-disable-next-line no-console	
            console.log("result ", result);
        }).error((error) => {
            // eslint-disable-next-line no-console	
            console.log("error ", error);
        });
    }
};

export const uploadHelpImage = (file, userInfo, onUpload) => {
    return new Promise((resolve, reject) => {
        Storage.put(get(file, "uid"), file, {
            bucket: "help_images",
            region: "ap-south-1",
            contentType: get(file, "type"),
            metadata: {
                email: get(userInfo, "email"),
                name: get(userInfo, "name"),
                fileName: get(file, "name"),
            },
        })
            .then((result) => {
                // eslint-disable-next-line no-console	
                console.log("upload_file success", result);
                return resolve(result);
            })
            .catch((err) => {
                // eslint-disable-next-line no-console	
                console.log("error while uploading help image", err);
                return reject({ error: err });
            });
    });
};
