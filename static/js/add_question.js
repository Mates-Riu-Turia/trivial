let form_page = 1

let is_guest = false

let question_saved = false

let mainForm = {
    subject: document.getElementById("subject").value,
    level: document.getElementById("level").value,
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
    },
    answers: function () {
        let answers = Array.from(this.answerTable.childNodes)
        let answersString;

        for (i = 0; i < answers.length; i++) {
            if (i == 0) {
                answersString = answers[i].getAttribute("data-value")
            }
            else {
                answersString += ";" + answers[i].getAttribute("data-value")
            }
        }

        return answersString
    }
};

let uploadForm = {
    timebar: document.getElementById("timebar").value,
    hide: document.getElementById("hide"),
    verify: document.getElementById("verify"),
    tries: document.getElementById("tries").value,
};

let questionForm = {
    valuesGuest: function () {
        return JSON.stringify({
            Guest: {
                level: parseInt(mainForm.level),
                question: mainForm.question.value.replace(/(\n)+/g, '<br>'),
                answers: mainForm.answers(),
                tries: parseInt(uploadForm.tries),
                time: parseInt(uploadForm.timebar),
            }
        })
    },
    valuesTeacher: function () {
        return JSON.stringify({
            Teacher: {
                subject: mainForm.subject,
                level: parseInt(mainForm.level),
                question: mainForm.question.value.replace(/(\n)+/g, '<br>'),
                hide: !uploadForm.hide.checked,
                answers: mainForm.answers(),
                tries: parseInt(uploadForm.tries),
                time: parseInt(uploadForm.timebar),
                image: "",
                bigger: false,
                verified: uploadForm.verify.checked
            }
        })
    },
    upload: function () {
        fetch("http://localhost:8080/api/question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: (is_guest ? this.valuesGuest() : this.valuesTeacher())
        }).then((response) => {
            if (response.ok) {
                question_saved = true
                window.location = "http://localhost:8080/"
            }
            else {
                alert("Server Error!, try again later")
            }
        })
    }
};

function adapt(data) {
    let subject = document.getElementById("subject").classList;
    let verify = document.getElementById("verifyAll").classList;
    let hide = document.getElementById("hideAll").classList;

    if (data.User != undefined) {
        if (data.User.role == "T") {
            verify.add("d-none")
            uploadForm.verify.checked = false
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
        answerTable.innerHTML += '<li class="list-group-item d-flex" data-value="' + answerInput.value + '">' + answerInput.value + `<button
        type="button" class="btn btn-danger position-absolute top-50 end-0 translate-middle-y h-100" onclick="this.parentNode.remove()">
        <i class="bi bi-trash"></i>
        </button></li>`
        answerInput.value = ""
    }
}

fetch("http://localhost:8080/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return (question_saved ? null : true)
}