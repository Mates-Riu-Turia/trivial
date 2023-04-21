let form_page = 1

let is_guest = false

let question_saved = false

let original_image = ""
let question_id = 0

let mainForm = {
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

let imageForm = {
    imageInput: document.getElementById("image"),
    imagePreview: document.getElementById("previewImage"),
    bigImage: document.getElementById("big"),
    updated: false,
    imageFile: File,
    verify: function () {
        this.imageInput.classList = "form-control mb-3"
        if (modify_question == true) {
            if (!this.updated) {
                return true
            }
            if (this.imageFile.size > 1000000) {
                this.imageInput.classList = "form-control mb-3 is-invalid"
                return false
            }
        }
        if (this.imageFile.name == "File") {
            this.imageInput.classList = "form-control mb-3 is-invalid"
            return false
        }
        if (this.imageFile.size > 1000000) {
            this.imageInput.classList = "form-control mb-3 is-invalid"
            return false
        }
        return true
    },
    upload: async function () {
        if (this.updated) {
            const formData = new FormData();
            formData.append("file", this.imageFile);
            const response = await fetch("/api/image", {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                window.location = "/?status=questionAddImageError"
            }
            else {
                return await response.text();
            }
        }
        else {
            return original_image;
        }
    }
};

let uploadForm = {
    hide: document.getElementById("hide"),
    verify: document.getElementById("verify"),
};

let questionForm = {
    valuesGuest: function () {
        return JSON.stringify({
            Guest: {
                level: parseInt(document.getElementById("level").value),
                question: mainForm.question.value.replace(/(\n)+/g, '<br>'),
                answers: mainForm.answers(),
                tries: parseInt(document.getElementById("tries").value),
                time: parseInt(document.getElementById("timebar").value),
            }
        })
    },
    valuesTeacher: async function () {
        return JSON.stringify({
            Teacher: {
                subject: document.getElementById("subject").value,
                level: parseInt(document.getElementById("level").value),
                question: mainForm.question.value.replace(/(\n)+/g, '<br>'),
                hide: !uploadForm.hide.checked,
                answers: mainForm.answers(),
                tries: parseInt(document.getElementById("tries").value),
                time: parseInt(document.getElementById("timebar").value),
                image: await imageForm.upload(),
                bigger: imageForm.bigImage.checked,
                verified: uploadForm.verify.checked
            }
        })
    },
    upload: async function () {
        if (question_id != 0) {
            fetch("/api/question", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: question_id
            }).then(response => {
                if (!response.ok) {
                    question_saved = true
                    window.location = "/?status=questionModifyError"
                }
            })
        }
        fetch("/api/question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: (is_guest ? this.valuesGuest() : await this.valuesTeacher())
        }).then((response) => {
            if (response.ok) {
                question_saved = true
                window.location = "/?status=questionAddSuccess"
            }
            else {
                window.location = "/?status=questionAddError"
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

            let options = document.getElementById("subject").options;
            for (i = 0; i < options.length; i++) {
                if (data.User.subjects.find(element => element == options[i].value) != undefined) {
                    options[i].classList = "";
                    options[i].selected = true;
                }
            }
        }
        else {
            let options = document.getElementById("subject").options;
            for (i = 0; i < options.length; i++) {
                options[i].classList = "";
            }
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
        if (imageForm.verify()) {
            nextButton.disabled = true
            form_page = 3
            progressbar.style.width = "100%"
            progress3.classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-primary rounded-pill"
            questionImage.classList = "d-none"
            questionUpload.classList = ""
        }
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

    answerInput.classList = "form-control"

    if (answerInput.value == "") {
        answerInput.classList = "form-control is-invalid"
    }
    else {
        add_answer_know(answerInput.value)
        answerInput.value = ""
    }
}

function add_answer_know(answer) {
    let answerTable = document.getElementById("answerTable")

    answerInput.classList = "form-control"
    answerTable.innerHTML += '<li class="list-group-item d-flex" data-value="' + answer + '">' + answer + `<button
        type="button" class="btn btn-danger position-absolute top-50 end-0 translate-middle-y h-100" onclick="this.parentNode.remove()">
        <i class="bi bi-trash"></i>
        </button></li>`
}

fetch("/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return (question_saved ? null : true)
}
imageForm.imageInput.onchange = function () {
    resizeImage();
}
imageForm.bigImage.onchange = function () {
    resizeImage();
}

function resizeImage() {
    imageForm.updated = true
    const [file] = imageForm.imageInput.files
    if (file) {
        if (file.type == "image/gif") {
            imageForm.imagePreview.src = URL.createObjectURL(file)
            imageForm.imageFile = file
        }
        else {
            var reader = new FileReader();
            reader.onload = function (e) {
                // We create an image to receive the Data URI
                var img = document.createElement('img');

                // When the event "onload" is triggered we can resize the image.
                img.onload = function () {
                    // We create a canvas and get its context.
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');

                    // We set the dimensions at the wanted size.
                    // We resize the image with the canvas method drawImage();
                    if (imageForm.bigImage.checked == true) {
                        canvas.width = 600;
                        canvas.height = 400;
                        ctx.drawImage(img, 0, 0, 600, 400);
                    }
                    else {
                        canvas.width = 300;
                        canvas.height = 200;
                        ctx.drawImage(img, 0, 0, 300, 200);
                    }

                    // We get the URL and put it as the src of the previewImage
                    imageForm.imagePreview.src = canvas.toDataURL();

                    canvas.toBlob(function (blob) {
                        imageForm.imageFile = new File([blob], "image.jpeg", { type: "image/jpeg" });
                    })
                };

                // We put the Data URI in the image's src attrºibute
                img.src = e.target.result;
            }

            //Convert the file into an URL
            reader.readAsDataURL(file);
        }
    }
}

function showPreview() {
    let color;
    switch (document.getElementById("subject").options[document.getElementById("subject").selectedIndex].getAttribute("data-value")) {
        case "foreign-language":
            color = " #da1b0b";
            break;
        case "science":
            color = "#1d950f";
            break;
        case "art":
            color = "#ad6038";
            break;
        case "history":
            color = "#e3701b";
            break;
        case "philosophy":
            color = "#fee11e";
            break;
        default:
            break;
    }

    let body = document.getElementById("previewModalBody");
    body.style.setProperty("border-color", color, "important")

    body.innerHTML = "<p class='text-start'>" + document.getElementById("subject").options[document.getElementById("subject").selectedIndex].innerHTML + " (Nivel " + document.getElementById("level").value + ")" + "<span style='float:right;'>" + document.getElementById("timebar").value + " Segundos</span></p>";
    body.innerHTML += mainForm.question.value.replace(/(\n)+/g, '<br>');

    let answers = mainForm.answers().split(';');
    let list = "<ul class='list-group'>";
    for (i = 0; i < answers.length; i++) {
        list += "<li class='list-group-item'>" + answers[i] + "</li>";
    }

    if (!is_guest) {
        body.innerHTML += "<br><img width='300' height='200' src='" + imageForm.imagePreview.src + "'></img>"
    }

    body.innerHTML += "<br><strong>RESPUESTAS</strong><br>"
    body.innerHTML += list + "</ul>";

    new bootstrap.Modal("#previewModal").show()
}

modify_question_prepare()

async function modify_question_prepare() {

    modify_question = true

    let id = new URL(window.location.toLocaleString()).searchParams.get("modifyId");

    if (id != undefined) {
        const response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({User: {
                id: parseInt(id),
                subject: "",
                level: 0,
                start_date: "2023-04-14T14:55:47.530641212",
                end_date: "2023-04-14T14:55:47.530641212",
                creator: 1,
                verified: true,
            }})
        })

        if (!response.ok) {
            question_saved = true
            window.location = "/?status=questionModifyError"
        }
        else {
            let question = await response.json()
            question = question[0]
            question_id = question.id
            document.getElementById("subject").value = question.subject
            document.getElementById("level").value = question.level
            mainForm.question.value = question.question.replace(/<br>/g, '\n')
            question.answers.split(';').forEach(answer => {
                add_answer_know(answer)
            });
            document.getElementById("previewImage").src = question.image
            imageForm.bigImage.checked = question.bigger
            original_image = question.image
            uploadForm.hide.checked = !question.hide
            document.getElementById("tries").value = question.tries
            let timebar = document.getElementById("timebar");
            timebar.value = question.time
            update_time(timebar)
            uploadForm.verify.checked = question.verified
        }
    }
}