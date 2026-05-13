```markdown
# Sistema Escolar – Relatório de Desenvolvimento

## Descrição do Problema

A escola enfrentava problemas de controle de presença: lançamentos errados, dados sobrescritos, ausência de histórico e relatórios inconsistentes. O objetivo foi criar um sistema confiável, com regras claras, validação forte, histórico de alterações e relatórios precisos.

---

## Funcionalidades Implementadas

### 1. Gestão de Dados (CRUD)

- **Salas**: Cadastro, edição, exclusão e listagem.
- **Alunos**: Cadastro, edição, exclusão e listagem. Um aluno só pode ser cadastrado se vinculado a uma sala.

**Exemplo de código para evitar duplicidade de salas:**
```javascript
function adicionarSala(nomeSala) {
  if (!nomeSala) throw new Error("Nome da sala não pode ser vazio.");
  const salas = getSalas();
  if (salas.some(sala => sala.nome === nomeSala)) {
    throw new Error("Já existe uma sala com esse nome.");
  }
  // ...adicionar sala...
}
```

**Dificuldade:** Garantir unicidade dos nomes das salas.  
**Solução:** Validação antes do cadastro.

---

### 2. Presença e Histórico

- **Presença**: Um aluno só pode ter uma presença por dia.
- **Histórico**: Alterações não sobrescrevem dados, mas criam um histórico.

**Estrutura do histórico:**
```javascript
{
  alunoId,
  data,
  historico: [
    { presente: true, timestamp: "2024-05-10T08:00:00" },
    { presente: false, timestamp: "2024-05-10T10:00:00" }
  ]
}
```

**Dificuldade:** Evitar sobrescrita e garantir histórico.  
**Solução:** Sempre adicionar novo registro ao array `historico` ao invés de substituir.

---

### 3. Regras de Negócio

- **Presença só até 23:59**. Após isso, só pode alterar com justificativa.
- **Validações**: Impede campos vazios, duplicidade, aluno sem sala, presença sem data.

**Exemplo de regra de negócio:**
```javascript
function marcarPresenca(alunoId, data, presente) {
  const agora = new Date();
  if (agora > new Date(data + "T23:59:59")) {
    throw new Error("Presença só pode ser marcada até 23:59 do dia.");
  }
  // ...restante da lógica...
}
```

---

### 4. Relatórios

- **Por aluno**: % de presença, total de faltas, último dia presente.
- **Por sala**: Média geral, ranking de frequência.

**Exemplo de cálculo de presença:**
```javascript
function calcularPercentualPresenca(historico) {
  const total = historico.length;
  const presentes = historico.filter(h => h.presente).length;
  return (presentes / total) * 100;
}
```

---

### 5. Persistência

- **localStorage**: Todos os dados são salvos e recuperados do localStorage.
- **Estrutura clara**: Dados organizados por entidades (salas, alunos, presenças).

**Exemplo de uso do localStorage:**
```javascript
function salvarDados(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}
```

---

### 6. Interface

- **Bootstrap**: Layout responsivo, feedback visual (verde para presente, vermelho para falta).
- **Validação visual**: Mensagens de erro e sucesso.

---

## Como as Dificuldades Foram Resolvidas

- **Evitar duplicidade**: Validação antes do cadastro de salas e presenças.
- **Histórico**: Estrutura de array para cada alteração, nunca sobrescrevendo.
- **Regras de negócio**: Funções separadas para cada regra, com testes de horário e justificativa.
- **Persistência**: Funções específicas para leitura e escrita no localStorage, sempre validando antes de salvar.

---

## Diferenciais

- **Exportação de relatórios**: Implementado exportar em JSON e CSV.
- **Filtros por período**: Relatórios podem ser filtrados por datas.
- **Dashboard com gráficos**: Utilizado Chart.js para exibir gráficos de presença.

---

## Organização do Código

- **Funções separadas**: Storage, UI e regras de negócio em arquivos distintos.
- **Nomes claros**: Variáveis e funções com nomes descritivos.
- **Sem funções gigantes**: Cada função tem responsabilidade única.

---

## Conclusão

O sistema atende todos os requisitos, garantindo confiabilidade, histórico, relatórios precisos e interface amigável. As principais dificuldades foram resolvidas com validação forte, separação de responsabilidades e testes constantes.

---
```
