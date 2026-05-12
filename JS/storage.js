const STORAGE_KEY = 'escolaAtivaDatabase';

function gerarId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function carregarDatabase() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return { salas: [], alunos: [] };
    }

    try {
        const parsed = JSON.parse(raw);
        return {
            salas: Array.isArray(parsed.salas) ? parsed.salas : [],
            alunos: Array.isArray(parsed.alunos) ? parsed.alunos : [],
        };
    } catch {
        return { salas: [], alunos: [] };
    }
}

function salvarDatabase(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
}

function obterSalas() {
    return carregarDatabase().salas;
}

function obterAlunos() {
    return carregarDatabase().alunos;
}

function buscarSalaPorId(id) {
    return obterSalas().find((sala) => sala.id === id) || null;
}

function buscarAlunoPorId(id) {
    return obterAlunos().find((aluno) => aluno.id === id) || null;
}

function adicionarSala(nome) {
    const db = carregarDatabase();
    const nomeNormalizado = nome.trim();

    if (db.salas.some((sala) => sala.nome.trim().toLowerCase() === nomeNormalizado.toLowerCase())) {
        throw new Error('Já existe sala com esse nome.');
    }

    const sala = {
        id: gerarId(),
        nome: nomeNormalizado,
    };

    db.salas.push(sala);
    salvarDatabase(db);
    return sala;
}

function atualizarSala(id, novoNome) {
    const db = carregarDatabase();
    const nomeNormalizado = novoNome.trim();

    if (db.salas.some((sala) => sala.id !== id && sala.nome.trim().toLowerCase() === nomeNormalizado.toLowerCase())) {
        throw new Error('Já existe sala com esse nome.');
    }

    const sala = db.salas.find((salaItem) => salaItem.id === id);
    if (!sala) {
        throw new Error('Sala não encontrada.');
    }

    sala.nome = nomeNormalizado;
    salvarDatabase(db);
    return sala;
}

function removerSala(id) {
    const db = carregarDatabase();
    const existeAluno = db.alunos.some((aluno) => aluno.salaId === id);
    if (existeAluno) {
        throw new Error('Não é possível excluir sala com alunos cadastrados.');
    }

    db.salas = db.salas.filter((sala) => sala.id !== id);
    salvarDatabase(db);
}

function adicionarAluno(nome, salaId) {
    const db = carregarDatabase();
    const nomeNormalizado = nome.trim();

    if (!db.salas.some((sala) => sala.id === salaId)) {
        throw new Error('Sala inválida.');
    }

    if (db.alunos.some((aluno) => aluno.nome.trim().toLowerCase() === nomeNormalizado.toLowerCase() && aluno.salaId === salaId)) {
        throw new Error('Aluno já cadastrado nesta sala.');
    }

    const aluno = {
        id: gerarId(),
        nome: nomeNormalizado,
        salaId,
        presencas: [],
    };

    db.alunos.push(aluno);
    salvarDatabase(db);
    return aluno;
}

function atualizarAluno(id, novoNome) {
    const db = carregarDatabase();
    const aluno = db.alunos.find((item) => item.id === id);
    if (!aluno) {
        throw new Error('Aluno não encontrado.');
    }

    aluno.nome = novoNome.trim();
    salvarDatabase(db);
    return aluno;
}

function removerAluno(id) {
    const db = carregarDatabase();
    db.alunos = db.alunos.filter((aluno) => aluno.id !== id);
    salvarDatabase(db);
}

function obterAlunosPorSalaId(salaId) {
    return obterAlunos().filter((aluno) => aluno.salaId === salaId);
}

function obterPresenca(alunoId, data) {
    const aluno = buscarAlunoPorId(alunoId);
    if (!aluno) {
        return null;
    }

    return aluno.presencas.find((item) => item.data === data) || null;
}

function salvarPresenca(alunoId, data, presente, justificativa = '') {
    const db = carregarDatabase();
    const aluno = db.alunos.find((item) => item.id === alunoId);
    if (!aluno) {
        throw new Error('Aluno não encontrado.');
    }

    let registro = aluno.presencas.find((item) => item.data === data);
    const historicoItem = {
        presente: Boolean(presente),
        timestamp: new Date().toISOString(),
        justificativa: justificativa.trim(),
    };

    if (registro) {
        registro.historico.push(historicoItem);
        if (historicoItem.justificativa) {
            registro.justificativa = historicoItem.justificativa;
        }
    } else {
        registro = {
            data,
            justificativa: historicoItem.justificativa,
            historico: [historicoItem],
        };
        aluno.presencas.push(registro);
    }

    salvarDatabase(db);
    return registro;
}

function obterTodosOsRegistrosDeJustificativa(salaId) {
    const alunos = obterAlunosPorSalaId(salaId);
    const justificativas = [];

    alunos.forEach((aluno) => {
        aluno.presencas.forEach((presenca) => {
            presenca.historico.forEach((item) => {
                if (item.justificativa) {
                    justificativas.push({
                        alunoNome: aluno.nome,
                        data: presenca.data,
                        presente: item.presente,
                        justificativa: item.justificativa,
                        timestamp: item.timestamp,
                    });
                }
            });
        });
    });

    justificativas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return justificativas;
}
