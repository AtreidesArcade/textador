// MAIN PROCESS + INITIAL CODE
// --------------------------------------------------------------------------------
// Make sure authenticated
authCheck("index.html", (user) => {
    if (user) {
        userId = user.uid;
        // Get user info from mySQLDB ???
        // MAIN PROCESS + INITIAL CODE
        // --------------------------------------------------------------------------------
        $(document).ready(function () {
            // Show Logoff button if logged in
            $(".loggedIn").removeClass('hide');
            $(".notLoggedIn").addClass('hide');

            // welcome the user by their 'auth name'
            $("#userName span").text(user.displayName);

        }); // document.ready
        return user;
    }
});