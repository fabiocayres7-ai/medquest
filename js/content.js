/* ============================================================
   MedQuest 5 — Banco de conteúdo (questões + flashcards)
   ------------------------------------------------------------
   Baseado no conteúdo do 5º semestre (Mandic).
   COMO ADICIONAR: copie um bloco, mude os campos e salve.
   - difficulty: 1 (base) | 2 (intermediária) | 3 (desafio)
   - answer: índice da alternativa correta (0 = A, 1 = B, ...)
   - phase: "N1" ou "N2"
   Veja COMO-ADICIONAR-QUESTOES.md para o guia completo.
   ============================================================ */

const DISCIPLINES = {
  mad:       { name: "MAD II — Imunologia",        color: "#ef4444", icon: "🧬" },
  pratica:   { name: "Prática Clínica II",         color: "#8b5cf6", icon: "🔬" },
  terap:     { name: "Terapêutica I — Farmaco",    color: "#f59e0b", icon: "💊" },
  rci:       { name: "RCI V — Raciocínio Clínico",  color: "#06b6d4", icon: "🩺" },
  legal:     { name: "Medicina Legal",             color: "#10b981", icon: "⚖️" },
  cirurgia:  { name: "Intro à Prática Cirúrgica",  color: "#3b82f6", icon: "🔪" },
  pig:       { name: "PIG V — Gestão em Saúde",     color: "#ec4899", icon: "🏥" },
  aps:       { name: "APS V — Saúde Ocupacional",   color: "#84cc16", icon: "👷" },
};

/* ============================ QUESTÕES ============================ */
const QUESTIONS = [
  /* ---------------- MAD II — Imunologia ---------------- */
  {
    id: "mad01", discipline: "mad", phase: "N1", topic: "Sepse", difficulty: 3,
    vignette: "Homem de 68 anos, diabético, chega ao PS com febre, taquicardia (FC 122), FR 26, PA 82x50 mmHg e confusão mental. Lactato 4,2 mmol/L. Após 30 mL/kg de cristaloide a PA permanece 84x52 mmHg, exigindo noradrenalina para manter PAM ≥ 65.",
    question: "Com base na fisiopatologia imunológica, qual afirmação melhor explica a hipotensão refratária deste paciente?",
    options: [
      "Vasoconstrição generalizada por descarga adrenérgica maciça",
      "Liberação de mediadores (TNF-α, IL-1, óxido nítrico) causando vasodilatação e aumento da permeabilidade capilar",
      "Depleção do complemento levando à queda da pressão oncótica",
      "Bloqueio dos receptores de insulina pela hiperglicemia",
      "Trombose microvascular isolada sem componente inflamatório"
    ],
    answer: 1,
    explanation: "É choque séptico (sepse + necessidade de vasopressor + lactato > 2 apesar de volume). A resposta imune inata libera citocinas pró-inflamatórias (TNF-α, IL-1, IL-6) e induz a NO sintase, gerando VASODILATAÇÃO intensa e aumento da permeabilidade capilar → hipotensão distributiva refratária. A descarga adrenérgica existe, mas é sobrepujada. O NO (não a adrenalina) é protagonista da vasoplegia.",
    tags: ["choque", "citocinas", "NO"]
  },
  {
    id: "mad02", discipline: "mad", phase: "N1", topic: "Tipagem sanguínea", difficulty: 2,
    vignette: "Gestante O negativo, primeira gestação, feto A positivo. Não recebeu imunoglobulina anti-D.",
    question: "Qual o risco imunológico principal para uma PRÓXIMA gestação e o mecanismo?",
    options: [
      "Reação ABO grave nesta gestação por anticorpos IgM anti-A maternos que cruzam a placenta",
      "Doença hemolítica do recém-nascido na próxima gestação Rh+, por IgG anti-D produzida após sensibilização",
      "Anemia materna por autoanticorpos anti-Rh",
      "Nenhum risco, pois mãe O negativo é doadora universal",
      "Trombocitopenia fetal por anticorpos plaquetários"
    ],
    answer: 1,
    explanation: "A mãe Rh(D) negativa pode se sensibilizar ao antígeno D fetal (hemorragia feto-materna, sobretudo no parto). A resposta primária gera IgM, mas na re-exposição (próxima gestação Rh+) há resposta secundária com IgG anti-D — e IgG ATRAVESSA a placenta, causando doença hemolítica perinatal. IgM anti-A/B (ABO) não cruza bem a placenta. Por isso se administra imunoglobulina anti-D profilática.",
    tags: ["Rh", "IgG", "DHRN"]
  },
  {
    id: "mad03", discipline: "mad", phase: "N1", topic: "Transplantes / HLA", difficulty: 3,
    vignette: "Receptor de transplante renal apresenta, 8 dias após o enxerto, elevação de creatinina, febre e dor no enxerto. Biópsia mostra infiltrado de linfócitos T e tubulite.",
    question: "Qual o tipo e mecanismo predominante desta rejeição?",
    options: [
      "Rejeição hiperaguda, por anticorpos pré-formados anti-HLA (minutos a horas)",
      "Rejeição aguda celular, mediada por linfócitos T contra aloantígenos HLA do enxerto",
      "Rejeição crônica, por fibrose e arteriosclerose do enxerto ao longo de anos",
      "Doença do enxerto contra hospedeiro, por linfócitos T do doador",
      "Rejeição por deposição de imunocomplexos tipo III"
    ],
    answer: 1,
    explanation: "O quadro em dias a semanas, com infiltrado de linfócitos T e tubulite, é rejeição AGUDA CELULAR (T-mediada) contra o HLA alogênico. Hiperaguda ocorre em minutos-horas por anticorpos PRÉ-formados (protagonista: humoral). Crônica leva meses-anos com fibrose. GVHD ocorre quando o enxerto (ex.: medula) ataca o hospedeiro, não o inverso.",
    tags: ["rejeição", "linfócito T", "HLA"]
  },
  {
    id: "mad04", discipline: "mad", phase: "N1", topic: "Tolerância imunológica", difficulty: 2,
    vignette: "Discussão sobre como o sistema imune evita atacar os próprios tecidos.",
    question: "Qual mecanismo corresponde à tolerância CENTRAL dos linfócitos T?",
    options: [
      "Anergia de células T na periferia por ausência de coestimulação",
      "Seleção negativa no timo, eliminando timócitos com alta afinidade por autoantígenos",
      "Supressão por linfócitos T reguladores (Treg) nos linfonodos",
      "Deleção clonal de linfócitos B na medula óssea",
      "Produção de IgA secretora nas mucosas"
    ],
    answer: 1,
    explanation: "Tolerância CENTRAL de T ocorre no TIMO: timócitos que reconhecem autoantígenos (apresentados via AIRE nas células epiteliais medulares) com alta afinidade sofrem seleção negativa (deleção clonal). Anergia e Treg são mecanismos de tolerância PERIFÉRICA. Deleção de B na medula é tolerância central, mas de linfócitos B, não T.",
    tags: ["timo", "AIRE", "seleção negativa"]
  },
  {
    id: "mad05", discipline: "mad", phase: "N1", topic: "Imunologia dos tumores", difficulty: 3,
    vignette: "Terapia com anticorpo anti-PD-1 (imunoterapia) em paciente com melanoma metastático.",
    question: "Qual o mecanismo pelo qual o bloqueio de PD-1 combate o tumor?",
    options: [
      "Marca diretamente a célula tumoral para fagocitose por neutrófilos",
      "Bloqueia um checkpoint inibitório, restaurando a atividade citotóxica dos linfócitos T contra o tumor",
      "Estimula a produção de anticorpos anti-tumorais pelos linfócitos B",
      "Induz apoptose direta da célula tumoral por dano ao DNA",
      "Impede a angiogênese tumoral ao bloquear o VEGF"
    ],
    answer: 1,
    explanation: "Tumores exploram checkpoints inibitórios: o ligante PD-L1 tumoral liga-se ao PD-1 do linfócito T e o 'desliga' (exaustão). O anti-PD-1 bloqueia essa interação, RETIRANDO o freio e restaurando a citotoxicidade dos T CD8 contra o tumor. Não é ação direta no DNA nem antiangiogênica (isso é o anti-VEGF).",
    tags: ["checkpoint", "PD-1", "imunoterapia"]
  },
  {
    id: "mad06", discipline: "mad", phase: "N1", topic: "Imunodeficiências", difficulty: 2,
    vignette: "Lactente com infecções bacterianas piogênicas de repetição a partir dos 6 meses, com ausência de linfócitos B e imunoglobulinas séricas quase indetectáveis; timo e linfócitos T normais.",
    question: "A hipótese diagnóstica mais provável é:",
    options: [
      "Imunodeficiência combinada grave (SCID)",
      "Agamaglobulinemia de Bruton (ligada ao X)",
      "Deficiência de complemento (C5-C9)",
      "Doença granulomatosa crônica",
      "Síndrome de DiGeorge"
    ],
    answer: 1,
    explanation: "Ausência de linfócitos B + hipogamaglobulinemia com T preservado = agamaglobulinemia de Bruton (mutação na BTK, ligada ao X). Manifesta-se após ~6 meses, quando caem os anticorpos maternos. SCID afeta T e B. DiGeorge afeta T (aplasia tímica). Deficiência de C5-C9 predispõe a Neisseria. DGC dá infecções por catalase-positivos com granulomas.",
    tags: ["Bruton", "BTK", "linfócito B"]
  },
  {
    id: "mad07", discipline: "mad", phase: "N2", topic: "Hipersensibilidade", difficulty: 3,
    vignette: "Paciente recebe penicilina e, em 10 minutos, apresenta urticária, broncoespasmo, edema de glote e hipotensão.",
    question: "Classifique o mecanismo de hipersensibilidade e a molécula-chave:",
    options: [
      "Tipo II (citotóxica) — IgG contra a membrana celular",
      "Tipo I (imediata) — IgE ligada a mastócitos, com liberação de histamina",
      "Tipo III (imunocomplexos) — deposição de complexos e ativação do complemento",
      "Tipo IV (tardia) — linfócitos T e macrófagos",
      "Reação pseudoalérgica sem participação de imunoglobulinas"
    ],
    answer: 1,
    explanation: "Anafilaxia em minutos = hipersensibilidade TIPO I: a penicilina (hapteno) sensibilizou, gerando IgE que se fixou a mastócitos/basófilos; na reexposição há degranulação com liberação de histamina, leucotrienos e triptase → vasodilatação, broncoespasmo, edema. Tipo II é citotóxica (ex.: anemia hemolítica), III é por imunocomplexos (doença do soro), IV é tardia (dermatite de contato, PPD).",
    tags: ["anafilaxia", "IgE", "mastócito"]
  },
  {
    id: "mad08", discipline: "mad", phase: "N2", topic: "Autoimunidade sistêmica", difficulty: 3,
    vignette: "Mulher de 28 anos com artralgia, rash malar fotossensível, úlceras orais, proteinúria e FAN positivo com padrão homogêneo.",
    question: "Qual autoanticorpo é MAIS específico para a doença suspeita (LES) e qual associação clínica ele tem?",
    options: [
      "Anti-Ro (SSA) — associado a bloqueio cardíaco neonatal, específico de LES",
      "Anti-DNA dupla hélice (anti-dsDNA) — específico de LES e associado a nefrite lúpica",
      "Fator reumatoide — específico de LES e de atividade cutânea",
      "Anti-centrômero — específico de LES com acometimento renal",
      "ANCA-c (anti-PR3) — específico de LES e de serosite"
    ],
    answer: 1,
    explanation: "O FAN é sensível, porém inespecífico. Para LES, os anticorpos ESPECÍFICOS são o anti-dsDNA (correlaciona com nefrite lúpica e atividade) e o anti-Sm. Anti-Ro associa-se a lúpus neonatal/bloqueio cardíaco, mas não é específico (aparece em Sjögren). Anti-centrômero → esclerose sistêmica limitada. ANCA → vasculites. FR → artrite reumatoide.",
    tags: ["LES", "anti-dsDNA", "FAN"]
  },
  {
    id: "mad09", discipline: "mad", phase: "N2", topic: "Vasculites", difficulty: 3,
    vignette: "Homem de 55 anos com sinusite crônica, nódulos pulmonares cavitados e glomerulonefrite rapidamente progressiva. ANCA-c (anti-PR3) positivo.",
    question: "O diagnóstico e o mecanismo imunológico são:",
    options: [
      "Poliarterite nodosa; imunocomplexos de HBsAg",
      "Granulomatose com poliangiite (Wegener); vasculite pauci-imune associada a ANCA-PR3",
      "Arterite de Takayasu; vasculite de grandes vasos por linfócitos T",
      "Púrpura de Henoch-Schönlein; deposição de IgA",
      "Doença de Kawasaki; superantígenos"
    ],
    answer: 1,
    explanation: "Tríade via aérea superior (sinusite) + pulmão (nódulos cavitados) + rim (GNRP) com ANCA-c/anti-PR3 = Granulomatose com poliangiite (Wegener), vasculite de pequenos vasos PAUCI-IMUNE (pouco depósito de imunocomplexos). O ANCA ativa neutrófilos que lesam o endotélio. PAN associa-se a HBV e poupa pulmão/rim glomerular; Henoch-Schönlein é por IgA (crianças, púrpura + dor abdominal).",
    tags: ["Wegener", "ANCA", "GPA"]
  },
  {
    id: "mad10", discipline: "mad", phase: "N2", topic: "Imunoensaios", difficulty: 2,
    vignette: "Rastreio de HIV em banco de sangue: prioriza-se NÃO liberar bolsa infectada (mínimo de falsos-negativos).",
    question: "Qual característica do teste é priorizada e por quê?",
    options: [
      "Alta especificidade, para evitar falsos-positivos",
      "Alta sensibilidade, para captar todos os verdadeiros positivos e minimizar falsos-negativos",
      "Alto valor preditivo positivo, independentemente da prevalência",
      "Baixa sensibilidade, para reduzir custos",
      "Alta acurácia analítica sem relação com sensibilidade"
    ],
    answer: 1,
    explanation: "Em RASTREIO/triagem, prioriza-se SENSIBILIDADE: um teste sensível tem poucos falsos-negativos, essencial para não liberar bolsa contaminada. Testes sensíveis com resultado negativo ajudam a excluir (SnNOut). A confirmação posterior usa teste ESPECÍFICO (evita falso-positivo). Trade-off clássico sensibilidade × especificidade.",
    tags: ["sensibilidade", "triagem", "ELISA"]
  },

  /* ---------------- Prática Clínica II ---------------- */
  {
    id: "pat01", discipline: "pratica", phase: "N1", topic: "Patologia do esôfago", difficulty: 3,
    vignette: "Homem de 60 anos, tabagista e etilista, com disfagia progressiva para sólidos e perda ponderal de 8 kg em 3 meses. Endoscopia mostra lesão ulcerovegetante no terço médio do esôfago.",
    question: "O tipo histológico mais provável e seu principal fator de risco são:",
    options: [
      "Adenocarcinoma; associado a esôfago de Barrett e DRGE",
      "Carcinoma epidermoide (escamoso); associado a tabagismo e etilismo",
      "Linfoma MALT; associado a H. pylori",
      "Tumor estromal (GIST); associado a mutação c-KIT",
      "Leiomioma; associado a refluxo crônico"
    ],
    answer: 1,
    explanation: "No terço médio/superior do esôfago e com tabagismo + etilismo, o tipo mais provável é o carcinoma EPIDERMOIDE (escamoso). O ADENOCARCINOMA predomina no terço DISTAL e associa-se a DRGE → esôfago de Barrett (metaplasia intestinal → displasia → adenocarcinoma). Reconhecer a localização e os fatores de risco é a chave do raciocínio.",
    tags: ["esôfago", "escamoso", "Barrett"]
  },
  {
    id: "pat02", discipline: "pratica", phase: "N1", topic: "Patologia gástrica", difficulty: 2,
    vignette: "Biópsia gástrica de paciente com dispepsia mostra gastrite crônica com metaplasia intestinal e presença de bacilos curvos na superfície mucosa.",
    question: "Qual a relação causal e o desdobramento mais temido?",
    options: [
      "H. pylori causa apenas gastrite aguda autolimitada, sem risco neoplásico",
      "H. pylori é fator de risco para adenocarcinoma gástrico e linfoma MALT",
      "A metaplasia intestinal é um achado protetor contra câncer",
      "Os bacilos indicam infecção viral sem tratamento disponível",
      "O achado é normal e não requer conduta"
    ],
    answer: 1,
    explanation: "Os bacilos curvos são H. pylori. A infecção crônica causa gastrite → atrofia → metaplasia intestinal → displasia → adenocarcinoma (cascata de Correa) e também linfoma MALT. A metaplasia intestinal é lesão PRÉ-maligna, não protetora. H. pylori é carcinógeno tipo I (OMS).",
    tags: ["H. pylori", "MALT", "Correa"]
  },
  {
    id: "pat03", discipline: "pratica", phase: "N1", topic: "Doença inflamatória intestinal", difficulty: 3,
    vignette: "Jovem de 24 anos com diarreia crônica e dor abdominal. Colonoscopia: acometimento salteado com áreas normais entre lesões, úlceras profundas e aspecto em 'paralelepípedo'. Biópsia: inflamação transmural com granulomas não caseosos.",
    question: "O diagnóstico e uma complicação característica são:",
    options: [
      "Retocolite ulcerativa; megacólon tóxico como complicação típica",
      "Doença de Crohn; fístulas e estenoses por inflamação transmural",
      "Colite pseudomembranosa; associada a C. difficile",
      "Colite isquêmica; associada a baixo fluxo mesentérico",
      "Diverticulite; por herniação da mucosa"
    ],
    answer: 1,
    explanation: "Acometimento SALTEADO, transmural, granulomas não caseosos e aspecto em paralelepípedo = doença de CROHN → tende a fístulas, estenoses e abscessos (inflamação de toda a parede). A retocolite ulcerativa é CONTÍNUA, ascendente a partir do reto, limitada à mucosa/submucosa, e sua complicação clássica é o megacólon tóxico. Distinguir os dois é questão certa de prova.",
    tags: ["Crohn", "RCU", "transmural"]
  },
  {
    id: "pat04", discipline: "pratica", phase: "N1", topic: "Pâncreas exócrino", difficulty: 2,
    vignette: "Homem etilista com dor abdominal intensa em faixa, irradiada para o dorso, náuseas e amilase/lipase muito elevadas.",
    question: "Além do álcool, a causa mais comum desta condição (pancreatite aguda) é:",
    options: [
      "Hipertrigliceridemia leve",
      "Litíase biliar (cálculo obstruindo a ampola de Vater)",
      "Infecção viral por hepatite A",
      "Uso de anti-inflamatórios",
      "Refluxo gastroesofágico"
    ],
    answer: 1,
    explanation: "As duas principais causas de pancreatite aguda são LITÍASE BILIAR e ÁLCOOL. O cálculo obstrui a ampola de Vater, causando refluxo/ativação intrapancreática de enzimas → autodigestão. Hipertrigliceridemia causa, mas geralmente com níveis muito altos (>1000). Reconhecer 'dor em faixa + enzimas elevadas' e as duas etiologias-mãe é o essencial.",
    tags: ["pancreatite", "litíase", "álcool"]
  },
  {
    id: "pat05", discipline: "pratica", phase: "N2", topic: "Doenças hepáticas", difficulty: 3,
    vignette: "Paciente cirrótico por hepatite C, agora com nódulo hepático de 4 cm, alfafetoproteína elevada e realce arterial com washout na fase portal à TC.",
    question: "O diagnóstico mais provável e o mecanismo de progressão são:",
    options: [
      "Hemangioma; malformação vascular benigna",
      "Carcinoma hepatocelular; cirrose → displasia → CHC, com neovascularização arterial",
      "Metástase de adenocarcinoma de cólon; disseminação porta",
      "Abscesso hepático; infecção bacteriana",
      "Hiperplasia nodular focal; resposta a fluxo arterial anômalo"
    ],
    answer: 1,
    explanation: "Cirrose + nódulo com padrão de realce arterial e washout + AFP elevada = carcinoma HEPATOCELULAR (CHC). A cirrose é o grande fator de risco: regeneração crônica → nódulos displásicos → CHC. O padrão vascular (hipervascularização arterial por neoangiogênese) permite diagnóstico por imagem mesmo sem biópsia (critérios de LI-RADS). Metástases de cólon são hipovasculares.",
    tags: ["CHC", "cirrose", "AFP"]
  },
  {
    id: "pat06", discipline: "pratica", phase: "N2", topic: "Semiologia — síndromes ictéricas", difficulty: 3,
    vignette: "Paciente com icterícia, colúria, acolia fecal e prurido. Bilirrubina direta predominante, fosfatase alcalina e GGT muito elevadas, com transaminases pouco alteradas.",
    question: "O padrão laboratorial indica:",
    options: [
      "Icterícia pré-hepática (hemólise), com bilirrubina indireta predominante",
      "Icterícia colestática/obstrutiva, com bilirrubina direta e enzimas canaliculares elevadas",
      "Hepatite aguda com padrão hepatocelular puro",
      "Síndrome de Gilbert",
      "Icterícia fisiológica do adulto"
    ],
    answer: 1,
    explanation: "Colúria + acolia + prurido + bilirrubina DIRETA + FA/GGT muito altas = padrão COLESTÁTICO/obstrutivo (cálculo, tumor de via biliar/cabeça de pâncreas). Na hemólise predomina bilirrubina INDIRETA, sem colúria (indireta não é hidrossolúvel). No padrão hepatocelular predominam as transaminases (ALT/AST). Correlacionar os marcadores é o raciocínio central.",
    tags: ["colestase", "bilirrubina", "GGT"]
  },
  {
    id: "pat07", discipline: "pratica", phase: "N2", topic: "Patologia da tireoide", difficulty: 2,
    vignette: "Mulher de 40 anos com hipotireoidismo, bócio difuso e anticorpos anti-TPO e anti-tireoglobulina positivos. Histologia: infiltrado linfocitário com centros germinativos e células de Hürthle.",
    question: "O diagnóstico é:",
    options: [
      "Doença de Graves",
      "Tireoidite de Hashimoto",
      "Carcinoma papilífero",
      "Bócio multinodular tóxico",
      "Tireoidite de De Quervain (subaguda)"
    ],
    answer: 1,
    explanation: "Hipotireoidismo + anti-TPO/anti-tireoglobulina + infiltrado linfocitário com centros germinativos e células de Hürthle = tireoidite de HASHIMOTO (autoimune, causa mais comum de hipotireoidismo em áreas com iodo suficiente). Graves cursa com HIPERtireoidismo e anti-TRAB. De Quervain é dolorosa e pós-viral.",
    tags: ["Hashimoto", "anti-TPO", "hipotireoidismo"]
  },
  {
    id: "pat08", discipline: "pratica", phase: "N2", topic: "Patologia das suprarrenais", difficulty: 3,
    vignette: "Paciente com hipertensão, fraqueza muscular, hipocalemia e alcalose metabólica. Aldosterona elevada e renina suprimida.",
    question: "A principal hipótese e o mecanismo são:",
    options: [
      "Feocromocitoma; excesso de catecolaminas",
      "Hiperaldosteronismo primário (Conn); adenoma produtor de aldosterona com renina baixa",
      "Doença de Addison; insuficiência adrenal",
      "Síndrome de Cushing; excesso de cortisol",
      "Hiperplasia adrenal congênita por deficiência de 21-hidroxilase"
    ],
    answer: 1,
    explanation: "HAS + hipocalemia + alcalose + aldosterona ALTA com renina BAIXA (relação aldo/renina elevada) = hiperaldosteronismo PRIMÁRIO (síndrome de Conn, geralmente adenoma). O excesso de aldosterona retém Na/água (HAS) e espolia K+/H+ (hipocalemia, alcalose). Addison é o oposto (hipotensão, hipercalemia). Feocromocitoma dá HAS paroxística com catecolaminas.",
    tags: ["Conn", "aldosterona", "hipocalemia"]
  },
  {
    id: "pat09", discipline: "pratica", phase: "N2", topic: "Pâncreas endócrino", difficulty: 2,
    vignette: "Discussão da fisiopatologia do diabetes mellitus tipo 1 versus tipo 2.",
    question: "Qual afirmação está CORRETA sobre a patologia do DM tipo 1?",
    options: [
      "Resistência periférica à insulina com hiperinsulinemia inicial",
      "Destruição autoimune das células beta das ilhotas, com insulinopenia absoluta",
      "Deposição de amiloide nas ilhotas como evento primário",
      "Excesso de glucagon como causa única",
      "Sempre associado a obesidade e síndrome metabólica"
    ],
    answer: 1,
    explanation: "DM1 = destruição AUTOIMUNE das células beta (insulite, autoanticorpos anti-GAD, anti-ilhota) → deficiência ABSOLUTA de insulina, tendência à cetoacidose. DM2 = resistência à insulina + disfunção beta progressiva, com depósito de amiloide (amilina) nas ilhotas e associação à obesidade. Diferenciar os mecanismos é essencial.",
    tags: ["DM1", "autoimune", "ilhotas"]
  },

  /* ---------------- Terapêutica I — Farmacocinética ---------------- */
  {
    id: "ter01", discipline: "terap", phase: "N1", topic: "Farmacocinética — meia-vida", difficulty: 3,
    vignette: "Um fármaco tem meia-vida de eliminação de 8 horas e é administrado em dose fixa a intervalos regulares.",
    question: "Após quanto tempo, aproximadamente, atinge-se o estado de equilíbrio (steady state)?",
    options: [
      "Após 1 meia-vida (8 h)",
      "Após 4 a 5 meias-vidas (~32 a 40 h)",
      "Após 10 meias-vidas (80 h)",
      "Imediatamente, se a via for endovenosa",
      "O steady state independe da meia-vida"
    ],
    answer: 1,
    explanation: "O estado de equilíbrio é atingido em ~4 a 5 meias-vidas (independe da dose e do intervalo). Com t½ de 8 h → ~32–40 h. A mesma regra vale para a eliminação quase completa do fármaco após suspensão. Para efeito rápido antes disso, usa-se dose de ATAQUE. Conceito quantitativo clássico de Terapêutica.",
    tags: ["meia-vida", "steady state", "cinética"]
  },
  {
    id: "ter02", discipline: "terap", phase: "N1", topic: "Clearance e dose", difficulty: 3,
    vignette: "Deseja-se manter a concentração plasmática de manutenção de um fármaco constante em infusão contínua.",
    question: "Qual relação define corretamente a taxa de infusão de manutenção?",
    options: [
      "Taxa = Volume de distribuição × Concentração-alvo",
      "Taxa de manutenção = Clearance × Concentração-alvo (no estado de equilíbrio)",
      "Taxa = Concentração-alvo ÷ meia-vida",
      "Taxa = Dose de ataque × biodisponibilidade",
      "Taxa = Clearance ÷ Volume de distribuição"
    ],
    answer: 1,
    explanation: "No steady state, a taxa de administração iguala a taxa de eliminação: Taxa de manutenção = Clearance (Cl) × Concentração-alvo (Css). Já a DOSE DE ATAQUE = Vd × Css (preenche o volume de distribuição). Não confundir os dois: ataque depende do Vd; manutenção depende do clearance.",
    tags: ["clearance", "dose de manutenção", "Vd"]
  },
  {
    id: "ter03", discipline: "terap", phase: "N1", topic: "Biodisponibilidade / vias", difficulty: 2,
    vignette: "Um mesmo fármaco tem biodisponibilidade oral de 25% e endovenosa de 100%, devido a intenso metabolismo hepático na primeira passagem.",
    question: "Para obter, por via oral, a mesma exposição de uma dose EV de 50 mg, a dose oral deveria ser aproximadamente:",
    options: [
      "12,5 mg",
      "200 mg",
      "50 mg",
      "25 mg",
      "100 mg"
    ],
    answer: 1,
    explanation: "Dose oral = Dose EV ÷ F = 50 ÷ 0,25 = 200 mg. A biodisponibilidade (F) reflete a fração que chega à circulação sistêmica; efeito de primeira passagem hepático reduz F. Via EV tem F=100% (não sofre primeira passagem). Cálculo direto e clássico de prova.",
    tags: ["biodisponibilidade", "primeira passagem", "dose"]
  },
  {
    id: "ter04", discipline: "terap", phase: "N1", topic: "Cinética de ordem zero vs primeira", difficulty: 3,
    vignette: "O etanol e, em doses altas, a fenitoína e a aspirina, saturam suas enzimas metabolizadoras.",
    question: "Qual é a consequência cinética da saturação enzimática?",
    options: [
      "A eliminação passa a ser de primeira ordem, proporcional à concentração",
      "A eliminação torna-se de ordem ZERO: quantidade fixa eliminada por tempo, risco de acúmulo desproporcional",
      "A meia-vida permanece constante independentemente da dose",
      "O clearance aumenta proporcionalmente à dose",
      "A biodisponibilidade cai a zero"
    ],
    answer: 1,
    explanation: "Quando as enzimas saturam, a eliminação vira de ORDEM ZERO: elimina-se uma QUANTIDADE FIXA por unidade de tempo (não uma fração). Pequenos aumentos de dose causam elevações desproporcionais da concentração — daí a toxicidade da fenitoína e do etanol. Na cinética de primeira ordem (a maioria dos fármacos), elimina-se uma fração constante e a meia-vida é estável.",
    tags: ["ordem zero", "saturação", "fenitoína"]
  },
  {
    id: "ter05", discipline: "terap", phase: "N2", topic: "Metabolismo — indução/inibição", difficulty: 3,
    vignette: "Paciente em uso crônico de varfarina inicia claritromicina (inibidor do CYP3A4) para uma pneumonia.",
    question: "O efeito esperado sobre a varfarina e a conduta são:",
    options: [
      "Redução do efeito anticoagulante; aumentar a dose de varfarina",
      "Aumento do efeito anticoagulante e risco de sangramento; monitorar INR e ajustar dose",
      "Nenhuma interação, pois atuam em enzimas diferentes",
      "A claritromicina induz o CYP e reduz os níveis de varfarina",
      "A varfarina inibe o metabolismo da claritromicina, sem risco ao paciente"
    ],
    answer: 1,
    explanation: "A claritromicina INIBE o CYP → reduz o metabolismo da varfarina → aumenta seus níveis e o efeito anticoagulante → risco de sangramento (INR elevado). Conduta: monitorar INR e reduzir dose se necessário. INDUTORES (rifampicina, carbamazepina) fariam o oposto: acelerariam o metabolismo e reduziriam o efeito. Interação medicamentosa clássica de prova.",
    tags: ["CYP450", "interação", "varfarina"]
  },
  {
    id: "ter06", discipline: "terap", phase: "N2", topic: "Excreção renal", difficulty: 2,
    vignette: "Intoxicação por ácido fraco (ex.: salicilato). Deseja-se acelerar sua eliminação renal.",
    question: "Qual medida favorece a excreção e por qual princípio?",
    options: [
      "Acidificar a urina, pois isso ioniza o ácido",
      "Alcalinizar a urina, pois o ácido fica ionizado e não é reabsorvido (aprisionamento iônico)",
      "Reduzir a diurese para concentrar o fármaco",
      "Administrar outro ácido para competir pela reabsorção",
      "Nenhuma medida altera a excreção renal"
    ],
    answer: 1,
    explanation: "Aprisionamento iônico: um ÁCIDO fraco fica IONIZADO em meio alcalino; a forma ionizada não atravessa membranas e não é reabsorvida no túbulo → excretada. Logo, ALCALINIZAR a urina (bicarbonato) acelera a eliminação de salicilatos. Para bases fracas, o inverso (acidificar). Aplicação direta da relação pH/pKa (Henderson-Hasselbalch).",
    tags: ["aprisionamento iônico", "pKa", "excreção"]
  },

  /* ---------------- RCI V — Raciocínio Clínico Integrado ---------------- */
  {
    id: "rci01", discipline: "rci", phase: "N1", topic: "Abdome agudo vascular", difficulty: 3,
    vignette: "Mulher de 59 anos, HAS, DM e tabagista, com dor abdominal intensa há 3 dias, desproporcional ao exame físico (abdome pouco doloroso à palpação apesar da dor referida como forte), acidose láctica e fibrilação atrial.",
    question: "A principal hipótese e a base fisiopatológica são:",
    options: [
      "Diverticulite aguda; inflamação por herniação da mucosa",
      "Isquemia mesentérica aguda; embolia/trombose com dor desproporcional ao exame e acidose láctica",
      "Pancreatite aguda; autodigestão enzimática",
      "Úlcera péptica perfurada; abdome em tábua",
      "Colecistite aguda; obstrução do ducto cístico"
    ],
    answer: 1,
    explanation: "Fatores de risco vasculares + fibrilação atrial (fonte embólica) + DOR DESPROPORCIONAL ao exame + acidose láctica = isquemia mesentérica aguda. A dor intensa com abdome inicialmente pouco alterado é o sinal semiológico clássico; a acidose láctica reflete o sofrimento tecidual. É emergência cirúrgica. Este é o raciocínio do 'Caso 3' (infarto intestinal).",
    tags: ["isquemia mesentérica", "FA", "lactato"]
  },
  {
    id: "rci02", discipline: "rci", phase: "N2", topic: "Hepatite medicamentosa", difficulty: 3,
    vignette: "Paciente inicia uso de fármaco hepatotóxico e, semanas depois, desenvolve icterícia, elevação de ALT/AST 15x e INR alargado, sem sinais de obstrução biliar à imagem.",
    question: "O padrão de lesão e o marcador que indica gravidade são, respectivamente:",
    options: [
      "Colestático; fosfatase alcalina como marcador de gravidade",
      "Hepatocelular; INR/tempo de protrombina como marcador de disfunção de síntese e gravidade",
      "Misto; amilase como marcador prognóstico",
      "Vascular; D-dímero como marcador",
      "Infiltrativo; LDH isoladamente"
    ],
    answer: 1,
    explanation: "Elevação acentuada de transaminases (ALT/AST) = padrão HEPATOCELULAR. A gravidade da lesão hepática se mede pela função de SÍNTESE: INR/tempo de protrombina alargado (e bilirrubina) indicam falência — base dos critérios de Hy's law (hepatocelular + icterícia = pior prognóstico). A FA marca colestase, não gravidade hepatocelular.",
    tags: ["DILI", "hepatocelular", "INR"]
  },
  {
    id: "rci03", discipline: "rci", phase: "N1", topic: "Úlcera péptica", difficulty: 2,
    vignette: "Paciente com epigastralgia que MELHORA com alimentação e uso frequente de AINE. Endoscopia confirma úlcera.",
    question: "A localização provável da úlcera e o mecanismo predominante são:",
    options: [
      "Úlcera gástrica; a dor piora com alimento e associa-se a AINE/H. pylori",
      "Úlcera duodenal; dor que melhora com alimento, relacionada a hipersecreção ácida e H. pylori",
      "Úlcera esofágica; por refluxo alcalino",
      "Úlcera de estresse; exclusiva de UTI",
      "Úlcera maligna; sempre indolor"
    ],
    answer: 1,
    explanation: "Dor que MELHORA com alimentação sugere úlcera DUODENAL (o alimento tampona o ácido; a dor retorna 2–3 h depois e à noite). A úlcera GÁSTRICA tende a PIORAR com alimento e tem maior preocupação com malignidade. AINEs e H. pylori são os grandes fatores etiológicos de ambas. Correlacionar sintoma-tempo-localização é o objetivo do caso.",
    tags: ["úlcera duodenal", "H. pylori", "AINE"]
  },

  /* ---------------- Medicina Legal ---------------- */
  {
    id: "leg01", discipline: "legal", phase: "N1", topic: "Traumatologia forense", difficulty: 2,
    vignette: "Perícia descreve lesão de bordas nítidas e regulares, sem vestígios (sem pontes de tecido) no fundo, mais comprida que profunda, produzida por instrumento de gume.",
    question: "Trata-se de ferida:",
    options: [
      "Contusa",
      "Incisa (cortante)",
      "Perfuroincisa",
      "Perfurocontusa",
      "Lacerocontusa"
    ],
    answer: 1,
    explanation: "Bordas NÍTIDAS e regulares, SEM pontes de tecido, comprimento > profundidade = ferida INCISA (instrumento cortante/gume). A ferida CONTUSA tem bordas irregulares e pontes de tecido (instrumento contundente). PERFUROINCISA é feita por instrumento com ponta E gume (faca cravada), mais profunda que longa. Reconhecer o padrão da lesão pelo instrumento é o cerne da traumatologia forense.",
    tags: ["ferida incisa", "instrumento cortante"]
  },
  {
    id: "leg02", discipline: "legal", phase: "N1", topic: "Lesões perfurocontusas", difficulty: 3,
    vignette: "Perícia de ferimento por projétil de arma de fogo à queima-roupa descreve orla de tatuagem, zona de esfumaçamento e orifício de entrada.",
    question: "Sobre o orifício de ENTRADA por projétil de arma de fogo, é correto afirmar:",
    options: [
      "É maior que o de saída e tem bordas evertidas",
      "Geralmente é menor, arredondado, com orla de escoriação (contusão) e, se a curta distância, sinais de fumaça/tatuagem",
      "Nunca apresenta orla de escoriação",
      "É sempre estrelado, independentemente da distância",
      "A tatuagem indica tiro a longa distância"
    ],
    answer: 1,
    explanation: "O orifício de ENTRADA costuma ser menor, arredondado, com orla de escoriação (Chavigny) e, em tiros próximos, zona de tatuagem (grãos de pólvora incrustados) e esfumaçamento. O de SAÍDA é maior, irregular, de bordas evertidas e sem orla. Tiro encostado pode dar aspecto estrelado (câmara de mina). Tatuagem = curta distância.",
    tags: ["PAF", "orifício de entrada", "tatuagem"]
  },
  {
    id: "leg03", discipline: "legal", phase: "N2", topic: "Ética / documentos", difficulty: 2,
    vignette: "Discussão sobre documentos médico-legais e sigilo.",
    question: "Sobre o atestado de óbito e o sigilo, assinale a correta:",
    options: [
      "O médico pode quebrar o sigilo livremente para qualquer autoridade",
      "A notificação compulsória de doenças é uma exceção legal ao sigilo médico (justa causa)",
      "O sigilo médico é absoluto e não admite exceções",
      "Atestado de óbito pode ser assinado por qualquer profissional de saúde",
      "O prontuário pertence exclusivamente ao médico"
    ],
    answer: 1,
    explanation: "O sigilo médico é a regra, mas admite exceções por JUSTA CAUSA, DEVER LEGAL ou autorização — a notificação compulsória de doenças é o exemplo clássico de dever legal que autoriza a comunicação. O sigilo não é absoluto. O atestado de óbito é ato médico. O prontuário pertence ao PACIENTE (guarda pela instituição/médico).",
    tags: ["sigilo", "notificação", "ética"]
  },

  /* ---------------- Introdução à Prática Cirúrgica ---------------- */
  {
    id: "cir01", discipline: "cirurgia", phase: "N1", topic: "Antissepsia e assepsia", difficulty: 2,
    vignette: "Preparo para procedimento cirúrgico.",
    question: "Qual a diferença conceitual correta entre ASSEPSIA e ANTISSEPSIA?",
    options: [
      "São sinônimos",
      "Assepsia é o conjunto de medidas para impedir a chegada de microrganismos; antissepsia é a eliminação/redução de microrganismos em tecidos vivos",
      "Antissepsia aplica-se a superfícies inanimadas e assepsia à pele do paciente",
      "Esterilização e antissepsia são o mesmo processo",
      "Assepsia usa antibióticos sistêmicos"
    ],
    answer: 1,
    explanation: "ASSEPSIA = conjunto de medidas para IMPEDIR a contaminação (manter estéril o que já está). ANTISSEPSIA = uso de antissépticos para ELIMINAR/reduzir microrganismos em TECIDOS VIVOS (pele, mucosa). Desinfecção é para superfícies INANIMADAS; esterilização elimina TODAS as formas, inclusive esporos. Distinção conceitual básica e muito cobrada.",
    tags: ["assepsia", "antissepsia", "esterilização"]
  },
  {
    id: "cir02", discipline: "cirurgia", phase: "N1", topic: "Tempos cirúrgicos", difficulty: 2,
    vignette: "Sequência fundamental de um ato operatório.",
    question: "Qual a ordem correta dos quatro tempos cirúrgicos fundamentais?",
    options: [
      "Hemostasia → diérese → síntese → exérese",
      "Diérese → hemostasia → exérese (cirurgia propriamente dita) → síntese",
      "Síntese → diérese → hemostasia → exérese",
      "Exérese → síntese → diérese → hemostasia",
      "Diérese → síntese → hemostasia → exérese"
    ],
    answer: 1,
    explanation: "Tempos fundamentais: DIÉRESE (divisão dos tecidos/incisão) → HEMOSTASIA (controle do sangramento) → cirurgia propriamente dita/EXÉRESE → SÍNTESE (reconstituição/sutura). Decorar essa sequência é ponto certo e base para as demais aulas.",
    tags: ["diérese", "hemostasia", "síntese"]
  },
  {
    id: "cir03", discipline: "cirurgia", phase: "N2", topic: "Fios e suturas", difficulty: 3,
    vignette: "Escolha do fio de sutura para diferentes situações.",
    question: "Sobre fios cirúrgicos, assinale a correta:",
    options: [
      "Fios absorvíveis (ex.: catgut, Vicryl/poliglactina) são preferidos para pele externa, que exige permanência",
      "Fios absorvíveis são usados em planos profundos/mucosas; inabsorvíveis (nylon, prolene) na pele e onde se exige força prolongada",
      "Fios multifilamentares têm menor risco de infecção que os monofilamentares",
      "Categute é um fio sintético inabsorvível",
      "Todo fio de seda é absorvível e ideal para vasos"
    ],
    answer: 1,
    explanation: "ABSORVÍVEIS (catgut, poliglactina/Vicryl, PDS) são usados em planos profundos e mucosas, onde não se quer retirar ponto. INABSORVÍVEIS (nylon, polipropileno/prolene, seda) ficam na PELE e onde se exige resistência prolongada. MONOfilamentares têm MENOR risco de infecção que os multifilamentares (que retêm bactérias no trançado). Categute é absorvível de origem orgânica.",
    tags: ["fios", "absorvível", "monofilamentar"]
  },
  {
    id: "cir04", discipline: "cirurgia", phase: "N1", topic: "Cicatrização", difficulty: 3,
    vignette: "Estudo das fases da cicatrização de feridas.",
    question: "Qual a ordem correta das fases da cicatrização e um evento-chave de cada?",
    options: [
      "Proliferativa (coágulo) → inflamatória (colágeno) → remodelação (angiogênese)",
      "Inflamatória (hemostasia e limpeza) → proliferativa (fibroblastos, angiogênese, tecido de granulação) → remodelação (maturação do colágeno)",
      "Remodelação → proliferativa → inflamatória",
      "Proliferativa → remodelação → inflamatória",
      "Inflamatória → remodelação → proliferativa"
    ],
    answer: 1,
    explanation: "Ordem: 1) INFLAMATÓRIA (hemostasia, neutrófilos/macrófagos limpam a ferida); 2) PROLIFERATIVA (fibroblastos depositam colágeno tipo III, angiogênese, tecido de granulação, epitelização); 3) REMODELAÇÃO/maturação (colágeno III → I, ganho de força tênsil ao longo de meses). Cicatrização por 1ª intenção (bordas aproximadas) vs 2ª intenção (granulação) é desdobramento comum de prova.",
    tags: ["cicatrização", "colágeno", "fases"]
  },

  /* ---------------- PIG V — Gestão em Saúde ---------------- */
  {
    id: "pig01", discipline: "pig", phase: "N1", topic: "SUS e regulação", difficulty: 1,
    vignette: "Organização do sistema de saúde brasileiro.",
    question: "Qual órgão regula o setor de saúde SUPLEMENTAR (planos e seguros de saúde)?",
    options: [
      "ANVISA",
      "ANS — Agência Nacional de Saúde Suplementar",
      "Ministério da Previdência",
      "CEREST",
      "SINAN"
    ],
    answer: 1,
    explanation: "A ANS (Agência Nacional de Saúde Suplementar) regula os planos e seguros privados de saúde. A ANVISA regula produtos/serviços sob vigilância sanitária. Não confundir: saúde SUPLEMENTAR = privada/planos; SUS = público. Conceito básico de gestão.",
    tags: ["ANS", "saúde suplementar", "SUS"]
  },
  {
    id: "pig02", discipline: "pig", phase: "N1", topic: "Linha de cuidado", difficulty: 2,
    vignette: "Conceito de organização do cuidado.",
    question: "O que define uma 'linha de cuidado' no SUS?",
    options: [
      "Um protocolo rígido e idêntico para todos os pacientes",
      "Um itinerário organizado que o paciente percorre na rede para garantir continuidade e integralidade do cuidado",
      "A fila de espera para consultas especializadas",
      "O organograma administrativo da secretaria de saúde",
      "Um documento contábil de financiamento"
    ],
    answer: 1,
    explanation: "Linha de cuidado é o itinerário ORGANIZADO (trajetória ideal) que o paciente percorre na rede de atenção, garantindo CONTINUIDADE e INTEGRALIDADE — não é percurso rígido nem igual para todos, mas uma organização do cuidado voltada a melhorar desfechos.",
    tags: ["linha de cuidado", "integralidade", "rede"]
  },

  /* ---------------- APS V — Saúde Ocupacional ---------------- */
  {
    id: "aps01", discipline: "aps", phase: "N2", topic: "Documentos ocupacionais", difficulty: 1,
    vignette: "Trabalhador sofre acidente durante a jornada de trabalho.",
    question: "Qual documento formaliza o acidente de trabalho e garante direitos previdenciários?",
    options: [
      "Atestado médico simples",
      "CAT — Comunicação de Acidente de Trabalho",
      "SINAN isoladamente",
      "Receita médica",
      "Termo de consentimento"
    ],
    answer: 1,
    explanation: "A CAT (Comunicação de Acidente de Trabalho) formaliza o acidente/doença ocupacional e garante direitos (benefício do INSS, estabilidade, FGTS em certas situações). Deve ser emitida até o 1º dia útil após o acidente (imediatamente em caso de óbito) e MESMO que não haja afastamento. O SINAN é o sistema de notificação de agravos.",
    tags: ["CAT", "acidente de trabalho", "INSS"]
  },
  {
    id: "aps02", discipline: "aps", phase: "N2", topic: "Nexo causal", difficulty: 2,
    vignette: "Paciente com sintomas que pioram no trabalho e melhoram em férias/repouso.",
    question: "Na abordagem em Saúde do Trabalhador, o que caracteriza o 'nexo causal'?",
    options: [
      "A gravidade da doença independentemente do trabalho",
      "A relação estabelecida entre a doença/agravo e a exposição/atividade laboral",
      "O tempo de empresa do trabalhador",
      "O valor do benefício do INSS",
      "A presença de EPI no local"
    ],
    answer: 1,
    explanation: "Nexo causal é a RELAÇÃO entre a doença/agravo e o trabalho — estabelecê-lo é etapa central da conduta em Saúde do Trabalhador (junto com anamnese ocupacional, avaliação da capacidade laboral, emissão de CAT e notificação no SINAN). A melhora em repouso/férias e a anamnese ocupacional ajudam a firmá-lo.",
    tags: ["nexo causal", "saúde do trabalhador", "anamnese ocupacional"]
  },
];

/* ============================ FLASHCARDS ============================ */
const FLASHCARDS = [
  /* MAD II */
  { id: "f-mad01", discipline: "mad", phase: "N1", front: "Critérios de choque séptico (definição prática)", back: "Sepse + necessidade de vasopressor para PAM ≥ 65 mmHg + lactato > 2 mmol/L apesar de ressuscitação volêmica adequada." },
  { id: "f-mad02", discipline: "mad", phase: "N1", front: "Principais citocinas pró-inflamatórias da sepse", back: "TNF-α, IL-1 e IL-6. Induzem febre, vasodilatação (via NO), aumento de permeabilidade capilar e ativação da coagulação." },
  { id: "f-mad03", discipline: "mad", phase: "N1", front: "Por que IgG causa doença hemolítica do RN e IgM não?", back: "IgG atravessa a placenta (transporte ativo via receptor FcRn); IgM não. Por isso a sensibilização Rh (resposta secundária IgG) afeta a próxima gestação." },
  { id: "f-mad04", discipline: "mad", phase: "N1", front: "Tolerância central vs periférica (linfócito T)", back: "Central: seleção negativa no TIMO (AIRE). Periférica: anergia (falta de coestímulo), supressão por Treg e deleção clonal." },
  { id: "f-mad05", discipline: "mad", phase: "N1", front: "O que são células espumosas (foam cells)?", back: "Macrófagos que fagocitaram LDL oxidado na íntima vascular — evento inicial da placa aterosclerótica." },
  { id: "f-mad06", discipline: "mad", phase: "N1", front: "Rejeição hiperaguda vs aguda vs crônica", back: "Hiperaguda: min-horas, anticorpos pré-formados. Aguda: dias-semanas, celular (T) ou humoral. Crônica: meses-anos, fibrose e arteriosclerose." },
  { id: "f-mad07", discipline: "mad", phase: "N1", front: "Função do HLA classe I vs classe II", back: "Classe I (A,B,C): apresenta antígenos endógenos a CD8. Classe II (DR,DQ,DP): apresenta antígenos exógenos a CD4." },
  { id: "f-mad08", discipline: "mad", phase: "N1", front: "Agamaglobulinemia de Bruton", back: "Mutação na BTK (ligada ao X). Ausência de linfócitos B e de imunoglobulinas; T normal. Infecções piogênicas após 6 meses." },
  { id: "f-mad09", discipline: "mad", phase: "N2", front: "Os 4 tipos de hipersensibilidade (Gell e Coombs)", back: "I: IgE/mastócito (imediata, anafilaxia). II: citotóxica IgG/IgM. III: imunocomplexos. IV: tardia, mediada por células T." },
  { id: "f-mad10", discipline: "mad", phase: "N2", front: "Mediadores da degranulação do mastócito", back: "Pré-formados: histamina, triptase, heparina. Neoformados: leucotrienos, prostaglandinas, PAF. Causam vasodilatação e broncoespasmo." },
  { id: "f-mad11", discipline: "mad", phase: "N2", front: "Autoanticorpos: LES vs AR vs esclerose sistêmica", back: "LES: anti-dsDNA e anti-Sm (específicos). AR: anti-CCP e FR. Esclerose sistêmica: anti-centrômero (limitada) e anti-Scl70 (difusa)." },
  { id: "f-mad12", discipline: "mad", phase: "N2", front: "Vasculites associadas a ANCA", back: "ANCA-c/PR3: Granulomatose com poliangiite (Wegener). ANCA-p/MPO: poliangiite microscópica e Churg-Strauss (EGPA)." },
  { id: "f-mad13", discipline: "mad", phase: "N2", front: "Sensibilidade vs especificidade (uso clínico)", back: "Sensível → bom para RASTREIO (SnNout: negativo exclui). Específico → bom para CONFIRMAR (SpPin: positivo confirma)." },
  { id: "f-mad14", discipline: "mad", phase: "N2", front: "Exaustão de linfócitos T e checkpoints", back: "T exaustos expressam PD-1, CTLA-4. Tumores usam PD-L1 para 'desligar' T. Imunoterapia (anti-PD1/anti-CTLA4) retira o freio." },

  /* Prática Clínica */
  { id: "f-pat01", discipline: "pratica", phase: "N1", front: "Cascata de Correa (câncer gástrico)", back: "Gastrite crônica (H. pylori) → atrofia → metaplasia intestinal → displasia → adenocarcinoma." },
  { id: "f-pat02", discipline: "pratica", phase: "N1", front: "Carcinoma de esôfago: escamoso vs adenocarcinoma", back: "Escamoso: terço médio/superior, tabaco+álcool. Adenocarcinoma: terço distal, DRGE → Barrett (metaplasia intestinal)." },
  { id: "f-pat03", discipline: "pratica", phase: "N1", front: "Crohn vs Retocolite ulcerativa", back: "Crohn: salteado, transmural, granulomas, boca-ânus, fístulas. RCU: contínuo, mucosa, reto→cólon, megacólon tóxico, ↑risco de CA colorretal." },
  { id: "f-pat04", discipline: "pratica", phase: "N1", front: "Causas principais de pancreatite aguda", back: "Litíase biliar e álcool (as duas maiores). Outras: hipertrigliceridemia, hipercalcemia, CPRE, fármacos, trauma." },
  { id: "f-pat05", discipline: "pratica", phase: "N2", front: "Fatores de risco para carcinoma hepatocelular", back: "Cirrose (qualquer causa), hepatite B e C, esteato-hepatite (NASH), aflatoxina, álcool. Marcador: alfafetoproteína." },
  { id: "f-pat06", discipline: "pratica", phase: "N2", front: "Padrões de icterícia (laboratorial)", back: "Pré-hepática: BI ↑ (hemólise). Hepatocelular: ALT/AST ↑↑. Colestática/obstrutiva: BD ↑, FA e GGT ↑↑, colúria + acolia." },
  { id: "f-pat07", discipline: "pratica", phase: "N2", front: "Hashimoto vs Graves", back: "Hashimoto: hipotireoidismo, anti-TPO/anti-Tg, infiltrado linfocitário/células de Hürthle. Graves: hipertireoidismo, anti-TRAB, exoftalmia." },
  { id: "f-pat08", discipline: "pratica", phase: "N2", front: "Síndrome de Conn (hiperaldosteronismo primário)", back: "HAS + hipocalemia + alcalose metabólica. Aldosterona ↑ e renina ↓ (relação aldo/renina elevada). Causa: adenoma ou hiperplasia adrenal." },
  { id: "f-pat09", discipline: "pratica", phase: "N2", front: "DM1 vs DM2 (patologia)", back: "DM1: destruição autoimune das células beta, insulinopenia absoluta, cetoacidose. DM2: resistência insulínica + disfunção beta, amiloide nas ilhotas." },

  /* Terapêutica */
  { id: "f-ter01", discipline: "terap", phase: "N1", front: "Quantas meias-vidas até o steady state?", back: "~4 a 5 meias-vidas (independe da dose e do intervalo). Mesma regra para eliminação após suspensão." },
  { id: "f-ter02", discipline: "terap", phase: "N1", front: "Dose de ataque vs dose de manutenção", back: "Ataque = Vd × Css (preenche o volume). Manutenção = Clearance × Css (repõe o que é eliminado)." },
  { id: "f-ter03", discipline: "terap", phase: "N1", front: "Biodisponibilidade (F) e efeito de primeira passagem", back: "F = fração que chega à circulação sistêmica. EV: F=100%. Oral sofre 1ª passagem hepática/intestinal → F menor. Dose oral = dose EV ÷ F." },
  { id: "f-ter04", discipline: "terap", phase: "N1", front: "Cinética de primeira ordem vs ordem zero", back: "1ª ordem: elimina FRAÇÃO constante, t½ estável (maioria). Ordem zero: elimina QUANTIDADE fixa/tempo (saturação: etanol, fenitoína, AAS)." },
  { id: "f-ter05", discipline: "terap", phase: "N1", front: "Volume de distribuição (Vd) — conceito", back: "Volume aparente que relaciona dose e concentração plasmática. Vd alto = fármaco vai muito para tecidos (lipofílico). Vd = Dose / C plasmática." },
  { id: "f-ter06", discipline: "terap", phase: "N2", front: "Indutores vs inibidores do CYP450", back: "Indutores (rifampicina, carbamazepina, fenitoína): ↑metabolismo, ↓efeito. Inibidores (claritromicina, cetoconazol, suco de toranja): ↓metabolismo, ↑efeito/toxicidade." },
  { id: "f-ter07", discipline: "terap", phase: "N2", front: "Aprisionamento iônico na excreção renal", back: "Ácido fraco ioniza em urina ALCALINA → não reabsorve → excreta (ex.: alcalinizar p/ salicilato). Base fraca: acidificar a urina." },
  { id: "f-ter08", discipline: "terap", phase: "N2", front: "Fases do metabolismo de fármacos", back: "Fase I (CYP450): oxidação/redução/hidrólise (funcionaliza). Fase II: conjugação (glicuronidação, sulfatação) → mais hidrossolúvel para excreção." },

  /* RCI */
  { id: "f-rci01", discipline: "rci", phase: "N1", front: "Sinal semiológico da isquemia mesentérica aguda", back: "Dor DESPROPORCIONAL ao exame físico + acidose láctica + fonte embólica (FA). Emergência cirúrgica." },
  { id: "f-rci02", discipline: "rci", phase: "N1", front: "Úlcera duodenal vs gástrica (dor)", back: "Duodenal: dor MELHORA com alimento (volta 2-3h depois, noturna). Gástrica: PIORA com alimento, maior preocupação com malignidade." },
  { id: "f-rci02b", discipline: "rci", phase: "N2", front: "Lei de Hy (Hy's law) — hepatotoxicidade", back: "Lesão hepatocelular (ALT/AST ↑↑) + icterícia (BT ↑) sem colestase = alto risco de falência hepática. INR alargado marca gravidade." },

  /* Medicina Legal */
  { id: "f-leg01", discipline: "legal", phase: "N1", front: "Feridas por instrumentos (traumatologia forense)", back: "Incisa: gume, bordas nítidas, sem pontes. Contusa: contundente, bordas irregulares, pontes de tecido. Perfuroincisa: ponta+gume. Cortocontusa: gume+peso." },
  { id: "f-leg02", discipline: "legal", phase: "N1", front: "Orifício de entrada vs saída (PAF)", back: "Entrada: menor, arredondado, orla de escoriação; a curta distância há tatuagem/esfumaçamento. Saída: maior, irregular, bordas evertidas, sem orla." },
  { id: "f-leg03", discipline: "legal", phase: "N2", front: "Exceções ao sigilo médico", back: "Justa causa, dever legal (ex.: notificação compulsória) e autorização do paciente. O sigilo NÃO é absoluto. Prontuário pertence ao paciente." },

  /* Cirurgia */
  { id: "f-cir01", discipline: "cirurgia", phase: "N1", front: "Assepsia vs antissepsia vs desinfecção vs esterilização", back: "Assepsia: impedir contaminação. Antissepsia: reduzir micróbios em TECIDO VIVO. Desinfecção: superfície inanimada. Esterilização: elimina TUDO, inclusive esporos." },
  { id: "f-cir02", discipline: "cirurgia", phase: "N1", front: "Os 4 tempos cirúrgicos fundamentais", back: "1) Diérese (incisão) → 2) Hemostasia → 3) Exérese/cirurgia propriamente dita → 4) Síntese (sutura)." },
  { id: "f-cir03", discipline: "cirurgia", phase: "N1", front: "Fases da cicatrização", back: "1) Inflamatória (hemostasia, limpeza). 2) Proliferativa (fibroblastos, colágeno III, granulação, angiogênese). 3) Remodelação (colágeno III→I, força tênsil)." },
  { id: "f-cir04", discipline: "cirurgia", phase: "N2", front: "Fios absorvíveis vs inabsorvíveis", back: "Absorvíveis (catgut, Vicryl/poliglactina, PDS): planos profundos, mucosa. Inabsorvíveis (nylon, prolene, seda): pele, força prolongada." },
  { id: "f-cir05", discipline: "cirurgia", phase: "N2", front: "Mono vs multifilamentar", back: "Monofilamentar (nylon, prolene): menos infecção, mais memória (desliza). Multifilamentar (seda, Vicryl): melhor manuseio/nó, mas retém bactérias." },

  /* PIG */
  { id: "f-pig01", discipline: "pig", phase: "N1", front: "Princípios doutrinários do SUS", back: "Universalidade, Integralidade e Equidade. Organizativos: descentralização, regionalização, hierarquização e participação social." },
  { id: "f-pig02", discipline: "pig", phase: "N1", front: "ANS vs ANVISA", back: "ANS: regula a saúde SUPLEMENTAR (planos privados). ANVISA: vigilância sanitária de produtos e serviços." },

  /* APS */
  { id: "f-aps01", discipline: "aps", phase: "N2", front: "CAT — quando emitir", back: "Até o 1º dia útil após o acidente (imediatamente se óbito). Deve ser emitida MESMO sem afastamento. Garante direitos previdenciários." },
  { id: "f-aps02", discipline: "aps", phase: "N2", front: "SINAN e CEREST", back: "SINAN: sistema de notificação de agravos (vigilância). CEREST: Centro de Referência em Saúde do Trabalhador (rede pública de apoio)." },
  { id: "f-aps03", discipline: "aps", phase: "N2", front: "Conduta da APS em Saúde do Trabalhador", back: "Acolhimento → anamnese ocupacional → nexo causal → registro → avaliar capacidade laboral → relatório → CAT/SINAN → encaminhar (CEREST) → prevenção." },
];

// Exporta para o app
window.MEDQUEST_DATA = { DISCIPLINES, QUESTIONS, FLASHCARDS };
