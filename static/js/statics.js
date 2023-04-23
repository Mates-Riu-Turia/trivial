function Static(subject, quantity) {
    this.subject = subject
    this.quantity = quantity
}

async function get_statics(subjects) {
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
                    creator: 2,
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
                    creator: 2,
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
                    creator: 2,
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
                    creator: 2,
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
                    creator: 2,
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
                    creator: 2,
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
        //document.getElementById("charts").innerHTML += "<div><canvas id='" + subject.subject + "Chart'></canvas></div>"

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

window.addEventListener('load', async function () {
    let user

    await fetch("/api/auth").then((response) => response.json()).then((data) => (user = data))

    user = user.User

    let statics = await get_statics(user.subjects)

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

    get_level_statics(statics)
})