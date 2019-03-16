"use strict";

const uuidv4 = require("uuid/v4");
const axios = require("axios");

// Shared Credentials and common auth logic
const admin = require("../config/middleware/authServerCommon");

// This saves URL by streaminbg it.  It says it works but no way to view on cloud - just spins
function uploadStreamToGCS(attachmentUrl, fileName) {
    return new Promise((resolve, reject) => {

        const bucket = admin.storage().bucket();

        const imageUrl = attachmentUrl;

        // Configure axios to receive a response type of stream, and get a readableStream of the image from the specified URL
        axios({
            method: "get",
            url: imageUrl,
            responseType: "stream"
        }).then((response) => {
            let gcFile = bucket.file(fileName);
            // Pipe the axios response data to Google Cloud
            response.data.pipe(gcFile.createWriteStream({
                resumable: false,
                validation: false,
                contentType: "auto",
                gzip: true,
                public: true,
                metadata: {
                    contentType: imageUrl.mimetype
                }
            })).on("error", (err) => {
                console.error(`Error saving image ${err}`);
            }).on("finish", () => {
                console.log("Image saved successfully");
                gcFile.makePublic().then(() => {
                    const publicURL = `https://storage.googleapis.com/${bucket.name}${fileName}`;
                    return resolve(publicURL);
                }).catch(err => {
                    return reject(err);
                });
            });
        }).catch(err => {
            console.log(`Image transfer error. ${err}`);
            return reject(err);
        });
    }); // Promise
}

// upload stream
function uploadUserUrlToGCS(uid, imageUrl) {
    return new Promise((resolve, reject) => {
        let _uid;
        if (!uid) {
            _uid = "unknown-uid";
        } else {
            _uid = uid;
        }

        let ext = imageUrl.split(".").pop();
        let folderRef = `/users/${_uid}/users`;
        let gcsObjectName = `${folderRef}/${uuidv4()}.${ext}`;

        uploadStreamToGCS(imageUrl, gcsObjectName).then(publicURL => {
            return resolve({publicURL: publicURL, gcsObjectName: gcsObjectName});
        }).catch(err => {
            return reject(err);
        });
    });
}

// upload from url
function uploadPostUrlToGCS(uid, postId, photoUrl) {
    return new Promise((resolve, reject) => {
        let _uid;
        if (!uid) {
            _uid = "unknown-uid";
        } else {
            _uid = uid;
        }

        let ext = photoUrl.split(".").pop();
        let folderRef = `/users/${_uid}/posts`;
        let gcsObjectName = `${folderRef}/${uuidv4()}.${ext}`;

        uploadStreamToGCS(photoUrl, gcsObjectName).then(publicURL => {
            return resolve({publicURL: publicURL, gcsObjectName: gcsObjectName});
        }).catch(err => {
            return reject(err);
        });
    });
}

// upload from url
function uploadTransactionUrlToGCS(uid, transaction, photoUrl) {
    return new Promise((resolve, reject) => {
        let _uid;
        if (!uid) {
            _uid = "unknown-uid";
        } else {
            _uid = uid;
        }

        let ext = photoUrl.split(".").pop();
        let folderRef = `/users/${_uid}/transactions}`;
        let gcsObjectName = `${folderRef}/${uuidv4()}.${ext}`;

        uploadStreamToGCS(photoUrl, gcsObjectName).then(publicURL => {
            return resolve({publicURL: publicURL, gcsObjectName: gcsObjectName});
        }).catch(err => {
            return reject(err);
        });
    });
}

// delete all posts from cloud storage for postId
// NOTE: ALTERNATE METHOD TO RETURN PROMISE
// DONGT USE FOR NOPW No way to get post in there but not ne
function destroyAllPostPhotosFromGCS(uid, postId) {
    // You do not have to use Promise constructor here, just return async function
    // return new Promise((resolve, reject) => {
    return (async (resolve, reject) => {
        const bucket = admin.storage().bucket();
        let folderRef = `/users/${uid}/posts/${postId}/`;
        // List all the files under the bucket
        let files = await bucket.getFiles({
            prefix: folderRef
        });
        // Delete each one
        let response;
        for (let i in files) {
            try {
                response = await files[i].delete();
              } catch(err) {
                reject(err);
              }
        }
        resolve(response);
    });
}

// delete all posts from cloud storage for postId
// NOTE: ALTERNATE METHOD TO RETURN PROMISE
function destroyAllTransactionPhotosFromGCS(uid, transactionId) {
    // You do not have to use Promise constructor here, just return async function
    // return new Promise((resolve, reject) => {
    return (async (resolve, reject) => {
        const bucket = admin.storage().bucket();
        let folderRef = `/users/${uid}/transactions/${transactionId}/`;
        // List all the files under the bucket
        let files = await bucket.getFiles({
            prefix: folderRef
        });
        // Delete each one
        let response;
        for (let i in files) {
            try {
                response = await files[i].delete();
              } catch(err) {
                reject(err);
              }
        }
        resolve(response);
    });
}
// delete a single object from cloud storage
function destroyFromGCS(storageFilePath) {
    let promise = new Promise((resolve, reject) => {
        const bucket = admin.storage().bucket();
        const file = bucket.file(storageFilePath);

        // storage.bucket(bucketName).file(storageFilePath).delete();
        file.delete().then(() => {
            // Deleted
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
    return promise;
}

// upload from local file - not used currently since this functionality is on the client only right now.
function uploadFileToGCS(localFileName) {
    let promise = new Promise((resolve, reject) => {
        const bucket = admin.storage().bucket();

        // const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';
        // Uploads a local file to the bucket
        const fileName = path.join(__dirname, localFileName);
        const baseFileName = fileName.split("/").pop();
        const gcsObjectName = `/testUploads/${uuidv4()}-${baseFileName}`;

        bucket.upload(fileName, {
            destination: gcsObjectName,
        }).then(() => {
            console.log(`${fileName} uploaded to ${bucket.name}${gcsObjectName}`);
        }).catch(err => {
            console.error(`ERROR: err ${err}`);
        });
    });

    return promise;
}

module.exports = {
    uploadUserUrlToGCS,
    uploadPostUrlToGCS,
    destroyAllPostPhotosFromGCS,
    uploadTransactionUrlToGCS,
    destroyAllTransactionPhotosFromGCS,
    destroyFromGCS,
    uploadFileToGCS
};