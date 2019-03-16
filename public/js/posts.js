// Render the post Card
// polymoripc -- if prependMode exists, prepend vs append so newly added card goes to front
function postCardRender(post, prependMode) {
    let postCardContentDiv = "";
    if (!post.amount) {
        post.amount = 0;
    }

    postCardContentDiv += `
        <div id=${post.id} data-key=${post.id} class="postHeader col s12 l6">
            <div class="card">
                <div class="card-image">
                    <img data-key=${post.id} class="postImage responsive-img materialboxed" src="${post.url}" alt="" >
                    <a href="" class="halfway-fab btn-floating grey">
                        <i class="material-icons">favorite</i>
                    </a>
                </div>
                <div class="card-content">
                    <span data-key=${post.id} class="postTitle flow-text card-title">${post.title}</span>
                    <span data-key=${post.id} class="postAmount flow-text card-title">$${post.amount}</span>
                    <p data-key=${post.id} class="postDescription truncate">${post.body}</p>
                </div>
                <div class="card-action">
                    <a href="#" class="indigo-text text-darken-4" data-target="modal-post">
                        <i data-key=${post.id} class="postInfo material-icons left">info</i>
                    </a>
                    <a href="#" class="indigo-text text-darken-4">
                        <i data-key=${post.id} class="postDelete material-icons left">delete</i>
                    </a>
                </div>
            </div>
        </div>
        `;

    if (prependMode) {
        $(".postCardContent").prepend(postCardContentDiv);
    } else {
        $(".postCardContent").append(postCardContentDiv);
    }
}

function postRenderAllCards(posts) {
    $(".posCardContent").empty();

    // Dont display them all since it may be too slow
    for (let i = 0;
        (i < posts.length && i < 10); i++) {
        if (posts[i].Photos && posts[i].Photos.length > 0) {
            console.log(posts[i].Photos[0].url);
            posts[i].url = posts[i].Photos[0].url;
        } else {
            posts[i].url = "";
        }
        postCardRender(posts[i]);
    }
}



// --------------------------------------------------------------------------------------------------------------
// AJAX CALLS START
// --------------------------------------------------------------------------------------------------------------

// ====================================================================================================================
// GET CURRENT USERS POSTS
// ===================================================================================================================
function getCurrentUsersPosts() {
    // ALL AJAX Calls automatically get secure token placed in header
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/api/post",
            datatype: "application/json",
            success: (posts) => {
                console.log(posts);
                if (posts && posts.length > 0) {
                    return resolve(posts);
                }
            },
            error: (err) => {
                return reject(err);
            }
        });
    });
}

// ====================================================================================================================
// POST PHOTO TESTING AJAX CALL - LUKE -- you can use this as example and change route name to go to your api
// Saves post with photo to the SQL Database
// ====================================================================================================================
function savePostPhoto(postInfo) {
    // Create Promise for async call
    return new Promise((resolve, reject) => {
        // ALL AJAX Calls automatically get secure token placed in header
        $.ajax({
            type: "POST",
            url: "/api/post",
            datatype: "application/json",
            data: postInfo,
            success: (post) => {
                return resolve(post);
            },
            error: (err) => {
                return reject(err);
            }
        });
    });
}
// ====================================================================================================================
// END POST Add
// ===================================================================================================================

// ====================================================================================================================
// DELETE POST
// ===================================================================================================================
function deletePost(postInfo) {
    // ALL AJAX Calls automatically get secure token placed in header
    return new Promise((resolve, reject) => {
        console.log(postInfo);
        $.ajax({
            type: "DELETE",
            url: `/api/post/${postInfo.id}`,
            datatype: "application/json",
            success: (rowsDeleted) => {
                console.log(`Deleted ${rowsDeleted} post(s)`);
                return resolve(rowsDeleted);
            },
            error: (err) => {
                console.error(err);
                return reject(err);
            }
        });
    });
}
// --------------------------------------------------------------------------------------------------------------
// END AJAX CALLS
// --------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------
// HTML validation and manipulation
// --------------------------------------------------------------------------------------------------------------
function validateForm() {
    let result = {
        isValid: true,
        message: "",
    };

    const postTitle = $("#postTitle").val();
    const postBody = $("#postBody").val();
    const postAmount = $("#postAmount").val();

    if (postTitle === "") {
        result.isValid = false;
        result.message += "Invalid post title\n";
    }
    if (postBody === "") {
        result.isValid = false;
        result.message += "Invalid post body\n";
    }

    if (postAmount !== "") {
        if (isNaN(postAmount)) {
            result.isValid = false;
            result.message += "Post Amount must be a number\n";
        }
    } else {
        result.isValid = false;
        result.message += "Invalid Post Amount\n";
    }

    return result;
}

// clear photo
function resetFileUpload() {
    $("#uploadPostFileForm")[0].reset();
}

// reset the form
function resetForm() {
    $("#uploadPostFileForm")[0].reset();
    $("#postInputForm")[0].reset();
}

// --------------------------------------------------------------------------------------------------------------
// MAIN PROGRAM START
// --------------------------------------------------------------------------------------------------------------
//  THIS IS NEEDED TO GET THE CURRENT USER. AND BECAUSE WE HAVE TO WAIT FOR A REPLY FROM THE DATABASE
authCheck("posts.html", (user) => {
    if (user) {
        userId = user.uid;

        $(document).ready(function () {
            // Get posts for current user
            getCurrentUsersPosts().then(posts => {
                postRenderAllCards(posts);
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

            // Clear fields
            $(document).on("click", ".clearPostFileUpload", () => {
                event.preventDefault();
                resetFileUpload();
            });
            // Clear the whole form
            $(document).on("click", "#clearPostForm", () => {
                event.preventDefault();
                resetForm();
            });

            $(document).on("click", "#savePostPhoto", () => {
                event.preventDefault();

                let result = validateForm();

                if (result.isValid) {
                    const file = $("#postPhotoFile").get(0).files[0];
                    if (file !== undefined) {
                        // Save photo to firebase cloud storage
                        // MUST Save photo to cloud first since we need unque object key and public URL to store in DB
                        uploadPostPhoto(file).then(photo => {
                            // save post and photo to sql database
                            let post = {};
                            // fill in all posts field from html form
                            post.title = $("#postTitle").val();
                            post.body = $("#postBody").val();
                            post.amount = $("#postAmount").val();
                            post.fileName = photo.fileName; // Full filename of where object is stored
                            post.url = photo.url; // Public URL
                            savePostPhoto(post).then(res => {
                                res.url = post.url;
                                postCardRender(res, true);
                                console.log(res);
                                resetForm();
                            });
                        }).catch(err => {
                            // pop up modal with all picture info
                            $(".error-details").html(err);
                            $("#modal-error").modal("open");
                        });
                    } else {
                        // save post without photo
                        let post = {};
                        post.title = $("#postTitle").val();
                        post.body = $("#postBody").val();
                        post.amount = $("#postAmount").val();
                        savePostPhoto(post).then(res => {
                            res.url = "";
                            postCardRender(res, true);
                            console.log(res);
                            resetForm();
                        });
                    } // if file
                } else {
                    // isValid Failed
                    let errMsg = result.message;
                    $(".error-details").html(errMsg);
                    $("#modal-error").modal("open");
                }
            });

            $(document).on("click", ".postDelete", event => {
                event.preventDefault();

                // Create an object for the photo data
                let postInfo = {};
                postInfo.id = parseInt($(event.target).attr("data-key"));
                deletePost(postInfo).then(postId => {
                    // Delete from DOM
                    $(`#${postInfo.id}`).empty();
                    // Change alert to modal
                    $(".info-details").html(`Deleted ${postId} post(s)`);
                    $("#modal-info").modal("open");
                }).catch(err => {
                    // pop up modal with all picture info
                    $(".error-details").html(err);
                    $("#modal-error").modal("open");
                });
            });

            // post info
            $(document).on("click", ".postInfo", event => {
                event.preventDefault();
                // Create an object for the post data
                let postInfo = {};
                postInfo.id = parseInt($(event.target).attr("data-key"));
                // pop up modal with all picture info
                $(".post-details").html(postInfo.id);
                $('#modal-post').modal('open');
            });


            // ====================================================================================================================
            // END POST MAIN
            // ====================================================================================================================

        });
    }

});