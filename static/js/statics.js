function Static(subject, quantity) {
    this.subject = subject
    this.quantity = quantity
}

async function get_statics(subjects, creator) {
    let total = []
    for (let i = 0; i < subjects.length; i++) {
        let subject = subjects[i]
        let questions = []

        let response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                User: {
                    id: 0,
                    subject: subject,
                    level: 0,
                    start_date: "1970-06-01T14:55:47.530641212",
                    end_date: "2999-04-14T14:55:47.530641212",
                    creator: creator,
                    verified: true
                }
            })
        })
        if (!response.ok) {
            window.location = "/?status=questionModifyError"
        }
        else {
            questions.push((await response.json()).length)
        }

        response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                User: {
                    id: 0,
                    subject: subject,
                    level: 1,
                    start_date: "1970-06-01T14:55:47.530641212",
                    end_date: "2999-04-14T14:55:47.530641212",
                    creator: creator,
                    verified: true
                }
            })
        })
        if (!response.ok) {
            window.location = "/?status=questionModifyError"
        }
        else {
            questions.push((await response.json()).length)
        }

        response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                User: {
                    id: 0,
                    subject: subject,
                    level: 2,
                    start_date: "1970-06-01T14:55:47.530641212",
                    end_date: "2999-04-14T14:55:47.530641212",
                    creator: creator,
                    verified: true
                }
            })
        })
        if (!response.ok) {
            window.location = "/?status=questionModifyError"
        }
        else {
            questions.push((await response.json()).length)
        }

        response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                User: {
                    id: 0,
                    subject: subject,
                    level: 3,
                    start_date: "1970-06-01T14:55:47.530641212",
                    end_date: "2999-04-14T14:55:47.530641212",
                    creator: creator,
                    verified: true
                }
            })
        })
        if (!response.ok) {
            window.location = "/?status=questionModifyError"
        }
        else {
            questions.push((await response.json()).length)
        }

        response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                User: {
                    id: 0,
                    subject: subject,
                    level: 4,
                    start_date: "1970-06-01T14:55:47.530641212",
                    end_date: "2999-04-14T14:55:47.530641212",
                    creator: creator,
                    verified: true
                }
            })
        })
        if (!response.ok) {
            window.location = "/?status=questionModifyError"
        }
        else {
            questions.push((await response.json()).length)
        }

        response = await fetch("/api/filter_question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                User: {
                    id: 0,
                    subject: subject,
                    level: 5,
                    start_date: "1970-06-01T14:55:47.530641212",
                    end_date: "2999-04-14T14:55:47.530641212",
                    creator: creator,
                    verified: true
                }
            })
        })
        if (!response.ok) {
            window.location = "/?status=questionModifyError"
        }
        else {
            questions.push((await response.json()).length)
        }

        total.push(new Static(subject, questions))
    }

    return total
}

async function get_global_statics(static) {
    let result = []
    static.forEach(subject => {
        result.push(subject.quantity.reduce((acc, curr) => acc + curr, 0))
    })
    return result
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function get_level_statics(static) {
    let reference = "subjectsChart"
    static.forEach(subject => {
        let container = document.createElement("div")
        let canvas = document.createElement("canvas")
        canvas.id = subject.subject

        container.appendChild(canvas)

        insertAfter(document.getElementById(reference), container)

        reference = subject.subject

        new Chart(document.getElementById(subject.subject), {
            type: 'doughnut',
            data: {
                labels: ["Nivel Básico", "Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4", "Nivel Bachillerato"],
                datasets: [{
                    label: 'Número de preguntas',
                    data: subject.quantity,
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: "Preguntas de " + subject.subject + " por nivel"
                    }
                }
            }
        })

    })
}

async function subjectSelected(subject) {
    let subjectArray = []
    subjectArray.push(subject.value)
    let statics = await get_statics(subjectArray, 1)
    console.log(statics)
    get_level_statics(statics)
} 

window.addEventListener('load', async function () {
    document.getElementById("main").classList = "d-none"
    let user

    await fetch("/api/auth").then((response) => response.json()).then((data) => (user = data))

    user = user.User

    if (user.role == "T") {

        let statics = await get_statics(user.subjects, 2)

        new Chart(document.getElementById('subjectsChart'), {
            type: 'pie',
            data: {
                labels: user.subjects,
                datasets: [{
                    label: 'Número de preguntas',
                    data: await get_global_statics(statics),
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: "Número de preguntas por asignatura"
                    }
                }
            }
        })
        document.getElementById("overlay").classList = "d-none"
        document.getElementById("main").classList = "m-auto text-center"
        get_level_statics(statics)
    }
    else {
        let subjects = ["anatomia", "english", "biologia", "castellano", "clasica", "dibuix", "ed_fisica", "filosofia", "fisica_quimica", "frances", "historia", "grec", "informatica", "literatura", "llati", "mates", "musica", "orientacio", "plastica", "religio", "tecnologia", "valencia", "etica"];
        let statics = await get_statics(subjects, 1)
        staticGlobal = statics
        let global = await get_global_statics(statics)
        document.getElementById("main").classList = "m-auto text-center"
        document.getElementById("overlay").classList = "d-none"
        document.getElementById("subjectSelector").classList = "form-floating mt-3 mb-3"
        let chart = new Chart(document.getElementById('subjectsChart'), {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Número de preguntas',
                    data: global,
                    borderWidth: 1
                }]
            },
            options: {
                scaleShowValues: true,
                scales: {
                    x: {
                      ticks: {
                        autoSkip: false
                      }
                    }
                  },
                plugins: {
                    title: {
                        display: true,
                        text: "Número de preguntas por asignatura"
                    }
                }
            }
        })
        chart.resize(600, 400)
    }
})