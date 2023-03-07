function logout() {
  fetch("http://localhost:8080/api/auth", {
    method: "DELETE",
  }
  ).then(res => res.json()).then(res => window.location = "http://localhost:8080/login"  )  
}

function changePassword() {
  const myModal = new bootstrap.Modal("#exampleModal")
  myModal.show()
}

function name(data) {
  let divElement = document.getElementById("welcome")
  let divElement2 = document.getElementById("menu-name")
  let div = document.getElementById("button-group");

  if (data.User != undefined) {
    divElement2.innerHTML = data.User.name
    div.innerHTML = '<button type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-plus-circle"></i> <br>Nueva Pregunta</button><button type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-pen"></i> <br>Modificar Pregunta</button><button type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-mortarboard"></i> <br>Preguntas de los Alumnos</button>'
    if (data.User.gender == "B") {
      divElement.innerHTML = "Bienvenido " + data.User.name
    }
    else {
      divElement.innerHTML = "Bienvenida " + data.User.name
    }
  }
  else {
    divElement2.innerHTML = data.Guest.name
    div.innerHTML = '<button type="button" class="btn btn-outline-primary button-group-element"><i class="bi bi-plus-circle"></i> <br>Nueva Pregunta</button>'
    divElement.innerHTML = "Bienvenido/a " + data.Guest.name
  }
  resize()
}
function resize(role_guest) {
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
window.addEventListener('resize', () => resize(), false)

let data = fetch("http://localhost:8080/api/auth").then((response) => response.json()).then((data) => (name(data)))