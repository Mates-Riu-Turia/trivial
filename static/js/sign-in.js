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

function validateForm() {
    let user = {
        email: document.forms["loginForm"]["username"],
        password: document.forms["loginForm"]["password"],
        pass_btn: document.getElementById("toggle-password").style,
        guest: document.forms["loginForm"]["guest"].checked,
        modal: new bootstrap.Modal("#myModal"),
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
            return true;
        },
        values: function() {
            return JSON.stringify({
                email: this.email.value,
                password: this.password.value
            })
        }
    };

    user.reset()
    if (!user.verify()) {
        return false
    }

    if (user.guest) {
        user.modal.show()
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
            window.location = "http://localhost:8080"
        }
        else {
            alert("Server Error!, try it again later")
        }
      })

    return false
}