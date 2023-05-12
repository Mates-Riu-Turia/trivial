let courses = []

function reset() {
    document.getElementById("f-name").classList = "form-control"
    document.getElementById("email").classList = "form-control"
}

function verify() {
    reset()

    if (document.getElementById("f-name").value == "") {
        document.getElementById("f-name").classList.add("is-invalid")
        return false
    }

    if (document.getElementById("email").value == "") {
        document.getElementById("email").classList.add("is-invalid")
        return false
    }

    return true
}

function add_course() {
    let course = document.getElementById("courseTable")

    let course_element = document.getElementById("level").value + "-" + document.getElementById("class").value + "-" + document.getElementById("subject").value
    courses.push(course_element)

    course.innerHTML += '<li class="list-group-item d-flex" data-value="' + course_element + '">' + course_element + `<button
        type="button" class="btn btn-danger position-absolute top-50 end-0 translate-middle-y h-100" onclick="this.parentNode.remove()">
        <i class="bi bi-trash"></i>
        </button></li>`
}

function slide_next() {
    if (!verify()) { }
    else {
        document.getElementById("f-name").classList.add("d-none")
        document.getElementById("email").classList.add("d-none")
        document.getElementById("gender").classList.add("d-none")

        document.getElementById("progressbar").style.width = "100%"
        document.getElementById("progress2").classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-primary rounded-pill"

        document.getElementById("previousButton").disabled = false
        document.getElementById("nextButton").disabled = true

        document.getElementById("add_course_div").classList = "input-group mb-3"
    }
}

function slide_previous() {
    document.getElementById("f-name").classList = "form-control"
        document.getElementById("email").classList = "form-control"
        document.getElementById("gender").classList = "form-control mb-3"

        document.getElementById("progressbar").style.width = "0%"
        document.getElementById("progress2").classList = "position-absolute top-0 start-100 translate-middle btn btn-sm btn-secondary rounded-pill"

        document.getElementById("previousButton").disabled = true
        document.getElementById("nextButton").disabled = false

        document.getElementById("add_course_div").classList = "input-group mb-3 d-none"
}

async function upload() {
    await fetch("/api/add_user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: document.getElementById("f-name").value,
            email: document.getElementById("email").value,
            gender: document.querySelector("input[name='gender']:checked").value,
            courses: courses
        })
    })

    window.location = "/login"
}