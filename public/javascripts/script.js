$(document).ready(function () {
    $("#loginform").hide()
    $("#registerform").hide()
    $("#login").click(function () {
        $("#loginform").slideToggle()
    })
    $("#register").click(function () {
        $("#registerform").slideToggle()
    })
})