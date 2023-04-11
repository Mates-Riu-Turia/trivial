let index_page = false;

function changePasswordVisibility(button, buttonNumber) {
  let field;
  if (buttonNumber == 0) {
    field = document.getElementById("password");
  }
  else {
    field = document.getElementById("passwordAgain");
  }

  if (field.type == "password") {
    field.type = "text"
    button.classList = "toogle-password bi bi-eye-slash"
  }
  else {
    field.type = "password"
    button.classList = "toogle-password bi bi-eye"
  }
}

function modifyPassword() {
  let passwords = {
    password: document.forms["modifyPasswordForm"]["password"],
    passwordAgain: document.forms["modifyPasswordForm"]["passwordAgain"],
    tooglePassword1: document.getElementById("toggle-password1").style,
    tooglePassword2: document.getElementById("toggle-password2").style,
    modal: bootstrap.Modal.getInstance("#changePasswordModal"),
    reset: function () {
      this.password.classList = "form-control"
      this.passwordAgain.classList = "form-control"
      this.tooglePassword1.right = "5%"
      this.tooglePassword1.top = "25%"
      this.tooglePassword2.right = "5%"
      this.tooglePassword2.top = "25%"
    },
    verify: function () {
      if (this.password.value == "") {
        this.password.classList = "form-control is-invalid"
        this.tooglePassword1.right = "15%"
        this.tooglePassword1.top = "15%"
        return false
      }
      if (this.passwordAgain.value != this.password.value) {
        this.passwordAgain.classList = "form-control is-invalid"
        this.tooglePassword2.right = "15%"
        this.tooglePassword2.top = "15%"
        return false
      }
      return true
    }
  }
  passwords.reset()
  if (passwords.verify()) {
    fetch("/api/auth", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password: passwords.password.value }),
    }).then((response) => {
      if (response.ok) {
        passwords.modal.hide()
        window.location = "/?status=changePasswordSuccess"
      }
      else {
        window.location = "/?status=changePasswordError"
      }
    })
  }
}

function logout() {
  fetch("http://localhost:8080/api/auth", {
    method: "DELETE",
  }
  ).then(res => res.json()).then(res => window.location = "http://localhost:8080/login")
}

function changePassword() {
  const myModal = new bootstrap.Modal("#changePasswordModal")
  myModal.show()
}

function name(data) {
  let divElement2 = document.getElementById("menu-name")
  let divElement = document.getElementById("welcome")
  let div = document.getElementById("button-group");
  let modifyPassword = document.getElementById("modifyPasswordOption")

  if (data.User != undefined) {
    divElement2.innerHTML = data.User.name
    if (index_page) {
      div.innerHTML = `<button onclick="window.location.href='http://localhost:8080/add_question'" type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-plus-circle"></i> <br>Nueva Pregunta</button><button type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-pen"></i> <br>Modificar Pregunta</button><button type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-mortarboard"></i> <br>Preguntas de los Alumnos</button><button type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-bar-chart"></i> <br>Estadistica</button>`
      if (data.User.password_changed == false) {
        new bootstrap.Toast("#liveToast").show()
      }
      if (data.User.gender == "B") {
        divElement.innerHTML = "Bienvenido " + data.User.name
      }
      else {
        divElement.innerHTML = "Bienvenida " + data.User.name
      }
    }
  }
  else {
    divElement2.innerHTML = data.Guest.name
    if (window.location == "http://localhost:8080/") {
      modifyPassword.style.cssText = "display: none !important;"
      div.innerHTML = `<button onclick="window.location.href='http://localhost:8080/add_question'" type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-plus-circle"></i> <br>Nueva Pregunta</button>`
      divElement.innerHTML = "Bienvenido/a " + data.Guest.name
    }
  }
  resize()
}

function resize_close() {
  document.getElementById("alertSuccess").classList = "alert alert-success alert-dismissible fade d-none";
  document.getElementById("alertError").classList = "alert alert-danger alert-dismissible fade d-none";
  resize()
}

function resize() {
  if (index_page) {
    let divElement = document.getElementById("welcome");
    let buttons = document.getElementsByClassName('button-group-element')
    let buttons_array = Array.from(buttons)
    let elemWidth = divElement.offsetWidth / buttons_array.length;
    for (i = 0; i < buttons_array.length; i++) {
      if (i != 0) {
        buttons_array[i].style.marginLeft = elemWidth * i + "px"
      }
      buttons_array[i].style.width = elemWidth + "px"
    }
  }
}

function prepare() {
  let url = new URL(window.location.toLocaleString());

  if (url.pathname = "/") {
    index_page = true;
    fetch("http://localhost:8080/api/auth").then((response) => response.json()).then((data) => (name(data)))
    window.addEventListener('resize', () => resize(), false)
  }

  url = url.searchParams;

  let alertSuccess = document.getElementById("alertSuccess");
  let alertError = document.getElementById("alertError");
  let messageSuccess = document.getElementById("alertSuccessMessage");
  let messageError = document.getElementById("alertErrorMessage");

  if (url.get("status") == "changePasswordSuccess") {
    messageSuccess.innerHTML = "La contraseña se actualizó satisfactoriamente. Los cambios surgirán efecto la próxima vez que inicie sesión."
    alertSuccess.classList = "alert alert-success alert-dismissible fade show";
  }
  if (url.get("status") == "changePasswordError") {
    messageError.innerHTML = "Sucedió un error inesperado al actualizar la contraseña. Pruebe más adelante o contacte con el administrador."
    alertError.classList = "alert alert-danger alert-dismissible fade show";
  }

}