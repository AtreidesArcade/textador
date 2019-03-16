// ================================================================================================
// CLOUD STORAGE CALLS
// ================================================================================================
// upload file to firebase cloud storage
// uploadTag is "photos" or "posts" or "transactions"
function uploadPhoto(file, uploadTag) {
    // Create Promise for async call
    return new Promise((resolve, reject) => {
        let user = currentAuthUser();
        let uid = user.uid;
        console.log(`uid: ${uid}`);
        let photoObj = {};

        let folderRef = firebase.storage().ref(`/users/${uid}/${uploadTag}`);
        // Create a unique file name
        const fileName = (+new Date()) + "-" + file.name;
        photoObj.fileName = fileName;

        const metadata = {
            contentType: file.type
        };
        // Create a reference to file
        var photoRef = folderRef.child(fileName);
        const task = photoRef.put(file, metadata);

        task.then(snapshot => {
            console.log(`${snapshot}`);
            console.log("Uploaded a blob or file!");
            snapshot.ref.getDownloadURL().then(url => {
                photoObj.url = url;
                // MUST Save full object path in filename so we can find it for deletion
                // aka this is the google cloud object name not really the "file" name
                photoObj.fileName = snapshot.metadata.fullPath;
                console.log(photoObj);
                return resolve(photoObj);
            });
        }).catch(err => {
            return reject(err);
        });
    });
}

// Upload a user photo
function uploadUserPhoto(file) {
    // Create Promise for async call
    return new Promise((resolve, reject) => {
        uploadPhoto(file, "users").then( photoObj => {
            return resolve(photoObj);
        }).catch(err => {
            return reject(err);
        });
    });
}

// Upload a posts photo
function uploadPostPhoto(file) {
    // Create Promise for async call
    return new Promise((resolve, reject) => {
        uploadPhoto(file, "posts").then( photoObj => {
            return resolve(photoObj);
        }).catch(err => {
            return reject(err);
        });
    });
}

// Upload a posts photo
function uploadTransactionPhoto(file) {
    // Create Promise for async call
    return new Promise((resolve, reject) => {
        uploadPhoto(file, "transactions").then( photoObj => {
            return resolve(photoObj);
        }).catch(err => {
            return reject(err);
        });
    });
}

// Get the users photos
function getUserPhotos(userId) {
    // ALL AJAX Calls automatically get secure token placed in header
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/api/photo/user",
            datatype: "application/json",
            data: {userId: userId},
            success: (photos) => {
                console.log(photos);
                if (photos && photos.length > 0) {
                    return resolve(photos);
                }
            },
            error: (err) => {
                return reject(err);
            }
        });
    });
}

// Get the post photos
function getPostPhotos(postId) {
    // ALL AJAX Calls automatically get secure token placed in header
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/api/photo/post",
            datatype: "application/json",
            data: {postId: postId},
            success: (photos) => {
                console.log(photos);
                if (photos && photos.length > 0) {
                    return resolve(photos);
                }
            },
            error: (err) => {
                return reject(err);
            }
        });
    });
}

// Get the currently logged in user's photos
function getTransactionPhotos(transactionId) {
    // ALL AJAX Calls automatically get secure token placed in header
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/api/photo/transaction",
            datatype: "application/json",
            data: {transactionId: transactionId},
            success: (photos) => {
                console.log(photos);
                if (photos && photos.length > 0) {
                    return resolve(photos);
                }
            },
            error: (err) => {
                return reject(err);
            }
        });
    });
}