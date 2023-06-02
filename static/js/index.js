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
    button.classList = "toggle-password bi bi-eye-slash"
  }
  else {
    field.type = "password"
    button.classList = "toggle-password bi bi-eye"
  }
}

function modifyPassword() {
  let passwords = {
    password: document.forms["modifyPasswordForm"]["password"],
    passwordAgain: document.forms["modifyPasswordForm"]["passwordAgain"],
    togglePassword1: document.getElementById("toggle-password1").style,
    togglePassword2: document.getElementById("toggle-password2").style,
    modal: bootstrap.Modal.getInstance("#changePasswordModal"),
    reset: function () {
      this.password.classList = "form-control"
      this.passwordAgain.classList = "form-control"
      this.togglePassword1.right = "5%"
      this.togglePassword1.top = "25%"
      this.togglePassword2.right = "5%"
      this.togglePassword2.top = "25%"
    },
    verify: function () {
      if (this.password.value == "") {
        this.password.classList = "form-control is-invalid"
        this.togglePassword1.right = "15%"
        this.togglePassword1.top = "15%"
        return false
      }
      if (this.passwordAgain.value != this.password.value) {
        this.passwordAgain.classList = "form-control is-invalid"
        this.togglePassword2.right = "15%"
        this.togglePassword2.top = "15%"
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

async function logout() {
  let data = await fetch("/api/auth", {
    method: "DELETE",
    headers: {
      "Clear-Site-Data": "*"
    }
  }
  );
  window.location = "/login?status=sessionClosed"
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
      div.innerHTML = `
      <div class="button-group row mx-2">
        <a type="button" class="btn btn-outline-primary button-group-element col-xxl-12 text-wrap mb-3" href="/add_question">
          <i class="bi bi-plus-circle"></i><br>
          Nueva Pregunta
        </a>
        <a type="button" class="btn btn-outline-primary button-group-element col-xxl-12 text-wrap mb-3"
          href="/modify_question">
          <i class="bi bi-pen"></i><br>
          Modificar Pregunta
        </a>
        <a type="button" class="btn btn-outline-primary button-group-element col-xxl-12 text-wrap mb-3"
          href="/student_question">
          <i class="bi bi-mortarboard"></i><br>
          Preguntas de los Alumnos
        </a>
        <a type="button" class="btn btn-outline-primary button-group-element col-xxl-12 text-wrap mb-3" href="/statics">
          <i class="bi bi-bar-chart"></i><br>
          Estadistica
        </a>
      </div>
      `
      if (data.User.password_changed == false) {
        new bootstrap.Toast("#liveToast").show()
      }
      if (data.User.gender == "B") {
        divElement.innerHTML = "Bienvenido " + data.User.name
      }
      else {
        divElement.innerHTML = "Bienvenida " + data.User.name
      }

      if (data.User.role == "A") {
        document.getElementById("flushButton").classList = "dropdown-item d-flex align-items-center"
      }

      
    }
  }
  else {
    divElement2.innerHTML = data.Guest.name
    if (index_page) {
      modifyPassword.style.cssText = "display: none !important;"
      div.innerHTML = `
        <div class="button-group row">
          <a type="button" class="btn btn-outline-primary button-group-element col-xxl-12 text-wrap mb-3" href="/add_question">
            <i class="bi bi-plus-circle"></i><br>
            Nueva Pregunta
          </a>
        </div>
      `
      divElement.innerHTML = "Bienvenido/a " + data.Guest.name
      
    }
  }
}

function flush_users() {
  new bootstrap.Modal("#sureModal").show()
}

async function flush_users_sure() {
  await fetch("/api/add_user").ok
  bootstrap.Modal("#sureModal").hide()
}

fetch("/api/auth").then((response) => response.json()).then((data) => (name(data)))

function prepare() {
  let url = new URL(window.location.toLocaleString());

  if (url.pathname = "/") {
    index_page = true;
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

  if (url.get("status") == "questionAddSuccess") {
    messageSuccess.innerHTML = "La pregunta se introdució satisfactoriamente."
    alertSuccess.classList = "alert alert-success alert-dismissible fade show";
  }

  if (url.get("status") == "questionAddError") {
    messageError.innerHTML = "Sucedió un error inesperado al subir la pregunta. Pruebe más adelante o contacte con el administrador."
    alertError.classList = "alert alert-danger alert-dismissible fade show";
  }  

  if (url.get("status") == "questionAddImageError") {
    messageError.innerHTML = "Sucedió un error inesperado al subir la imágen de la pregunta. Pruebe más adelante o contacte con el administrador."
    alertError.classList = "alert alert-danger alert-dismissible fade show";
  }  

  if (url.get("status") == "questionModifyError") {
    messageError.innerHTML = "Sucedió un error inesperado al filtrar o modificar la pregunta. Pruebe más adelante o contacte con el administrador."
    alertError.classList = "alert alert-danger alert-dismissible fade show";
  }

  if (url.get("status") == "questionModifySuccess") {
    messageSuccess.innerHTML = "La pregunta se modificó satisfactoriamente."
    alertSuccess.classList = "alert alert-success alert-dismissible fade show";

  }
}