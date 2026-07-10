# ✍️ Como adicionar questões e flashcards

Tudo fica no arquivo `js/content.js`. Você **não precisa saber programar** — é só copiar um modelo e trocar os textos. Depois salve o arquivo e recarregue o app.

> Dica para o grupo: dividam as disciplinas. Cada colega cria 10 questões da sua parte e todos ganham um banco enorme.

---

## 1) Adicionar uma QUESTÃO

Dentro da lista `const QUESTIONS = [ ... ]`, copie e cole este bloco (antes do `];` final) e edite:

```js
  {
    id: "mad11",                       // código ÚNICO (ninguém pode repetir)
    discipline: "mad",                 // ver códigos das disciplinas abaixo
    phase: "N1",                       // "N1" ou "N2"
    topic: "Nome do tema",
    difficulty: 2,                     // 1 = base, 2 = média, 3 = desafio (dá mais XP)
    vignette: "Caso clínico / contexto. Pode deixar vazio: \"\".",
    question: "O enunciado da pergunta?",
    options: [
      "Alternativa A",
      "Alternativa B",
      "Alternativa C",
      "Alternativa D",
      "Alternativa E"                  // pode ter de 2 a 5 alternativas
    ],
    answer: 1,                         // qual é a CORRETA: 0=A, 1=B, 2=C, 3=D, 4=E
    explanation: "Por que a correta está certa E por que as outras estão erradas. É o que faz aprender!",
    tags: ["palavra1", "palavra2"]
  },
```

⚠️ **Cuidados:**
- Cada `id` tem que ser único.
- `answer` conta a partir do ZERO (a primeira alternativa é `0`).
- Toda linha termina com vírgula. Use aspas duplas `"..."`. Se o texto tiver aspas, escreva `\"`.
- Não esqueça a vírgula `,` no fim do bloco.

---

## 2) Adicionar um FLASHCARD

Dentro da lista `const FLASHCARDS = [ ... ]`:

```js
  { id: "f-mad15", discipline: "mad", phase: "N1",
    front: "Pergunta / termo (frente do card)",
    back: "Resposta / explicação (verso do card)" },
```

---

## 3) Códigos das disciplinas (campo `discipline`)

| Código      | Disciplina |
|-------------|------------|
| `mad`       | MAD II — Imunologia |
| `pratica`   | Prática Clínica II |
| `terap`     | Terapêutica I — Farmacologia |
| `rci`       | RCI V — Raciocínio Clínico |
| `legal`     | Medicina Legal |
| `cirurgia`  | Introdução à Prática Cirúrgica |
| `pig`       | PIG V — Gestão em Saúde |
| `aps`       | APS V — Saúde Ocupacional |

---

## 3.1) IMPORTANTE — o campo `topic` e o Plano de Estudos

As questões **só aparecem quando o tema está marcado como estudado** no **Plano de Estudos**.
Para o tema aparecer no plano, o `topic` da questão deve existir na lista **SYLLABUS** (topo do `content.js`).

- Se você usar um `topic` que **já está** no SYLLABUS, pronto — a questão entra naquele tema.
- Se criar um `topic` **novo**, adicione-o também no SYLLABUS, na disciplina certa:

```js
const SYLLABUS = {
  mad: [
    { phase:"N1", topic:"Sepse" },
    { phase:"N1", topic:"Meu tema novo" },   // <- adicione aqui
    ...
  ],
  ...
};
```

> Se esquecer, a questão ainda funciona, mas o tema aparece no fim da lista do plano automaticamente (o app inclui temas de questões que não estão no SYLLABUS). Colocar no SYLLABUS só serve para controlar a ORDEM e a fase (N1/N2).

## 4) Adicionar um RESUMO

No bloco **SUMMARIES** (topo do `content.js`), a chave é `"disciplina::tema"` (o mesmo `topic`):

```js
const SUMMARIES = {
  "mad::Sepse":
    "Definição...\n"+
    "• ponto 1\n"+
    "• ponto 2",
  "cirurgia::Fios e suturas":
    "Absorvíveis: ...\nInabsorvíveis: ...",
};
```

Use `\n` para quebrar linha e `+` para juntar linhas (como no exemplo). O resumo aparece na aba **📖 Resumos**, dentro da disciplina, e um marcador 📖 surge no Plano.

## 5) Testar se não quebrou

Se o app abrir em branco depois de editar, provavelmente faltou uma vírgula ou aspas.
Abra o arquivo, procure o bloco que você mexeu e confira. No navegador, aperte **F12 → Console**
para ver a mensagem de erro (ela diz a linha do problema).

Pronto! Cada questão nova entra automaticamente no jogo, no ranking e nas conquistas. 🎯
