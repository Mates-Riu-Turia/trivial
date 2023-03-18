function  adapt(data) {
    let verify = document.getElementById("verify").classList;
    let hide = document.getElementById("hide").classList;

    if (data.User != undefined) {
        if (data.User.role == "T") {
            verify.add("d-none")
        } 
    }
    else {
        verify.add("d-none")
        hide.add("d-none")
    }
}

fetch("http://localhost:8080/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return true
}