let changes_saved = false

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
            for (let i = 0; i<courses.length; i++) {
                document.getElementById("course").innerHTML += "<option value='" + courses[i] + "'>" + courses[i] + "</option>"
            }
    }
}

fetch("/api/auth").then((response) => response.json()).then((data) => (adapt(data)))

window.onbeforeunload = function () {
    return (changes_saved ? null : true)
}