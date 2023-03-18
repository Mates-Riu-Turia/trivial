let form_page = 1

let is_guest = false

let mainForm = {
    subject: document.getElementById("subject"),
    level: document.getElementById("level"),
    question: document.getElementById("question"),
    answerTable: document.getElementById("answerTable"),
    answerInput: document.getElementById("answerInput"),
    reset: function () {
        this.question.classList = "form-control overflow-auto"
        this.answerInput.classList = "form-control"
    },
    verify: function () {
        this.reset()
        if (this.question.value == "") {
            this.question.classList = "form-control overflow-auto is-invalid"
            return false
        }
        if (this.answerTable.innerHTML == "") {
            this.answerInput.classList = "form-control is-invalid"
            return false
        }
        return true
    }
};

function adapt(data) {
    let subject = document.getElementById("subject").classList;
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
        subject.add("d-none")
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
        if (mainForm.verify()) {
            nextButton.disabled = true
            form_page = 3
            progressbar.style.width = "100%"
            progress2.classList = "position-absolute top-0 start-50 translate-middle btn btn-sm btn-primary rounded-pill"
            progress3.classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-primary rounded-pill"
            questionMain.classList = "d-none"
            questionUpload.classList = ""
        }
    }
    else {
        if (mainForm.verify()) {
            form_page++
            progressbar.style.width = "50%"
            progress2.classList = "position-absolute top-0 start-50 translate-middle btn btn-sm btn-primary rounded-pill"
            questionMain.classList = "d-none"
            questionImage.classList = ""
        }
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
        questionUpload.classList = "d-none"
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

function update_time(timebar) {
    document.getElementById("timebarLabel").innerHTML = timebar.value + " Segundos"
}

function add_answer() {
    let answerInput = document.getElementById("answerInput")
    let answerTable = document.getElementById("answerTable")

    answerInput.classList = "form-control"

    if (answerInput.value == "") {
        answerInput.classList = "form-control is-invalid"
    }
    else {
        answerTable.innerHTML += '<li class="list-group-item d-flex">' + answerInput.value +  `<button
        type="button" class="btn btn-danger position-absolute top-50 end-0 translate-middle-y h-100" onclick="this.parentNode.remove()">
        <i class="bi bi-trash"></i>
        </button></li>`
    }
}

fetch("http://localhost:8080/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return true
}