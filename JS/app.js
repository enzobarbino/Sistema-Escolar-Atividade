function inicializarApp() {
    atualizarTodasAsViews();

    const filtroSalaDashboard = document.getElementById('filtroSalaDashboard');
    if (filtroSalaDashboard) {
        filtroSalaDashboard.addEventListener('change', renderizarJustificativas);
    }

    document.getElementById('listaSalas').addEventListener('click', tratarCliqueListaSalas);
    document.getElementById('listaAlunosGeral').addEventListener('click', tratarCliqueListaAlunos);
    document.getElementById('chamada').addEventListener('change', tratarMudancaChamada);
}

function criarSala() {
    try {
        const nomeSala = document.getElementById('nomeSala').value;
        validarTextoObrigatorio(nomeSala, 'O nome da sala não pode ficar vazio.');
        adicionarSala(nomeSala);
        exibirMensagem('Sala cadastrada com sucesso!', 'success');
        document.getElementById('nomeSala').value = '';
        atualizarTodasAsViews();
    } catch (error) {
        exibirMensagem(error.message, 'warning');
    }
}

function cadastrarAlunos() {
    try {
        const nomeAluno = document.getElementById('nomeAluno').value;
        const salaId = document.getElementById('selectSala').value;

        validarTextoObrigatorio(nomeAluno, 'O nome do aluno não pode ficar vazio.');
        validarTextoObrigatorio(salaId, 'Selecione uma sala para cadastrar o aluno.');

        adicionarAluno(nomeAluno, salaId);
        exibirMensagem('Aluno cadastrado com sucesso!', 'success');
        document.getElementById('nomeAluno').value = '';
        atualizarTodasAsViews();
    } catch (error) {
        exibirMensagem(error.message, 'warning');
    }
}

function carregarChamada() {
    try {
        const dataChamada = document.getElementById('dataChamada').value;
        const salaId = document.getElementById('filtroSala').value;

        validarDataPresenca(dataChamada);
        validarTextoObrigatorio(salaId, 'Selecione uma sala para carregar a chamada.');

        renderizarChamada(dataChamada, salaId);
    } catch (error) {
        exibirMensagem(error.message, 'warning');
    }
}

function tratarMudancaChamada(event) {
    const target = event.target;
    if (!target.classList.contains('attendance-select')) {
        return;
    }

    const alunoId = target.dataset.alunoId;
    const data = target.dataset.data;
    const salaId = target.dataset.salaId;
    const valorSelecionado = target.value;

    if (valorSelecionado === '') {
        return;
    }

    const marcadoComoPresente = valorSelecionado === 'true';
    const aluno = buscarAlunoPorId(alunoId);
    const presencaAtual = obterStatusAtualPresenca(aluno, data);

    if (presencaAtual === marcadoComoPresente) {
        return;
    }

    let justificativa = '';
    if (precisaJustificativa(data)) {
        justificativa = prompt('Esta data já passou. Insira a justificativa para alterar a presença:');
        if (!justificativa || justificativa.trim().length === 0) {
            exibirMensagem('Justificativa obrigatória para alteração após a data.', 'warning');
            target.value = presencaAtual === true ? 'true' : presencaAtual === false ? 'false' : '';
            return;
        }
    }

    salvarPresenca(alunoId, data, marcadoComoPresente, justificativa);
    exibirMensagem('Presença registrada com sucesso.', 'success');
    renderizarChamada(data, salaId);
    atualizarTodasAsViews();
}

function tratarCliqueListaSalas(event) {
    const botao = event.target.closest('button');
    if (!botao) {
        return;
    }

    const action = botao.dataset.action;
    const id = botao.dataset.id;

    if (!action || !id) {
        return;
    }

    if (action === 'edit-sala') {
        const sala = buscarSalaPorId(id);
        if (!sala) {
            exibirMensagem('Sala não encontrada.', 'warning');
            return;
        }

        const novoNome = prompt('Novo nome da sala:', sala.nome);
        if (!novoNome || !novoNome.trim()) {
            exibirMensagem('Nome inválido.', 'warning');
            return;
        }

        try {
            atualizarSala(id, novoNome);
            exibirMensagem('Nome da sala atualizado.', 'success');
            atualizarTodasAsViews();
        } catch (error) {
            exibirMensagem(error.message, 'warning');
        }
    }

    if (action === 'delete-sala') {
        if (!confirm('Deseja realmente excluir esta sala? Alunos vinculados impedirão a exclusão.')) {
            return;
        }

        try {
            removerSala(id);
            exibirMensagem('Sala excluída.', 'success');
            atualizarTodasAsViews();
        } catch (error) {
            exibirMensagem(error.message, 'warning');
        }
    }
}

function tratarCliqueListaAlunos(event) {
    const botao = event.target.closest('button');
    if (!botao) {
        return;
    }

    const action = botao.dataset.action;
    const id = botao.dataset.id;

    if (!action || !id) {
        return;
    }

    if (action === 'edit-aluno') {
        const aluno = buscarAlunoPorId(id);
        if (!aluno) {
            exibirMensagem('Aluno não encontrado.', 'warning');
            return;
        }

        const novoNome = prompt('Novo nome do aluno:', aluno.nome);
        if (!novoNome || !novoNome.trim()) {
            exibirMensagem('Nome inválido.', 'warning');
            return;
        }

        try {
            atualizarAluno(id, novoNome);
            exibirMensagem('Nome do aluno atualizado.', 'success');
            atualizarTodasAsViews();
        } catch (error) {
            exibirMensagem(error.message, 'warning');
        }
    }

    if (action === 'delete-aluno') {
        if (!confirm('Deseja realmente excluir este aluno?')) {
            return;
        }

        try {
            removerAluno(id);
            exibirMensagem('Aluno excluído.', 'success');
            atualizarTodasAsViews();
        } catch (error) {
            exibirMensagem(error.message, 'warning');
        }
    }
}

window.addEventListener('DOMContentLoaded', inicializarApp);

// Funções de exportação
function arrayParaCSV(array, headers) {
    const csvRows = [];
    csvRows.push(headers.join(';'));

    array.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(';'));
    });

    return csvRows.join('\n');
}

function baixarArquivo(conteudo, nomeArquivo, tipo) {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportarAlunos(formato) {
    const alunos = obterAlunos();
    const dados = alunos.map(aluno => {
        const sala = buscarSalaPorId(aluno.salaId);
        const estatisticas = calcularEstatisticasAluno(aluno);
        return {
            id: aluno.id,
            nome: aluno.nome,
            salaNome: sala ? sala.nome : 'Sala não encontrada',
            salaId: aluno.salaId,
            percentualPresenca: estatisticas.percentual,
            totalFaltas: estatisticas.faltas,
            totalDias: estatisticas.totalDias,
            ultimoDiaPresente: estatisticas.ultimoDiaPresente || 'Nunca'
        };
    });

    if (formato === 'json') {
        const json = JSON.stringify(dados, null, 2);
        baixarArquivo(json, 'relatorio_alunos.json', 'application/json');
    } else if (formato === 'csv') {
        const headers = ['id', 'nome', 'salaNome', 'salaId', 'percentualPresenca', 'totalFaltas', 'totalDias', 'ultimoDiaPresente'];
        const csv = arrayParaCSV(dados, headers);
        baixarArquivo(csv, 'relatorio_alunos.csv', 'text/csv');
    }
}

function exportarSalas(formato) {
    const salas = obterSalas();
    const dados = salas.map(sala => {
        const media = calcularMediaSala(sala.id);
        const alunosCount = obterAlunosPorSalaId(sala.id).length;
        return {
            id: sala.id,
            nome: sala.nome,
            mediaPresenca: media,
            totalAlunos: alunosCount
        };
    });

    if (formato === 'json') {
        const json = JSON.stringify(dados, null, 2);
        baixarArquivo(json, 'relatorio_salas.json', 'application/json');
    } else if (formato === 'csv') {
        const headers = ['id', 'nome', 'mediaPresenca', 'totalAlunos'];
        const csv = arrayParaCSV(dados, headers);
        baixarArquivo(csv, 'relatorio_salas.csv', 'text/csv');
    }
}

function exportarPresencas(formato) {
    const alunos = obterAlunos();
    const dados = [];

    alunos.forEach(aluno => {
        const sala = buscarSalaPorId(aluno.salaId);
        aluno.presencas.forEach(presenca => {
            presenca.historico.forEach(item => {
                dados.push({
                    alunoId: aluno.id,
                    alunoNome: aluno.nome,
                    salaNome: sala ? sala.nome : 'Sala não encontrada',
                    data: presenca.data,
                    presente: item.presente,
                    timestamp: item.timestamp,
                    justificativa: item.justificativa || ''
                });
            });
        });
    });

    dados.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (formato === 'json') {
        const json = JSON.stringify(dados, null, 2);
        baixarArquivo(json, 'relatorio_presencas.json', 'application/json');
    } else if (formato === 'csv') {
        const headers = ['alunoId', 'alunoNome', 'salaNome', 'data', 'presente', 'timestamp', 'justificativa'];
        const csv = arrayParaCSV(dados, headers);
        baixarArquivo(csv, 'relatorio_presencas.csv', 'text/csv');
    }
}

function exportarJustificativas(formato) {
    const salaId = document.getElementById('filtroSalaDashboard').value;
    if (!salaId) {
        exibirMensagem('Selecione uma sala para exportar justificativas.', 'warning');
        return;
    }

    const justificativas = obterTodosOsRegistrosDeJustificativa(salaId);
    const dados = justificativas.map(item => ({
        alunoNome: item.alunoNome,
        data: item.data,
        presente: item.presente,
        justificativa: item.justificativa,
        timestamp: item.timestamp
    }));

    if (formato === 'json') {
        const json = JSON.stringify(dados, null, 2);
        baixarArquivo(json, 'relatorio_justificativas.json', 'application/json');
    } else if (formato === 'csv') {
        const headers = ['alunoNome', 'data', 'presente', 'justificativa', 'timestamp'];
        const csv = arrayParaCSV(dados, headers);
        baixarArquivo(csv, 'relatorio_justificativas.csv', 'text/csv');
    }
}


