function mostrarGaleria(id) {
    const galeria = document.getElementById(id);

    if (galeria.style.display === "none" || galeria.style.display === "") {
        galeria.style.display = "flex";
    } else {
        galeria.style.display = "none";
    }
}

const form = document.getElementById('formulario_contacto');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (form.checkValidity()) {
        alert("Mensagem enviada com sucesso!");
        form.reset();
    }
});