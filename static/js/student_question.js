let changes_saved = false
let question_id

let filterForm = {
    filter: async function () {
        const response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Guest: {
                    subject: document.getElementById("subject").value,
                    course: document.getElementById("course").value
                }
            })
        })
        if (!response.ok) {
            changes_saved = true
            window.location = "/?status=questionModifyError"
        }
        else {
            return await response.json();
        }
    },
    fill_preview: async function () {
        let questions = await this.filter()
        let preview = document.getElementById("preview")
        let preview_quantity = document.getElementById("previewQuantity")
        preview_quantity.innerHTML = "Se encontraron " + questions.length + " resultados"
        preview.classList = "row row-cols-4"
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
        questions.forEach(question => {
            let prev = "<div class='col border border-5 me-3 mb-3 ms-4' style='width: 350px; " + "border-color: " + color + "!important' onclick='show_options_modal(" + question.id + ")'>"
            prev += "<p class='text-start'>" + document.getElementById("subject").options[document.getElementById("subject").selectedIndex].innerHTML + " (Nivel " + question.level + ")" + "<span style='float:right;'>" + question.time + " Segundos</span></p>"
            prev += question.question
            prev += "<p><em>Por: " + question.name_creator + "</em></p>"
            prev += "</div>"
            preview.innerHTML += prev
        });
    }
};

function slide_next() {
    document.getElementById("progressbar").style.width = "100%";
    document.getElementById("progress2").classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-primary rounded-pill"
    document.getElementById("nextButton").disabled = true
    document.getElementById("previousButton").disabled = false
    document.getElementById("filters").classList.add("d-none")
    filterForm.fill_preview()
}

function slide_previous() {
    document.getElementById("previewQuantity").innerHTML = ""
    document.getElementById("progressbar").style.width = "0%";
    document.getElementById("progress2").classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-secondary rounded-pill"
    document.getElementById("nextButton").disabled = false
    document.getElementById("previousButton").disabled = true
    document.getElementById("filters").classList = ""
    document.getElementById("preview").classList.add("d-none")
    document.getElementById("preview").innerHTML = ""
}

function show_options_modal(id) {
    question_id = id
    new bootstrap.Modal("#optionsModal").show()
}

function remove_question() {
    new bootstrap.Modal("#sureModal").show()
}

function remove_question_sure() {
    fetch("/api/question", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: question_id,
            is_guest: true
        })
    }).then(response => {
        changes_saved = true
        if (response.ok) {
            window.location = "/?status=questionModifySuccess"
        }
        else {
            window.location = "/?status=questionModifyError"
        }
    })
}

function adapt(data) {
    if (data.User != undefined) {
        let options = document.getElementById("subject").options;
        for (i = 0; i < options.length; i++) {
            if (data.User.subjects.find(element => element == options[i].value) != undefined) {
                options[i].classList = "";
                options[i].selected = true;
            }
        }
        let courses = data.User.courses
        for (let i = 0; i < courses.length; i++) {
            document.getElementById("course").innerHTML += "<option value='" + courses[i] + "'>" + courses[i] + "</option>"
        }
    }
}

fetch("/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return (changes_saved ? null : true)
}