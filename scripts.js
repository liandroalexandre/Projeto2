// LIURAME MUSIC — Loja Online
// Catálogo AJAX, filtros, detalhes dos álbuns e calculadora.

// Estado do catálogo e da janela de detalhes
let albunsCatalogo = [];
let indiceAlbumAtual = 0;
let elementoAnterior = null;

const lightbox = document.getElementById("lightbox");
const imagemLightbox = document.getElementById("lightbox-image");
const campoQuantidade = document.getElementById("quantity");
const selecionarProduto = document.getElementById("product");
const resultado = document.getElementById("total-value");

// LIGHTBOX — DETALHES E NAVEGAÇÃO
// Atualizar a capa, descrição, músicas e preço do álbum selecionado.
function atualizarDetalhesAlbum(produto) {
    document.getElementById("lightbox-title").textContent = produto.name;
    imagemLightbox.src = produto.image;
    imagemLightbox.alt = produto.name;
    document.getElementById("lightbox-description").textContent = produto.description;
    document.getElementById("lightbox-price").textContent =
        `Preço: ${Number(produto.price).toFixed(2)} €`;

    const listaMusicas = document.getElementById("lightbox-tracks");
    listaMusicas.innerHTML = "";
    (produto.tracks || []).forEach(function (musica) {
        const item = document.createElement("li");
        item.textContent = musica;
        listaMusicas.appendChild(item);
    });

    // Reiniciar a animação ao mudar de álbum
    imagemLightbox.classList.remove("animar-album");
    void imagemLightbox.offsetWidth;
    imagemLightbox.classList.add("animar-album");
}

// Abrir a janela e guardar o elemento que tinha o foco.
function abrirLightbox(produto) {
    if (lightbox.style.display !== "none") return;

    elementoAnterior = document.activeElement;
    indiceAlbumAtual = albunsCatalogo.findIndex(function (album) {
        return String(album.id) === String(produto.id);
    });
    atualizarDetalhesAlbum(produto);
    lightbox.style.display = "block";
    requestAnimationFrame(function () {
        lightbox.querySelector(".close-btn").focus();
    });
}

// Fechar a janela e devolver o foco ao elemento inicial.
function fecharLightbox() {
    lightbox.style.display = "none";
    if (elementoAnterior) elementoAnterior.focus();
}

// Mudar de álbum sem ultrapassar os limites do catálogo.
function mudarAlbum(direcao) {
    if (albunsCatalogo.length === 0) return;
    indiceAlbumAtual =
        (indiceAlbumAtual + direcao + albunsCatalogo.length) % albunsCatalogo.length;
    atualizarDetalhesAlbum(albunsCatalogo[indiceAlbumAtual]);
}

document.getElementById("album-anterior").addEventListener("click", function () {
    mudarAlbum(-1);
});
document.getElementById("album-seguinte").addEventListener("click", function () {
    mudarAlbum(1);
});
lightbox.querySelector(".close-btn").addEventListener("click", fecharLightbox);

// Navegação por teclado: Escape, setas e Tab.
document.addEventListener("keydown", function (evento) {
    if (lightbox.style.display === "none") return;

    if (evento.key === "Escape") {
        evento.preventDefault();
        fecharLightbox();
    } else if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        mudarAlbum(-1);
    } else if (evento.key === "ArrowRight") {
        evento.preventDefault();
        mudarAlbum(1);
    } else if (evento.key === "Tab") {
        const botoes = [
            lightbox.querySelector(".close-btn"),
            document.getElementById("album-anterior"),
            document.getElementById("album-seguinte")
        ];
        const primeiro = botoes[0];
        const ultimo = botoes[botoes.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    }
});

// Navegação por toque na capa (deslizar pelo menos 50 píxeis).
let toqueInicialX = 0;
imagemLightbox.addEventListener("touchstart", function (evento) {
    toqueInicialX = evento.changedTouches[0].screenX;
}, { passive: true });
imagemLightbox.addEventListener("touchend", function (evento) {
    const distancia = evento.changedTouches[0].screenX - toqueInicialX;
    if (Math.abs(distancia) < 50) return;
    mudarAlbum(distancia < 0 ? 1 : -1);
}, { passive: true });

// CATÁLOGO AJAX E FILTROS
// Ler o JSON, criar os cartões e preencher os menus.
async function carregarCatalogo() {
    try {
        const resposta = await fetch("catalog.json");
        if (!resposta.ok) throw new Error("Erro ao carregar o catálogo.");

        const dados = await resposta.json();
        albunsCatalogo = dados.products;

        const filtroCategorias = document.getElementById("category-filter");
        const listaProdutos = document.getElementById("product-list");

        // Preencher as categorias do filtro
        dados.categories.forEach(function (categoria) {
            const opcao = document.createElement("option");
            opcao.value = categoria.id;
            opcao.textContent = categoria.name;
            filtroCategorias.appendChild(opcao);
        });

        // Mostrar os produtos recebidos e abrir os detalhes ao clicar.
        function mostrarProdutos(produtos) {
            listaProdutos.innerHTML = "";
            produtos.forEach(function (produto) {
                const cartao = document.createElement("div");
                cartao.innerHTML = `
                    <h3>${produto.name}</h3>
                    <img src="${produto.image}" alt="${produto.name}" width="200">
                    <p>${produto.description}</p>
                    <p>Preço: ${Number(produto.price).toFixed(2)} €</p>
                    <button type="button" class="btn-detalhes">&#9835; Ver detalhes</button>
                `;
                cartao.addEventListener("click", function () {
                    abrirLightbox(produto);
                });
                listaProdutos.appendChild(cartao);
            });
        }

        // Apresentar todos os produtos e aplicar o filtro selecionado.
        mostrarProdutos(dados.products);
        filtroCategorias.addEventListener("change", function () {
            const categoria = filtroCategorias.value;
            if (categoria === "all" || categoria === "") {
                mostrarProdutos(dados.products);
            } else {
                mostrarProdutos(dados.products.filter(function (produto) {
                    return produto.category === categoria;
                }));
            }
        });

        // Preencher o seletor da calculadora
        dados.products.forEach(function (produto) {
            const opcao = document.createElement("option");
            opcao.value = produto.id;
            opcao.textContent =
                `${produto.name} — ${Number(produto.price).toFixed(2)} €`;
            selecionarProduto.appendChild(opcao);
        });

        // CALCULADORA
        // Validar produto e quantidade antes de calcular o total.
        document.getElementById("calc-form").addEventListener("submit", function (evento) {
            evento.preventDefault();
            const quantidade = Number(campoQuantidade.value);
            const produtoEscolhido = dados.products.find(function (produto) {
                return String(produto.id) === String(selecionarProduto.value);
            });

            if (!produtoEscolhido) {
                resultado.textContent = "Por favor, seleciona um produto.";
                return;
            }
            if (!Number.isInteger(quantidade) || quantidade <= 0) {
                resultado.textContent =
                    "A quantidade deve ser um número inteiro superior a zero.";
                return;
            }
            const total = Number(produtoEscolhido.price) * quantidade;
            resultado.textContent = `Valor total: ${total.toFixed(2)} €`;
        });
    } catch (erro) {
        console.error("Erro ao carregar a loja:", erro);
        document.getElementById("product-list").innerHTML = `
            <p class="mensagem-catalogo mensagem-erro">
                Não foi possível carregar o catálogo.
                Por favor, atualiza a página e tenta novamente.
            </p>
        `;
    }
}

// CONTROLO DA QUANTIDADE
// Limpar o resultado quando o utilizador altera os dados.
selecionarProduto.addEventListener("change", function () {
    campoQuantidade.value = 1;
    resultado.textContent = "";
});
// Ao corrigir a quantidade, retirar mensagens de erro ou totais anteriores.
campoQuantidade.addEventListener("input", function () {
    resultado.textContent = "";
});
document.getElementById("decrease-quantity").addEventListener("click", function () {
    const quantidade = Number(campoQuantidade.value);
    campoQuantidade.value = Number.isInteger(quantidade) && quantidade > 1
        ? quantidade - 1 : 1;
    resultado.textContent = "";
});
document.getElementById("increase-quantity").addEventListener("click", function () {
    const quantidade = Number(campoQuantidade.value);
    campoQuantidade.value = Number.isInteger(quantidade) && quantidade >= 1
        ? quantidade + 1 : 1;
    resultado.textContent = "";
});

// Iniciar o carregamento do catálogo ao abrir a página.
carregarCatalogo();
