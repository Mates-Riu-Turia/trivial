let is_admin = false;
let question_id = 0;
let changes_saved = false;

let filterForm = {
    start_date: function () {
        let date = document.getElementById("startDate").value;
        if (date == "") {
            date = "1970-06-01"
        }
        return (date + "T00:00:00.000000000")
    },
    end_date: function () {
        let date = document.getElementById("endDate").value;
        if (date == "") {
            date = "2999-06-01"
        }
        return (date + "T23:59:59.999999999")
    },
    filter: async function () {
        const response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subject: document.getElementById("subject").value,
                level: parseInt(document.getElementById("level").value),
                start_date: this.start_date(),
                end_date: this.end_date(),
                creator: parseInt(document.querySelector("input[name='creator']:checked").value)
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
            prev += "<br><img width='300' height='200' class='mb-3' src='" + question.image + "'></img>"
            prev += "</div>"
            preview.innerHTML += prev
        });
    }
};

function adapt(data) {
    let creator = document.getElementById("creator").classList;

    if (data.User != undefined) {
        if (data.User.role == "T") {
            let options = document.getElementById("subject").options;
            for (i = 0; i < options.length; i++) {
                if (data.User.subjects.find(element => element == options[i].value) != undefined) {
                    options[i].classList = "";
                    options[i].selected = true;
                }
            }
            creator.add("d-none")
        }
        else {
            is_admin = true
            let options = document.getElementById("subject").options;
            for (i = 0; i < options.length; i++) {
                options[i].classList = "";
            }
        }
    }
}

function slide_next() {
    document.getElementById("progressbar").style.width = "100%";
    document.getElementById("progress2").classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-primary rounded-pill"
    document.getElementById("nextButton").disabled = true
    document.getElementById("previousButton").disabled = false
    document.getElementById("filters").classList.add("d-none")
    filterForm.fill_preview()
}

function slide_previous() {
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
    let verify = document.getElementById("verify")
    if (!is_admin) {
        verify.classList.add("d-none")
    }
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
        body: question_id
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

function verify_question() {
    fetch("/api/question", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: question_id
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

fetch("/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return (changes_saved ? null : true)
}