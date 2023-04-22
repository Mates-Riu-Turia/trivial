function Static (subject, quantity){
    this.subject = subject
    this.quantity = quantity
}

async function get_statics(subjects) {
    let total = []
    subjects.forEach(async subject => {
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
    })
    console.log(total)
}

async function get_subject_statics() {

}

window.addEventListener('load', async function () {
    let user

    await fetch("/api/auth").then((response) => response.json()).then((data) => (user = data))

    user = user.User

    get_statics(user.subjects)

    new Chart(document.getElementById('subjectsChart'), {
        type: 'pie',
        data: {
            labels: user.subjects,
            datasets: [{
                label: 'Número de preguntas',
                data: [1],
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
})