let form_page = 1;
let is_admin = false;
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
    filter: function () {
        fetch("/api/filter_question", {
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
        }).then(response => console.log(response.json()))
    }
};

function adapt(data) {
    let creator = document.getElementById("creator").classList;

    if (data.User != undefined) {
        if (data.User.role == "T") {
            let options = document.getElementById("subject").options;
            for (i=0; i<options.length; i++) {
                if (data.User.subjects.find(element => element == options[i].value) != undefined) {
                    options[i].classList = "";
                    options[i].selected = true;
                }
            }
            creator.add("d-none")
        }
        else {
            let options = document.getElementById("subject").options;
            for (i=0; i<options.length; i++) {
                options[i].classList = "";
            }
        }
    }
}

function slide_next() {
    form_page = 2;
    filterForm.filter()
}

fetch("/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return (changes_saved ? null : true)
}