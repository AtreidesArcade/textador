// ------------------------------------------------------------------------------
// get all the users from DB - use to list all users in cards or collection
// ------------------------------------------------------------------------------
function getUsers() {		
    // Note: ALL AJAX Calls automatically get secure token placed in header
    $.ajax({
        type: "GET",
        url: "/api/user",
        datatype: "application/json",
        success: (users) => {
            console.log(users);
        },
        error: (err) => {
            console.error(err);
        }
    });
}

function getCurrentUser() {
    $.get("/api/user/" + userUid, function (user) {

        $("#userName").text(user.name);
        $("#name").val(user.name);
        $("#mySystemNumber").val(user.mySystemNumber);
        $("#myCellNumber").val(user.myCellNumber);
        $("#emergencyNumber").val(user.emergencyNumber);
        $("#email").val(user.email);

    });
}

// Update User info
function updateUser(userInfo) {
    // Create Promise for async call
    return new Promise((resolve, reject) => {
        // ALL AJAX Calls automatically get secure token placed in header
        $.ajax({
            type: "PUT",
            url: "/api/user",
            datatype: "application/json",
            data: userInfo,
            success: (user) => {
                return resolve(user);
            },
            error: (err) => {
                return reject(err);
            }
        });
    });
}


// ---------------------------------------------------------------------------
// MAIN APP START
// ---------------------------------------------------------------------------
// Must get authorized first
authCheck("users.html", (user) => {
    if (user) {
        userUid = user.uid;
        console.log("user.js2", user.uid);
        $(document).ready(function () {
            console.log("AuthCheck", user.uid);
            // This gets the currently authenticated user from the SQL Database
            getCurrentUser();

            $(document).on("click", "#updateUser", () => {
                event.preventDefault();

                let userInfo = {};
                userInfo.name = $("#name").val();
                userInfo.mySystemNumber = $("#mySystemNumber").val();
                userInfo.myCellNumber = $("#myCellNumber").val();
                userInfo.emergencyNumber = $("#emergencyNumber").val();
                userInfo.email = $("#email").val();     
                
                updateUser(userInfo).then(user => {
                    //
                    alert(`Updated User`);
                }).catch (err => {
                    //
                    alert(`Error updating User Profile ${err}`);
                });

                
            });
        });
    }
});