function validarTextoObrigatorio(valor, mensagem) {
    if (!valor || String(valor).trim().length === 0) {
        throw new Error(mensagem);
    }
}

function normalizarTexto(valor) {
    return String(valor || '').trim();
}

function dataParaObjeto(dataString) {
    const [year, month, day] = String(dataString).split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatarDataLocal(dataString) {
    if (!dataString) {
        return 'N/A';
    }

    const [year, month, day] = String(dataString).split('-');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

function hojeSemHorario() {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}

function dataEhFutura(dataString) {
    const data = dataParaObjeto(dataString);
    return data.getTime() > hojeSemHorario().getTime();
}

function dataEhPassada(dataString) {
    const data = dataParaObjeto(dataString);
    return data.getTime() < hojeSemHorario().getTime();
}

function validarDataPresenca(dataString) {
    validarTextoObrigatorio(dataString, 'Data da presença é obrigatória.');
    if (typeof dataString !== 'string' || dataString.length !== 10 || !dataString.includes('-')) {
        throw new Error('Data inválida.');
    }

    if (dataEhFutura(dataString)) {
        throw new Error('Não é possível registrar presença para data futura.');
    }
}

function precisaJustificativa(dataString) {
    return dataEhPassada(dataString);
}

function obterUltimoRegistro(presenca) {
    if (!presenca || !Array.isArray(presenca.historico) || presenca.historico.length === 0) {
        return null;
    }

    return presenca.historico[presenca.historico.length - 1];
}

function obterStatusAtualPresenca(aluno, dataString) {
    const presenca = obterPresenca(aluno.id, dataString);
    const ultimo = obterUltimoRegistro(presenca);
    return ultimo ? ultimo.presente : null;
}

function calcularEstatisticasAluno(aluno) {
    const totalDias = aluno.presencas.length;
    const resultado = {
        totalDias,
        presentes: 0,
        faltas: 0,
        percentual: 0,
        ultimoDiaPresente: null,
    };

    aluno.presencas.forEach((presenca) => {
        const ultimo = obterUltimoRegistro(presenca);
        if (!ultimo) {
            return;
        }

        if (ultimo.presente) {
            resultado.presentes += 1;
            resultado.ultimoDiaPresente = presenca.data;
        } else {
            resultado.faltas += 1;
        }
    });

    if (totalDias > 0) {
        resultado.percentual = Math.round((resultado.presentes / totalDias) * 100);
    }

    return resultado;
}

function calcularMediaSala(salaId) {
    const alunos = obterAlunosPorSalaId(salaId);
    if (alunos.length === 0) {
        return 0;
    }

    const somaPercentuais = alunos.reduce((acc, aluno) => acc + calcularEstatisticasAluno(aluno).percentual, 0);
    return Math.round(somaPercentuais / alunos.length);
}

function compararPorFrequencia(a, b) {
    return calcularEstatisticasAluno(b).percentual - calcularEstatisticasAluno(a).percentual;
}

function obterResumoPresenca(aluno, dataString) {
    const presenca = obterPresenca(aluno.id, dataString);
    const ultimo = obterUltimoRegistro(presenca);
    return {
        atual: ultimo ? ultimo.presente : null,
        registro: presenca,
        ultimoRegistro: ultimo,
    };
}
