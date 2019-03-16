// Check to see if a string is a valid URL
function isValidURL(str) {
    let pattern = new RegExp('^((ft|htt)ps?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?' + // port
        '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

    return (pattern.test(str));
}


//  Used to open sidebar for mobile
$(document).ready(function () {
    $(".sidenav").sidenav();
    $(".materialboxed").materialbox();
    $(".parallax").parallax();
    $(".tabs").tabs();
    $('.datepicker').datepicker({
        disableWeekends: true,
        yearRange: 1
      });
    $('.tooltipped').tooltip();
    $('.scrollspy').scrollSpy();
    $('.modal').modal();
    $('.collapsible').collapsible();
    $("label").addClass("active");
   });