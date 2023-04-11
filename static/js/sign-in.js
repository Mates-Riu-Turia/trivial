function changePasswordVisibility(button) {    
    let field = document.getElementById("password");

    if (field.type == "password") {
        field.type = "text"
        button.classList = "bi bi-eye-slash"
    }
    else {
        field.type = "password"
        button.classList = "bi bi-eye"
    }
}

function signAsGuest(checkBox) {
    if (checkBox.checked) {
        document.forms["loginForm"]["password"].disabled = true;
    }
    else {
        document.forms["loginForm"]["password"].disabled = false;
    }
}

function guestLogin() {
    let guest = {
        teacher_email: document.forms["loginForm"]["username"],
        name: document.forms["loginGuest"]["guest-name"],
        course: document.forms["loginGuest"]["guest-course"],
        class: document.forms["loginGuest"]["guest-class"],
        subject: document.forms["loginGuest"]["guest-subject"],
        modalError: new bootstrap.Modal("#guestModalError"),
        reset: function () {
            this.name.classList = "form-control"
            for (i=1; i<=3; i++) {
                 document.forms["loginGuest"][i].classList = "form-select"
            }
        },
        verify: function () {
            this.reset()
            let status = true
            for (i=0; i<=3; i++) {
                if (document.forms["loginGuest"][i].value == "") {
                    document.forms["loginGuest"][i].classList.add("is-invalid")
                    status = false
                }
            } 
            return status           
        },
        values: function () {
            return JSON.stringify({Guest: {
                teacher_email: this.teacher_email.value,
                name: this.name.value,
                course: this.course.value,
                class: this.class.value,
                subject: this.subject.value,
            }})
        }
    }
    
    if (!guest.verify()) {
        return false
    }

    fetch("http://localhost:8080/api/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: guest.values()
    }).then((response) => {
        if (response.status == 401) {
            guest.modalError.show()
        }
        else if (response.ok) {
            window.location = "http://localhost:8080"
        }
        else {
            alert("Server Error!, try it again later")
        }
      })

      return false
} 

function validateForm() {
    let user = {
        email: document.forms["loginForm"]["username"],
        password: document.forms["loginForm"]["password"],
        pass_btn: document.getElementById("toggle-password").style,
        guest: document.forms["loginForm"]["guest"].checked,
        modal: new bootstrap.Modal("#guestModal"),
        reset: function() {
            this.email.classList = "form-control"
            this.password.classList = "form-control"
            this.pass_btn.right = "5%";
            this.pass_btn.top = "25%";
        },
        verify: function() {
            if (this.email.value == "") {
                this.email.classList.add("is-invalid")
                return false
            }
            else if (this.password.value == "" && !this.guest) {
                this.password.classList.add("is-invalid")
                this.pass_btn.right = "15%"
                this.pass_btn.top = "15%"

                return false
            }
            return true
        },
        values: function() {
            return JSON.stringify({User: {
                email: this.email.value,
                password: this.password.value
            }})
        }
    };

    user.reset()
    if (!user.verify()) {
        return false
    }

    if (user.guest) {
        user.modal.show()
        return false
    }
    
    fetch("http://localhost:8080/api/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: user.values()
    }).then((response) => {
        if (response.status == 401) {
            this.password.classList.add("is-invalid")
            let pass_btn = document.getElementById("toggle-password").style;
            pass_btn.right = "15%";
            pass_btn.top = "15%";
        }
        else if (response.ok) {
            window.location = "/"
        }
        else {
            window.location = "/login?status=loginError"
        }
      })

    return false
}

function prepare() {
    let url = new URL(window.location.toLocaleString()).searchParams;
  
    let alertSuccess = document.getElementById("alertSuccess");
    let alertError = document.getElementById("alertError");
    let alertErrorMessage = document.getElementById("alertErrorMessage")
  
    if (url.get("status") == "sessionClosed") {
      alertSuccess.classList = "alert alert-success alert-dismissible fade show";
    }
    if (url.get("status") == "loginError") {
       alertErrorMessage.innerHTML = "Sucedió un error inesperado al iniciar sesión. Pruebe más adelante o contacte con el administrador."
      alertError.classList = "alert alert-danger alert-dismissible fade show";
    }
    if (url.get("status") == "redirected") {
        alertErrorMessage.innerHTML = "Por favor, inicie sesión antes de acceder a esa página."
        alertError.classList = "alert alert-danger alert-dismissible fade show";
    }

  }