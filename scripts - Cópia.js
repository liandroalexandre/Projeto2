
// LIURAME MUSIC — Loja Online

// Guardar o elemento que abriu a lightbox
let elementoAnterior = null;
let albunsCatalogo = [];
let indiceAlbumAtual = 0;

// Atualizar os detalhes do álbum apresentado na lightbox
function atualizarDetalhesAlbum(produto) {

    document.getElementById("lightbox-title").textContent = produto.name;

    const imagemAlbum = document.getElementById("lightbox-image");
    imagemAlbum.src = produto.image;
    imagemAlbum.alt = produto.name;

    document.getElementById("lightbox-description").textContent =
        produto.description;

    document.getElementById("lightbox-price").textContent =
        `Preço: ${Number(produto.price).toFixed(2)} €`;

    const listaMusicas = document.getElementById("lightbox-tracks");
    listaMusicas.innerHTML = "";

    (produto.tracks || []).forEach(function (musica) {
        const item = document.createElement("li");
        item.textContent = musica;
        listaMusicas.appendChild(item);
    });

    // Reiniciar a animação da capa
    imagemAlbum.classList.remove("animar-album");
    void imagemAlbum.offsetWidth;
    imagemAlbum.classList.add("animar-album");
}
// Navegar para o álbum anterior
document.getElementById("album-anterior").addEventListener("click", function () {

    if (albunsCatalogo.length === 0) return;

    indiceAlbumAtual =
        (indiceAlbumAtual - 1 + albunsCatalogo.length) % albunsCatalogo.length;

    atualizarDetalhesAlbum(albunsCatalogo[indiceAlbumAtual]);
});

// Navegar para o álbum seguinte
document.getElementById("album-seguinte").addEventListener("click", function () {

    if (albunsCatalogo.length === 0) return;

    indiceAlbumAtual =
        (indiceAlbumAtual + 1) % albunsCatalogo.length;

    atualizarDetalhesAlbum(albunsCatalogo[indiceAlbumAtual]);
});

// Carregar os dados do catálogo através de AJAX (fetch)
async function carregarCatalogo() {
    try {
        const resposta = await fetch("catalog.json");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar o catálogo.");
        }

        const dados = await resposta.json();

        albunsCatalogo = dados.products;
        console.log("Categorias:", dados.categories);
        console.log("Produtos:", dados.products);

        // ==========================================
        // 1. PREENCHER O FILTRO DE CATEGORIAS
        // ==========================================

        const filtroCategorias = document.getElementById("category-filter");

        dados.categories.forEach(function (categoria) {
            const opcao = document.createElement("option");

            opcao.value = categoria.id;
            opcao.textContent = categoria.name;

            filtroCategorias.appendChild(opcao);
        });

        // ==========================================
        // 2. APRESENTAR OS PRODUTOS NA PÁGINA
        // ==========================================

        const listaProdutos = document.getElementById("product-list");

        function mostrarProdutos(produtos) {
            // Limpar os produtos apresentados anteriormente
            listaProdutos.innerHTML = "";

            produtos.forEach(function (produto) {
                const cartao = document.createElement("div");

                cartao.innerHTML = `
                    <h3>${produto.name}</h3>
                    <img
                        src="${produto.image}"
                        alt="${produto.name}"
                        width="200"
                    >
                    <p>${produto.description}</p>
                    <p>Preço: ${Number(produto.price).toFixed(2)} €</p>

                    <button type="button" class="btn-detalhes"> &#9835; Ver detalhes</button>
                `;
                // Abrir os detalhes do álbum quando o cartão for clicado
                cartao.addEventListener("click", function () {

                    const lightbox = document.getElementById("lightbox");

                    // Evitar abrir novamente uma janela que já está aberta
                    if (lightbox.style.display !== "none") {
                        return;
                    }

                    // Guardar o elemento que tinha o foco
                    elementoAnterior = document.activeElement;

                    // Identificar o álbum que foi aberto
                    indiceAlbumAtual = albunsCatalogo.findIndex(function (album) {
                        return album.id === produto.id;
                    });

                    // Apresentar os detalhes do álbum
                    atualizarDetalhesAlbum(produto);

                    // Abrir a lightbox
                    lightbox.style.display = "block";

                    // Colocar o foco no botão de fechar
                    requestAnimationFrame(function () {
                        lightbox.querySelector(".close-btn").focus();
                    });

                });

                // Adicionar o cartão à lista de produtos
                listaProdutos.appendChild(cartao);


            });
        }

        // Apresentar todos os produtos ao carregar a página
        mostrarProdutos(dados.products);

        // ==========================================
        // 3. FILTRAR OS PRODUTOS POR CATEGORIA
        // ==========================================

        filtroCategorias.addEventListener("change", function () {
            const categoriaSelecionada = filtroCategorias.value;

            if (
                categoriaSelecionada === "all" ||
                categoriaSelecionada === ""
            ) {
                mostrarProdutos(dados.products);
            } else {
                const produtosFiltrados = dados.products.filter(
                    function (produto) {
                        return produto.category === categoriaSelecionada;
                    }
                );

                mostrarProdutos(produtosFiltrados);
            }
        });

        // ==========================================
        // 4. PREENCHER O MENU DO FORMULÁRIO
        // ==========================================

        const selecionarProduto = document.getElementById("product");

        dados.products.forEach(function (produto) {
            const opcao = document.createElement("option");

            opcao.value = produto.id;
            opcao.textContent =
                `${produto.name} — ${Number(produto.price).toFixed(2)} €`;

            selecionarProduto.appendChild(opcao);
        });
        // ==========================================
        // FECHAR O LIGHTBOX
        // ==========================================

        // Selecionar a janela e o botão de fechar
        const lightbox = document.getElementById("lightbox");
        const botaoFechar = document.querySelector(".close-btn");


        // Fechar a janela ao clicar no X
        botaoFechar.addEventListener("click", function () {
            lightbox.style.display = "none";

            // Devolver o foco ao elemento que abriu a janela
            if (elementoAnterior) {
                elementoAnterior.focus();
            }
        });
        // ==========================================
        // 5. CALCULAR O VALOR TOTAL
        // ==========================================

        const botaoCalcular = document.getElementById("calculate");
        const resultado = document.getElementById("total-value");
        const campoQuantidade = document.getElementById("quantity");

        const formularioCalculo = document.getElementById("calc-form");

        formularioCalculo.addEventListener("submit", function (evento) {

            // Impedir que o formulário recarregue a página
            evento.preventDefault();

            // Obter os valores escolhidos
            const idProduto = selecionarProduto.value;
            const quantidade = Number(campoQuantidade.value);

            // Procurar o produto no catálogo
            const produtoEscolhido = dados.products.find(
                function (produto) {
                    return String(produto.id) === String(idProduto);
                }
            );

            // Validar o produto selecionado
            if (!produtoEscolhido) {
                resultado.textContent =
                    "Por favor, seleciona um produto.";
                return;
            }

            // Validar a quantidade
            if (!Number.isInteger(quantidade) || quantidade <= 0) {
                resultado.textContent =
                    "A quantidade deve ser um número inteiro superior a zero.";
                return;
            }

            // Calcular o valor total
            const preco = Number(produtoEscolhido.price);
            const total = preco * quantidade;

            // Apresentar o resultado
            resultado.textContent =
                `Valor total: ${total.toFixed(2)} €`;
        });

    } catch (erro) {
        console.error("Erro ao carregar a loja:", erro);

        const listaProdutos = document.getElementById("product-list");

        listaProdutos.innerHTML = `
    <p class="mensagem-catalogo mensagem-erro">
        Não foi possível carregar o catálogo.
        Por favor, atualiza a página e tenta novamente.
    </p>
`;
    }
}

// Executar a função quando a página carregar
carregarCatalogo();
// Botões para aumentar e diminuir a quantidade
const campoQuantidade = document.getElementById("quantity");
const botaoDiminuir = document.getElementById("decrease-quantity");
const botaoAumentar = document.getElementById("increase-quantity");

botaoDiminuir.addEventListener("click", function () {
    const quantidade = Number(campoQuantidade.value);

    if (Number.isInteger(quantidade) && quantidade > 1) {
        campoQuantidade.value = quantidade - 1;
    } else {
        campoQuantidade.value = 1;
    }
});

botaoAumentar.addEventListener("click", function () {
    const quantidade = Number(campoQuantidade.value);

    if (Number.isInteger(quantidade) && quantidade >= 1) {
        campoQuantidade.value = quantidade + 1;
    } else {
        campoQuantidade.value = 1;
    }
});

// Manter a navegação por teclado dentro da lightbox
document.addEventListener("keydown", function (evento) {
    const lightbox = document.getElementById("lightbox");

    if (evento.key !== "Tab" || lightbox.style.display === "none") {
        return;
    }

    const botoes = [
        lightbox.querySelector(".close-btn"),
        document.getElementById("album-anterior"),
        document.getElementById("album-seguinte")
    ];

    const primeiroBotao = botoes[0];
    const ultimoBotao = botoes[botoes.length - 1];

    if (evento.shiftKey && document.activeElement === primeiroBotao) {
        evento.preventDefault();
        ultimoBotao.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimoBotao) {
        evento.preventDefault();
        primeiroBotao.focus();
    }
});
// Repor a quantidade quando o utilizador muda de produto
document.getElementById("product").addEventListener("change", function () {
    document.getElementById("quantity").value = 1;
    document.getElementById("total-value").textContent = "";
});

// Fechar a lightbox com a tecla Escape
document.addEventListener("keydown", function (evento) {
    const lightbox = document.getElementById("lightbox");

    if (evento.key === "Escape" && lightbox.style.display !== "none") {
        lightbox.style.display = "none";

        // Devolver o foco ao elemento que abriu a janela
        if (elementoAnterior) {
            elementoAnterior.focus();
        }
    }
});
// Navegar entre álbuns com as setas do teclado
document.addEventListener("keydown", function (evento) {
    const lightbox = document.getElementById("lightbox");

    if (lightbox.style.display === "none" || albunsCatalogo.length === 0) {
        return;
    }

    if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        document.getElementById("album-anterior").click();
    }

    if (evento.key === "ArrowRight") {
        evento.preventDefault();
        document.getElementById("album-seguinte").click();
    }
});

// Navegar entre álbuns com o dedo no telemóvel
const imagemLightbox = document.getElementById("lightbox-image");
let toqueInicialX = 0;

imagemLightbox.addEventListener("touchstart", function (evento) {
    toqueInicialX = evento.changedTouches[0].screenX;
}, { passive: true });

imagemLightbox.addEventListener("touchend", function (evento) {
    const toqueFinalX = evento.changedTouches[0].screenX;
    const distancia = toqueFinalX - toqueInicialX;

    // Ignorar pequenos movimentos acidentais
    if (Math.abs(distancia) < 50) {
        return;
    }

    if (distancia < 0) {
        // Deslizar para a esquerda: próximo álbum
        document.getElementById("album-seguinte").click();
    } else {
        // Deslizar para a direita: álbum anterior
        document.getElementById("album-anterior").click();
    }
}, { passive: true });