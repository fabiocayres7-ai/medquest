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

/* ============================ PLANO DE ESTUDOS (grade de temas) ============================
   Cada tema tem: phase ("N1"/"N2") e topic (deve BATER com o campo "topic" das questões).
   A pessoa marca o tema como estudado no app; só então caem questões daquele tema.
   Temas sem questões ainda ("—") já ficam no plano; é só ir adicionando questões/resumos.
   =========================================================================================== */
const SYLLABUS = {
  mad: [
    { phase:"N1", topic:"Imunidade inata vs adaptativa" },
    { phase:"N1", topic:"Classes de anticorpos" },
    { phase:"N1", topic:"Sistema complemento" },
    { phase:"N1", topic:"Perfis de linfócitos T CD4" },
    { phase:"N1", topic:"Restrição pelo MHC" },
    { phase:"N1", topic:"Terapia das doenças imunológicas" },
    { phase:"N1", topic:"Tipagem sanguínea" },
    { phase:"N1", topic:"Sepse" },
    { phase:"N1", topic:"Tolerância imunológica" },
    { phase:"N1", topic:"Senescência e exaustão imunológica" },
    { phase:"N1", topic:"Imunologia dos tumores" },
    { phase:"N1", topic:"Transplantes / HLA" },
    { phase:"N1", topic:"GVHD" },
    { phase:"N1", topic:"Imunodeficiências" },
    { phase:"N2", topic:"Hipersensibilidade" },
    { phase:"N2", topic:"Hipersensibilidade tipo II" },
    { phase:"N2", topic:"Hipersensibilidade tipo III" },
    { phase:"N2", topic:"Hipersensibilidade tipo IV" },
    { phase:"N2", topic:"Imunologia das mucosas e alergia alimentar" },
    { phase:"N2", topic:"Asma alérgica" },
    { phase:"N2", topic:"Rinite alérgica" },
    { phase:"N2", topic:"Autoimunidade órgão-específica" },
    { phase:"N2", topic:"Autoimunidade sistêmica" },
    { phase:"N2", topic:"Vasculites" },
    { phase:"N2", topic:"Imunoensaios" },
    { phase:"N2", topic:"Imunoensaios — método" },
    { phase:"N2", topic:"Doenças autoinflamatórias" },
    { phase:"N2", topic:"Artrite reumatoide" },
    { phase:"N2", topic:"Espondiloartrites e HLA-B27" },
    { phase:"N2", topic:"Febre reumática" },
  ],
  pratica: [
    { phase:"N1", topic:"Patologia do esôfago" },
    { phase:"N1", topic:"Patologia gástrica" },
    { phase:"N1", topic:"Adenocarcinoma gástrico" },
    { phase:"N1", topic:"Doença celíaca" },
    { phase:"N1", topic:"Doença inflamatória intestinal" },
    { phase:"N1", topic:"Sequência adenoma-carcinoma" },
    { phase:"N1", topic:"Apendicite aguda" },
    { phase:"N1", topic:"Pâncreas exócrino" },
    { phase:"N1", topic:"Doenças hepáticas" },
    { phase:"N1", topic:"Semiologia — síndromes ictéricas" },
    { phase:"N2", topic:"Doença hepática — hepatites virais" },
    { phase:"N2", topic:"Cirrose — complicações" },
    { phase:"N2", topic:"Vesícula e vias biliares" },
    { phase:"N2", topic:"Câncer de pâncreas" },
    { phase:"N2", topic:"Pâncreas endócrino" },
    { phase:"N2", topic:"Patologia da tireoide" },
    { phase:"N2", topic:"Carcinoma de tireoide" },
    { phase:"N2", topic:"Patologia das suprarrenais" },
    { phase:"N2", topic:"Feocromocitoma" },
    { phase:"N2", topic:"AVC — patologia" },
    { phase:"N2", topic:"Semiologia — ascite" },
    { phase:"N2", topic:"Semiologia — hipertireoidismo" },
  ],
  terap: [
    { phase:"N1", topic:"Farmacocinética — meia-vida" },
    { phase:"N1", topic:"Biodisponibilidade / vias" },
    { phase:"N1", topic:"Clearance e dose" },
    { phase:"N1", topic:"Cinética de ordem zero vs primeira" },
    { phase:"N1", topic:"Volume de distribuição" },
    { phase:"N2", topic:"Metabolismo — indução/inibição" },
    { phase:"N2", topic:"Excreção renal" },
    { phase:"N2", topic:"Farmacodinâmica — receptores" },
    { phase:"N2", topic:"Janela terapêutica e monitorização" },
    { phase:"N2", topic:"Farmacologia autonômica" },
    { phase:"N2", topic:"Antimicrobianos — escolha" },
  ],
  rci: [
    { phase:"N1", topic:"Úlcera péptica" },
    { phase:"N1", topic:"Abdome agudo vascular" },
    { phase:"N1", topic:"Hemorragia digestiva" },
    { phase:"N2", topic:"Hepatite medicamentosa" },
    { phase:"N2", topic:"Icterícia obstrutiva" },
    { phase:"N2", topic:"Pancreatite aguda — conduta" },
  ],
  legal: [
    { phase:"N1", topic:"Traumatologia forense" },
    { phase:"N1", topic:"Lesões perfurocontusas" },
    { phase:"N1", topic:"Tanatologia forense" },
    { phase:"N2", topic:"Ética / documentos" },
    { phase:"N2", topic:"Sexologia forense" },
    { phase:"N2", topic:"Toxicologia forense" },
  ],
  cirurgia: [
    { phase:"N1", topic:"Antissepsia e assepsia" },
    { phase:"N1", topic:"Tempos cirúrgicos" },
    { phase:"N1", topic:"Cicatrização" },
    { phase:"N1", topic:"Ambiente e paramentação" },
    { phase:"N1", topic:"Áreas do centro cirúrgico" },
    { phase:"N1", topic:"Instrumental cirúrgico" },
    { phase:"N2", topic:"Fios e suturas" },
    { phase:"N2", topic:"Nós e técnicas de sutura" },
  ],
  pig: [
    { phase:"N1", topic:"SUS e regulação" },
    { phase:"N1", topic:"Linha de cuidado" },
    { phase:"N1", topic:"Financiamento em saúde" },
    { phase:"N1", topic:"Níveis de atenção" },
  ],
  aps: [
    { phase:"N2", topic:"Saúde do trabalhador" },
    { phase:"N2", topic:"Documentos ocupacionais" },
    { phase:"N2", topic:"Nexo causal" },
    { phase:"N2", topic:"Vigilância e notificação" },
  ],
};

/* ============================ RESUMOS ============================
   Chave: "<disciplina>::<topic>" (mesmo topic do plano/questões).
   Corpo em texto; use quebras de linha. Vá adicionando conforme o plano.
   Ex.: "mad::Sepse": "Definição...\n- item\n- item".
   ================================================================= */
const SUMMARIES = {
  "mad::Sepse":
    "SEPSE = disfunção orgânica ameaçadora à vida por resposta desregulada à infecção.\n"+
    "• Choque séptico: sepse + vasopressor p/ PAM ≥ 65 + lactato > 2 apesar de volume.\n"+
    "• Mediadores: TNF-α, IL-1, IL-6 e NO → vasodilatação + ↑permeabilidade → choque distributivo.\n"+
    "• Reconhecimento (qSOFA): FR ≥ 22, PAS ≤ 100, alteração do estado mental.\n"+
    "• Conduta (1ª hora): coletar lactato + culturas, antibiótico precoce, cristaloide 30 mL/kg, vasopressor (noradrenalina) se hipotensão refratária.",
  "pratica::Semiologia — síndromes ictéricas":
    "ICTERÍCIA — padrões:\n"+
    "• Pré-hepática (hemólise): bilirrubina INDIRETA ↑, sem colúria, LDH ↑, haptoglobina ↓.\n"+
    "• Hepatocelular: ALT/AST ↑↑; gravidade pelo INR/albumina.\n"+
    "• Colestática/obstrutiva: bilirrubina DIRETA ↑, FA e GGT ↑↑, colúria + acolia + prurido.\n"+
    "• Courvoisier (vesícula palpável indolor) → obstrução maligna distal (pâncreas).",
  "terap::Farmacocinética — meia-vida":
    "MEIA-VIDA (t½) e STEADY STATE:\n"+
    "• Steady state e eliminação quase completa: ~4–5 meias-vidas (independe da dose).\n"+
    "• Dose de ataque = Vd × Css (preenche o volume). Manutenção = Clearance × Css.\n"+
    "• 1ª ordem: elimina fração constante, t½ estável. Ordem zero: quantidade fixa/tempo (etanol, fenitoína, AAS).",

  "mad::Imunidade inata vs adaptativa":
    "INATA: imediata, inespecífica, SEM memória. Barreiras, fagócitos (neutrófilo, macrófago), NK, complemento, PRR/PAMP.\n"+
    "ADAPTATIVA: específica, mais lenta na 1ª vez, COM memória. Humoral (linfócito B → anticorpo) e celular (T CD4 helper, T CD8 citotóxico).\n"+
    "• Ponte entre as duas: células apresentadoras (dendrítica) via MHC.",
  "mad::Sistema complemento":
    "3 vias (clássica: Ac; alternativa: superfície microbiana; lectinas: MBL) → convergem em C3.\n"+
    "Funções: C3b = OPSONIZAÇÃO; C3a/C5a = anafilotoxinas (C5a quimiotaxia); C5b-9 = MAC (lise).\n"+
    "• Deficiência de C5-C9 → infecções por Neisseria. Deficiência de C1-inibidor → angioedema hereditário.",
  "mad::Transplantes / HLA":
    "HLA (MHC) classe I (A,B,C)→CD8; classe II (DR,DQ,DP)→CD4. Quanto mais compatível, menor rejeição.\n"+
    "Rejeição: HIPERAGUDA (min-h, Ac pré-formados) · AGUDA (dias-sem, celular T ou humoral) · CRÔNICA (meses-anos, fibrose/arteriosclerose).\n"+
    "• GVHD: linfócitos T do DOADOR atacam o receptor (pele, intestino, fígado).",
  "mad::Hipersensibilidade":
    "Gell e Coombs:\n"+
    "I (imediata): IgE + mastócito → histamina (anafilaxia, alergia).\n"+
    "II (citotóxica): IgG/IgM contra antígeno de superfície (transfusão, anemia hemolítica; Coombs).\n"+
    "III (imunocomplexos): deposição + complemento (doença do soro, LES).\n"+
    "IV (tardia): linfócitos T/macrófagos, 48-72h (PPD, dermatite de contato). Única CELULAR.",
  "mad::Imunodeficiências":
    "PRIMÁRIAS: Bruton (BTK, ausência de B, X) · DiGeorge (aplasia tímica, sem T) · SCID (T e B) · DGC (catalase+, granulomas) · def. complemento (Neisseria).\n"+
    "SECUNDÁRIAS: HIV (↓CD4), desnutrição, corticoide/imunossupressor, quimioterapia. Infecções de repetição são a pista.",
  "mad::Vasculites":
    "Grandes vasos: Takayasu, arterite temporal. Médios: PAN (HBV, poupa pulmão), Kawasaki.\n"+
    "Pequenos ANCA: GPA/Wegener (PR3/ANCA-c, via aérea+rim), poliangiite microscópica e EGPA/Churg-Strauss (MPO/ANCA-p).\n"+
    "Pequenos por imunocomplexo: Henoch-Schönlein (IgA, criança, púrpura+dor abdominal).",
  "pratica::Patologia do esôfago":
    "ESCAMOSO (epidermoide): terço médio/superior, tabaco+álcool.\n"+
    "ADENOCARCINOMA: terço distal, DRGE → esôfago de Barrett (metaplasia intestinal) → displasia → adenocarcinoma.\n"+
    "• Disfagia progressiva (sólidos→líquidos) + perda de peso = alarme.",
  "pratica::Doença inflamatória intestinal":
    "CROHN: boca→ânus, SALTEADO, TRANSMURAL, granulomas, 'paralelepípedo', fístulas/estenoses.\n"+
    "RCU: reto→cólon, CONTÍNUO, mucosa/submucosa, criptite, megacólon tóxico, ↑risco de CA colorretal.\n"+
    "• p-ANCA mais na RCU; ASCA mais no Crohn.",
  "pratica::Cirrose — complicações":
    "Hipertensão portal → varizes (hematêmese), ascite, circulação colateral (cabeça de medusa), esplenomegalia.\n"+
    "Outras: PBE (PMN>250 no líquido), encefalopatia hepática (amônia; trata com lactulose), síndrome hepatorrenal, CHC.\n"+
    "• Child-Pugh e MELD estimam gravidade/prognóstico.",
  "pratica::Patologia da tireoide":
    "Hashimoto: hipotireoidismo, anti-TPO, células de Hürthle. Graves: hipertireoidismo, anti-TRAB, exoftalmia, captação alta.\n"+
    "De Quervain (subaguda): dolorosa, pós-viral, VHS↑, captação BAIXA. Carcinoma papilífero: mais comum, psammoma, linfático, bom prognóstico.",
  "terap::Metabolismo — indução/inibição":
    "Fase I (CYP450: oxidação) → Fase II (conjugação: glicuronidação/sulfatação → hidrossolúvel).\n"+
    "INDUTORES (rifampicina, carbamazepina, fenitoína, álcool crônico): ↑metabolismo, ↓efeito.\n"+
    "INIBIDORES (claritromicina, cetoconazol, suco de toranja, ritonavir): ↓metabolismo, ↑efeito/toxicidade.",
  "cirurgia::Tempos cirúrgicos":
    "1) DIÉRESE (incisão/divisão dos tecidos) → 2) HEMOSTASIA (controle do sangramento) →\n"+
    "3) EXÉRESE / cirurgia propriamente dita → 4) SÍNTESE (reconstrução/sutura).\n"+
    "• Síntese por 1ª intenção (bordas aproximadas) x 2ª intenção (granulação).",
  "cirurgia::Fios e suturas":
    "ABSORVÍVEIS (catgut, Vicryl/poliglactina, PDS): planos profundos, mucosa, aponeurose (PDS).\n"+
    "INABSORVÍVEIS (nylon, prolene, seda): pele e onde exige força prolongada.\n"+
    "Mono (nylon/prolene): menos infecção, mais memória. Multi (seda/Vicryl): melhor nó, retém bactéria.",
  "legal::Traumatologia forense":
    "Por instrumento: INCISA (gume, bordas nítidas, sem pontes) · CONTUSA (contundente, bordas irregulares, pontes) ·\n"+
    "PERFUROINCISA (ponta+gume, faca) · PERFUROCONTUSA (PAF) · CORTOCONTUSA (gume+peso, machado).\n"+
    "PAF entrada: menor, orla de escoriação, tatuagem se curta distância. Saída: maior, evertida, sem orla.",

  "mad::Imunologia dos tumores":
    "IMUNOEDIÇÃO (3 E's): Eliminação (imunovigilância mata células transformadas) → Equilíbrio → Escape (variantes evadem).\n"+
    "Antígenos: TSA (específicos de tumor) e TAA (associados, também em tecido normal).\n"+
    "Escape: perda de MHC-I, PD-L1 (exaustão de T), Treg/citocinas imunossupressoras. Alvo da imunoterapia (anti-PD1/anti-CTLA4).",
  "mad::Artrite reumatoide":
    "Autoimune, poliartrite SIMÉTRICA de pequenas articulações + rigidez matinal > 1h + erosões.\n"+
    "Mediadores: CD4, macrófagos, TNF-α, IL-1, IL-6 → sinovite/pannus. Marcadores: anti-CCP (mais ESPECÍFICO) e FR (sensível, inespecífico).\n"+
    "Tratamento: metotrexato e biológicos (anti-TNF etc.).",
  "mad::Febre reumática":
    "Reação autoimune pós-faringite por Streptococcus pyogenes (grupo A) por MIMETISMO MOLECULAR.\n"+
    "Alvos: coração (valvulite → lesão mitral), articulações (poliartrite migratória), SNC (coreia de Sydenham), pele.\n"+
    "Critérios de Jones. Prevenção: tratar a faringite estreptocócica (penicilina).",
  "terap::Farmacologia autonômica":
    "SIMPÁTICO: alfa-1 (vasoconstrição), beta-1 (coração ↑FC/força), beta-2 (broncodilatação, vasodilatação musc. esquelética).\n"+
    "Adrenalina age em alfa+beta (beta-2 dilata musc. esquelética); noradrenalina predomina alfa (vasoconstrição).\n"+
    "PARASSIMPÁTICO: ACh em receptores muscarínicos. Anticolinesterásico (piridostigmina) ↑ACh na fenda → miastenia.\n"+
    "Feocromocitoma: bloquear ALFA antes do beta.",
  "terap::Antimicrobianos — escolha":
    "Escolha = espectro (microbiologia) + segurança (paciente) + via.\n"+
    "Estreptococo/pneumococo sensível → penicilina/amoxicilina. Alergia grave a betalactâmico → macrolídeo (evitar cefalosporina por reação cruzada).\n"+
    "Gestante: evitar tetraciclina (dentes/ossos) e fluoroquinolona (cartilagem); penicilina é segura. Criança: evitar tetraciclina.",
  "cirurgia::Áreas do centro cirúrgico":
    "IRRESTRITA: acesso livre, roupa comum (recepção/vestiário).\n"+
    "SEMIRRESTRITA: circulação interna; exige pijama privativo e touca.\n"+
    "RESTRITA: salas cirúrgicas; exige pijama privativo, TOUCA e MÁSCARA. Fluxo do limpo para o sujo.",
  "cirurgia::Instrumental cirúrgico":
    "Por função: DIÉRESE (bisturi, tesoura) · PREENSÃO (pinça anatômica, dente de rato, Allis — tração de tecido) ·\n"+
    "HEMOSTASIA (Kelly, Halsted/mosquito) · SÍNTESE (porta-agulhas) · ESPECIAIS/AFASTADORES (Farabeuf, Gosset) · CAMPOS (Backhaus).",
  "pig::Financiamento em saúde":
    "Fontes: governo, empresas e famílias (pagamento direto/out of pocket).\n"+
    "SUS: financiamento TRIPARTITE (União/estados/municípios). Suplementar (~26% da população) regulado pela ANS.\n"+
    "Out of pocket recai sobretudo em MEDICAMENTOS e artigos médicos. Queda de beneficiários pós-2015 ligada ao desemprego.",
  "pig::SUS e regulação":
    "Princípios: universalidade, integralidade, equidade; organização: descentralização, regionalização, hierarquização, participação social.\n"+
    "APS = porta de entrada e ordenadora da rede (linha de cuidado). ANS regula a saúde suplementar; ANVISA, a vigilância sanitária.",
  "legal::Lesões perfurocontusas":
    "PAF — orifício de ENTRADA: menor, arredondado, com orla de escoriação, orla de enxugo e aréola equimótica; a curta distância há zona de TATUAGEM (pólvora incrustada, não sai com água) e ESFUMAÇAMENTO (fuligem, sai com água).\n"+
    "SAÍDA: maior, irregular, bordas evertidas, sem orla. Tiro ENCOSTADO: câmara de mina de Hofmann (gases) e sinal de Puppe-Werkgaetner (impressão da boca do cano).\n"+
    "Ausência de tatuagem NÃO exclui curta distância (anteparo/roupa retém resíduos).",
  "pratica::Vesícula e vias biliares":
    "COLELITÍASE: perfil '4F' (female, forty, fat, fertile), cólica biliar pós-gordura; USG com cálculo (hiperecogênico + sombra acústica).\n"+
    "Complicações: colecistite aguda (Murphy+), coledocolitíase → icterícia obstrutiva e COLANGITE (tríade de Charcot: dor + febre + icterícia → CPRE de urgência), e PANCREATITE AGUDA biliar (cálculo na ampola de Vater).\n"+
    "Tratamento definitivo: colecistectomia.",
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

  {
    id: "mad11", discipline: "mad", phase: "N1", topic: "Imunidade inata vs adaptativa", difficulty: 2,
    vignette: "Comparação entre os dois braços da resposta imune.",
    question: "Qual característica é EXCLUSIVA da imunidade adaptativa?",
    options: [
      "Resposta imediata e inespecífica",
      "Memória imunológica e especificidade por meio de receptores rearranjados (BCR/TCR)",
      "Barreiras físicas como pele e mucosas",
      "Fagocitose por neutrófilos e macrófagos",
      "Ativação do complemento pela via alternativa"
    ],
    answer: 1,
    explanation: "A imunidade ADAPTATIVA tem MEMÓRIA e ESPECIFICIDADE (receptores BCR/TCR gerados por recombinação V(D)J), com resposta mais lenta na primeira exposição e rápida/robusta na segunda. Fagocitose, barreiras e complemento (alternativa) são da imunidade INATA (imediata, inespecífica, sem memória).",
    tags: ["inata", "adaptativa", "memória"]
  },
  {
    id: "mad12", discipline: "mad", phase: "N1", topic: "Sistema complemento", difficulty: 3,
    vignette: "Estudo das funções do sistema complemento na defesa.",
    question: "Qual associação entre componente do complemento e função está CORRETA?",
    options: [
      "C3b — principal anafilotoxina responsável pela vasodilatação",
      "C3b — opsonização, facilitando a fagocitose",
      "C5a — formação do complexo de ataque à membrana (MAC)",
      "C1 — quimiotaxia de neutrófilos como função principal",
      "C9 — opsonização de bactérias encapsuladas"
    ],
    answer: 1,
    explanation: "C3b é a principal OPSONINA do complemento (recobre o patógeno → fagocitose via receptor CR1). As ANAFILOTOXINAS (vasodilatação, quimiotaxia) são C3a e C5a — C5a é potente quimiotático. O MAC é formado por C5b-C9 (lise). Deficiência de C5-C9 predispõe a infecções por Neisseria.",
    tags: ["complemento", "C3b", "opsonização"]
  },
  {
    id: "mad13", discipline: "mad", phase: "N1", topic: "Classes de anticorpos", difficulty: 2,
    vignette: "Um paciente tem infecção aguda e o laboratório dosa imunoglobulinas.",
    question: "Qual classe de anticorpo indica tipicamente infecção RECENTE/aguda e é a primeira a surgir?",
    options: [
      "IgG",
      "IgM",
      "IgA",
      "IgE",
      "IgD"
    ],
    answer: 1,
    explanation: "IgM é a PRIMEIRA a surgir na resposta primária (pentâmero, ótima ativadora do complemento) → marca infecção RECENTE. IgG predomina na resposta secundária/memória e atravessa a placenta. IgA protege mucosas. IgE liga-se a mastócitos (alergia/parasitas). IgD é receptor de linfócito B naive.",
    tags: ["IgM", "IgG", "sorologia"]
  },
  {
    id: "mad14", discipline: "mad", phase: "N1", topic: "Perfis de linfócitos T CD4", difficulty: 3,
    vignette: "A diferenciação do linfócito T CD4 (helper) direciona o tipo de resposta imune.",
    question: "Qual associação perfil Th × citocina × alvo está CORRETA?",
    options: [
      "Th1 — IL-4 — combate helmintos e estimula IgE",
      "Th1 — IFN-γ — ativa macrófagos contra patógenos intracelulares",
      "Th2 — IFN-γ — imunidade celular contra vírus",
      "Th17 — IL-10 — imunossupressão",
      "Treg — IL-17 — inflamação neutrofílica"
    ],
    answer: 1,
    explanation: "Th1 secreta IFN-γ e ativa MACRÓFAGOS (imunidade celular, patógenos intracelulares, granulomas). Th2 secreta IL-4/IL-5/IL-13 (helmintos, IgE, alergia, eosinófilos). Th17 secreta IL-17 (neutrófilos, fungos, autoimunidade). Treg secreta IL-10/TGF-β (tolerância/supressão). Trocar as citocinas é a pegadinha clássica.",
    tags: ["Th1", "Th2", "Th17"]
  },
  {
    id: "mad15", discipline: "mad", phase: "N1", topic: "Restrição pelo MHC", difficulty: 3,
    vignette: "Um vírus infecta uma célula do epitélio respiratório e produz proteínas virais no citoplasma.",
    question: "Como esses antígenos virais são apresentados e a qual linfócito?",
    options: [
      "Via MHC classe II para linfócitos T CD4",
      "Via MHC classe I para linfócitos T CD8 citotóxicos",
      "Diretamente por anticorpos de superfície",
      "Via MHC classe II para linfócitos T CD8",
      "Não há apresentação; a célula é lisada por neutrófilos"
    ],
    answer: 1,
    explanation: "Antígenos ENDÓGENOS (virais sintetizados no citoplasma) são processados no proteassoma e apresentados via MHC classe I a linfócitos T CD8 CITOTÓXICOS, que matam a célula infectada. MHC classe II apresenta antígenos EXÓGENOS (fagocitados) a CD4. Regra: 'CD8 vê classe I (endógeno); CD4 vê classe II (exógeno)'.",
    tags: ["MHC I", "CD8", "apresentação"]
  },
  {
    id: "mad16", discipline: "mad", phase: "N1", topic: "GVHD", difficulty: 2,
    vignette: "Paciente submetido a transplante de medula óssea (células-tronco hematopoéticas) desenvolve, semanas depois, rash cutâneo, diarreia e icterícia.",
    question: "A complicação e seu mecanismo são:",
    options: [
      "Rejeição do enxerto pelo hospedeiro; linfócitos T do receptor atacam o enxerto",
      "Doença do enxerto contra o hospedeiro (GVHD); linfócitos T do DOADOR atacam tecidos do receptor",
      "Reação hiperaguda por anticorpos pré-formados",
      "Anafilaxia ao meio de infusão",
      "Recidiva da doença de base"
    ],
    answer: 1,
    explanation: "No transplante de medula, o enxerto contém linfócitos T do DOADOR que reconhecem os tecidos do receptor como estranhos → GVHD, com acometimento clássico de PELE, INTESTINO e FÍGADO (rash, diarreia, icterícia). É o oposto da rejeição (em que o hospedeiro ataca o enxerto). Prevenção: imunossupressão e compatibilidade HLA.",
    tags: ["GVHD", "medula óssea", "doador"]
  },
  {
    id: "mad17", discipline: "mad", phase: "N2", topic: "Hipersensibilidade tipo II", difficulty: 3,
    vignette: "Paciente recebe transfusão ABO incompatível e desenvolve febre, dor lombar e hemoglobinúria; ou, em outro caso, apresenta anemia hemolítica autoimune com Coombs direto positivo.",
    question: "O mecanismo de hipersensibilidade envolvido é:",
    options: [
      "Tipo I — IgE e mastócitos",
      "Tipo II — anticorpos IgG/IgM contra antígenos da superfície celular, com lise via complemento/opsonização",
      "Tipo III — deposição de imunocomplexos circulantes",
      "Tipo IV — linfócitos T e macrófagos",
      "Reação não imunológica"
    ],
    answer: 1,
    explanation: "Reação transfusional hemolítica e anemia hemolítica autoimune são hipersensibilidade TIPO II (CITOTÓXICA): anticorpos IgG/IgM ligam-se a antígenos da MEMBRANA das hemácias → ativação do complemento e opsonização → hemólise. O teste de Coombs detecta esses anticorpos. Tipo III é por imunocomplexos (não ligados à superfície celular).",
    tags: ["tipo II", "Coombs", "hemólise"]
  },
  {
    id: "mad18", discipline: "mad", phase: "N2", topic: "Hipersensibilidade tipo III", difficulty: 3,
    vignette: "Dias após receber soro heterólogo (antiveneno), paciente evolui com febre, urticária, artralgia e proteinúria.",
    question: "O quadro (doença do soro) corresponde a qual mecanismo?",
    options: [
      "Tipo I imediata",
      "Tipo III — deposição de imunocomplexos com ativação do complemento em tecidos (vasos, rins, articulações)",
      "Tipo II citotóxica",
      "Tipo IV tardia",
      "Autoimunidade órgão-específica"
    ],
    answer: 1,
    explanation: "A doença do soro é hipersensibilidade TIPO III: imunocomplexos (antígeno-anticorpo) circulam e se DEPOSITAM em vasos, glomérulos e articulações, ativando complemento e recrutando neutrófilos → vasculite, nefrite, artrite. Ocorre dias após a exposição. Difere da tipo II (anticorpo contra antígeno fixo na célula) e da tipo I (imediata, IgE).",
    tags: ["tipo III", "imunocomplexos", "doença do soro"]
  },
  {
    id: "mad19", discipline: "mad", phase: "N2", topic: "Hipersensibilidade tipo IV", difficulty: 2,
    vignette: "48–72 horas após a aplicação do PPD (teste tuberculínico) ou do contato com níquel de um brinco, surge enduração/eritema local.",
    question: "Esse padrão TARDIO é mediado por:",
    options: [
      "IgE e histamina",
      "Linfócitos T sensibilizados e macrófagos (imunidade celular), sem anticorpos",
      "Imunocomplexos circulantes",
      "Anticorpos citotóxicos e complemento",
      "Degranulação de eosinófilos"
    ],
    answer: 1,
    explanation: "Hipersensibilidade TIPO IV (TARDIA) é mediada por LINFÓCITOS T (Th1/CD8) e MACRÓFAGOS, não por anticorpos. Pico em 48–72 h (por isso a leitura do PPD é tardia). Exemplos: dermatite de contato (níquel), PPD, rejeição celular, granulomas. É a única hipersensibilidade CELULAR (as outras são humorais).",
    tags: ["tipo IV", "PPD", "dermatite de contato"]
  },
  {
    id: "mad20", discipline: "mad", phase: "N2", topic: "Autoimunidade órgão-específica", difficulty: 3,
    vignette: "Mulher com ptose e fraqueza muscular que piora ao longo do dia e com esforço, melhorando ao repouso. Anticorpos anti-receptor de acetilcolina positivos.",
    question: "O diagnóstico e o mecanismo são:",
    options: [
      "Esclerose múltipla; anticorpos contra a mielina do SNC",
      "Miastenia gravis; anticorpos que bloqueiam/destroem o receptor de acetilcolina na junção neuromuscular",
      "Doença de Graves; anticorpos estimuladores do receptor de TSH",
      "Guillain-Barré; desmielinização periférica pós-infecciosa",
      "Polimiosite; infiltrado inflamatório muscular"
    ],
    answer: 1,
    explanation: "Fraqueza FATIGÁVEL (piora com uso, melhora com repouso) + anti-AChR = MIASTENIA GRAVIS, hipersensibilidade tipo II em que anticorpos bloqueiam e degradam o receptor de acetilcolina na placa motora → falha na transmissão neuromuscular. Graves também é por anticorpo anti-receptor, mas ESTIMULADOR (do TSH) → hipertireoidismo. Associação com timoma.",
    tags: ["miastenia", "anti-AChR", "junção neuromuscular"]
  },
  {
    id: "mad21", discipline: "mad", phase: "N2", topic: "Asma alérgica", difficulty: 3,
    vignette: "Adolescente atópico com crises de sibilância, dispneia e tosse desencadeadas por poeira, com boa resposta a broncodilatador.",
    question: "Sobre a fisiopatologia imunológica da asma alérgica, assinale a correta:",
    options: [
      "Resposta Th1 com IFN-γ e ativação de macrófagos",
      "Resposta Th2 com IL-4/IL-5/IL-13, IgE, eosinófilos e inflamação brônquica com hiper-reatividade",
      "Deposição de imunocomplexos na parede brônquica",
      "Reação citotóxica contra o epitélio respiratório",
      "Deficiência de complemento com infecções de repetição"
    ],
    answer: 1,
    explanation: "A asma alérgica é doença Th2: IL-4/IL-13 (troca para IgE), IL-5 (eosinófilos). A reexposição ao alérgeno degranula mastócitos (fase imediata) e recruta eosinófilos (fase tardia) → broncoconstrição, edema, hipersecreção e HIPER-REATIVIDADE brônquica. Base do tratamento: corticoide inalatório (anti-inflamatório) + broncodilatador.",
    tags: ["asma", "Th2", "eosinófilo"]
  },
  {
    id: "mad22", discipline: "mad", phase: "N2", topic: "Imunoensaios — método", difficulty: 2,
    vignette: "Um laboratório quer quantificar a concentração de uma citocina no soro com alta sensibilidade.",
    question: "Qual técnica é a mais apropriada e qual seu princípio?",
    options: [
      "Western blot; separa proteínas por peso e confirma identidade",
      "ELISA sanduíche; captura o antígeno entre dois anticorpos e gera sinal proporcional à concentração",
      "Citometria de fluxo; conta células em suspensão marcadas",
      "PCR; amplifica sequências de DNA",
      "Imuno-histoquímica; marca antígenos em cortes de tecido"
    ],
    answer: 1,
    explanation: "O ELISA sanduíche é ideal para QUANTIFICAR antígenos solúveis (ex.: citocinas): um anticorpo de captura fixa o antígeno, um segundo anticorpo conjugado a enzima gera cor proporcional à concentração. Western blot confirma identidade por peso molecular (ex.: confirmatório de HIV). Citometria analisa células; imuno-histoquímica, tecidos.",
    tags: ["ELISA", "quantificação", "citocina"]
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

  {
    id: "pat10", discipline: "pratica", phase: "N1", topic: "Adenocarcinoma gástrico", difficulty: 3,
    vignette: "Biópsia gástrica revela células em 'anel de sinete' infiltrando difusamente a parede, com espessamento rígido (linite plástica).",
    question: "Sobre esse subtipo (difuso) de adenocarcinoma gástrico, é correto:",
    options: [
      "É o subtipo intestinal, associado a H. pylori e à cascata de Correa, bom prognóstico",
      "É o subtipo difuso, com células em anel de sinete, pior prognóstico e associação a mutação de CDH1 (E-caderina)",
      "É sempre benigno",
      "Origina-se de metaplasia escamosa",
      "Não invade a parede gástrica"
    ],
    answer: 1,
    explanation: "Células em anel de sinete + linite plástica = adenocarcinoma gástrico tipo DIFUSO (classificação de Lauren): perda de E-caderina (CDH1), pouca coesão, infiltração difusa, PIOR prognóstico, acomete mais jovens. O tipo INTESTINAL forma glândulas, associa-se a H. pylori/dieta/cascata de Correa e a lesões pré-malignas. Diferenciar os dois é cobrado.",
    tags: ["anel de sinete", "linite plástica", "Lauren"]
  },
  {
    id: "pat11", discipline: "pratica", phase: "N1", topic: "Doença celíaca", difficulty: 2,
    vignette: "Paciente com diarreia crônica, distensão e anemia ferropriva. Biópsia duodenal: atrofia de vilosidades, hiperplasia de criptas e linfocitose intraepitelial. Anti-transglutaminase positivo.",
    question: "O diagnóstico e o mecanismo são:",
    options: [
      "Doença de Whipple; infecção por Tropheryma whipplei",
      "Doença celíaca; reação imunomediada ao glúten em predispostos (HLA-DQ2/DQ8)",
      "Giardíase; parasitose intestinal",
      "Intolerância à lactose; deficiência de lactase",
      "Doença de Crohn duodenal"
    ],
    answer: 1,
    explanation: "Atrofia vilositária + hiperplasia de criptas + linfocitose intraepitelial + anti-transglutaminase = DOENÇA CELÍACA, resposta imune ao glúten (gliadina) em indivíduos HLA-DQ2/DQ8, com má absorção (anemia, diarreia). Tratamento: dieta sem glúten. A atrofia das vilosidades reduz a superfície absortiva — base da má absorção.",
    tags: ["celíaca", "atrofia vilositária", "HLA-DQ2"]
  },
  {
    id: "pat12", discipline: "pratica", phase: "N1", topic: "Sequência adenoma-carcinoma", difficulty: 3,
    vignette: "Colonoscopia de rastreamento identifica pólipo adenomatoso viloso de 2 cm no cólon.",
    question: "Qual a importância desse achado e a base molecular?",
    options: [
      "Pólipo hiperplásico sem risco, apenas observar",
      "Adenoma é lesão precursora do adenocarcinoma colorretal (sequência adenoma-carcinoma), com acúmulo de mutações (APC → KRAS → TP53)",
      "Indica doença de Crohn",
      "É metástase de outro sítio",
      "Pólipos vilosos têm menor risco que os tubulares"
    ],
    answer: 1,
    explanation: "O adenoma (sobretudo VILOSO e >1 cm) é o precursor do adenocarcinoma colorretal — a sequência ADENOMA-CARCINOMA acumula mutações (inativação de APC, ativação de KRAS, perda de TP53). Pólipos vilosos e maiores têm MAIOR risco de malignizar que os tubulares pequenos. Por isso a colonoscopia com polipectomia previne câncer.",
    tags: ["adenoma", "APC", "colorretal"]
  },
  {
    id: "pat13", discipline: "pratica", phase: "N1", topic: "Apendicite aguda", difficulty: 2,
    vignette: "Jovem com dor periumbilical que migra para a fossa ilíaca direita, anorexia, febre baixa e Blumberg positivo.",
    question: "O mecanismo fisiopatológico inicial mais comum é:",
    options: [
      "Isquemia mesentérica por embolia",
      "Obstrução da luz apendicular (fecalito/hiperplasia linfoide) → distensão, proliferação bacteriana e inflamação",
      "Perfuração espontânea sem obstrução",
      "Torção do apêndice",
      "Refluxo de conteúdo colônico"
    ],
    answer: 1,
    explanation: "A apendicite começa pela OBSTRUÇÃO da luz (fecalito no adulto, hiperplasia linfoide no jovem) → acúmulo de secreção, aumento de pressão, proliferação bacteriana, isquemia da parede e inflamação transmural → pode evoluir para necrose e perfuração. A dor migra (visceral periumbilical → somática em FID quando irrita o peritônio parietal).",
    tags: ["apendicite", "fecalito", "Blumberg"]
  },
  {
    id: "pat14", discipline: "pratica", phase: "N2", topic: "Cirrose — complicações", difficulty: 3,
    vignette: "Cirrótico com ascite volumosa, circulação colateral abdominal e episódio de hematêmese.",
    question: "A hemorragia digestiva alta nesse contexto deve-se principalmente a:",
    options: [
      "Úlcera duodenal por H. pylori",
      "Varizes esofágicas rotas, decorrentes da hipertensão portal",
      "Câncer gástrico avançado",
      "Síndrome de Mallory-Weiss por vômitos",
      "Angiodisplasia do cólon"
    ],
    answer: 1,
    explanation: "Na cirrose, a fibrose aumenta a resistência ao fluxo portal → HIPERTENSÃO PORTAL → abre colaterais portossistêmicas (varizes esofagogástricas, circulação abdominal 'cabeça de medusa', hemorroidas) e ascite. A rotura de VARIZES ESOFÁGICAS é a causa clássica de hematêmese maciça no cirrótico. Outras complicações: PBE, encefalopatia, síndrome hepatorrenal.",
    tags: ["hipertensão portal", "varizes", "cirrose"]
  },
  {
    id: "pat15", discipline: "pratica", phase: "N2", topic: "Câncer de pâncreas", difficulty: 3,
    vignette: "Homem de 65 anos, tabagista, com icterícia progressiva INDOLOR, colúria, acolia e vesícula biliar palpável e indolor.",
    question: "O achado da vesícula palpável indolor (sinal de Courvoisier) sugere:",
    options: [
      "Colelitíase simples",
      "Obstrução maligna da via biliar distal, tipicamente por adenocarcinoma de cabeça de pâncreas",
      "Colecistite aguda litiásica",
      "Hepatite viral aguda",
      "Síndrome de Gilbert"
    ],
    answer: 1,
    explanation: "Icterícia obstrutiva INDOLOR + vesícula palpável indolor = sinal de COURVOISIER, que sugere obstrução MALIGNA da via biliar (adenocarcinoma de cabeça de pâncreas ou colangiocarcinoma distal), não litíase — na litíase crônica a vesícula é fibrótica e não distende. Tabagismo é fator de risco. Prognóstico ruim, diagnóstico tardio.",
    tags: ["Courvoisier", "pâncreas", "icterícia indolor"]
  },
  {
    id: "pat16", discipline: "pratica", phase: "N2", topic: "Carcinoma de tireoide", difficulty: 2,
    vignette: "Nódulo tireoidiano em mulher jovem; punção mostra células com núcleos em 'vidro fosco', fendas nucleares e corpos de psammoma.",
    question: "O tipo histológico e o prognóstico são:",
    options: [
      "Carcinoma anaplásico; péssimo prognóstico",
      "Carcinoma papilífero; o mais comum, dissemina por via linfática, bom prognóstico",
      "Carcinoma medular; produz calcitonina",
      "Carcinoma folicular; dissemina por via hematogênica",
      "Linfoma de tireoide"
    ],
    answer: 1,
    explanation: "Núcleos em vidro fosco, fendas ('grooves'), pseudoinclusões e CORPOS DE PSAMMOMA = carcinoma PAPILÍFERO, o mais comum da tireoide, de disseminação LINFÁTICA e BOM prognóstico. O folicular dissemina por via hematogênica; o medular (células C) produz calcitonina; o anaplásico é agressivo e letal. Reconhecer a histologia é a chave.",
    tags: ["papilífero", "psammoma", "tireoide"]
  },
  {
    id: "pat17", discipline: "pratica", phase: "N2", topic: "Feocromocitoma", difficulty: 3,
    vignette: "Paciente com crises de cefaleia, palpitação, sudorese e hipertensão paroxística. Metanefrinas urinárias elevadas.",
    question: "O diagnóstico e a origem são:",
    options: [
      "Hiperaldosteronismo; zona glomerulosa da adrenal",
      "Feocromocitoma; tumor da medula adrenal produtor de catecolaminas",
      "Síndrome de Cushing; zona fasciculada",
      "Doença de Addison; córtex adrenal",
      "Adenoma hipofisário produtor de ACTH"
    ],
    answer: 1,
    explanation: "Tríade cefaleia + palpitação + sudorese com HAS paroxística e metanefrinas elevadas = FEOCROMOCITOMA, tumor da MEDULA adrenal (células cromafins) que secreta catecolaminas (adrenalina/noradrenalina). Segue a 'regra dos 10' (10% bilateral, extra-adrenal, maligno). Cuidado: manipular o tumor sem bloqueio alfa pode causar crise hipertensiva.",
    tags: ["feocromocitoma", "catecolaminas", "medula adrenal"]
  },
  {
    id: "pat18", discipline: "pratica", phase: "N2", topic: "AVC — patologia", difficulty: 3,
    vignette: "Homem de 70 anos, hipertenso, com déficit neurológico focal súbito. TC de crânio sem contraste inicial é normal; após 24 h mostra área hipodensa.",
    question: "O tipo mais provável de AVC e o motivo da TC inicial normal são:",
    options: [
      "AVC hemorrágico; sangue é hipodenso na TC",
      "AVC isquêmico; a TC precoce costuma ser normal, pois a hipodensidade da necrose leva horas para aparecer",
      "AVC hemorrágico; a hipodensidade aparece imediatamente",
      "Tumor cerebral; cresce em 24 h",
      "Enxaqueca com aura"
    ],
    answer: 1,
    explanation: "Déficit focal súbito com TC inicial NORMAL sugere AVC ISQUÊMICO: a hipodensidade (edema citotóxico da necrose) demora horas a aparecer, por isso a TC precoce pode ser normal (serve para EXCLUIR hemorragia, que é HIPERdensa imediatamente). O AVC isquêmico é o mais comum (~85%). A janela para trombólise depende desse raciocínio tempo-imagem.",
    tags: ["AVC isquêmico", "TC", "penumbra"]
  },
  {
    id: "pat19", discipline: "pratica", phase: "N2", topic: "Doença hepática — hepatites virais", difficulty: 2,
    vignette: "Comparação entre as hepatites virais quanto à cronicidade.",
    question: "Qual afirmação está CORRETA?",
    options: [
      "Hepatite A cronifica na maioria dos casos",
      "Hepatites B e C podem cronificar e predispor a cirrose e carcinoma hepatocelular; a A e a E (imunocompetente) são geralmente autolimitadas",
      "Hepatite C nunca cronifica",
      "Somente a hepatite A causa carcinoma hepatocelular",
      "Nenhuma hepatite viral evolui para cirrose"
    ],
    answer: 1,
    explanation: "As hepatites de transmissão parenteral/sexual B e C CRONIFICAM (C em ~80%) e são grandes causas de cirrose e CHC. As de transmissão fecal-oral A e E são geralmente AGUDAS e autolimitadas (E pode ser grave em gestantes; cronifica só em imunossuprimidos). Relacionar via de transmissão e risco de cronicidade é essencial.",
    tags: ["hepatite", "cronificação", "CHC"]
  },
  {
    id: "sem01", discipline: "pratica", phase: "N2", topic: "Semiologia — ascite", difficulty: 2,
    vignette: "Ao exame do abdome de um paciente cirrótico, você quer confirmar ascite de médio volume.",
    question: "Qual manobra semiológica é típica para detectar líquido livre na cavidade?",
    options: [
      "Sinal de Murphy",
      "Macicez móvel (piparote e mudança de decúbito alterando a percussão)",
      "Sinal de Blumberg",
      "Sinal de Giordano",
      "Manobra de Lasègue"
    ],
    answer: 1,
    explanation: "A ascite é pesquisada pela MACICEZ MÓVEL (o líquido se desloca com a mudança de decúbito, alterando a linha de percussão) e pelo sinal do PIPAROTE (onda líquida). Murphy → colecistite; Blumberg → irritação peritoneal (apendicite); Giordano → pielonefrite; Lasègue → ciática. Cada manobra aponta um sistema — não confundir.",
    tags: ["ascite", "macicez móvel", "piparote"]
  },
  {
    id: "sem02", discipline: "pratica", phase: "N2", topic: "Semiologia — hipertireoidismo", difficulty: 2,
    vignette: "Paciente com perda de peso apesar de apetite aumentado, taquicardia, tremor fino, intolerância ao calor e exoftalmia.",
    question: "Esse conjunto de sinais indica e sugere qual etiologia?",
    options: [
      "Hipotireoidismo por Hashimoto",
      "Hipertireoidismo, e a exoftalmia sugere doença de Graves",
      "Insuficiência adrenal",
      "Feocromocitoma isolado",
      "Diabetes insipidus"
    ],
    answer: 1,
    explanation: "Perda ponderal com apetite preservado, taquicardia, tremor, intolerância ao calor = HIPERtireoidismo (metabolismo acelerado). A EXOFTALMIA (oftalmopatia) e o bócio difuso apontam especificamente para DOENÇA DE GRAVES (autoimune, anti-TRAB). No hipotireoidismo ocorre o oposto: ganho de peso, bradicardia, intolerância ao frio.",
    tags: ["hipertireoidismo", "Graves", "exoftalmia"]
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

  /* ==================== LOTE RESIDÊNCIA — clínico e mais difícil ==================== */

  /* ---- MAD II ---- */
  {
    id: "mad23", discipline: "mad", phase: "N1", topic: "Terapia das doenças imunológicas", difficulty: 3,
    vignette: "Paciente com artrite reumatoide refratária a metotrexato inicia terapia com anti-TNF-α (infliximabe). Antes de iniciar, o serviço solicita PPD/IGRA e radiografia de tórax.",
    question: "Qual a justificativa imunológica para esse rastreio prévio?",
    options: [
      "O anti-TNF causa hepatotoxicidade e o exame avalia o fígado",
      "O TNF-α é essencial para a formação e manutenção do granuloma; bloqueá-lo pode REATIVAR tuberculose latente",
      "O anti-TNF induz nefrite e o PPD avalia a função renal",
      "O rastreio busca alergia ao próprio anticorpo monoclonal",
      "É apenas exigência burocrática, sem base fisiopatológica"
    ],
    answer: 1,
    explanation: "O TNF-α mantém a integridade do GRANULOMA que contém o M. tuberculosis latente. Ao bloquear o TNF, o granuloma se desestrutura e pode haver REATIVAÇÃO de TB (inclusive formas disseminadas). Por isso, antes de imunobiológicos anti-TNF, rastreia-se TB latente (PPD/IGRA + RX) e trata-se se positivo. Conceito clássico de imunoterapia.",
    tags: ["anti-TNF", "granuloma", "TB latente"]
  },
  {
    id: "mad24", discipline: "mad", phase: "N2", topic: "Autoimunidade sistêmica", difficulty: 3,
    vignette: "Mulher de 32 anos com história de 3 abortos espontâneos, trombose venosa profunda prévia e plaquetopenia. Anticoagulante lúpico e anti-cardiolipina positivos em duas dosagens com 12 semanas de intervalo.",
    question: "O diagnóstico e o mecanismo predominante são:",
    options: [
      "Lúpus isolado; deposição de imunocomplexos renais",
      "Síndrome antifosfolípide; autoanticorpos pró-trombóticos causando tromboses e perdas fetais",
      "Púrpura trombocitopênica trombótica; deficiência de ADAMTS13",
      "Trombofilia hereditária (fator V de Leiden); mutação genética",
      "Vasculite ANCA; inflamação de pequenos vasos"
    ],
    answer: 1,
    explanation: "Tromboses (arteriais/venosas) + morbidade gestacional + anticorpos antifosfolípides (anticoagulante lúpico, anticardiolipina, anti-β2-glicoproteína) persistentes ≥ 12 semanas = SÍNDROME ANTIFOSFOLÍPIDE. Os anticorpos ativam plaquetas/endotélio e a cascata da coagulação → estado pró-trombótico. Pode ser primária ou associada ao LES. Tratamento: anticoagulação.",
    tags: ["SAF", "trombose", "antifosfolípide"]
  },
  {
    id: "mad25", discipline: "mad", phase: "N2", topic: "Imunologia das mucosas e alergia alimentar", difficulty: 2,
    vignette: "Lactente de 4 meses em aleitamento materno exclusivo apresenta sangue nas fezes, sem toxemia. Mãe consome leite de vaca. Melhora com dieta materna de exclusão do leite.",
    question: "A hipótese e o mecanismo mais provável são:",
    options: [
      "Alergia à proteína do leite de vaca não IgE-mediada (proctocolite alérgica), mecanismo celular",
      "Anafilaxia IgE-mediada ao leite",
      "Intolerância à lactose por deficiência de lactase",
      "Doença celíaca do lactente",
      "Invaginação intestinal"
    ],
    answer: 0,
    explanation: "Proctocolite alérgica: lactente com bom estado geral e sangue nas fezes, desencadeada por proteína do leite de vaca (via leite materno). É reação NÃO IgE-mediada, de mecanismo predominantemente CELULAR (linfócitos T), de início tardio — diferente da anafilaxia (IgE, imediata). Conduta: exclusão do leite da dieta materna. Intolerância à lactose não causa sangramento.",
    tags: ["APLV", "não IgE", "mucosa"]
  },
  {
    id: "mad26", discipline: "mad", phase: "N2", topic: "Rinite alérgica", difficulty: 2,
    vignette: "Adolescente com espirros em salva, prurido nasal, rinorreia aquosa e obstrução, sazonais, com cornetos pálidos e edemaciados à rinoscopia.",
    question: "Sobre o tratamento de primeira linha da rinite alérgica persistente moderada/grave:",
    options: [
      "Antibiótico sistêmico",
      "Corticosteroide intranasal, o mais eficaz para controle da inflamação alérgica",
      "Descongestionante tópico de uso contínuo",
      "Anti-histamínico de primeira geração em altas doses",
      "Imunossupressor sistêmico"
    ],
    answer: 1,
    explanation: "O CORTICOIDE INTRANASAL é o tratamento mais eficaz da rinite alérgica moderada/grave (reduz a inflamação Th2 local). Anti-histamínicos ajudam nos sintomas; descongestionantes tópicos por mais de 5 dias causam rinite medicamentosa (efeito rebote). Antibiótico não tem papel (é alérgica, não infecciosa). Imunoterapia é opção para casos selecionados.",
    tags: ["rinite", "corticoide nasal", "Th2"]
  },

  /* ---- Prática Clínica II ---- */
  {
    id: "pat20", discipline: "pratica", phase: "N1", topic: "Doenças hepáticas", difficulty: 3,
    vignette: "Homem de 45 anos, obeso, diabético e dislipidêmico, com transaminases levemente elevadas (ALT>AST), sem uso de álcool. USG com esteatose; biópsia mostra esteatose, balonização hepatocitária e infiltrado inflamatório.",
    question: "O diagnóstico e o risco evolutivo são:",
    options: [
      "Hepatite alcoólica; risco de cirrose se mantiver o álcool",
      "Esteato-hepatite não alcoólica (NASH); pode evoluir para fibrose, cirrose e CHC",
      "Hepatite viral C; cronificação em 80%",
      "Hemocromatose; sobrecarga de ferro",
      "Colangite biliar primária; anti-mitocôndria positivo"
    ],
    answer: 1,
    explanation: "Síndrome metabólica (obesidade, DM2, dislipidemia) + esteatose com balonização e inflamação, SEM álcool = ESTEATO-HEPATITE NÃO ALCOÓLICA (NASH). A balonização/inflamação distingue NASH da esteatose simples. Pode progredir para fibrose → cirrose → CHC. Na doença alcoólica costuma haver AST>ALT (relação >2); aqui é o inverso. Tratamento: perda de peso e controle metabólico.",
    tags: ["NASH", "esteatose", "síndrome metabólica"]
  },
  {
    id: "pat21", discipline: "pratica", phase: "N1", topic: "Pâncreas exócrino", difficulty: 3,
    vignette: "Paciente no 3º dia de pancreatite aguda grave evolui com dispneia, hipoxemia e infiltrado pulmonar bilateral; PaO2/FiO2 = 180 sem sinais de congestão cardíaca.",
    question: "A complicação sistêmica mais provável é:",
    options: [
      "Edema agudo de pulmão cardiogênico",
      "Síndrome do desconforto respiratório agudo (SDRA) por resposta inflamatória sistêmica",
      "Tromboembolismo pulmonar",
      "Pneumonia bacteriana comunitária",
      "Derrame pleural transudativo isolado"
    ],
    answer: 1,
    explanation: "A pancreatite grave desencadeia resposta inflamatória sistêmica (SIRS), e a liberação de mediadores/enzimas lesa o endotélio alveolar → SDRA (hipoxemia, infiltrado bilateral, PaO2/FiO2 baixo, sem origem cardíaca). É causa clássica de SDRA e marcador de gravidade. Diferencia-se do edema cardiogênico pela ausência de congestão/disfunção cardíaca.",
    tags: ["SDRA", "pancreatite grave", "SIRS"]
  },
  {
    id: "pat22", discipline: "pratica", phase: "N2", topic: "Patologia da tireoide", difficulty: 3,
    vignette: "Mulher com dor cervical anterior, febre baixa e disfagia após quadro viral de vias aéreas. Ao exame, tireoide dolorosa. Inicialmente com sintomas de hipertireoidismo, VHS muito elevado e captação de iodo REDUZIDA.",
    question: "O diagnóstico é:",
    options: [
      "Doença de Graves",
      "Tireoidite subaguda (De Quervain), granulomatosa, pós-viral",
      "Tireoidite de Hashimoto",
      "Carcinoma anaplásico",
      "Bócio multinodular tóxico"
    ],
    answer: 1,
    explanation: "Tireoide DOLOROSA + pós-viral + VHS muito alto + tireotoxicose com captação de iodo BAIXA = tireoidite subaguda de DE QUERVAIN (granulomatosa). O hipertireoidismo é por liberação do hormônio pré-formado pela destruição do folículo (por isso captação baixa, ao contrário de Graves, que tem captação alta). Costuma ser autolimitada; trata-se a dor (AINE) e sintomas. Hashimoto é indolor.",
    tags: ["De Quervain", "tireoidite", "captação"]
  },
  {
    id: "pat23", discipline: "pratica", phase: "N2", topic: "Patologia das suprarrenais", difficulty: 3,
    vignette: "Paciente com fraqueza, perda de peso, hiperpigmentação de pele e mucosas, hipotensão, hiponatremia e hipercalemia. Cortisol baixo e ACTH elevado.",
    question: "O diagnóstico e o mecanismo da hiperpigmentação são:",
    options: [
      "Síndrome de Cushing; excesso de cortisol",
      "Insuficiência adrenal primária (Addison); ACTH elevado, e o excesso de POMC/MSH causa hiperpigmentação",
      "Hiperaldosteronismo; excesso de aldosterona",
      "Feocromocitoma; catecolaminas",
      "Insuficiência adrenal secundária; ACTH baixo"
    ],
    answer: 1,
    explanation: "Cortisol baixo com ACTH ALTO + hiperpigmentação + hipotensão + hiponatremia/hipercalemia = insuficiência adrenal PRIMÁRIA (Addison). Como a adrenal não responde, a hipófise aumenta a POMC (precursora de ACTH e de MSH) → estímulo dos melanócitos → HIPERPIGMENTAÇÃO. Na insuficiência SECUNDÁRIA (hipofisária) o ACTH é baixo e NÃO há hiperpigmentação nem hipercalemia (aldosterona preservada).",
    tags: ["Addison", "ACTH", "hiperpigmentação"]
  },
  {
    id: "pat24", discipline: "pratica", phase: "N2", topic: "Pâncreas endócrino", difficulty: 3,
    vignette: "Paciente diabético tipo 1 chega ao PS com poliúria, dor abdominal, respiração de Kussmaul e hálito cetônico. Glicemia 480 mg/dL, pH 7,18, bicarbonato 12, cetonúria +++.",
    question: "Além de insulina, qual é a prioridade INICIAL do tratamento?",
    options: [
      "Bicarbonato de sódio em bolus imediato",
      "Reposição volêmica vigorosa com salina e correção do potássio antes/junto da insulina",
      "Insulina em bolus alto sem hidratação",
      "Glicose hipertônica",
      "Antibiótico empírico de amplo espectro"
    ],
    answer: 1,
    explanation: "Cetoacidose diabética: a prioridade inicial é HIDRATAÇÃO (salina 0,9%) e atenção ao POTÁSSIO — a insulina desloca K+ para dentro da célula e pode causar hipocalemia grave; se K+ < 3,3, repõe-se K antes da insulina. Bicarbonato só em acidose muito grave (pH < 6,9). A tríade do tratamento é volume + insulina + potássio. Raciocínio de conduta típico de prova.",
    tags: ["CAD", "potássio", "hidratação"]
  },

  /* ---- Terapêutica I ---- */
  {
    id: "ter07", discipline: "terap", phase: "N1", topic: "Volume de distribuição", difficulty: 3,
    vignette: "Um fármaco muito lipofílico distribui-se amplamente nos tecidos, resultando em volume de distribuição (Vd) elevado.",
    question: "Qual a implicação clínica prática de um Vd alto?",
    options: [
      "O fármaco é facilmente removido por hemodiálise",
      "É necessária maior dose de ATAQUE para atingir a concentração plasmática desejada, e a remoção por diálise é pouco eficaz",
      "A meia-vida é sempre curta",
      "A biodisponibilidade oral é de 100%",
      "O fármaco fica restrito ao plasma"
    ],
    answer: 1,
    explanation: "Vd alto = o fármaco 'sai' do plasma para os tecidos (lipofílico, sequestrado). Consequências: exige DOSE DE ATAQUE maior (Dose de ataque = Vd × Css) para encher esse volume aparente, e a HEMODIÁLISE é ineficaz (pouco fármaco no plasma para remover). Fármacos com Vd baixo (restritos ao plasma) são melhor dialisáveis. Aplicação clínica direta do conceito de Vd.",
    tags: ["Vd", "dose de ataque", "diálise"]
  },
  {
    id: "ter08", discipline: "terap", phase: "N1", topic: "Clearance e dose", difficulty: 3,
    vignette: "Paciente com clearance de creatinina de 25 mL/min precisa usar um fármaco de eliminação predominantemente RENAL, com índice terapêutico estreito.",
    question: "Qual o ajuste correto e a razão?",
    options: [
      "Aumentar a dose, pois o rim elimina mais rápido",
      "Reduzir a dose e/ou aumentar o intervalo, pois a queda do clearance renal eleva a concentração e o risco de toxicidade",
      "Manter a dose habitual, pois o rim não influencia",
      "Suspender qualquer hidratação",
      "Trocar por via inalatória obrigatoriamente"
    ],
    answer: 1,
    explanation: "Se o fármaco é eliminado pelo rim e o clearance renal caiu (DRC), a eliminação diminui → acúmulo → toxicidade (pior em índice terapêutico estreito, ex.: vancomicina, digoxina, aminoglicosídeos). Conduta: REDUZIR a dose e/ou ESPAÇAR o intervalo, guiando-se por níveis séricos quando disponíveis. Relaciona clearance, função renal e ajuste posológico.",
    tags: ["clearance renal", "ajuste de dose", "índice terapêutico"]
  },
  {
    id: "ter09", discipline: "terap", phase: "N2", topic: "Farmacodinâmica — receptores", difficulty: 3,
    vignette: "Um paciente intoxicado por opioide (miose, depressão respiratória, rebaixamento) recebe naloxona e melhora imediatamente.",
    question: "A naloxona atua como:",
    options: [
      "Agonista total do receptor opioide",
      "Antagonista competitivo do receptor opioide, deslocando o agonista",
      "Agonista parcial com efeito-teto",
      "Inibidor enzimático do metabolismo do opioide",
      "Agonista inverso dos receptores GABA"
    ],
    answer: 1,
    explanation: "A naloxona é ANTAGONISTA COMPETITIVO dos receptores opioides: liga-se ao receptor sem ativá-lo e DESLOCA o agonista (opioide), revertendo a depressão respiratória. Antagonista competitivo desloca a curva dose-resposta do agonista para a direita (↓potência, Emax mantido com mais agonista). Atenção: meia-vida curta pode exigir repetição. Conceito central de farmacodinâmica.",
    tags: ["antagonista", "naloxona", "receptor"]
  },
  {
    id: "ter10", discipline: "terap", phase: "N2", topic: "Janela terapêutica e monitorização", difficulty: 3,
    vignette: "Paciente em uso de digoxina apresenta náuseas, visão amarelada (xantopsia) e bradiarritmia. Está em uso recente de furosemida.",
    question: "Qual fator provavelmente precipitou a toxicidade e por quê?",
    options: [
      "Hipercalemia induzida pela furosemida",
      "Hipocalemia induzida pela furosemida, que potencializa a ligação da digoxina à bomba Na/K-ATPase",
      "Aumento do clearance da digoxina",
      "Indução enzimática do CYP pela furosemida",
      "Redução da absorção da digoxina"
    ],
    answer: 1,
    explanation: "A digoxina tem janela terapêutica ESTREITA. A furosemida causa HIPOCALEMIA, e o baixo potássio aumenta a ligação da digoxina à Na/K-ATPase, POTENCIALIZANDO sua ação e toxicidade (náusea, xantopsia, arritmias). Por isso, monitoriza-se K+ e nível sérico de digoxina. Exemplo clássico de interação por índice terapêutico estreito.",
    tags: ["digoxina", "hipocalemia", "monitorização"]
  },
  {
    id: "ter11", discipline: "terap", phase: "N1", topic: "Biodisponibilidade / vias", difficulty: 2,
    vignette: "Paciente em crise convulsiva precisa de benzodiazepínico com início de ação mais rápido possível, sem acesso venoso imediato disponível.",
    question: "Qual via oferece início de ação mais rápido nesse cenário e por quê?",
    options: [
      "Via oral, por ser mais cômoda",
      "Vias que evitam a primeira passagem e têm boa absorção (endovenosa se possível; alternativas: intranasal/bucal/retal) — início mais rápido que a oral",
      "Via oral com dose dobrada",
      "Via subcutânea de depósito",
      "Via transdérmica"
    ],
    answer: 1,
    explanation: "A via ENDOVENOSA é a mais rápida (F=100%, sem primeira passagem). Sem acesso, alternativas de absorção rápida e que evitam a primeira passagem hepática — intranasal, bucal/sublingual ou retal — superam a oral (que é lenta e sofre metabolismo de primeira passagem). Relaciona via de administração, biodisponibilidade e velocidade de início.",
    tags: ["vias", "primeira passagem", "emergência"]
  },

  /* ---- RCI V (casos clínicos integrados) ---- */
  {
    id: "rci04", discipline: "rci", phase: "N1", topic: "Hemorragia digestiva", difficulty: 3,
    vignette: "Homem de 58 anos, etilista, dá entrada com hematêmese volumosa e melena. PA 90x60, FC 118. Ao exame: ascite, telangiectasias e esplenomegalia. Suspeita-se de varizes esofágicas.",
    question: "Além da estabilização hemodinâmica, qual conduta farmacológica inicial é prioritária?",
    options: [
      "Iniciar anticoagulação plena",
      "Droga vasoativa esplâncnica (terlipressina/octreotide) + antibioticoprofilaxia, antes da endoscopia",
      "AINE endovenoso para dor",
      "Betabloqueador em bolus para a taquicardia",
      "Corticoide em altas doses"
    ],
    answer: 1,
    explanation: "HDA varicosa no cirrótico: após estabilizar (2 acessos calibrosos, cristaloide, hemotransfusão criteriosa), inicia-se DROGA VASOATIVA esplâncnica (terlipressina ou octreotide) para reduzir a pressão portal e ANTIBIOTICOPROFILAXIA (ceftriaxona — reduz mortalidade e ressangramento), seguidos de ENDOSCOPIA (ligadura elástica) idealmente em até 12 h. Betabloqueador é para profilaxia, não na hemorragia aguda.",
    tags: ["HDA varicosa", "terlipressina", "profilaxia"]
  },
  {
    id: "rci05", discipline: "rci", phase: "N2", topic: "Icterícia obstrutiva", difficulty: 3,
    vignette: "Mulher de 60 anos com dor em hipocôndrio direito, febre com calafrios e icterícia. Bilirrubina direta e FA elevadas; USG com dilatação de vias biliares e cálculo no colédoco.",
    question: "A síndrome (tríade de Charcot) indica qual diagnóstico e conduta?",
    options: [
      "Colecistite aguda; colecistectomia eletiva em 6 semanas",
      "Colangite aguda; antibiótico + DESCOMPRESSÃO da via biliar (CPRE) de urgência",
      "Hepatite viral; suporte clínico",
      "Pancreatite crônica; enzimas pancreáticas",
      "Abscesso hepático; drenagem percutânea apenas"
    ],
    answer: 1,
    explanation: "Dor em HCD + febre/calafrios + icterícia = tríade de CHARCOT = COLANGITE AGUDA (infecção da via biliar obstruída, geralmente por cálculo no colédoco). É emergência: antibiótico + DESCOMPRESSÃO biliar (CPRE com papilotomia/retirada do cálculo). Se acrescentar hipotensão e confusão (pêntade de Reynolds) → colangite tóxica, ainda mais grave. Reconhecer a tríade e a urgência da drenagem é o ponto-chave.",
    tags: ["colangite", "Charcot", "CPRE"]
  },
  {
    id: "rci06", discipline: "rci", phase: "N2", topic: "Pancreatite aguda — conduta", difficulty: 3,
    vignette: "Paciente com pancreatite aguda biliar. Após a fase aguda, discute-se prevenção de recorrência.",
    question: "Qual a conduta definitiva para prevenir novos episódios de pancreatite biliar?",
    options: [
      "Uso contínuo de inibidor de bomba de prótons",
      "Colecistectomia (idealmente na mesma internação, após melhora) para remover a fonte dos cálculos",
      "Dieta zero permanente",
      "Antibiótico profilático crônico",
      "Reposição enzimática pancreática vitalícia"
    ],
    answer: 1,
    explanation: "Na pancreatite aguda BILIAR, a prevenção definitiva de recorrência é a COLECISTECTOMIA (remove a origem dos cálculos), preferencialmente na MESMA internação nos casos leves, após a resolução do quadro. Se houver cálculo no colédoco/colangite, faz-se CPRE antes. Antibiótico profilático não é recomendado na pancreatite sem infecção. Conduta clássica.",
    tags: ["pancreatite biliar", "colecistectomia", "recorrência"]
  },

  /* ---- Medicina Legal ---- */
  {
    id: "leg04", discipline: "legal", phase: "N1", topic: "Tanatologia forense", difficulty: 3,
    vignette: "Perícia em cadáver encontrado descreve livores fixos na região dorsal, rigidez cadavérica generalizada e temperatura corporal reduzida.",
    question: "Sobre os fenômenos cadavéricos e a estimativa do tempo de morte, é correto:",
    options: [
      "Livores fixos indicam morte há menos de 1 hora",
      "Livores tornam-se FIXOS após ~8–12 h e sua localização (dorsal) indica a posição do corpo; a rigidez segue cronologia própria",
      "A rigidez cadavérica aparece imediatamente após a morte e some em 1 hora",
      "A temperatura não tem qualquer valor médico-legal",
      "Livores dorsais indicam que o corpo foi enforcado em pé"
    ],
    answer: 1,
    explanation: "Fenômenos cadavéricos ajudam a estimar o tempo e as circunstâncias da morte. Os LIVORES (hipóstases) surgem por gravidade nas partes de declive, são móveis no início e FIXAM-se em ~8–12 h (indicam a posição do corpo — dorsal = decúbito dorsal). A RIGIDEZ (rigor mortis) instala-se progressivamente (início ~2–3 h, completa ~6–12 h) e depois se resolve. O esfriamento (algor mortis) também é usado. Base da tanatologia forense.",
    tags: ["livores", "rigidez", "tempo de morte"]
  },
  {
    id: "leg05", discipline: "legal", phase: "N1", topic: "Traumatologia forense", difficulty: 3,
    vignette: "Vítima de agressão apresenta fratura de ossos próprios do nariz, com incapacidade para as atividades habituais por mais de 30 dias, comprovada pericialmente.",
    question: "Segundo a tipificação das lesões corporais, essa lesão classifica-se como de natureza:",
    options: [
      "Leve",
      "Grave (por incapacidade para as ocupações habituais por mais de 30 dias)",
      "Gravíssima",
      "Contravenção sem lesão",
      "Vias de fato"
    ],
    answer: 1,
    explanation: "A lesão corporal de natureza GRAVE inclui, entre outros critérios, a INCAPACIDADE para as ocupações habituais por MAIS DE 30 DIAS (comprovada por exame complementar). A gravíssima envolve, por exemplo, incapacidade permanente, deformidade permanente, perda de membro/função, aborto. Saber os critérios de leve/grave/gravíssima é cobrado em medicina legal.",
    tags: ["lesão corporal", "grave", "30 dias"]
  },
  {
    id: "leg06", discipline: "legal", phase: "N2", topic: "Ética / documentos", difficulty: 2,
    vignette: "Um médico é procurado por familiar de paciente já falecido solicitando cópia do prontuário; em outro momento, a polícia solicita informações sobre atendimento de paciente vivo sem autorização judicial.",
    question: "Qual conduta é a correta quanto ao sigilo?",
    options: [
      "Fornecer tudo a qualquer pessoa que solicitar",
      "O sigilo persiste após a morte; a liberação de dados segue as normas (herdeiros/representantes conforme resolução) e a quebra a pedido de autoridade exige respaldo legal/justa causa",
      "A polícia sempre tem direito irrestrito ao prontuário sem ordem judicial",
      "O sigilo cessa automaticamente com a morte do paciente",
      "O médico deve destruir o prontuário após a alta"
    ],
    answer: 1,
    explanation: "O SIGILO médico PERSISTE após a morte do paciente. A liberação de informações/prontuário obedece às normas do CFM (a herdeiros/representantes legais em situações específicas) e a quebra a pedido de autoridade requer respaldo legal (ordem judicial) ou justa causa — não é irrestrita. O prontuário deve ser guardado (prazo mínimo estabelecido), não destruído. Ética e sigilo são temas frequentes.",
    tags: ["sigilo", "prontuário", "post mortem"]
  },
  {
    id: "leg07", discipline: "legal", phase: "N2", topic: "Toxicologia forense", difficulty: 2,
    vignette: "Investigação de morte suspeita solicita dosagem toxicológica. Discute-se a coleta de amostras biológicas.",
    question: "Sobre a coleta em toxicologia forense, assinale a correta:",
    options: [
      "Apenas sangue periférico tem valor, nenhuma outra amostra",
      "Diferentes matrizes (sangue, humor vítreo, urina, conteúdo gástrico, cabelo) fornecem informações complementares sobre exposição recente e pregressa, respeitando a cadeia de custódia",
      "A cadeia de custódia é irrelevante para o laudo",
      "O cabelo não serve para avaliar uso crônico",
      "O humor vítreo não pode ser utilizado"
    ],
    answer: 1,
    explanation: "Na toxicologia forense usam-se MÚLTIPLAS matrizes: sangue (exposição recente/concentração), humor vítreo (mais estável à putrefação), urina (metabólitos), conteúdo gástrico (ingestão), e CABELO (exposição crônica/retrospectiva). A CADEIA DE CUSTÓDIA (registro íntegro da amostra) é essencial para a validade jurídica do laudo. Conceito de coleta e interpretação.",
    tags: ["toxicologia", "cadeia de custódia", "matrizes"]
  },

  /* ---- Introdução à Prática Cirúrgica ---- */
  {
    id: "cir05", discipline: "cirurgia", phase: "N1", topic: "Ambiente e paramentação", difficulty: 2,
    vignette: "Durante a paramentação cirúrgica, discute-se o que é considerado campo estéril.",
    question: "Qual afirmação sobre a técnica asséptica no centro cirúrgico é correta?",
    options: [
      "A região posterior do avental (costas) é considerada estéril",
      "Considera-se estéril a parte frontal do avental do umbigo/cintura para cima até os ombros e as mangas; abaixo da cintura e as costas NÃO são estéreis",
      "As mãos podem ficar abaixo da cintura após a paramentação",
      "O gorro e a máscara fazem parte do campo estéril das mãos",
      "Qualquer superfície da sala é estéril"
    ],
    answer: 1,
    explanation: "Após paramentado, o campo estéril do cirurgião é a FRENTE do avental entre a cintura e os ombros e as mangas (até acima do cotovelo); COSTAS e região ABAIXO da cintura NÃO são estéreis, por isso as mãos são mantidas acima da cintura e à frente. Instrumentador e cirurgião não tocam áreas não estéreis. Base da técnica asséptica no CC.",
    tags: ["campo estéril", "paramentação", "assepsia"]
  },
  {
    id: "cir06", discipline: "cirurgia", phase: "N2", topic: "Fios e suturas", difficulty: 3,
    vignette: "Ao final de uma laparotomia, o cirurgião vai suturar a aponeurose (parede abdominal) e, separadamente, a pele.",
    question: "Qual a escolha de fios mais adequada para cada plano?",
    options: [
      "Aponeurose com fio absorvível de rápida absorção; pele com categute",
      "Aponeurose com fio de absorção lenta/inabsorvível resistente (ex.: PDS ou nylon); pele com fio inabsorvível monofilamentar (nylon)",
      "Ambos com seda multifilamentar",
      "Aponeurose com categute simples; pele com fio absorvível trançado",
      "Ambos os planos sem sutura, apenas cola"
    ],
    answer: 1,
    explanation: "A APONEUROSE exige RESISTÊNCIA prolongada (cicatriza devagar; risco de hérnia incisional) → fio de absorção lenta (PDS) ou inabsorvível resistente. A PELE usa fio INABSORVÍVEL MONOFILAMENTAR (nylon/polipropileno), que causa menos reação/infecção e é retirado depois. Categute (absorção rápida) não serve para planos que precisam de força. Escolha de fio por plano é muito cobrada.",
    tags: ["aponeurose", "PDS", "nylon"]
  },
  {
    id: "cir07", discipline: "cirurgia", phase: "N1", topic: "Cicatrização", difficulty: 3,
    vignette: "Paciente diabético descompensado e desnutrido evolui, no pós-operatório, com deiscência de ferida e cicatrização lenta.",
    question: "Qual fator abaixo prejudica DIRETAMENTE a síntese de colágeno e a cicatrização?",
    options: [
      "Boa oxigenação tecidual",
      "Deficiência de vitamina C (necessária à hidroxilação do colágeno), hiperglicemia e desnutrição",
      "Níveis normais de proteínas",
      "Ausência de infecção",
      "Perfusão tecidual adequada"
    ],
    answer: 1,
    explanation: "A cicatrização depende de aporte adequado; PREJUDICAM-na: hiperglicemia/diabetes (disfunção leucocitária, microangiopatia), desnutrição/hipoproteinemia, deficiência de VITAMINA C (cofator da hidroxilação da prolina/lisina na síntese do colágeno → escorbuto compromete a cicatriz), hipóxia, infecção, corticoides e tabagismo. Boa oxigenação e nutrição FAVORECEM. Fatores que afetam a cicatrização são clássicos.",
    tags: ["cicatrização", "vitamina C", "diabetes"]
  },

  /* ---- PIG V (Gestão em Saúde) ---- */
  {
    id: "pig03", discipline: "pig", phase: "N1", topic: "Níveis de atenção", difficulty: 2,
    vignette: "Um gestor quer organizar a rede para que a maioria dos problemas de saúde seja resolvida próximo à comunidade, reservando serviços complexos para casos que realmente necessitem.",
    question: "Qual princípio/estrutura do SUS corresponde a essa lógica?",
    options: [
      "Atenção hospitalar como porta de entrada preferencial",
      "Atenção Primária como ordenadora do cuidado e porta de entrada, com hierarquização entre os níveis (primário, secundário, terciário)",
      "Livre acesso direto à alta complexidade para todos",
      "Centralização de todo o cuidado no nível terciário",
      "Eliminação da referência e contrarreferência"
    ],
    answer: 1,
    explanation: "A ATENÇÃO PRIMÁRIA (APS) é a porta de entrada preferencial e ORDENADORA do cuidado, resolvendo a maioria das demandas perto da comunidade; a hierarquização organiza os níveis primário/secundário/terciário, com referência e contrarreferência para os casos que exigem maior densidade tecnológica. Essa é a lógica de organização e regionalização do SUS.",
    tags: ["APS", "hierarquização", "porta de entrada"]
  },
  {
    id: "pig04", discipline: "pig", phase: "N1", topic: "Financiamento em saúde", difficulty: 2,
    vignette: "Discussão sobre as fontes de recursos do sistema de saúde brasileiro.",
    question: "Assinale a afirmação correta sobre o financiamento da saúde no Brasil:",
    options: [
      "O SUS é financiado exclusivamente pelo governo federal",
      "O financiamento do SUS é tripartite (União, estados e municípios); há ainda gastos privados (planos e desembolso direto/out of pocket)",
      "Todo o gasto em saúde é privado",
      "O desembolso direto (out of pocket) não existe no Brasil",
      "A ANS financia diretamente o SUS"
    ],
    answer: 1,
    explanation: "O SUS tem financiamento TRIPARTITE — União, estados e municípios (com percentuais mínimos de aplicação definidos em lei). Além do público, existe o gasto PRIVADO: planos de saúde (saúde suplementar, regulada pela ANS) e o desembolso direto das famílias (out of pocket — ex.: medicamentos e itens não cobertos). Conceito básico de gestão/financiamento.",
    tags: ["financiamento", "tripartite", "out of pocket"]
  },

  /* ---- APS V (Saúde Ocupacional) ---- */
  {
    id: "aps03", discipline: "aps", phase: "N2", topic: "Saúde do trabalhador", difficulty: 3,
    vignette: "Operário de metalúrgica, exposto a ruído intenso por 10 anos sem proteção adequada, apresenta perda auditiva neurossensorial bilateral, simétrica, com entalhe na frequência de 4000 Hz na audiometria.",
    question: "Qual a hipótese e a conduta ocupacional prioritária?",
    options: [
      "Otite média; antibiótico",
      "Perda auditiva induzida por ruído (PAIR) ocupacional; estabelecer nexo, emitir CAT, notificar e afastar da exposição",
      "Presbiacusia; apenas observação",
      "Rolha de cerume; lavagem auricular",
      "Surdez súbita idiopática; corticoide"
    ],
    answer: 1,
    explanation: "Perda neurossensorial bilateral com ENTALHE em 4 kHz + exposição crônica a ruído = PAIR (perda auditiva induzida por ruído), doença ocupacional. Conduta: estabelecer NEXO causal, emitir CAT, notificar (SINAN), e sobretudo AFASTAR/reduzir a exposição e garantir EPI/medidas coletivas — a PAIR é irreversível, mas previne-se a progressão. Integra clínica + conduta ocupacional.",
    tags: ["PAIR", "ruído", "CAT"]
  },
  {
    id: "aps04", discipline: "aps", phase: "N2", topic: "Vigilância e notificação", difficulty: 2,
    vignette: "Uma unidade de saúde identifica um caso de doença relacionada ao trabalho de notificação compulsória.",
    question: "Qual sistema/instrumento é utilizado e qual o objetivo?",
    options: [
      "Apenas prontuário interno, sem notificação",
      "Notificação no SINAN (Sistema de Informação de Agravos de Notificação), para vigilância epidemiológica e orientação de políticas",
      "Somente comunicação verbal ao empregador",
      "Registro exclusivamente no plano de saúde privado",
      "Nenhuma ação é necessária"
    ],
    answer: 1,
    explanation: "Agravos e doenças relacionadas ao trabalho de notificação compulsória são registrados no SINAN, alimentando a VIGILÂNCIA epidemiológica em saúde do trabalhador — o que permite identificar riscos, dimensionar o problema e orientar políticas públicas e ações do CEREST. A CAT formaliza para fins previdenciários; o SINAN é o instrumento de vigilância. Diferenciar os instrumentos é o ponto.",
    tags: ["SINAN", "notificação", "vigilância"]
  },

  /* ==================== LOTE PROVAS ANTIGAS + MATERIAIS (Mandic) ==================== */

  /* ---- MAD II (provas N1/N2) ---- */
  {
    id: "madp01", discipline: "mad", phase: "N1", topic: "Sepse", difficulty: 3,
    vignette: "Homem de 60 anos, hipertenso e diabético, com febre alta, taquicardia e confusão mental, é diagnosticado com sepse secundária a pneumonia comunitária e evolui com choque séptico (hipotensão persistente e disfunção de múltiplos órgãos).",
    question: "Qual mecanismo imunológico é o MAIS relevante para o quadro apresentado?",
    options: [
      "Ativação descontrolada da resposta adaptativa, com aumento da resposta inflamatória e dano tecidual",
      "Resposta inflamatória exacerbada mediada por citocinas, provocando vasodilatação e aumento da permeabilidade vascular",
      "Liberação excessiva de mediadores anti-inflamatórios levando à inibição imune e progressão da infecção",
      "Supressão do sistema imune permitindo multiplicação descontrolada do patógeno",
      "Ativação isolada do complemento sem participação de citocinas"
    ],
    answer: 1,
    explanation: "Na sepse/choque séptico, a resposta inflamatória sistêmica EXACERBADA (tempestade de citocinas: TNF-α, IL-1, IL-6) e a indução de óxido nítrico causam VASODILATAÇÃO e aumento da PERMEABILIDADE vascular → choque distributivo e disfunção orgânica. Há também componente anti-inflamatório compensatório, mas o motor da disfunção aguda é a resposta pró-inflamatória desregulada.",
    tags: ["sepse", "citocinas", "choque"]
  },
  {
    id: "madp02", discipline: "mad", phase: "N1", topic: "Sepse", difficulty: 3,
    vignette: "Paciente com sepse grave evolui com coagulação intravascular disseminada (CID), com microtrombos em capilares de múltiplos órgãos. A disfunção endotelial é apontada como mecanismo central.",
    question: "A disfunção endotelial na sepse contribui para a CID porque:",
    options: [
      "Reduz a expressão de moléculas de adesão, diminuindo o recrutamento de neutrófilos",
      "Ativa e lesa as células endoteliais, levando à expressão de moléculas pró-coagulantes e aumento da permeabilidade vascular",
      "Suprime os fatores de coagulação, prevenindo a formação de coágulos",
      "Aumenta a produção de mediadores anti-inflamatórios que restauram a perfusão",
      "Bloqueia a via do fator tecidual, impedindo trombose"
    ],
    answer: 1,
    explanation: "Na sepse, o endotélio ativado/lesado passa a expressar FATOR TECIDUAL e moléculas pró-coagulantes, reduz anticoagulantes naturais e aumenta a permeabilidade → trombose microvascular difusa (CID) com consumo de plaquetas e fatores, levando a isquemia orgânica e, paradoxalmente, sangramento. Ativação (não supressão) da coagulação é a chave.",
    tags: ["CID", "endotélio", "fator tecidual"]
  },
  {
    id: "madp03", discipline: "mad", phase: "N1", topic: "Imunologia dos tumores", difficulty: 3,
    vignette: "Discussão sobre a relação entre o sistema imune e as neoplasias.",
    question: "Sobre a imunologia dos tumores, assinale a afirmativa CORRETA:",
    options: [
      "Antígenos tumorais são sempre exclusivos das células neoplásicas, nunca presentes em células normais",
      "A imunoedição envolve eliminação, equilíbrio e escape — e as neoplasias frequentemente desenvolvem estratégias para evadir a vigilância imune",
      "O escape imunológico é obrigatório e ocorre em toda célula que sofre mutação, antes mesmo de virar câncer",
      "O sistema imune não reconhece células tumorais",
      "A imunoedição depende exclusivamente de linfócitos B e anticorpos"
    ],
    answer: 1,
    explanation: "A IMUNOEDIÇÃO tem 3 fases: ELIMINAÇÃO (imunovigilância destrói células transformadas), EQUILÍBRIO e ESCAPE (variantes que evadem a resposta imune proliferam). Nem todo antígeno tumoral é exclusivo (há antígenos associados a tumores, também em tecidos normais), e o escape não é obrigatório em toda mutação. Base da imunoterapia (checkpoints).",
    tags: ["imunoedição", "escape", "vigilância"]
  },
  {
    id: "madp04", discipline: "mad", phase: "N1", topic: "Terapia das doenças imunológicas", difficulty: 3,
    vignette: "Revisão dos fármacos usados nas doenças imunológicas: AINEs, corticoides, imunossupressores e biológicos.",
    question: "Assinale a alternativa CORRETA sobre esses fármacos:",
    options: [
      "AINEs inibem a fosfolipase A2, bloqueando toda a cascata do ácido araquidônico",
      "Anticorpos monoclonais podem inibir citocinas pró-inflamatórias (ex.: anti-TNF), sendo úteis em doenças autoimunes",
      "Omalizumabe bloqueia a ciclo-oxigenase, reduzindo prostaglandinas",
      "Glicocorticoides não têm utilidade por via inalatória na asma",
      "AINEs seletivos para COX-2 aumentam a proteção gástrica sem qualquer risco cardiovascular"
    ],
    answer: 1,
    explanation: "Anticorpos monoclonais miram alvos específicos da imunopatologia — ex.: anti-TNF (infliximabe), anti-IL-6, anti-IgE (omalizumabe, que neutraliza IgE, NÃO a COX). AINEs inibem a COX (não a fosfolipase A2 — essa é inibida pelos corticoides). Corticoide inalatório é pilar da asma. Coxibes aumentam risco trombótico. Reconhecer os mecanismos por classe é o objetivo.",
    tags: ["biológicos", "anti-TNF", "omalizumabe"]
  },
  {
    id: "madp05", discipline: "mad", phase: "N2", topic: "Rinite alérgica", difficulty: 3,
    vignette: "Paciente de 23 anos com prurido nasal, coriza, espirros e obstrução nasal por rinite alérgica.",
    question: "Qual tratamento atua de forma MAIS AMPLA sobre todos os sintomas, por interferir em múltiplos pontos da cascata inflamatória?",
    options: [
      "Anti-histamínico H1, que bloqueia tanto mastócitos quanto eosinófilos",
      "Corticoide nasal, que reduz a inflamação em vários pontos (mastócitos, mediadores neoformados e eosinófilos)",
      "Anti-leucotrieno, que bloqueia o único mediador relevante na rinite",
      "Descongestionante nasal de uso contínuo",
      "Antibiótico tópico nasal"
    ],
    answer: 1,
    explanation: "O CORTICOIDE NASAL é o mais eficaz e amplo: reduz a inflamação alérgica em múltiplos níveis (recrutamento e ativação de eosinófilos, mediadores neoformados, edema), controlando obstrução, prurido, espirros e coriza. Anti-histamínicos atuam sobretudo na histamina (menos na obstrução); anti-leucotrienos são adjuvantes; descongestionante contínuo causa rinite medicamentosa.",
    tags: ["rinite", "corticoide nasal", "eosinófilo"]
  },
  {
    id: "madp06", discipline: "mad", phase: "N2", topic: "Doenças autoinflamatórias", difficulty: 3,
    vignette: "Em discussão de caso, questiona-se por que as síndromes autoinflamatórias diferem das doenças autoimunes clássicas.",
    question: "Qual alternativa descreve corretamente essa diferença fisiopatológica?",
    options: [
      "Autoinflamatórias são mediadas por linfócitos T autorreativos; autoimunes dependem da imunidade inata",
      "Autoinflamatórias decorrem de ativação descontrolada da imunidade INATA (ex.: via inflamassoma), sem autoanticorpos; autoimunes envolvem linfócitos T e B autorreativos",
      "Ambas produzem autoanticorpos e dependem de perda de tolerância central",
      "Autoimunes têm mutações em genes de citocinas; autoinflamatórias são por antígenos ambientais",
      "Não há diferença fisiopatológica entre elas"
    ],
    answer: 1,
    explanation: "Doenças AUTOINFLAMATÓRIAS (ex.: febre familiar do Mediterrâneo) resultam de ativação desregulada da imunidade INATA — muitas por disfunção do INFLAMASSOMA e excesso de IL-1 — SEM autoanticorpos nem autorreatividade de linfócitos. As AUTOIMUNES envolvem perda de tolerância com linfócitos T/B autorreativos e autoanticorpos. Distinção conceitual cobrada.",
    tags: ["autoinflamatória", "inflamassoma", "IL-1"]
  },
  {
    id: "madp07", discipline: "mad", phase: "N2", topic: "Espondiloartrites e HLA-B27", difficulty: 2,
    vignette: "Homem jovem com dor lombar inflamatória (pior em repouso, melhora com exercício), rigidez matinal prolongada e limitação progressiva da coluna.",
    question: "Sobre a espondilite anquilosante, assinale a correta:",
    options: [
      "Associa-se ao HLA-DR4 e cursa com FAN positivo",
      "Associa-se ao HLA-B27, com inflamação entesítica e fusão progressiva das sacroilíacas e da coluna",
      "É causada por autoanticorpos anti-dsDNA",
      "É uma vasculite de grandes vasos",
      "Acomete predominantemente pequenas articulações das mãos com anti-CCP positivo"
    ],
    answer: 1,
    explanation: "A espondilite anquilosante é uma espondiloartrite soronegativa (FAN/FR negativos) fortemente associada ao HLA-B27, com ENTESITE (inflamação da inserção de tendões/ligamentos), sacroileíte e anquilose progressiva ('coluna em bambu'). Anti-CCP e mãos são da artrite reumatoide; anti-dsDNA é do LES.",
    tags: ["espondilite", "HLA-B27", "entesite"]
  },
  {
    id: "madp08", discipline: "mad", phase: "N2", topic: "Artrite reumatoide", difficulty: 2,
    vignette: "Mulher de 45 anos com poliartrite simétrica de pequenas articulações das mãos, rigidez matinal > 1 h e erosões ósseas.",
    question: "Sobre a artrite reumatoide, é correto afirmar:",
    options: [
      "É mediada por linfócitos T CD4, macrófagos e citocinas (TNF-α, IL-1, IL-6), sendo o anti-CCP o marcador mais específico",
      "O fator reumatoide é 100% específico para a doença",
      "É uma doença autoinflamatória sem participação de linfócitos",
      "O anti-dsDNA é o autoanticorpo mais específico",
      "Não responde a terapia anti-TNF"
    ],
    answer: 0,
    explanation: "A AR é autoimune, mediada por CD4, macrófagos e citocinas pró-inflamatórias (TNF-α, IL-1, IL-6) → sinovite e erosão. O ANTI-CCP é o marcador mais ESPECÍFICO (o fator reumatoide é sensível, porém inespecífico). Responde a anti-TNF e outros biológicos. Anti-dsDNA é do LES.",
    tags: ["AR", "anti-CCP", "TNF"]
  },
  {
    id: "madp09", discipline: "mad", phase: "N2", topic: "Febre reumática", difficulty: 3,
    vignette: "Criança com poliartrite migratória, cardite e história de faringite por estreptococo semanas antes.",
    question: "O mecanismo imunológico da febre reumática é:",
    options: [
      "Hipersensibilidade tipo I mediada por IgE",
      "Mimetismo molecular entre antígenos do Streptococcus pyogenes e tecidos do hospedeiro (miocárdio e válvulas)",
      "Deficiência de complemento",
      "Infecção direta das válvulas pelo estreptococo",
      "Autoinflamação por disfunção do inflamassoma"
    ],
    answer: 1,
    explanation: "A febre reumática é uma reação autoimune por MIMETISMO MOLECULAR: anticorpos e linfócitos gerados contra o Streptococcus pyogenes (β-hemolítico do grupo A) reagem de forma cruzada com tecidos próprios — principalmente MIOCÁRDIO e VÁLVULAS cardíacas (valvulite → lesão mitral), articulações e SNC (coreia). Prevenção: tratar a faringite estreptocócica.",
    tags: ["febre reumática", "mimetismo", "estreptococo"]
  },

  /* ---- Terapêutica I (prova N2 — autonômico e antimicrobianos) ---- */
  {
    id: "terp01", discipline: "terap", phase: "N2", topic: "Farmacologia autonômica", difficulty: 3,
    vignette: "Mulher de 42 anos com hipertensão, distúrbios visuais e vômitos; VMA urinário aumentado e massa suprarrenal (feocromocitoma). Enquanto aguarda cirurgia, recebe um antagonista do receptor alfa-1 adrenérgico.",
    question: "Qual efeito desse fármaco produz a redução desejada da pressão arterial?",
    options: [
      "Diminuição da frequência cardíaca por aumento do influxo de cálcio",
      "Dilatação das arteríolas e das veias (bloqueio da vasoconstrição alfa-1)",
      "Redução da força de contração do miocárdio",
      "Dilatação seletiva dos vasos da musculatura esquelética",
      "Aumento da liberação de noradrenalina"
    ],
    answer: 1,
    explanation: "O receptor alfa-1 medeia a VASOCONSTRIÇÃO de arteríolas e veias. Bloqueá-lo (ex.: fentolamina/fenoxibenzamina, prazosina) causa VASODILATAÇÃO arterial e venosa → queda da resistência periférica e da PA. No feocromocitoma faz-se o bloqueio ALFA antes do beta (para evitar crise hipertensiva por estímulo alfa sem oposição).",
    tags: ["feocromocitoma", "alfa-1", "vasodilatação"]
  },
  {
    id: "terp02", discipline: "terap", phase: "N2", topic: "Farmacologia autonômica", difficulty: 2,
    vignette: "Homem de 42 anos com miastenia gravis melhora a força muscular ao usar um inibidor da acetilcolinesterase (ex.: piridostigmina).",
    question: "A base farmacológica dessa melhora é o aumento:",
    options: [
      "Da acetilcolina LIBERADA pelos neurônios motores",
      "Dos níveis de acetilcolina na fenda sináptica da junção neuromuscular (menor degradação)",
      "Do número de receptores de acetilcolina na junção",
      "Da noradrenalina liberada pelos nervos motores",
      "Do cálcio intracelular no músculo"
    ],
    answer: 1,
    explanation: "Na miastenia há redução dos receptores de ACh (autoanticorpos). O inibidor da ACETILCOLINESTERASE impede a degradação da ACh na fenda → mais ACh disponível por mais tempo para os receptores remanescentes → melhora a transmissão neuromuscular e a força. Ele NÃO aumenta a liberação nem cria novos receptores.",
    tags: ["miastenia", "anticolinesterásico", "ACh"]
  },
  {
    id: "terp03", discipline: "terap", phase: "N2", topic: "Antimicrobianos — escolha", difficulty: 3,
    vignette: "Criança de 6 anos com faringite (provável estreptococo, cocos gram-positivos) e história de reação alérgica grave à amoxicilina aos 3 anos. O médico prefere via oral.",
    question: "Qual classe é a mais apropriada em eficácia e segurança?",
    options: [
      "Cefalosporina (cefaclor)",
      "Macrolídeo (azitromicina)",
      "Tetraciclina (doxiciclina)",
      "Glicopeptídeo (vancomicina)",
      "Penicilina G benzatina intramuscular"
    ],
    answer: 1,
    explanation: "Faringite estreptocócica normalmente se trata com penicilina/amoxicilina, MAS há história de reação ALÉRGICA GRAVE a betalactâmico → evitá-los (há risco de reação cruzada com cefalosporinas, sobretudo de 1ª geração). O MACROLÍDEO (azitromicina) é a alternativa oral apropriada. Tetraciclina é contraindicada em crianças (dentes/ossos); vancomicina é EV e reservada.",
    tags: ["faringite", "alergia à penicilina", "macrolídeo"]
  },
  {
    id: "terp04", discipline: "terap", phase: "N2", topic: "Antimicrobianos — escolha", difficulty: 2,
    vignette: "Gestante no 7º mês, internada com pneumonia por Streptococcus pneumoniae (gram-positivo, não produtor de betalactamase).",
    question: "Qual a classe mais indicada e segura?",
    options: [
      "Tetraciclinas",
      "Penicilina (ex.: penicilina G / amoxicilina)",
      "Sulfonamidas",
      "Fluoroquinolonas",
      "Aminoglicosídeos"
    ],
    answer: 1,
    explanation: "Pneumococo não produtor de betalactamase é sensível à PENICILINA, que é o antibiótico de escolha e SEGURO na gestação (categoria favorável). Tetraciclinas e fluoroquinolonas são evitadas na gravidez (dentes/cartilagem); sulfonamidas têm restrições (kernicterus perto do termo). Escolha guiada por espectro + segurança.",
    tags: ["pneumonia", "penicilina", "gestação"]
  },
  {
    id: "terp05", discipline: "terap", phase: "N2", topic: "Farmacologia autonômica", difficulty: 3,
    vignette: "Comparação dos efeitos de noradrenalina e adrenalina sobre os vasos da musculatura esquelética.",
    question: "Assinale a afirmativa correta:",
    options: [
      "Apenas a noradrenalina dilata os vasos da musculatura esquelética, por agir em beta-2",
      "Apenas a adrenalina causa vasodilatação na musculatura esquelética, pois age em receptores beta-2 adrenérgicos",
      "Ambas causam vasoconstrição idêntica em todos os leitos",
      "A adrenalina só age em receptores alfa",
      "A noradrenalina é o único vasodilatador esplâncnico"
    ],
    answer: 1,
    explanation: "A ADRENALINA ativa receptores beta-2 (além de alfa e beta-1); nos vasos da musculatura esquelética, o efeito beta-2 predomina em doses fisiológicas → VASODILATAÇÃO. A NORADRENALINA tem afinidade beta-2 baixa, predominando o efeito alfa (vasoconstrição). Por isso a adrenalina pode reduzir a resistência periférica em baixas doses, e a noradrenalina eleva.",
    tags: ["adrenalina", "beta-2", "catecolaminas"]
  },

  /* ---- Introdução à Prática Cirúrgica (prova/simulado N1) ---- */
  {
    id: "cirp01", discipline: "cirurgia", phase: "N1", topic: "Antissepsia e assepsia", difficulty: 2,
    vignette: "No preparo pré-operatório, realiza-se antissepsia da pele do paciente para reduzir o risco de infecção do sítio cirúrgico.",
    question: "Sobre a antissepsia da pele, assinale a correta:",
    options: [
      "Elimina de forma total e definitiva toda a microbiota da pele",
      "Elimina a microbiota transitória, reduz a permanente e proporciona efeito residual antimicrobiano",
      "Remove apenas a microbiota permanente",
      "Só é indicada em cirurgias contaminadas",
      "Não tem efeito residual"
    ],
    answer: 1,
    explanation: "A antissepsia (ex.: clorexidina, PVPI) visa ELIMINAR a microbiota TRANSITÓRIA, REDUZIR a PERMANENTE (residente) e deixar EFEITO RESIDUAL (a clorexidina tem boa ação residual). Não há eliminação total/definitiva (a microbiota residente é difícil de erradicar). Aplica-se a todo procedimento, não só aos contaminados.",
    tags: ["antissepsia", "microbiota", "efeito residual"]
  },
  {
    id: "cirp02", discipline: "cirurgia", phase: "N1", topic: "Tempos cirúrgicos", difficulty: 1,
    vignette: "Os procedimentos são divididos em tempos operatórios.",
    question: "A etapa de separação/divisão dos tecidos para acessar a estrutura a ser tratada é a:",
    options: ["Hemostasia", "Diérese", "Síntese", "Exérese", "Antissepsia"],
    answer: 1,
    explanation: "DIÉRESE = divisão/separação dos tecidos (incisão) para acesso. Sequência: diérese → hemostasia → exérese (cirurgia propriamente dita) → síntese (reconstrução). Hemostasia controla sangramento; síntese aproxima/reconstrói.",
    tags: ["diérese", "tempos cirúrgicos"]
  },
  {
    id: "cirp03", discipline: "cirurgia", phase: "N1", topic: "Cicatrização", difficulty: 2,
    vignette: "Ferida cirúrgica com bordas bem aproximadas, mínima perda tecidual e sem infecção, cicatrizando rapidamente.",
    question: "Esse tipo de cicatrização é denominado:",
    options: [
      "Segunda intenção",
      "Primeira intenção",
      "Terceira intenção",
      "Cicatrização tardia por granulação",
      "Regeneração completa"
    ],
    answer: 1,
    explanation: "Bordas aproximadas + mínima perda + sem infecção = cicatrização por PRIMEIRA INTENÇÃO (rápida, pouca cicatriz). SEGUNDA intenção: ferida aberta que cicatriza por granulação (perda tecidual/contaminação). TERCEIRA intenção (primeira intenção tardia): ferida deixada aberta e suturada depois, quando o risco infeccioso reduz.",
    tags: ["primeira intenção", "cicatrização"]
  },
  {
    id: "cirp04", discipline: "cirurgia", phase: "N1", topic: "Cicatrização", difficulty: 3,
    vignette: "Paciente submetido a cirurgia abdominal; a ferida NÃO foi suturada inicialmente por contaminação local. Dias depois, reduzido o risco infeccioso, optou-se pelo fechamento cirúrgico das bordas.",
    question: "Esse tipo de cicatrização é:",
    options: [
      "Primeira intenção",
      "Primeira intenção tardia (terceira intenção)",
      "Segunda intenção",
      "Regeneração completa",
      "Cicatrização hipertrófica"
    ],
    answer: 1,
    explanation: "Ferida deixada ABERTA por contaminação e depois FECHADA (quando o leito melhora) = PRIMEIRA INTENÇÃO TARDIA, também chamada TERCEIRA intenção. Combina um período de granulação/controle da contaminação com o fechamento posterior das bordas.",
    tags: ["terceira intenção", "primeira intenção tardia"]
  },
  {
    id: "cirp05", discipline: "cirurgia", phase: "N1", topic: "Antissepsia e assepsia", difficulty: 2,
    vignette: "História da cirurgia e prevenção de infecções.",
    question: "Qual associação pioneiro × contribuição está CORRETA?",
    options: [
      "Louis Pasteur — criou as luvas cirúrgicas",
      "Joseph Lister — introduziu antissépticos no ambiente cirúrgico (ácido carbólico/fenol) para reduzir infecções",
      "Ignaz Semmelweis — desenvolveu a teoria da fermentação",
      "William Halsted — descobriu os antibióticos",
      "Robert Koch — criou a anestesia geral"
    ],
    answer: 1,
    explanation: "Joseph LISTER é o pai da antissepsia cirúrgica, ao usar ÁCIDO CARBÓLICO (fenol) para reduzir infecções. Semmelweis defendeu a lavagem das mãos (febre puerperal); Halsted introduziu as luvas cirúrgicas; Pasteur estabeleceu a teoria dos germes/fermentação. Associações históricas caem em prova.",
    tags: ["Lister", "história", "antissepsia"]
  },
  {
    id: "cirp06", discipline: "cirurgia", phase: "N1", topic: "Instrumental cirúrgico", difficulty: 2,
    vignette: "O instrumental cirúrgico é organizado por função (diérese, preensão, hemostasia, síntese, especiais).",
    question: "A pinça Allis é usada tipicamente para:",
    options: [
      "Hemostasia de vasos",
      "Preensão e tração de tecidos (preensão firme)",
      "Aproximação das bordas na sutura",
      "Corte de tecidos",
      "Fixação de campos estéreis à pele"
    ],
    answer: 1,
    explanation: "A pinça ALLIS é de PREENSÃO/tração de tecidos, segurando-os com firmeza (pode ser traumática). Hemostasia → pinças hemostáticas (Kelly, Halsted/mosquito). Síntese/sutura → porta-agulhas e pinça anatômica/dente de rato. Fixação de campos → pinça de campo (Backhaus). Conhecer os quadrantes do instrumental é cobrado.",
    tags: ["Allis", "preensão", "instrumental"]
  },
  {
    id: "cirp07", discipline: "cirurgia", phase: "N1", topic: "Áreas do centro cirúrgico", difficulty: 2,
    vignette: "Estudante entra no centro cirúrgico com pijama privativo, mas sem touca e máscara, alegando que são opcionais fora do campo.",
    question: "Sobre as áreas do CC e a paramentação, assinale a correta:",
    options: [
      "Na área irrestrita é obrigatório touca e máscara para todos",
      "Na área restrita (onde ocorre a cirurgia) são obrigatórios pijama privativo, touca e máscara",
      "Touca e máscara são opcionais em qualquer área",
      "A área semirrestrita não exige nenhuma paramentação",
      "O uso de máscara só é necessário para o cirurgião"
    ],
    answer: 1,
    explanation: "O CC divide-se em áreas IRRESTRITA (livre, roupa comum), SEMIRRESTRITA (circulação interna, exige pijama privativo e touca) e RESTRITA (salas cirúrgicas, exige pijama privativo, TOUCA e MÁSCARA). Portanto, na área restrita, touca e máscara NÃO são opcionais — reduzem a contaminação do ambiente/campo.",
    tags: ["centro cirúrgico", "áreas", "paramentação"]
  },

  /* ---- PIG V (prova) ---- */
  {
    id: "pigp01", discipline: "pig", phase: "N1", topic: "Financiamento em saúde", difficulty: 2,
    vignette: "Nos sistemas de saúde há três fontes de financiamento: governo, empresas e famílias. Parte do cuidado recai sobre o pagamento direto (do próprio bolso) das famílias.",
    question: "Em qual segmento a maior parte dos gastos vem do pagamento direto (out of pocket)?",
    options: [
      "Exames de imagem",
      "Medicamentos e artigos médicos",
      "Home care",
      "Próteses e órteses",
      "Internações hospitalares"
    ],
    answer: 1,
    explanation: "O segmento de MEDICAMENTOS e artigos médicos concentra a maior parte do gasto DIRETO das famílias (out of pocket), pois muitos itens não são cobertos pelo SUS nem pelos planos. Reconhecer as fontes de financiamento e onde recai o desembolso direto é conteúdo central de gestão.",
    tags: ["out of pocket", "medicamentos", "financiamento"]
  },
  {
    id: "pigp02", discipline: "pig", phase: "N1", topic: "SUS e regulação", difficulty: 1,
    vignette: "Sobre o objetivo comum da organização dos sistemas de saúde.",
    question: "Qual é esse objetivo, conforme a literatura de gestão?",
    options: [
      "Maximizar a eficiência das instituições",
      "Assegurar que as pessoas vivam mais e melhor, com o menor custo possível",
      "Aumentar a complexidade tecnológica dos serviços",
      "Garantir acesso apenas a determinados grupos sociais",
      "Ampliar o número de hospitais"
    ],
    answer: 1,
    explanation: "O objetivo dos sistemas de saúde é assegurar que as pessoas VIVAM MAIS E MELHOR com o MENOR CUSTO possível — equilibrando acesso, qualidade e sustentabilidade. Eficiência e tecnologia são meios, não o fim.",
    tags: ["sistemas de saúde", "objetivo"]
  },
  {
    id: "pigp03", discipline: "pig", phase: "N1", topic: "Linha de cuidado", difficulty: 2,
    vignette: "Na implantação de linhas de cuidado (ex.: depressão), a Portaria MS nº 4.279/2010 e os autores definem um aspecto crucial.",
    question: "Qual elemento é central para a implementação da Linha de Cuidado?",
    options: [
      "A atenção hospitalar como porta de entrada",
      "A Atenção Primária à Saúde (APS) como coordenadora do cuidado e ordenadora da rede",
      "Ofertas ambulatoriais amplas substituindo a APS",
      "A alta densidade tecnológica como eixo principal",
      "O pagamento direto pelas famílias"
    ],
    answer: 1,
    explanation: "A LINHA DE CUIDADO se organiza tendo a APS como COORDENADORA do cuidado e ORDENADORA da rede — garantindo continuidade, integralidade e o itinerário adequado do paciente entre os níveis de atenção. A APS é a base das Redes de Atenção à Saúde (Portaria 4.279/2010).",
    tags: ["linha de cuidado", "APS", "RAS"]
  },
  {
    id: "pigp04", discipline: "pig", phase: "N1", topic: "Financiamento em saúde", difficulty: 3,
    vignette: "Em 2015, o número de beneficiários de planos de saúde caiu de forma acentuada e não se recuperou.",
    question: "Qual a hipótese mais aceita para essa redução?",
    options: [
      "Ampliação do out of pocket por aumento da renda familiar",
      "Impacto duradouro da crise econômica sobre o emprego (planos empresariais) e a renda das famílias (planos individuais)",
      "Crescimento dos cartões populares de saúde substituindo os planos",
      "Migração para o SUS por melhora da rede pública",
      "Redução do número de operadoras por falência"
    ],
    answer: 1,
    explanation: "A queda de beneficiários a partir de 2015 é atribuída principalmente à CRISE ECONÔMICA: o desemprego reduziu os planos EMPRESARIAIS (a maior parte da carteira é coletiva/empresarial) e a queda de renda reduziu os planos INDIVIDUAIS. O vínculo emprego-plano explica a sensibilidade do setor ao mercado de trabalho.",
    tags: ["beneficiários", "crise", "planos"]
  },

  /* ---- Medicina Legal (processual/ética) ---- */
  {
    id: "legp01", discipline: "legal", phase: "N2", topic: "Ética / documentos", difficulty: 2,
    vignette: "Discussão sobre documentos médicos e responsabilidade profissional.",
    question: "Assinale a afirmativa CORRETA sobre atestados e ética médica:",
    options: [
      "É ético o médico fornecer atestado de complacência (sem exame/veracidade) a pedido do paciente",
      "O atestado médico é ato médico que deve ser verdadeiro; atestado falso configura infração ética e crime",
      "O médico pode atestar óbito de paciente que nunca examinou, livremente",
      "O sigilo médico impede sempre a emissão de qualquer atestado",
      "O prontuário pertence exclusivamente ao médico e pode ser destruído após a alta"
    ],
    answer: 1,
    explanation: "O atestado é ATO MÉDICO e deve ser VERDADEIRO. Atestado FALSO ou de COMPLACÊNCIA (sem correspondência com a realidade) é infração ética (Código de Ética Médica) e pode configurar CRIME (falsidade). O prontuário pertence ao paciente e deve ser guardado pelo prazo legal, não destruído.",
    tags: ["atestado", "ética", "falsidade"]
  },

  /* ---- RCI V (casos) ---- */
  {
    id: "rcip01", discipline: "rci", phase: "N2", topic: "Hepatite medicamentosa", difficulty: 3,
    vignette: "Paciente inicia novo fármaco e, semanas depois, apresenta icterícia, ALT/AST muito elevadas e INR alargado, sem obstrução biliar à imagem. Suspeita-se de lesão hepática induzida por droga (DILI).",
    question: "Qual a primeira conduta e o parâmetro de gravidade?",
    options: [
      "Manter o fármaco e observar; a fosfatase alcalina indica gravidade",
      "Suspender imediatamente o fármaco suspeito; o INR/tempo de protrombina (função de síntese) indica gravidade",
      "Aumentar a dose do fármaco para induzir tolerância",
      "Iniciar antibiótico de amplo espectro",
      "Solicitar apenas sorologias e liberar o paciente"
    ],
    answer: 1,
    explanation: "Na hepatite medicamentosa (DILI), a conduta inicial é SUSPENDER o agente suspeito. O padrão é HEPATOCELULAR (ALT/AST↑↑) e a GRAVIDADE se mede pela função de SÍNTESE — INR/TP alargado e bilirrubina (Lei de Hy: hepatocelular + icterícia = pior prognóstico). A FA marca colestase, não a gravidade hepatocelular.",
    tags: ["DILI", "suspender fármaco", "INR"]
  },

  /* ==================== PROVAS EM IMAGEM (fotos das provas) ==================== */

  /* ---- Medicina Legal (prova impressa) ---- */
  {
    id: "legf01", discipline: "legal", phase: "N1", topic: "Traumatologia forense", difficulty: 2,
    vignette: "Perícia descreve lesão de comprimento maior que a profundidade, com bordas lineares regulares, superfícies internas lisas e hemorragia abundante.",
    question: "Essa lesão foi produzida, com maior probabilidade, por agente:",
    options: ["Perfurante", "Cortante (produz ferida incisa)", "Contundente", "Perfuro-contundente", "Corto-contundente"],
    answer: 1,
    explanation: "Comprimento > profundidade, bordas lineares/regulares, paredes internas lisas e sangramento abundante = ferida INCISA, produzida por agente CORTANTE (com gume). Perfurante faz orifício (profundidade > extensão); contundente dá bordas irregulares com pontes; corto-contundente (gume+peso) esmaga e corta.",
    tags: ["ferida incisa", "cortante", "traumatologia"]
  },
  {
    id: "legf02", discipline: "legal", phase: "N1", topic: "Traumatologia forense", difficulty: 3,
    vignette: "Vítima de acidente com linha de cerol sofre lesão incisa profunda na região ANTERIOR do pescoço.",
    question: "Segundo a traumatologia forense, essa lesão constitui um(a):",
    options: ["Degolamento", "Esgorjamento", "Decapitação", "Enforcamento", "Esganadura"],
    answer: 1,
    explanation: "ESGORJAMENTO = ferida incisa/cortante na região ANTERIOR do pescoço (corta vasos, laringe/traqueia). DEGOLAMENTO é na região POSTERIOR/lateral (nuca). DECAPITAÇÃO é a separação completa da cabeça. Enforcamento e esganadura são asfixias mecânicas (constrição do pescoço), não feridas incisas.",
    tags: ["esgorjamento", "pescoço", "traumatologia"]
  },
  {
    id: "legf03", discipline: "legal", phase: "N1", topic: "Traumatologia forense", difficulty: 3,
    vignette: "Sobre o espectro (evolução das cores) da equimose.",
    question: "Assinale a alternativa correta:",
    options: [
      "Sequência avermelhado → esverdeado → arroxeado → azulado → amarelado; útil para avaliar a profundidade",
      "Sequência avermelhado → arroxeado → azulado → esverdeado → amarelado; útil para estimar a IDADE (data) da lesão",
      "Sequência avermelhado → azulado → arroxeado → esverdeado → amarelado; útil para a gravidade",
      "As cores não têm relação com o tempo",
      "A equimose é sempre da mesma cor, independentemente do tempo"
    ],
    answer: 1,
    explanation: "O ESPECTRO EQUIMÓTICO (de Legrand du Saulle) evolui: avermelhado → arroxeado → azulado → esverdeado (biliverdina) → amarelado (bilirrubina/hemossiderina). Serve para estimar a IDADE (tempo) da lesão — importante na datação médico-legal. Não indica profundidade nem gravidade.",
    tags: ["equimose", "espectro", "datação"]
  },
  {
    id: "legf04", discipline: "legal", phase: "N1", topic: "Traumatologia forense", difficulty: 2,
    vignette: "Escoriação, equimose, edema e hematoma são achados frequentes em ferimentos contusos.",
    question: "Quais destes NÃO resultam de rotura de vasos e hemorragia?",
    options: ["Equimose e hematoma", "Edema e escoriação", "Edema e hematoma", "Escoriação e equimose", "Escoriação e hematoma"],
    answer: 1,
    explanation: "EQUIMOSE e HEMATOMA são coleções de sangue (rotura vascular + hemorragia). Já o EDEMA é acúmulo de líquido (não sangue) e a ESCORIAÇÃO é arrancamento da epiderme (não depende de hemorragia). Logo, edema e escoriação não decorrem de rotura vascular.",
    tags: ["contusão", "escoriação", "edema"]
  },
  {
    id: "legf05", discipline: "legal", phase: "N1", topic: "Lesões perfurocontusas", difficulty: 3,
    vignette: "Ferimento por projétil de arma de fogo (PAF).",
    question: "Qual dos achados NÃO é produzido pela ação direta do PROJÉTIL?",
    options: [
      "Orifício de entrada",
      "Câmara de mina de Hofmann (produzida pelos gases em tiro encostado)",
      "Orla de escoriação",
      "Orla de enxugo",
      "Aréola equimótica"
    ],
    answer: 1,
    explanation: "A orla de escoriação, a orla de enxugo (limpeza do projétil) e a aréola equimótica são feitas pela passagem do PROJÉTIL no orifício de ENTRADA. A CÂMARA DE MINA DE HOFMANN resulta da ação dos GASES da deflagração em tiros ENCOSTADOS (descolam e explodem os tecidos), não da ação direta do projétil.",
    tags: ["PAF", "câmara de mina", "orla de enxugo"]
  },
  {
    id: "legf06", discipline: "legal", phase: "N1", topic: "Lesões perfurocontusas", difficulty: 3,
    vignette: "Discussão pericial sobre distância do disparo em ferimento por arma de fogo.",
    question: "Assinale a afirmativa CORRETA:",
    options: [
      "O orifício de saída é sempre maior que o de entrada",
      "A ausência de zona de tatuagem NÃO é prova definitiva de que o tiro não foi a curta distância (ex.: anteparo/roupa pode retê-la)",
      "A zona de tatuagem (grãos de pólvora incrustados) é facilmente removível com água e detergente",
      "A orla de contusão não se forma em tiros encostados",
      "A câmara de mina prova que o tiro foi a longa distância"
    ],
    answer: 1,
    explanation: "A ZONA DE TATUAGEM (grãos de pólvora incrustados) indica tiro a curta distância, mas sua AUSÊNCIA não exclui curta distância — roupas/anteparos podem reter os resíduos. A tatuagem verdadeira NÃO sai com água (é incrustada; o que sai é o esfumaçamento/'falsa tatuagem'). O orifício de saída nem sempre é maior. A câmara de mina indica tiro ENCOSTADO (curtíssima distância).",
    tags: ["tatuagem", "distância", "PAF"]
  },
  {
    id: "legf07", discipline: "legal", phase: "N1", topic: "Traumatologia forense", difficulty: 2,
    vignette: "No prontuário, descreve-se: lesão avermelhada/equimótica de 5x2 cm no lábio inferior, de bordas regulares e planas, recente, com orla de escoriação.",
    question: "O tipo de lesão e o agente causador são:",
    options: [
      "Ferida incisa; agente cortante",
      "Lesão contusa (rubefação/equimose); agente contundente",
      "Ferida perfuroincisa; agente com ponta e gume",
      "Queimadura; agente térmico",
      "Ferida perfurocontusa; projétil de arma de fogo"
    ],
    answer: 1,
    explanation: "Rubefação/equimose com orla de escoriação e sem corte limpo caracterizam LESÃO CONTUSA, produzida por agente CONTUNDENTE (superfície romba, sem gume nem ponta), por mecanismo de pressão/deslizamento. Descrever objetivamente (tipo, dimensão, localização, bordas, cor, sinais vitais) é a base do laudo em prontuário.",
    tags: ["lesão contusa", "contundente", "laudo"]
  },

  /* ---- APS (prova) e Prática Clínica (caso de imagem) ---- */
  {
    id: "apsf01", discipline: "aps", phase: "N2", topic: "Documentos ocupacionais", difficulty: 2,
    vignette: "Após a avaliação médica ocupacional periódica, é preciso registrar formalmente se o trabalhador está apto ou inapto para a função.",
    question: "Qual documento registra a aptidão do trabalhador nessa avaliação?",
    options: [
      "CAT — Comunicação de Acidente de Trabalho",
      "ASO — Atestado de Saúde Ocupacional",
      "SINAN",
      "Receita médica",
      "PPRA"
    ],
    answer: 1,
    explanation: "O ASO (Atestado de Saúde Ocupacional) é emitido nos exames ocupacionais (admissional, periódico, demissional, de retorno e de mudança de função) e registra se o trabalhador está APTO ou INAPTO. A CAT formaliza acidente/doença do trabalho; o SINAN é a notificação de agravos. Diferenciar os documentos ocupacionais é cobrado.",
    tags: ["ASO", "aptidão", "exame ocupacional"]
  },
  {
    id: "praf01", discipline: "pratica", phase: "N2", topic: "Vesícula e vias biliares", difficulty: 3,
    vignette: "Mulher acima de 40 anos, multípara e obesa, com dor em cólica no hipocôndrio direito após alimentação gordurosa, náuseas e vômitos. Ultrassom mostra imagem hiperecogênica com sombra acústica na vesícula.",
    question: "O diagnóstico e DUAS complicações possíveis são:",
    options: [
      "Hepatite viral; cirrose e varizes",
      "Colelitíase (cálculo biliar); pode complicar com pancreatite aguda biliar e coledocolitíase/colangite",
      "Câncer gástrico; metástase e obstrução",
      "Úlcera duodenal; perfuração e estenose",
      "Apendicite; abscesso e peritonite"
    ],
    answer: 1,
    explanation: "Perfil '4 F' (female, forty, fat, fertile) + cólica biliar pós-gordura + cálculo com sombra acústica ao USG = COLELITÍASE. Complicações: colecistite aguda, migração do cálculo ao colédoco (COLEDOCOLITÍASE) → obstrução, icterícia, COLANGITE, e PANCREATITE AGUDA BILIAR (cálculo na ampola de Vater). Caso clássico de imagem em prática clínica.",
    tags: ["colelitíase", "pancreatite biliar", "coledocolitíase"]
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
  { id: "f-mad15", discipline: "mad", phase: "N1", front: "Perfis Th (CD4) e suas citocinas", back: "Th1: IFN-γ (macrófagos, intracelulares). Th2: IL-4/5/13 (IgE, eosinófilos, helmintos/alergia). Th17: IL-17 (neutrófilos, fungos, autoimunidade). Treg: IL-10/TGF-β (tolerância)." },
  { id: "f-mad16", discipline: "mad", phase: "N1", front: "MHC I vs II — regra de apresentação", back: "MHC I (todas as células): antígeno ENDÓGENO → CD8 citotóxico. MHC II (APCs): antígeno EXÓGENO → CD4 helper. 'CD8×I, CD4×II'." },
  { id: "f-mad17", discipline: "mad", phase: "N1", front: "Complemento — funções por fragmento", back: "C3b: opsonização. C3a/C5a: anafilotoxinas (C5a = quimiotaxia). C5b-C9: MAC (lise). Deficiência C5-C9 → Neisseria." },
  { id: "f-mad18", discipline: "mad", phase: "N1", front: "Classes de imunoglobulinas", back: "IgM: 1ª da resposta (aguda), ativa complemento. IgG: memória, cruza placenta. IgA: mucosas. IgE: mastócito (alergia/parasita). IgD: BCR naive." },
  { id: "f-mad19", discipline: "mad", phase: "N2", front: "Anticorpo anti-receptor: Graves vs Miastenia", back: "Graves: anti-TRAB ESTIMULA o receptor de TSH → hipertireoidismo. Miastenia: anti-AChR BLOQUEIA/destrói o receptor de acetilcolina → fraqueza fatigável." },
  { id: "f-mad20", discipline: "mad", phase: "N2", front: "Doença do soro (tipo III) — pista", back: "Dias após antígeno (soro/fármaco): febre, urticária, artralgia, proteinúria. Imunocomplexos depositam em vasos/rim/articulação + complemento." },

  { id: "f-pat10", discipline: "pratica", phase: "N1", front: "Adenocarcinoma gástrico: intestinal vs difuso (Lauren)", back: "Intestinal: forma glândulas, H. pylori/Correa, melhor prognóstico. Difuso: anel de sinete, linite plástica, perda de E-caderina (CDH1), pior prognóstico." },
  { id: "f-pat11", discipline: "pratica", phase: "N1", front: "Doença celíaca — histologia e sorologia", back: "Atrofia de vilosidades + hiperplasia de criptas + linfocitose intraepitelial. Anti-transglutaminase/antiendomísio. HLA-DQ2/DQ8. Trata com dieta sem glúten." },
  { id: "f-pat12", discipline: "pratica", phase: "N1", front: "Sequência adenoma-carcinoma (cólon)", back: "Adenoma (viloso, >1 cm = mais risco) → carcinoma. Mutações: APC → KRAS → TP53. Polipectomia previne o câncer colorretal." },
  { id: "f-pat13", discipline: "pratica", phase: "N2", front: "Sinal de Courvoisier", back: "Vesícula palpável e INDOLOR + icterícia obstrutiva = obstrução maligna da via biliar distal (ex.: câncer de cabeça de pâncreas), não litíase." },
  { id: "f-pat14", discipline: "pratica", phase: "N2", front: "Complicações da hipertensão portal", back: "Varizes esofagogástricas (hematêmese), ascite, circulação colateral (cabeça de medusa), esplenomegalia, PBE, encefalopatia, síndrome hepatorrenal." },
  { id: "f-pat15", discipline: "pratica", phase: "N2", front: "Carcinomas da tireoide", back: "Papilífero: mais comum, psammoma/vidro fosco, linfático, bom prognóstico. Folicular: hematogênico. Medular: calcitonina (células C). Anaplásico: letal." },
  { id: "f-pat16", discipline: "pratica", phase: "N2", front: "AVC isquêmico vs hemorrágico na TC", back: "Isquêmico (~85%): TC precoce normal, hipodensidade em horas. Hemorrágico: HIPERdenso imediato. TC inicial serve p/ excluir sangramento antes de trombólise." },
  { id: "f-sem01", discipline: "pratica", phase: "N2", front: "Manobras semiológicas × sistema", back: "Murphy: colecistite. Blumberg: peritônio (apendicite). Giordano: rim (pielonefrite). Macicez móvel/piparote: ascite." },

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

  /* ---- Flashcards dos materiais/provas (Mandic) ---- */
  { id: "f-madp1", discipline: "mad", phase: "N1", front: "Disfunção endotelial na sepse", back: "Endotélio ativado/lesado → expressa fator tecidual (pró-coagulante) + ↑permeabilidade → CID (microtrombos) e choque distributivo." },
  { id: "f-madp2", discipline: "mad", phase: "N1", front: "Imunoedição (3 E's)", back: "Eliminação → Equilíbrio → Escape. Tumor evade por perda de MHC-I, PD-L1, Treg. Base da imunoterapia." },
  { id: "f-madp3", discipline: "mad", phase: "N2", front: "Autoinflamatória vs autoimune", back: "Autoinflamatória: imunidade INATA (inflamassoma, IL-1), SEM autoanticorpos. Autoimune: linfócitos T/B autorreativos + autoanticorpos." },
  { id: "f-madp4", discipline: "mad", phase: "N2", front: "Espondilite anquilosante", back: "HLA-B27, entesite, sacroileíte, anquilose da coluna ('bambu'). Soronegativa (FAN/FR negativos). Dor lombar inflamatória (melhora com exercício)." },
  { id: "f-madp5", discipline: "mad", phase: "N2", front: "Artrite reumatoide — marcadores", back: "Anti-CCP = mais ESPECÍFICO. FR = sensível, inespecífico. Citocinas: TNF-α, IL-1, IL-6. Poliartrite simétrica de pequenas articulações." },
  { id: "f-madp6", discipline: "mad", phase: "N2", front: "Febre reumática — mecanismo", back: "Mimetismo molecular pós-Streptococcus pyogenes: valvulite (mitral), poliartrite migratória, coreia. Prevenir tratando a faringite." },
  { id: "f-terp1", discipline: "terap", phase: "N2", front: "Receptores adrenérgicos — efeitos", back: "α1: vasoconstrição. β1: coração (↑FC/força). β2: broncodilatação + vasodilatação musc. esquelética. Adrenalina age em β2; noradrenalina, não." },
  { id: "f-terp2", discipline: "terap", phase: "N2", front: "Feocromocitoma — ordem do bloqueio", back: "Bloquear ALFA (fenoxibenzamina) ANTES do beta — evita crise hipertensiva por estímulo alfa sem oposição. Antagonista α1 dilata arteríolas e veias." },
  { id: "f-terp3", discipline: "terap", phase: "N2", front: "Anticolinesterásico na miastenia", back: "Piridostigmina inibe a acetilcolinesterase → ↑ACh na fenda → mais estímulo dos receptores remanescentes → melhora a força." },
  { id: "f-terp4", discipline: "terap", phase: "N2", front: "Antibiótico: alergia à penicilina", back: "Alergia GRAVE a betalactâmico → macrolídeo (azitromicina). Evitar cefalosporina (reação cruzada). Gestante/criança: evitar tetraciclina e fluoroquinolona." },
  { id: "f-cirp1", discipline: "cirurgia", phase: "N1", front: "Objetivo da antissepsia da pele", back: "Eliminar microbiota TRANSITÓRIA, reduzir a PERMANENTE e deixar EFEITO RESIDUAL (ex.: clorexidina). Não elimina tudo." },
  { id: "f-cirp2", discipline: "cirurgia", phase: "N1", front: "Tipos de cicatrização (intenção)", back: "1ª: bordas aproximadas, limpa. 2ª: aberta, granulação (perda/contaminação). 3ª (1ª tardia): aberta e suturada depois." },
  { id: "f-cirp3", discipline: "cirurgia", phase: "N1", front: "Áreas do centro cirúrgico", back: "Irrestrita (livre) · Semirrestrita (pijama+touca) · Restrita (pijama+touca+MÁSCARA = salas cirúrgicas)." },
  { id: "f-cirp4", discipline: "cirurgia", phase: "N1", front: "Instrumental por função", back: "Diérese (bisturi/tesoura); preensão (Allis, dente de rato); hemostasia (Kelly/mosquito); síntese (porta-agulhas); campos (Backhaus)." },
  { id: "f-cirp5", discipline: "cirurgia", phase: "N1", front: "Pioneiros da cirurgia", back: "Lister: antissepsia (ácido carbólico). Semmelweis: lavagem das mãos. Halsted: luvas cirúrgicas. Pasteur: teoria dos germes." },
  { id: "f-pigp1", discipline: "pig", phase: "N1", front: "Out of pocket — onde recai", back: "Maior parte do pagamento direto das famílias está em MEDICAMENTOS e artigos médicos (não cobertos por SUS/plano)." },
  { id: "f-pigp2", discipline: "pig", phase: "N1", front: "Queda de beneficiários pós-2015", back: "Crise econômica: desemprego reduz planos EMPRESARIAIS (coletivos) e queda de renda reduz os INDIVIDUAIS." },
  { id: "f-legp1", discipline: "legal", phase: "N2", front: "Atestado de complacência", back: "Atestado falso/sem exame = infração ética (CEM) e pode ser crime (falsidade). Atestado é ato médico e deve ser verdadeiro." },

  /* ---- Flashcards das provas em imagem ---- */
  { id: "f-legf1", discipline: "legal", phase: "N1", front: "Espectro equimótico (cores × tempo)", back: "Avermelhado → arroxeado → azulado → esverdeado → amarelado. Serve para estimar a IDADE (data) da lesão." },
  { id: "f-legf2", discipline: "legal", phase: "N1", front: "Sinais contusos: hemorrágicos ou não", back: "Hemorrágicos (rotura de vaso): equimose e hematoma. NÃO hemorrágicos: edema (líquido) e escoriação (arrancamento da epiderme)." },
  { id: "f-legf3", discipline: "legal", phase: "N1", front: "Esgorjamento × degolamento × decapitação", back: "Esgorjamento: ferida incisa ANTERIOR do pescoço. Degolamento: POSTERIOR/nuca. Decapitação: separação completa da cabeça." },
  { id: "f-legf4", discipline: "legal", phase: "N1", front: "Câmara de mina de Hofmann", back: "Descolamento explosivo dos tecidos pelos GASES em tiro ENCOSTADO (não pela ação do projétil). Indica curtíssima distância." },
  { id: "f-legf5", discipline: "legal", phase: "N1", front: "Tatuagem vs esfumaçamento (PAF)", back: "Tatuagem: grãos de pólvora INCRUSTADOS (não sai com água). Esfumaçamento ('falsa tatuagem'): fuligem que SAI com água. Ausência de tatuagem não exclui curta distância." },
  { id: "f-apsf1", discipline: "aps", phase: "N2", front: "ASO — Atestado de Saúde Ocupacional", back: "Registra APTO/INAPTO nos exames ocupacionais (admissional, periódico, demissional, retorno, mudança de função). Diferente da CAT (acidente) e do SINAN (notificação)." },
  { id: "f-praf1", discipline: "pratica", phase: "N2", front: "Colelitíase — perfil e complicações", back: "'4 F' (female, forty, fat, fertile), cólica pós-gordura, cálculo com sombra acústica ao USG. Complica: colecistite, coledocolitíase/colangite, pancreatite biliar." },
];

/* ============================ CRONOGRAMA (liberação por semana) ============================
   Preencha quando sair o cronograma oficial das aulas (início de agosto).
   - active: mude para true para ligar o modo semanal no Plano.
   - startDate: 1ª segunda-feira de aula (formato "AAAA-MM-DD").
   - weeks[].inicio: data em que a semana LIBERA (a partir dela dá para marcar/estudar os temas).
   - cada aula: { disc, topic (igual ao do plano), preAula (o que estudar ANTES da aula), data opcional }.
   Enquanto weeks estiver vazio, o Plano funciona por disciplina (modo atual).
   Guia completo em COMO-ADICIONAR-QUESTOES.md.
   =========================================================================================== */
const CRONOGRAMA = {
  active: false,
  startDate: "",
  weeks: [
    /* EXEMPLO — apague e preencha com o cronograma real:
    { n:1, inicio:"2026-08-04", rotulo:"Semana 1 (04–08/ago)", aulas:[
      { disc:"mad",   topic:"Imunidade inata vs adaptativa", preAula:"Ler o resumo do tema e listar 3 diferenças inata x adaptativa antes da aula." },
      { disc:"terap", topic:"Farmacocinética — meia-vida",   preAula:"Revisar o que é meia-vida e steady state; trazer 1 dúvida." },
      { disc:"pratica", topic:"Patologia do esôfago",        preAula:"Ver os fatores de risco de escamoso x adenocarcinoma." },
    ]},
    { n:2, inicio:"2026-08-11", rotulo:"Semana 2 (11–15/ago)", aulas:[
      { disc:"mad", topic:"Classes de anticorpos", preAula:"Memorizar as 5 classes de Ig e uma função de cada." },
    ]},
    */
  ],
};

/* ============================ MÓDULO DE IMAGENS (reconhecimento visual) ============================
   "Bata o olho e diga o diagnóstico". Cada card mostra os ACHADOS característicos (o que reconhecer)
   e, quando útil, um ESQUEMA original (svg). Para usar SUAS próprias imagens (dos seus slides),
   coloque o arquivo em medquest/img/ e preencha "src" (ex.: src:"img/psammoma.jpg").
   OBS: não publique imagens de terceiros com direitos autorais em repositório público.
   ==================================================================================================== */
const IMG = {}; // esquemas SVG originais (reutilizáveis)
IMG.anelSinete = `<svg viewBox="0 0 120 120" role="img"><circle cx="60" cy="62" r="42" fill="#22314f" stroke="#8b5cf6" stroke-width="2"/><circle cx="60" cy="58" r="30" fill="#0d1428"/><path d="M60 88 a30 30 0 0 1 -26 -15 a42 42 0 0 0 52 0 a30 30 0 0 1 -26 15z" fill="#b06cff"/><text x="60" y="112" fill="#8ea0c4" font-size="9" text-anchor="middle">núcleo em crescente na periferia</text></svg>`;
IMG.psammoma = `<svg viewBox="0 0 120 120" role="img"><g fill="none" stroke="#b06cff" stroke-width="2"><circle cx="55" cy="55" r="10"/><circle cx="55" cy="55" r="18"/><circle cx="55" cy="55" r="26"/><circle cx="55" cy="55" r="34"/></g><circle cx="55" cy="55" r="4" fill="#7c8cff"/><text x="60" y="112" fill="#8ea0c4" font-size="9" text-anchor="middle">calcificação lamelar concêntrica</text></svg>`;
IMG.vilosidade = `<svg viewBox="0 0 200 120" role="img"><text x="50" y="14" fill="#34d399" font-size="9" text-anchor="middle">normal</text><text x="150" y="14" fill="#fb7185" font-size="9" text-anchor="middle">atrofia</text><g stroke="#8ea0c4" fill="none" stroke-width="2"><path d="M15 90 q6 -50 12 0 q6 -50 12 0 q6 -50 12 0 q6 -50 12 0 q6 -50 12 0"/></g><line x1="12" y1="90" x2="90" y2="90" stroke="#8ea0c4" stroke-width="2"/><line x1="112" y1="86" x2="188" y2="86" stroke="#fb7185" stroke-width="3"/><g stroke="#fb7185" stroke-width="1.5"><line x1="120" y1="86" x2="120" y2="98"/><line x1="135" y1="86" x2="135" y2="102"/><line x1="150" y1="86" x2="150" y2="98"/><line x1="165" y1="86" x2="165" y2="102"/></g><text x="150" y="116" fill="#8ea0c4" font-size="8" text-anchor="middle">mucosa plana + criptas</text></svg>`;
IMG.appleCore = `<svg viewBox="0 0 120 140" role="img"><path d="M45 10 h30 v45 q-15 12 -15 12 q0 0 -15 -12 z" fill="#e8edf7"/><path d="M45 130 h30 v-45 q-15 -12 -15 -12 q0 0 -15 12 z" fill="#e8edf7"/><path d="M52 66 q8 6 16 0" fill="none" stroke="#fb7185" stroke-width="2"/><path d="M52 74 q8 -6 16 0" fill="none" stroke="#fb7185" stroke-width="2"/><text x="60" y="138" fill="#8ea0c4" font-size="9" text-anchor="middle">estenose 'em maçã mordida'</text></svg>`;
IMG.pneumoperitonio = `<svg viewBox="0 0 140 110" role="img"><rect x="0" y="0" width="140" height="110" fill="#0d1428"/><path d="M20 60 q50 -40 100 0" fill="#22314f" stroke="#8ea0c4" stroke-width="2"/><path d="M20 60 q50 -22 100 0 q-50 -10 -100 0z" fill="#0b1020" stroke="#fb7185" stroke-width="1.5"/><text x="70" y="52" fill="#fb7185" font-size="9" text-anchor="middle">ar</text><text x="70" y="102" fill="#8ea0c4" font-size="9" text-anchor="middle">ar sob a cúpula diafragmática</text></svg>`;
IMG.groundGlass = `<svg viewBox="0 0 120 120" role="img"><g fill="#22314f" stroke="#8b5cf6" stroke-width="1.5"><ellipse cx="45" cy="50" rx="16" ry="12"/><ellipse cx="78" cy="62" rx="16" ry="12"/><ellipse cx="55" cy="80" rx="16" ry="12"/></g><g stroke="#0d1428" stroke-width="2"><line x1="45" y1="40" x2="45" y2="60"/><line x1="78" y1="52" x2="78" y2="72"/></g><text x="60" y="112" fill="#8ea0c4" font-size="8" text-anchor="middle">núcleos claros com fenda (vidro fosco)</text></svg>`;

const IMAGES = [
  /* ---- Histologia / Patologia ---- */
  { id:"img01", discipline:"pratica", area:"Histologia", svg:IMG.anelSinete,
    findings:"Micrografia: células com grande vacúolo de muco intracitoplasmático que empurra o núcleo achatado para a periferia, infiltrando difusamente a parede gástrica.",
    answer:"Adenocarcinoma gástrico DIFUSO (células em anel de sinete)",
    explanation:"Células em anel de sinete + infiltração difusa (linite plástica) = tipo DIFUSO de Lauren, com perda de E-caderina (CDH1), pior prognóstico e mais em jovens. O tipo intestinal forma glândulas e liga-se à cascata de Correa (H. pylori)." },
  { id:"img02", discipline:"pratica", area:"Histologia", svg:IMG.vilosidade,
    findings:"Biópsia duodenal: mucosa com achatamento/atrofia das vilosidades, hiperplasia das criptas e aumento de linfócitos intraepiteliais.",
    answer:"Doença celíaca (atrofia vilositária)",
    explanation:"Atrofia de vilosidades + hiperplasia de criptas + linfocitose intraepitelial, com anti-transglutaminase positivo e HLA-DQ2/DQ8. A perda de superfície absortiva causa má absorção. Tratamento: dieta sem glúten." },
  { id:"img03", discipline:"pratica", area:"Histologia", svg:IMG.psammoma,
    findings:"Micrografia da tireoide: estruturas de calcificação em camadas concêntricas (lamelar) e núcleos claros com fendas e pseudoinclusões.",
    answer:"Carcinoma papilífero da tireoide",
    explanation:"Corpos de PSAMMOMA (calcificação concêntrica) + núcleos em 'vidro fosco' com grooves são marcas do carcinoma PAPILÍFERO — o mais comum, de disseminação linfática e bom prognóstico." },
  { id:"img04", discipline:"pratica", area:"Histologia", svg:IMG.groundGlass,
    findings:"Aspirado/biópsia de nódulo tireoidiano: núcleos aumentados, pálidos ('vidro fosco'), com fendas longitudinais (grooves) e pseudoinclusões nucleares.",
    answer:"Carcinoma papilífero (núcleos em vidro fosco)",
    explanation:"As alterações NUCLEARES (não a arquitetura) definem o papilífero: núcleos claros em vidro fosco, fendas e pseudoinclusões, além dos corpos de psammoma. Achado clássico de patologia da tireoide." },
  { id:"img05", discipline:"pratica", area:"Histologia",
    findings:"Mucosa intestinal com inflamação transmural, agregados linfoides e GRANULOMAS não caseosos, com áreas acometidas alternadas com mucosa normal (salteado).",
    answer:"Doença de Crohn",
    explanation:"Inflamação transmural + granulomas não caseosos + acometimento salteado ('paralelepípedo') = CROHN. A retocolite ulcerativa é contínua, limitada à mucosa/submucosa e sem granulomas." },
  { id:"img06", discipline:"pratica", area:"Histologia",
    findings:"Fígado com esteatose macrovesicular, hepatócitos balonizados e inclusões eosinofílicas intracitoplasmáticas (corpúsculos de Mallory-Denk), com infiltrado inflamatório.",
    answer:"Esteato-hepatite (NASH ou alcoólica)",
    explanation:"Esteatose + balonização + corpúsculos de Mallory-Denk + inflamação = ESTEATO-HEPATITE. No contexto de síndrome metabólica sem álcool = NASH; pode progredir para fibrose, cirrose e CHC." },
  { id:"img07", discipline:"pratica", area:"Histologia",
    findings:"Fígado com nódulos de hepatócitos regenerativos circundados por septos de fibrose que distorcem a arquitetura lobular.",
    answer:"Cirrose hepática",
    explanation:"Nódulos regenerativos + fibrose em ponte com distorção arquitetural = CIRROSE (via final de lesão crônica: álcool, hepatites B/C, NASH). Base das complicações (hipertensão portal, CHC)." },
  { id:"img08", discipline:"pratica", area:"Histologia",
    findings:"Tireoide com denso infiltrado linfocitário formando centros germinativos e células epiteliais grandes, eosinofílicas e granulares (células de Hürthle/oxífilas).",
    answer:"Tireoidite de Hashimoto",
    explanation:"Infiltrado linfocitário com centros germinativos + células de Hürthle = HASHIMOTO (autoimune, anti-TPO), causa mais comum de hipotireoidismo em áreas com iodo suficiente." },
  { id:"img09", discipline:"pratica", area:"Histologia",
    findings:"Pâncreas endócrino (ilhotas) com depósito de material amorfo, eosinofílico, congo-red positivo (amiloide) entre as células.",
    answer:"Diabetes mellitus tipo 2 (amiloide nas ilhotas)",
    explanation:"Depósito de AMILOIDE (amilina/IAPP) nas ilhotas é típico do DM2 (resistência insulínica + disfunção da célula beta). No DM1 há insulite autoimune com destruição das células beta." },
  { id:"img10", discipline:"pratica", area:"Histologia",
    findings:"Parede arterial com placa na íntima contendo macrófagos repletos de lipídios (células espumosas), núcleo lipídico e capa fibrosa.",
    answer:"Placa aterosclerótica (aterosclerose)",
    explanation:"Células espumosas (macrófagos com LDL oxidado) + núcleo lipídico + capa fibrosa = ATEROSCLEROSE. Placa instável (capa fina) rompe e causa trombose (IAM, AVC, isquemia mesentérica)." },
  { id:"img11", discipline:"pratica", area:"Histologia",
    findings:"Esôfago distal com epitélio colunar contendo células caliciformes (metaplasia intestinal) substituindo o epitélio escamoso.",
    answer:"Esôfago de Barrett",
    explanation:"Metaplasia intestinal (epitélio colunar com células caliciformes) no esôfago distal = BARRETT, consequência da DRGE crônica e precursora do ADENOCARCINOMA esofágico (metaplasia → displasia → carcinoma)." },
  { id:"img12", discipline:"pratica", area:"Histologia (SNC)",
    findings:"Córtex cerebral com placas extracelulares de amiloide (placas neuríticas/senis) e emaranhados neurofibrilares intracelulares (tau), com perda neuronal.",
    answer:"Doença de Alzheimer",
    explanation:"Placas senis (β-amiloide) + emaranhados neurofibrilares (proteína tau hiperfosforilada) + atrofia cortical = ALZHEIMER, principal causa de demência. Correlato de patologia do SNC (N2)." },

  /* ---- Radiologia / Imagem ---- */
  { id:"img13", discipline:"pratica", area:"Radiologia", svg:IMG.appleCore,
    findings:"Clister opaco (enema baritado) do cólon com estenose anular curta, de bordas irregulares e 'ombros' abruptos, estreitando a luz ('sinal da maçã mordida').",
    answer:"Adenocarcinoma de cólon (lesão 'apple-core')",
    explanation:"A imagem 'em maçã mordida' (apple-core) é a estenose anular do adenocarcinoma colorretal. Tumores do cólon esquerdo tendem a obstruir/estenosar; os do direito sangram e dão anemia." },
  { id:"img14", discipline:"pratica", area:"Radiologia", svg:IMG.pneumoperitonio,
    findings:"Radiografia de tórax/abdome em pé: fina lâmina de ar (radiotransparente) entre a cúpula diafragmática e o fígado.",
    answer:"Pneumoperitônio (víscera oca perfurada)",
    explanation:"Ar livre sob o diafragma = PNEUMOPERITÔNIO, sinal de perfuração de víscera oca (ex.: úlcera perfurada) — abdome agudo perfurativo, emergência cirúrgica." },
  { id:"img15", discipline:"pratica", area:"Radiologia", svg:IMG.groundGlass,
    findings:"TC de tórax com opacidades em 'vidro fosco' bilaterais e difusas, poupando parcialmente as bases, em paciente com hipoxemia grave.",
    answer:"SDRA (síndrome do desconforto respiratório agudo)",
    explanation:"Vidro fosco bilateral difuso + hipoxemia grave (PaO2/FiO2 baixo) sem causa cardíaca = SDRA. Causa clássica: sepse e pancreatite grave (resposta inflamatória sistêmica lesando o alvéolo)." },
  { id:"img16", discipline:"pratica", area:"Radiologia",
    findings:"Ultrassom do abdome superior: imagem hiperecogênica com sombra acústica posterior no interior da vesícula biliar, móvel à mudança de decúbito.",
    answer:"Colelitíase (cálculo biliar)",
    explanation:"Foco hiperecogênico + SOMBRA ACÚSTICA + mobilidade = cálculo na vesícula (COLELITÍASE). Complica com colecistite, coledocolitíase/colangite e pancreatite biliar." },
  { id:"img17", discipline:"pratica", area:"Radiologia",
    findings:"Ultrassom/colangiorressonância: dilatação das vias biliares intra e extra-hepáticas com cálculo impactado no colédoco.",
    answer:"Coledocolitíase (obstrução biliar)",
    explanation:"Dilatação de vias biliares + cálculo no colédoco = COLEDOCOLITÍASE → icterícia obstrutiva; se infectar, colangite (tríade de Charcot: dor + febre + icterícia) — CPRE de urgência." },
  { id:"img18", discipline:"pratica", area:"Radiologia (SNC)",
    findings:"TC de crânio sem contraste, 24 h após déficit focal súbito: área HIPODENSA com apagamento de sulcos em território arterial.",
    answer:"AVC isquêmico",
    explanation:"Hipodensidade tardia em território vascular = AVC ISQUÊMICO (a TC precoce pode ser normal; a hipodensidade leva horas). A TC inicial serve para EXCLUIR hemorragia antes da trombólise." },
  { id:"img19", discipline:"pratica", area:"Radiologia (SNC)",
    findings:"TC de crânio sem contraste, imediatamente após déficit súbito: coleção HIPERDENSA (branca) no parênquima/espaço, com efeito de massa.",
    answer:"AVC hemorrágico",
    explanation:"Sangue agudo é HIPERDENSO (branco) na TC imediatamente — ao contrário do isquêmico (hipodenso e tardio). Reconhecer isquêmico × hemorrágico define a conduta (trombólise é contraindicada no hemorrágico)." },
  { id:"img20", discipline:"pratica", area:"Radiologia",
    findings:"TC/RM de fígado em cirrótico: nódulo com realce arterial intenso (hipervascular) e 'washout' (clareamento) na fase venosa/tardia.",
    answer:"Carcinoma hepatocelular (CHC)",
    explanation:"Realce arterial + washout em fígado cirrótico = padrão típico de CHC (permite diagnóstico por imagem, critérios LI-RADS), pela neoangiogênese arterial do tumor. Marcador: alfafetoproteína." },

  /* ---- Semiologia / Macroscopia ---- */
  { id:"img21", discipline:"pratica", area:"Semiologia",
    findings:"Abdome de paciente cirrótico com veias dilatadas e tortuosas irradiando a partir do umbigo.",
    answer:"Cabeça de medusa (hipertensão portal)",
    explanation:"Circulação colateral periumbilical ('cabeça de medusa') resulta da recanalização da veia umbilical na HIPERTENSÃO PORTAL — junto com ascite, varizes e esplenomegalia." },
  { id:"img22", discipline:"pratica", area:"Semiologia",
    findings:"Paciente com pele e escleras amareladas, urina escura (colúria) e fezes claras (acolia), com prurido.",
    answer:"Icterícia colestática/obstrutiva",
    explanation:"Icterícia + colúria + acolia + prurido = padrão COLESTÁTICO (bilirrubina direta, FA e GGT elevadas). Causas: cálculo no colédoco, tumor de via biliar ou de cabeça de pâncreas." },
];

/* ============================ LINKS por tema (vídeos/áudios/leituras) ============================
   Chave: "disc::topic" (mesmo do plano). Cada item: {label, url}. Vão aparecer no resumo do tema.
   Adicione os seus (ex.: aula no YouTube). Exemplo abaixo — troque/adicione à vontade.
   ================================================================================================ */
const LINKS = {
  // "mad::Sepse": [ {label:"Vídeo: fisiopatologia da sepse", url:"https://youtu.be/..."} ],
  // "pratica::Vesícula e vias biliares": [ {label:"Aula: colelitíase", url:"https://..."} ],
};

// Exporta para o app
window.MEDQUEST_DATA = { DISCIPLINES, QUESTIONS, FLASHCARDS, SYLLABUS, SUMMARIES, CRONOGRAMA, IMAGES, LINKS };
