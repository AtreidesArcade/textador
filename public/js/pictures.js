"use strict";

// Render the photo Card
// polymoripc -- if prependMode exists, prepend vs append so newly added card goes to front
function photoCardRender(photo, prependMode) {
    let photoCardContentDiv = "";

    photoCardContentDiv += `
        <div id=${photo.id} data-key=${photo.id} class="photoHeader col s12 l6">
            <div class="card">
                <div class="card-image">
                    <img data-key=${photo.id} class="photoImage responsive-img materialboxed" src="${photo.url}" alt="" >
                    <a href="" class="halfway-fab btn-floating pink">
                        <i class="material-icons">favorite</i>
                    </a>
                </div>
                <div class="card-content">
                    <span data-key=${photo.id} class="photoTitle flow-text card-title">${photo.fileTitle}</span>
                    <p data-key=${photo.id} class="photoDescription truncate">${photo.fileDescription}</p>
                </div>
                <div class="card-action">
                    <a href="#" class="indigo-text text-darken-4" data-target="modal-photo">
                        <i data-key=${photo.id} class="photoInfo material-icons left">info</i>
                    </a>
                    <a href="#" class="indigo-text text-darken-4">
                        <i data-key=${photo.id} class="photoDelete material-icons left">delete</i>
                    </a>
                </div>
            </div>
        </div>
        `;

    if (prependMode) {
        $(".photoCardContent").prepend(photoCardContentDiv);
    } else {
        $(".photoCardContent").append(photoCardContentDiv);
    }
}

function photoRenderAllCards(photos) {
    $(".photoCardContent").empty();

    // Dont display them all since it may be too slow
    for (let i = 0;
        (i < photos.length && i < 10); i++) {
        photoCardRender(photos[i]);
    }
}

// ================================================================================================
// AJAX CALLS
// ================================================================================================

// get all the photos for a different user - not the one currenly logged on
function getDifferentUsersPhotos() {
    // ALL AJAX Calls automaticallt get secure token placed in header
    $.ajax({
        type: "GET",
        url: "/api/photo",
        datatype: "application/json",
        success: (photos) => {
            console.log(photos);
        },
        error: (err) => {
            console.error(err);
        }
    });
}

// Saves photo to the SQL Database
function savePhoto(photoInfo) {
    // Create Promise for async call
    return new Promise((resolve, reject) => {
        // ALL AJAX Calls automatically get secure token placed in header
        $.ajax({
            type: "POST",
            url: "/api/photo",
            datatype: "application/json",
            data: photoInfo,
            success: (photo) => {
                photoCardRender(photo, true);
                return resolve(photo);
            },
            error: (err) => {
                return reject(err);
            }
        });
    });
}

// Delete photo
function deletePhoto(photoInfo, completionHandler) {
    // ALL AJAX Calls automatically get secure token placed in header
    console.log(photoInfo);
    $.ajax({
        type: "DELETE",
        url: "/api/photo",
        datatype: "application/json",
        data: photoInfo,
        success: (photoId) => {
            completionHandler(photoId);
            console.log(`Deleted ${photoId} photo(s)`);
        },
        error: (err) => {
            console.error(err);
        }
    });
}

// Save photo from URL
function saveFromUrlWithUid(photoInfo) {
    // ALL AJAX Calls automatically get secure token placed in header
    console.log(photoInfo);
    $.ajax({
        type: "POST",
        url: "/api/photoURL",
        datatype: "application/json",
        data: photoInfo,
        success: (photo) => {
            photoCardRender(photo, true);
            console.log(photo);
        },
        error: (err) => {
            console.error(err);
        }
    });
}

// Get the currently logged in user's photos
function getCurrentUsersPhotos() {
    // ALL AJAX Calls automatically get secure token placed in header
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/api/photo",
            datatype: "application/json",
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

// clear photo
function resetPhoto() {
    $("#uploadFileForm")[0].reset();
}

// clear photo URL
function resetPhotoURL() {
    $("#inputURLForm")[0].reset();
}

// reset the form
function resetForm() {
    $("#uploadFileForm")[0].reset();
    $("#inputURLForm")[0].reset();
    $("#photoInputForm")[0].reset();
}

// Form validation
function validateForm() {
    let result = {
        isValid: true,
        message: "",
        saveType: 0 // 0 == file, 1 = URL
    };

    const file = $("#photoFile").get(0).files[0];

    const inputPhotoURL = $("#inputPhotoURL").val();
    const fileTitle = $("#fileTitle").val();
    const fileDescription = $("#fileDescription").val();

    if (inputPhotoURL === "" && file === undefined) {
        result.isValid = false;
        result.message += "Upload File or Enter Valid Image URL\n";
        return result;
    }

    if (inputPhotoURL !== "" && file !== undefined) {
        result.isValid = false;
        result.message += "Only Upload File -OR- Valid Image URL, not both\n";
        return result;
    }

    if (fileTitle === "") {
        result.isValid = false;
        result.message += "Invalid photo title\n";
    }
    if (fileDescription === "") {
        result.isValid = false;
        result.message += "Invalid photo description\n";
    }

    if (file !== undefined) {
        result.saveType = 0;
        return result;
    }

    if (inputPhotoURL !== "" && isValidURL(inputPhotoURL)) {
        result.saveType = 1;
        return result;
    }

    return result;
}

//  THIS IS NEEDED TO GET THE CURRENT USER. AND BECAUSE WE HAVE TO WAIT FOR A REPLY FROM THE DATABASE
authCheck("pictures.html", (user) => {
    if (user) {

        $(document).ready(function () {
            // get all the images for this user
            getCurrentUsersPhotos().then(photos => {
                photoRenderAllCards(photos);
            }).catch(err => {
                // pop up modal with all picture info
                let errMsg;
                if (typeof err === "object") {
                    errMsg = `Error Status: ${err.status}, Message: ${err.statusText}`;
                } else {
                    errMsg = err;    
                }
                $(".error-details").html(errMsg);
                $("#modal-error").modal("open");
            });

            // photo info
            $(document).on("click", ".photoInfo", event => {
                event.preventDefault();
                // Create an object for the photo data
                let photoInfo = {};
                photoInfo.id = parseInt($(event.target).attr("data-key"));
                // pop up modal with all picture info
                $(".photo-details").html(photoInfo.id);
                $('#modal-photo').modal('open');
            });

            $(document).on("click", ".photoDelete", event => {
                event.preventDefault();

                // Create an object for the photo data
                let photoInfo = {};
                photoInfo.id = parseInt($(event.target).attr("data-key"));
                deletePhoto(photoInfo, photoId => {
                    // Delete from DOM
                    $(`#${photoInfo.id}`).empty();
                    // Change alert to modal
                    $(".info-details").html(`Deleted ${photoId} photo(s)`);
                    $("#modal-info").modal("open");
                }).catch(err => {
                    // pop up modal with all picture info
                    $(".error-details").html(err);
                    $("#modal-error").modal("open");
                });
            });

            // Clear the file upload field
            $(document).on("click", ".clearFileUpload", () => {
                event.preventDefault();
                resetPhoto();
            });

            // Clear the Photo URL field
            $(document).on("click", "#clearPhotoURL", () => {
                event.preventDefault();
                resetPhotoURL();
            });

            // Clear the whole form
            $(document).on("click", "#clearForm", () => {
                event.preventDefault();
                resetForm();
            });

            // Upload a photo to FB
            $(document).on("click", "#savePhoto", () => {
                let form = $("#uploadFileForm")[0];
                if (form.checkValidity) {
                    event.preventDefault();

                    // Validate Form
                    let result = validateForm();

                    if (result.isValid) {
                        switch (result.saveType) {
                            case 0:
                                const file = $("#photoFile").get(0).files[0];

                                // save to firebase cloud storage
                                // MUST Save photo to cloud first since we need unque object key and public URL to store in DB
                                uploadUserPhoto(file).then(photo => {
                                    photo.fileTitle = $("#fileTitle").val();
                                    photo.fileDescription = $("#fileDescription").val();
                                    // save photo to sql database
                                    savePhoto(photo).then(photoInfo => {
                                        console.log(photoInfo);
                                        resetForm();
                                    });
                                }).catch(err => {
                                    // pop up modal with all picture info
                                    $(".error-details").html(err);
                                    $("#modal-error").modal("open");
                                });
                                break;
                            case 1:
                                // save via URL
                                let photoInfo = {};
                                photoInfo.inputPhotoURL = $("#inputPhotoURL").val();
                                photoInfo.fileTitle = $("#fileTitle").val();
                                photoInfo.fileDescription = $("#fileDescription").val();

                                // Saving of photo AND photo data happens on server
                                saveFromUrlWithUid(photoInfo);
                                resetForm();
                                break;
                            default:
                                alert("Invalid SaveType - contact programmer");
                                break;
                        }
                    } else {
                        alert(result.message);
                    }
                } else {
                    alert("Materialize validation error");
                }
            });
        });

    } // if (user)
});