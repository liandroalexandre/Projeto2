
/* ========================================
   LIURAME MUSIC — JAVASCRIPT
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Formulário de contactos
    const form = document.getElementById("formulario_contacto");
    const mensagemSucesso = document.getElementById("mensagem_sucesso");

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            // Verifica se todos os campos são válidos
            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                form.reportValidity();
                return;
            }

            // Apresenta a mensagem de sucesso
            if (mensagemSucesso) {
                mensagemSucesso.textContent =
                    "A tua mensagem foi validada com sucesso!";
                mensagemSucesso.hidden = false;
            } else {
                alert("Formulário validado com sucesso!");
            }

            form.reset();
            form.classList.remove("was-validated");
        });
    }

    // Ano atual no rodapé, se existir o elemento
    const ano = document.getElementById("ano_atual");

    if (ano) {
        ano.textContent = new Date().getFullYear();
    }

});
