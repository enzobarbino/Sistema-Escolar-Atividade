let salasChart = null;

function garantirAlerta() {
    let container = document.getElementById('mensagemApp');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mensagemApp';
        container.style.position = 'fixed';
        container.style.top = '90px';
        container.style.right = '20px';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
    }
    return container;
}

function exibirMensagem(texto, tipo = 'success') {
    const container = garantirAlerta();
    container.innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">${texto}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button></div>`;
}

function limparMensagem() {
    const container = document.getElementById('mensagemApp');
    if (container) {
        container.innerHTML = '';
    }
}

function renderizarOpcoesSalas() {
    const salas = obterSalas();
    const selectSala = document.getElementById('selectSala');
    const filtroSala = document.getElementById('filtroSala');
    const filtroSalaDashboard = document.getElementById('filtroSalaDashboard');

    [selectSala, filtroSala, filtroSalaDashboard].forEach((elemento) => {
        if (!elemento) {
            return;
        }

        elemento.innerHTML = '<option value="" selected disabled>Selecione uma sala</option>';
        salas.forEach((sala) => {
            const option = document.createElement('option');
            option.value = sala.id;
            option.textContent = sala.nome;
            elemento.appendChild(option);
        });
    });
}

function renderizarListaSalas() {
    const listaSalas = document.getElementById('listaSalas');
    listaSalas.innerHTML = '';
    const salas = obterSalas();

    if (salas.length === 0) {
        listaSalas.innerHTML = '<li class="list-group-item">Nenhuma sala criada ainda.</li>';
        return;
    }

    salas.forEach((sala) => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${sala.nome}</span>
            <div>
                <button type="button" class="btn btn-sm btn-outline-secondary me-1" data-action="edit-sala" data-id="${sala.id}">Editar</button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-sala" data-id="${sala.id}">Excluir</button>
            </div>
        `;
        listaSalas.appendChild(item);
    });
}

function renderizarListaAlunos() {
    const listaAlunosGeral = document.getElementById('listaAlunosGeral');
    listaAlunosGeral.innerHTML = '';
    const alunos = obterAlunos();

    if (alunos.length === 0) {
        listaAlunosGeral.innerHTML = '<li class="list-group-item">Nenhum aluno cadastrado ainda.</li>';
        return;
    }

    alunos.forEach((aluno) => {
        const estatisticas = calcularEstatisticasAluno(aluno);
        const sala = buscarSalaPorId(aluno.salaId);
        const salaNome = sala ? sala.nome : 'Sala indefinida';

        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="text-start">
                    <strong>${aluno.nome}</strong> <small class="text-muted">(${salaNome})</small><br>
                    <small>Presença: ${estatisticas.percentual}% | Faltas: ${estatisticas.faltas} | Último dia presente: ${estatisticas.ultimoDiaPresente ? formatarDataLocal(estatisticas.ultimoDiaPresente) : 'Nunca'}</small>
                </div>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-secondary me-1" data-action="edit-aluno" data-id="${aluno.id}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-aluno" data-id="${aluno.id}">Excluir</button>
                </div>
            </div>
        `;

        listaAlunosGeral.appendChild(item);
    });
}

function renderizarRankingAlunos() {
    const listaRankingAlunos = document.getElementById('listaRankingAlunos');
    listaRankingAlunos.innerHTML = '';
    const alunos = obterAlunos().slice().sort(compararPorFrequencia);

    if (alunos.length === 0) {
        listaRankingAlunos.innerHTML = '<li class="list-group-item">Sem dados de ranking de alunos.</li>';
        return;
    }

    alunos.forEach((aluno, index) => {
        const estatisticas = calcularEstatisticasAluno(aluno);
        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.textContent = `${index + 1}. ${aluno.nome} — ${estatisticas.percentual}% de presença`; 
        listaRankingAlunos.appendChild(item);
    });
}

function renderizarRankingSalas() {
    const listaRankingSalas = document.getElementById('listaRankingSalas');
    listaRankingSalas.innerHTML = '';
    const salas = obterSalas().slice().sort((a, b) => calcularMediaSala(b.id) - calcularMediaSala(a.id));

    if (salas.length === 0) {
        listaRankingSalas.innerHTML = '<li class="list-group-item">Sem dados de ranking de salas.</li>';
        return;
    }

    salas.forEach((sala, index) => {
        const media = calcularMediaSala(sala.id);
        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.textContent = `${index + 1}. ${sala.nome} — média de presença ${media}%`; 
        listaRankingSalas.appendChild(item);
    });
}

function renderizarChamada(data, salaId) {
    const container = document.getElementById('chamada');
    container.innerHTML = '';

    if (!data || !salaId) {
        container.innerHTML = '<div class="text-muted">Selecione data e sala para carregar a chamada.</div>';
        return;
    }

    const sala = buscarSalaPorId(salaId);
    if (!sala) {
        container.innerHTML = '<div class="text-danger">Sala não encontrada.</div>';
        return;
    }

    const alunos = obterAlunosPorSalaId(salaId);
    if (alunos.length === 0) {
        container.innerHTML = '<div class="text-muted">Nenhum aluno cadastrado nessa sala.</div>';
        return;
    }

    const dataPassada = dataEhPassada(data);
    const titulo = document.createElement('div');
    titulo.className = 'mb-3 text-start';
    titulo.innerHTML = `
        <strong>Chamada para ${sala.nome} em ${formatarDataLocal(data)}</strong><br>
        <small>${dataPassada ? 'Alterações após a data exigem justificativa.' : 'Você pode marcar presença normalmente até 23:59 do dia selecionado.'}</small>
    `;

    container.appendChild(titulo);

    const lista = document.createElement('ul');
    lista.className = 'list-group';

    alunos.forEach((aluno) => {
        const estado = obterResumoPresenca(aluno, data);
        const presenteAtual = estado.atual === true;
        const item = document.createElement('li');
        item.className = `list-group-item d-flex justify-content-between align-items-center ${estado.atual === true ? 'presente' : estado.atual === false ? 'ausente' : ''}`;

        item.innerHTML = `
            <div class="text-start me-3">
                <strong>${aluno.nome}</strong><br>
                <small>${estado.atual === null ? 'Sem registro' : estado.atual ? 'Presente' : 'Ausente'}</small>
            </div>
            <div class="input-group w-auto">
                <select class="form-select attendance-select" id="attendance-${aluno.id}" data-aluno-id="${aluno.id}" data-data="${data}" data-sala-id="${salaId}">
                    <option value="" ${estado.atual === null ? 'selected' : ''}>Sem registro</option>
                    <option value="true" ${estado.atual === true ? 'selected' : ''}>Presente</option>
                    <option value="false" ${estado.atual === false ? 'selected' : ''}>Ausente</option>
                </select>
            </div>
        `;

        lista.appendChild(item);
    });

    container.appendChild(lista);
}

function renderizarJustificativas() {
    const filtroSalaDashboard = document.getElementById('filtroSalaDashboard');
    const salaId = filtroSalaDashboard.value;
    const listaJustificativas = document.getElementById('listaJustificativas');
    listaJustificativas.innerHTML = '';

    if (!salaId) {
        listaJustificativas.innerHTML = '<li class="list-group-item">Escolha uma sala para ver as justificativas.</li>';
        return;
    }

    const justificativas = obterTodosOsRegistrosDeJustificativa(salaId);
    if (justificativas.length === 0) {
        listaJustificativas.innerHTML = '<li class="list-group-item">Não há justificativas registradas para esta sala.</li>';
        return;
    }

    justificativas.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item text-start';
        listItem.innerHTML = `
            <strong>${item.alunoNome}</strong><br>
            <small>Data: ${formatarDataLocal(item.data)} | Presente: ${item.presente ? 'Sim' : 'Não'} | Alterado: ${new Date(item.timestamp).toLocaleString()}</small><br>
            <span>Justificativa: ${item.justificativa}</span>
        `;
        listaJustificativas.appendChild(listItem);
    });
}

function renderizarGraficoSalas() {
    const ctx = document.getElementById('graficoSalas');
    if (!ctx) {
        return;
    }

    const salas = obterSalas();
    const labels = salas.map((sala) => sala.nome);
    const dados = salas.map((sala) => calcularMediaSala(sala.id));

    if (salasChart) {
        salasChart.data.labels = labels;
        salasChart.data.datasets[0].data = dados;
        salasChart.update();
        return;
    }

    salasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Média de presença (%)',
                    data: dados,
                    backgroundColor: 'rgba(14, 85, 239, 0.7)',
                    borderColor: 'rgba(14, 85, 239, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 10,
                    },
                },
            },
        },
    });
}

function atualizarTodasAsViews() {
    renderizarOpcoesSalas();
    renderizarListaSalas();
    renderizarListaAlunos();
    renderizarRankingAlunos();
    renderizarRankingSalas();
    renderizarGraficoSalas();
    renderizarJustificativas();
}
