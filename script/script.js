function mostrarGaleria(id) {
    const galeria = document.getElementById(id);

    if (galeria.style.display === "none" || galeria.style.display === "") {
        galeria.style.display = "flex";
    } else {
        galeria.style.display = "none";
    }
}

document.getElementById('formulario').addEventListener('input', function () {
    var form = event.target.form;
    var submitBtn = document.getElementById('submit-btn');
    if (form.checkValidity()) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
});