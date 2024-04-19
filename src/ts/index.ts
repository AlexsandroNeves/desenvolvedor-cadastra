const urlServidor = "http://localhost:5000";
const urlCarrinhoServidor = "http://localhost:5001/cart";
const formatoMoeda = { style: 'currency', currency: 'BRL' };
const itensPorPagina = 9;
const valoresSelecionados: { cor: string[], tamanho: string[], preco: string[] } = {
  cor: [],
  tamanho: [],
  preco: []
};

function buscarProdutos(): Promise<any[]> {
  return fetch(`${urlServidor}/products`).then(res => res.json());
}

function buscarCarrinho(): Promise<any[]> {
  return fetch(urlCarrinhoServidor).then(res => res.json());
}

function filtrarPorCor() {
  buscarProdutos()
    .then((data: any[]) => {
      const coresUnicas = [...new Set(data.map(item => item.color))];
      const listaCores = document.querySelector('.filter__item--color ul');

      coresUnicas.forEach(cor => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = cor;
        checkbox.name = cor;
        checkbox.value = cor;

        const span = document.createElement('span');
        span.textContent = cor;

        label.appendChild(checkbox);
        label.appendChild(span);

        const li = document.createElement('li');
        li.appendChild(label);

        listaCores?.appendChild(li);
      });

      listaCores?.addEventListener('change', () => {
        valoresSelecionados.cor = Array.from(listaCores.querySelectorAll('input:checked')).map((checkbox: HTMLInputElement) => checkbox.value);
        atualizarProdutos();
      });

      abrirMaisCores();
    })
    .catch(error => {
      console.error('Erro na solicitação:', error);
    });
}

function filtrarPorTamanho() {
  buscarProdutos()
    .then((data: any[]) => {
      const tamanhos = data.flatMap(item => item.size);
      const tamanhosUnicos = [...new Set(tamanhos)].sort();
      const listaTamanhos = document.querySelector('.filter__item--size ul');

      tamanhosUnicos.forEach(tamanho => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = tamanho;
        checkbox.name = tamanho;
        checkbox.value = tamanho;

        const span = document.createElement('span');
        span.textContent = tamanho;

        label.appendChild(checkbox);
        label.appendChild(span);

        const li = document.createElement('li');
        li.appendChild(label);

        listaTamanhos?.appendChild(li);
      });

      listaTamanhos?.addEventListener('change', () => {
        const checkboxes = listaTamanhos.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach((checkbox: HTMLInputElement) => {
          const li = checkbox.closest('li');

          if (li) {
            if (checkbox.checked) {
              li.classList.add('selected');
            } else {
              li.classList.remove('selected');
            }
          }
        });

        valoresSelecionados.tamanho = Array.from(checkboxes)
          .filter((checkbox: HTMLInputElement) => checkbox.checked)
          .map((checkbox: HTMLInputElement) => checkbox.value);

        atualizarProdutos();
      });

    });
}

function filtrarPorPreco() {
  const preco = document.querySelector('.filter__item--price ul');

  preco?.addEventListener('change', () => {
    valoresSelecionados.preco = Array.from(preco.querySelectorAll('input:checked')).map((checkbox: HTMLInputElement) => checkbox.value);
    atualizarProdutos();
  });
}

function obterProdutos() {
  buscarProdutos()
    .then((data: any[]) => {
      const listaProdutos = document.querySelector('.listProducts__list ul');

      if (data.length) {
        data.forEach((produto, index) => {
          const li = document.createElement('li');

          const img = document.createElement('img');
          img.src = produto.image;
          li.appendChild(img);

          const titulo = document.createElement('h3');
          titulo.textContent = produto.name;
          titulo.classList.add('product__title')
          li.appendChild(titulo);

          const preco = document.createElement('p');
          preco.textContent = String(produto.price.toLocaleString('pt-BR', formatoMoeda));
          preco.classList.add('product__price')
          li.appendChild(preco);

          const parcelamento = document.createElement('p');
          parcelamento.textContent = `até ${produto.parcelamento[0]}x de ${produto.parcelamento[1].toLocaleString('pt-BR', formatoMoeda)}`;
          parcelamento.classList.add('product__parcelamento')
          li.appendChild(parcelamento);

          const btn = document.createElement('button');
          btn.textContent = 'Comprar';
          btn.classList.add('btn-comprar');
          btn.dataset.id = JSON.stringify(produto.id);
          btn.dataset.name = produto.name;
          btn.dataset.price = JSON.stringify(produto.price);
          btn.dataset.image = produto.image;
          li.appendChild(btn);

          li.dataset.cor = produto.color;
          li.dataset.tamanho = JSON.stringify(produto.size);
          li.dataset.preco = JSON.stringify(produto.price);
          li.dataset.id = JSON.stringify(produto.id);

          if (index >= itensPorPagina) li.classList.add('hidden')

          listaProdutos?.appendChild(li);
        });
      }

      carrinho();
      carregarMais();
    });
}

function atualizarProdutos() {
  const botaoMais = document.querySelector('.load-more');
  if (botaoMais instanceof HTMLElement) {
    botaoMais.style.display = 'flex';
  }

  buscarProdutos()
    .then((data: any[]) => {
      const listaProdutos = document.querySelector('.listProducts__list ul');
      listaProdutos?.innerHTML = '<p class="filter-info">Não existem resultados para essa busca!</p>';

      data.forEach((produto, index) => {
        let visivel = true;

        // Filtro de cores
        if (valoresSelecionados.cor.length > 0 && !valoresSelecionados.cor.includes(produto.color)) {
          visivel = false;
        }

        // Filtro de tamanhos
        if (valoresSelecionados.tamanho.length > 0 && !produto.size.some(tamanho => valoresSelecionados.tamanho.includes(tamanho))) {
          visivel = false;
        }

        // Filtro de preço
        if (valoresSelecionados.preco.length > 0) {
          let precoNoIntervalo = false;
          valoresSelecionados.preco.forEach(filtro => {
            const [inicio, fim] = filtro.split('-').map(Number);
            if (fim) {
              if (produto.price >= inicio && produto.price <= fim) {
                precoNoIntervalo = true;
              }
            } else {
              if (produto.price >= inicio) {
                precoNoIntervalo = true;
              }
            }
          });
          if (!precoNoIntervalo) {
            visivel = false;
          }
        }

        if (visivel) {
          const listaProdutos = document.querySelector('.listProducts__list ul .filter-info');

          if (listaProdutos) {
            listaProdutos.remove();
          }

          montarShelf(produto, index);
        }
      });

      carregarMais();
    });
}

function montarShelf(produto: any, index: number) {
  const li = document.createElement('li');

  const img = document.createElement('img');
  img.src = produto.image;
  li.appendChild(img);

  const titulo = document.createElement('h3');
  titulo.textContent = produto.name;
  titulo.classList.add('product__title')
  li.appendChild(titulo);

  const preco = document.createElement('p');
  preco.textContent = String(produto.price.toLocaleString('pt-BR', formatoMoeda));
  preco.classList.add('product__price')
  li.appendChild(preco);

  const parcelamento = document.createElement('p');
  parcelamento.textContent = `até ${produto.parcelamento[0]}x de ${produto.parcelamento[1].toLocaleString('pt-BR', formatoMoeda)}`;
  parcelamento.classList.add('product__parcelamento')
  li.appendChild(parcelamento);

  const btn = document.createElement('button');
  btn.textContent = 'Comprar';
  btn.classList.add('btn-comprar');
  li.appendChild(btn);

  li.dataset.cor = produto.color;
  li.dataset.tamanho = JSON.stringify(produto.size);
  li.dataset.preco = JSON.stringify(produto.price);

  if (index >= itensPorPagina) li.classList.add('hidden')

  document.querySelector('.listProducts__list ul').appendChild(li);

  carrinho();
}

function toggleFiltro() {
  let itensFiltro = document.querySelectorAll('.filter__item--top');

  itensFiltro.forEach(item => {
    item.addEventListener('click', function () {
      item.classList.toggle('ativo');

      let proximoElemento = item.nextElementSibling;

      // Verificando se o próximo elemento é uma ul
      if (proximoElemento && proximoElemento.tagName.toLowerCase() === 'div') {
        proximoElemento.classList.toggle('ativo');
      }
    });
  });

  limparFiltro();
}

function limparFiltro() {
  let elemLimpar = document.querySelector('.buttons__item--limpar');

  elemLimpar.addEventListener('click', function () {
    let checkboxes = document.querySelectorAll('.filter__item input[type="checkbox"]');

    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = false;
    });

    valoresSelecionados.cor = []
    valoresSelecionados.tamanho = []
    valoresSelecionados.preco = []

    atualizarProdutos()
  });
}


function filtroMobile() {
  let elemFiltrar = document.querySelector('.filter__mob__item--filtrar');
  elemFiltrar.addEventListener('click', function () {
    let sidebar = document.querySelector('.sidebar') as HTMLElement;
    sidebar.style.display = 'block';
  });

  toggleFiltro()
}

function fecharFiltroMobile() {
  let elementos = document.querySelectorAll('.top__filter--close, .buttons__item--aplicar');

  elementos.forEach(elem => {
    elem.addEventListener('click', function () {
      let sidebar = document.querySelector('.sidebar') as HTMLElement;
      sidebar.style.display = 'none';

      let filtroOrdenacao = document.querySelector('.filter__order__mob') as HTMLElement;
      filtroOrdenacao.style.display = 'none';
    });
  });
}



function filtroOrdenacaoMobile() {
  let elemFiltrar = document.querySelector('.filter__mob__item--ordenar');

  elemFiltrar.addEventListener('click', function () {
    let filtroOrdenacao = document.querySelector('.filter__order__mob') as HTMLElement;
    filtroOrdenacao.style.display = 'block';

    const listaOrdenacao = document.querySelector('.filter__order__mob--list');

    // Adiciona um listener para o clique nos itens da lista
    listaOrdenacao?.addEventListener('click', function(event) {
      const opcaoSelecionada = (event.target as HTMLElement).textContent?.toLowerCase();
      if (opcaoSelecionada) {
        obterProdutos(); // Chama a função para obter os produtos (aqui você pode chamar a função correta, como ordenarProdutos)
      }
    });
  });
}

function mostrarBotaoCarregarMais(botaoCarregarMais: Element) {
  // Ocultar o botão "Load More" se não houver mais itens ocultos
  if (document.querySelectorAll('.listProducts__list ul .hidden').length === 0) {
    if (botaoCarregarMais instanceof HTMLElement) {
      botaoCarregarMais.style.display = 'none';
    }
  } else {
    if (botaoCarregarMais instanceof HTMLElement) {
      botaoCarregarMais.style.display = 'flex';
    }
  }
}

function carregarMais() {
  const botaoCarregarMais = document.querySelector('.load-more');
  const itensOcultos = document.querySelectorAll('.listProducts__list ul .hidden');

  // Ocultar todos os itens que excedem o número por página
  itensOcultos.forEach((item, index) => {
    if (index >= itensPorPagina && item instanceof HTMLElement) {
      item.style.display = 'none';
    }
  });

  // Mostrar mais itens quando o botão "Load More" for clicado
  botaoCarregarMais.addEventListener('click', function () {
    itensOcultos.forEach((item, index) => {
      if (index >= itensPorPagina) {
        return;
      }
      if (item instanceof HTMLElement) {
        item.style.display = ''; // Mostrar item
        item.classList.remove('hidden');
      }
    });

    mostrarBotaoCarregarMais(botaoCarregarMais)
  });
}

function getListagemCarrinho() {
  buscarCarrinho()
    .then((res) => {
      let qtdProdutos = res.length;

      let iconCartdocument = document.querySelector('.header__cart')
      iconCartdocument.innerHTML = `
        <div class="qtd__products">${qtdProdutos}</div>
      `;

      if (res.length) {

        let listaCarrinho = document.querySelector('.carrinho ul')
        listaCarrinho.innerHTML = "";

        res.map(product => {
          let li = document.createElement('li')
          let preco = "";

          preco = Number(product.price).toLocaleString('pt-BR', formatoMoeda);

          li.innerHTML = `
            <img src="${product.image}" alt="${product.name}" />
            <div class="carrinho__info">
              <h3 class="carrinho__titulo">${product.name}</h3>
              <p class="carrinho__price">${preco}</p>

              <div class="carrinho__seletor">
              <input type="text" min="1" value="${product.qtd}" disabled />
              </div>
            </div>
            <span class="carrinho__remove" data-id="${product.id}">
              <img src="/img/remove.png" alt="Remover produto" data-id="${product.id}" />
            </span>
          `;

          listaCarrinho.append(li)
          removerCarrinho(product.id);
        })

      } else {
        let listaCarrinho = document.querySelector('.carrinho ul')
        listaCarrinho.innerHTML = "<li class='carrinho__empty'>Carrinho vazio.</li>";
      }
    })
    .catch(error => {
      console.error('Erro na solicitação do Carrinho:', error);
    });
}

function abrirCarrinho() {
  let btnComprar = document.querySelectorAll('.btn-comprar,.header__cart')

  btnComprar.forEach(btn => {
    btn.addEventListener('click', function () {
      let carrinho = document.querySelector('.carrinho');
      if (carrinho instanceof HTMLElement) {
        carrinho.classList.toggle('ativo');
      }

      let overlay = document.querySelector('.carrinho__overlay')
      if (overlay instanceof HTMLElement) {
        overlay.style.display = "block";
      }
    });
  });
}

function fecharCarrinho() {
  let fechar = document.querySelector('.carrinho__close');

  fechar.addEventListener('click', function () {
    let carrinho = document.querySelector('.carrinho');
    carrinho.classList.remove('ativo')

    let overlay = document.querySelector('.carrinho__overlay')
    if (overlay instanceof HTMLElement) {
      overlay.style.display = "none";
    }
  })
}

function adicionarAoCarrinho(data: object) {

  interface RespostaCarrinho {
    id: string;
    name: string;
    price: number;
    parcelamento: Array<number>;
    color: string;
    image: string;
    size: Array<string>;
    date: string;
    qtd: string;
  }

  interface OpcoesRequisicao {
    method: string;
    headers: {
      [key: string]: string;
    };
    body?: string;
  }

  const opcoes: OpcoesRequisicao = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  fetch(urlCarrinhoServidor, opcoes)
    .then((response: Response) => {
      if (!response.ok) {
        throw new Error('Ocorreu um erro ao enviar os dados.');
      }
      return response.json() as Promise<RespostaCarrinho>;
    })
    .then((data: RespostaCarrinho) => {
      console.log('Dados enviados com sucesso:', data);

      getListagemCarrinho();
    })
    .catch((error: Error) => {
      console.error('Erro ao enviar os dados:', error);
      alterarQuantidade(data);
    });

}

function alterarQuantidade(data: any) {

  let id = data.id
  let qtd = ""

  buscarCarrinho()
    .then((res) => {
      if (res.length) {

        res.map(product => {
          if (Number(product.id) === Number(id)) {
            qtd = String(Number(data.qtd) + Number(product.qtd))

            const updateData = {
              qtd
            };

            const requestOptions = {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updateData)
            };

            fetch(`${urlCarrinhoServidor}/${id}`, requestOptions)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Ocorreu um erro ao atualizar o produto.');
                }
                return response.json();
              })
              .then(data => {
                getListagemCarrinho();
                console.log('Produto atualizado com sucesso:', data);
              })
              .catch(error => {
                console.error('Erro ao atualizar o produto:', error);
              });
          }
        })
      }
    })
}

function removerCarrinho(id: string) {
  const url = `${urlCarrinhoServidor}/${id}`;
  let remover = document.querySelectorAll('.carrinho__remove');

  remover.forEach(produto => {
    produto.addEventListener('click', function (e) {
      const target = e.target as HTMLElement;
      const dataset = target.dataset;

      if (dataset.id === id) {
        fetch(url, {
          method: 'DELETE'
        }).then(response => {
          if (!response.ok) {
            throw new Error('Erro ao excluir o produto.');
          }

          getListagemCarrinho();

          console.log('Produto excluído com sucesso.');

          setTimeout(function () {
            console.log('Produto removido com sucesso!');
          }, 1000)

        }).catch(error => {
          console.error('Erro ao remover produto:', error);
        });
      }
    })
  })

}

const carrinho = () => {
  getListagemCarrinho();
  abrirCarrinho();
  fecharCarrinho();

  let btnComprar = document.querySelectorAll('.btn-comprar')

  btnComprar.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const target = e.target as HTMLElement;
      const dataset = target.dataset;

      let id = dataset.id.replace(/"/g, '');
      const name = dataset.name;
      const price = dataset.price;
      const image = dataset.image;

      let data = {
        id,
        name,
        price,
        image,
        qtd: '1'
      }

      adicionarAoCarrinho(data);
    });
  });
}

function abrirMaisCores() {
  const cores = document.querySelectorAll('.filter__item--color li');

  cores.forEach((cor, index) => {
    if (index >= 4) {
      if (cor instanceof HTMLElement) {
        cor.style.display = 'none';
      }
    }
  });

  const mais = document.querySelector('.filter__more');
  mais.addEventListener('click', function () {
    cores.forEach((cor, index) => {
      if (index >= 4) {
        if (cor instanceof HTMLElement) {
          cor.style.display = 'block';
        }
      }
    });
    mais.remove();
  });
}

function inicio() {
  obterProdutos();
  filtrarPorCor();
  filtrarPorTamanho();
  filtrarPorPreco();
  filtroMobile();
  fecharFiltroMobile();
  filtroOrdenacaoMobile();
}

document.addEventListener("DOMContentLoaded", inicio);