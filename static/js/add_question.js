let form_page = 1

let is_guest = false

function adapt(data) {
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
        is_guest = true
    }
}

function slide_next() {
    let nextButton = document.getElementById("nextButton")
    let previousButton = document.getElementById("previousButton")
    let progressbar = document.getElementById("progressbar")
    let progress2 = document.getElementById("progress2")
    let progress3 = document.getElementById("progress3")
    
    let questionMain = document.getElementById("questionMain")
    let questionImage = document.getElementById("questionImage")
    let questionUpload = document.getElementById("questionUpload")    

    previousButton.disabled = false

    if (form_page >= 2) {
        nextButton.disabled = true
        form_page = 3
        progressbar.style.width = "100%"
        progress3.classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-primary rounded-pill"
        questionImage.classList = "d-none"
        questionUpload.classList = ""
    }
    else if (is_guest) {
        nextButton.disabled = true
        form_page = 3
        progressbar.style.width = "100%"
        progress2.classList = "position-absolute top-0 start-50 translate-middle btn btn-sm btn-primary rounded-pill"
        progress3.classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-primary rounded-pill"
        questionMain.classList = "d-none"
        questionUpload.classList = ""
    }
    else {
        form_page++
        progressbar.style.width = "50%"
        progress2.classList = "position-absolute top-0 start-50 translate-middle btn btn-sm btn-primary rounded-pill"
        questionMain.classList = "d-none"
        questionImage.classList = ""
    }
}

function slide_previous() {
    let nextButton = document.getElementById("nextButton")
    let previousButton = document.getElementById("previousButton")
    let progressbar = document.getElementById("progressbar")
    let progress2 = document.getElementById("progress2")
    let progress3 = document.getElementById("progress3")
    
    let questionMain = document.getElementById("questionMain")
    let questionImage = document.getElementById("questionImage")
    let questionUpload = document.getElementById("questionUpload")    

    if (form_page == 2 || is_guest) {
        form_page = 1
        previousButton.disabled = true
        nextButton.disabled = false
        progressbar.style.width = "0%"
        progress2.classList = "position-absolute top-0 start-50 translate-middle btn btn-sm btn-secondary rounded-pill"
        progress3.classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-secondary rounded-pill"
        questionImage.classList = "d-none"
        questionMain.classList = ""
    }    
    else {
        form_page = 2
        nextButton.disabled = false
        progressbar.style.width = "50%"
        progress3.classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-secondary rounded-pill"
        questionImage.classList = ""
        questionUpload.classList = "d-none"
    }
}


fetch("http://localhost:8080/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return true
}