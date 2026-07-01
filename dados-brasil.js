const ESTADOS = [
  {uf:'AC',nome:'Acre'},{uf:'AL',nome:'Alagoas'},{uf:'AP',nome:'Amapá'},
  {uf:'AM',nome:'Amazonas'},{uf:'BA',nome:'Bahia'},{uf:'CE',nome:'Ceará'},
  {uf:'DF',nome:'Distrito Federal'},{uf:'ES',nome:'Espírito Santo'},
  {uf:'GO',nome:'Goiás'},{uf:'MA',nome:'Maranhão'},{uf:'MT',nome:'Mato Grosso'},
  {uf:'MS',nome:'Mato Grosso do Sul'},{uf:'MG',nome:'Minas Gerais'},
  {uf:'PA',nome:'Pará'},{uf:'PB',nome:'Paraíba'},{uf:'PR',nome:'Paraná'},
  {uf:'PE',nome:'Pernambuco'},{uf:'PI',nome:'Piauí'},{uf:'RJ',nome:'Rio de Janeiro'},
  {uf:'RN',nome:'Rio Grande do Norte'},{uf:'RS',nome:'Rio Grande do Sul'},
  {uf:'RO',nome:'Rondônia'},{uf:'RR',nome:'Roraima'},{uf:'SC',nome:'Santa Catarina'},
  {uf:'SP',nome:'São Paulo'},{uf:'SE',nome:'Sergipe'},{uf:'TO',nome:'Tocantins'}
];

// Municípios por UF — conjunto representativo das principais cidades + Goiás completo
const MUNICIPIOS = {
  GO: ['Goiânia','Aparecida de Goiânia','Anápolis','Rio Verde','Luziânia','Águas Lindas de Goiás',
    'Valparaíso de Goiás','Trindade','Formosa','Novo Gama','Itumbiara','Senador Canedo',
    'Catalão','Jataí','Planaltina','Caldas Novas','Santo Antônio do Descoberto','Goianésia',
    'Mineiros','Quirinópolis','São Luís de Montes Belos','Inhumas','Morrinhos','Ceres',
    'Porangatu','Uruaçu','Iporá','Goiás','Palmeiras de Goiás','Itaberaí','Anicuns',
    'Bela Vista de Goiás','Ipameri','Cristalina','Pires do Rio','Alexânia','Corumbá de Goiás',
    'Pirenópolis','Edéia','Paraúna','Acreúna','Montes Claros de Goiás','Niquelândia',
    'Minaçu','Campos Belos','São Miguel do Araguaia','Posse','Iaciara','Flores de Goiás'],
  MT: ['Cuiabá','Várzea Grande','Rondonópolis','Sinop','Tangará da Serra','Cáceres',
    'Sorriso','Lucas do Rio Verde','Primavera do Leste','Barra do Garças','Alta Floresta',
    'Guarantã do Norte','Pontes e Lacerda','Nova Mutum','Colíder','Juína','Juara',
    'Campo Verde','Peixoto de Azevedo','Matupá','Confresa','Água Boa','Nova Xavantina'],
  PA: ['Belém','Ananindeua','Santarém','Marabá','Castanhal','Parauapebas','Altamira',
    'Itaituba','Barcarena','Abaetetuba','Cametá','Bragança','Tucuruí','Redenção',
    'Marituba','Paragominas','Tailândia','São Félix do Xingu','Conceição do Araguaia',
    'Oriximiná','Óbidos','Breves','Vigia','Tomé-Açu','Mocajuba'],
  TO: ['Palmas','Araguaína','Gurupi','Porto Nacional','Paraíso do Tocantins','Colinas do Tocantins',
    'Guaraí','Tocantinópolis','Formoso do Araguaia','Miranorte','Miracema do Tocantins',
    'Augustinópolis','Xambioá','Arraias','Dianópolis','Natividade','Pedro Afonso'],
  MG: ['Belo Horizonte','Uberlândia','Contagem','Juiz de Fora','Betim','Montes Claros',
    'Ribeirão das Neves','Uberaba','Governador Valadares','Ipatinga','Sete Lagoas',
    'Divinópolis','Santa Luzia','Ibirité','Poços de Caldas','Patos de Minas','Pouso Alegre',
    'Teófilo Otoni','Barbacena','Sabará','Vespasiano','Itabira','Conselheiro Lafaiete',
    'Ituiutaba','Araguari','Muriaé','Passos','Lavras','Varginha','Itajubá'],
  SP: ['São Paulo','Guarulhos','Campinas','São Bernardo do Campo','Santo André','Osasco',
    'Ribeirão Preto','Sorocaba','Mauá','São José dos Campos','Mogi das Cruzes','Santos',
    'Diadema','Jundiaí','Piracicaba','Carapicuíba','Bauru','Itaquaquecetuba','São José do Rio Preto',
    'Franca','Guarujá','Limeira','Taubaté','Suzano','Praia Grande'],
  MS: ['Campo Grande','Dourados','Três Lagoas','Corumbá','Ponta Porã','Naviraí','Nova Andradina',
    'Aquidauana','Sidrolândia','Maracaju','Coxim','Rio Brilhante','Chapadão do Sul','Sonora'],
  PR: ['Curitiba','Londrina','Maringá','Ponta Grossa','Cascavel','São José dos Pinhais',
    'Foz do Iguaçu','Colombo','Guarapuava','Paranaguá','Araucária','Toledo','Apucarana',
    'Pinhais','Campo Largo','Arapongas','Almirante Tamandaré','Umuarama','Piraquara'],
  BA: ['Salvador','Feira de Santana','Vitória da Conquista','Camaçari','Itabuna','Juazeiro',
    'Lauro de Freitas','Ilhéus','Jequié','Teixeira de Freitas','Alagoinhas','Barreiras',
    'Porto Seguro','Paulo Afonso','Eunápolis','Santo Antônio de Jesus','Valença'],
  RS: ['Porto Alegre','Caxias do Sul','Pelotas','Canoas','Santa Maria','Gravataí','Viamão',
    'Novo Hamburgo','São Leopoldo','Rio Grande','Alvorada','Passo Fundo','Sapucaia do Sul',
    'Uruguaiana','Cachoeirinha','Santa Cruz do Sul','Bagé','Bento Gonçalves'],
  SC: ['Florianópolis','Joinville','Blumenau','São José','Chapecó','Criciúma','Itajaí',
    'Jaraguá do Sul','Palhoça','Balneário Camboriú','Brusque','Tubarão','São Bento do Sul'],
  RJ: ['Rio de Janeiro','São Gonçalo','Duque de Caxias','Nova Iguaçu','Niterói','Belford Roxo',
    'São João de Meriti','Campos dos Goytacazes','Petrópolis','Volta Redonda','Magé',
    'Itaboraí','Macaé','Cabo Frio','Nova Friburgo','Angra dos Reis'],
  CE: ['Fortaleza','Caucaia','Juazeiro do Norte','Maracanaú','Sobral','Crato','Itapipoca',
    'Maranguape','Iguatu','Quixadá','Pacatuba','Russas','Aquiraz'],
  PE: ['Recife','Caruaru','Petrolina','Olinda','Paulista','Jaboatão dos Guararapes',
    'Garanhuns','Santa Cruz do Capibaribe','Vitória de Santo Antão','Cabo de Santo Agostinho'],
  AM: ['Manaus','Parintins','Itacoatiara','Manacapuru','Coari','Tefé','Tabatinga','Maués'],
  RN: ['Natal','Mossoró','Parnamirim','São Gonçalo do Amarante','Macaíba','Ceará-Mirim'],
  PB: ['João Pessoa','Campina Grande','Santa Rita','Patos','Bayeux','Sousa','Cajazeiras'],
  MA: ['São Luís','Imperatriz','São José de Ribamar','Timon','Caxias','Codó','Açailândia'],
  PI: ['Teresina','Parnaíba','Picos','Piripiri','Floriano','Campo Maior'],
  AL: ['Maceió','Arapiraca','Rio Largo','Palmeira dos Índios','União dos Palmares'],
  SE: ['Aracaju','Nossa Senhora do Socorro','Lagarto','Itabaiana','São Cristóvão'],
  ES: ['Vitória','Serra','Vila Velha','Cariacica','Cachoeiro de Itapemirim','Linhares','São Mateus'],
  RO: ['Porto Velho','Ji-Paraná','Ariquemes','Vilhena','Cacoal','Rolim de Moura'],
  AC: ['Rio Branco','Cruzeiro do Sul','Sena Madureira','Tarauacá','Feijó'],
  AP: ['Macapá','Santana','Laranjal do Jari','Oiapoque','Mazagão'],
  RR: ['Boa Vista','Caracaraí','Rorainópolis','Alto Alegre','Mucajaí'],
  DF: ['Brasília','Ceilândia','Taguatinga','Samambaia','Planaltina','Gama','Sobradinho'],
};

// Lista oficial de filiais da Agroquima, extraída da base de regionais (código + sigla +
// cidade + UF) enviada pela empresa. Não é sequencial — os códigos pulados (2, 6-9, 15, 18,
// 20, 26, 33, 39, 42 etc.) não correspondem a filiais comerciais nesta base.
// Quatro códigos não são filiais comerciais "padrão" (loja em cidade) e tiveram o nome
// detalhado a partir de esclarecimento da empresa, já que a LOJA da planilha sozinha não
// deixava isso claro: 13-FAG é a Unidade de Beneficiamento de Sementes (Goiânia/GO),
// 24-FAP e 25-FCB são fábricas (Aparecida de Goiânia/GO e Cuiabá/MT) e 36-GRA é a oficina
// de Goianira/GO.
const FILIAIS = [
  {id:'1-MTZ',nome:'Matriz - GO (1-MTZ)'},
  {id:'3-ARG',nome:'Araguaína - TO (3-ARG)'},
  {id:'4-RVD',nome:'Rio Verde - GO (4-RVD)'},
  {id:'5-UBR',nome:'Uberlândia - MG (5-UBR)'},
  {id:'10-MAR',nome:'Marabá - PA (10-MAR)'},
  {id:'11-JAT',nome:'Jataí - GO (11-JAT)'},
  {id:'12-CRI',nome:'Cristalina - GO (12-CRI)'},
  {id:'13-FAG',nome:'Unidade de Beneficiamento de Sementes - Goiânia/GO (13-FAG)'},
  {id:'14-RED',nome:'Redenção - PA (14-RED)'},
  {id:'16-IMP',nome:'Imperatriz - MA (16-IMP)'},
  {id:'17-BAR',nome:'Barra do Garças - MT (17-BAR)'},
  {id:'19-PAL',nome:'Palmas - TO (19-PAL)'},
  {id:'21-MOZ',nome:'Mozarlândia - GO (21-MOZ)'},
  {id:'22-PGM',nome:'Paragominas - PA (22-PGM)'},
  {id:'23-SFX',nome:'São Félix do Xingu - PA (23-SFX)'},
  {id:'24-FAP',nome:'Fábrica de Aparecida de Goiânia - GO (24-FAP)'},
  {id:'25-FCB',nome:'Fábrica de Cuiabá - MT (25-FCB)'},
  {id:'27-URU',nome:'Uruaçu - GO (27-URU)'},
  {id:'28-MOR',nome:'Morrinhos - GO (28-MOR)'},
  {id:'29-CON',nome:'Confresa - MT (29-CON)'},
  {id:'30-FOR',nome:'Formosa - GO (30-FOR)'},
  {id:'31-JUS',nome:'Jussara - GO (31-JUS)'},
  {id:'32-XRA',nome:'Xinguara - PA (32-XRA)'},
  {id:'34-POR',nome:'Porangatu - GO (34-POR)'},
  {id:'35-PLA',nome:'Pontes e Lacerda - MT (35-PLA)'},
  {id:'36-GRA',nome:'Oficina Goianira - GO (36-GRA)'},
  {id:'37-CAN',nome:'Canarana - MT (37-CAN)'},
  {id:'38-GUR',nome:'Gurupi - TO (38-GUR)'},
  {id:'40-RIA',nome:'Rialma - GO (40-RIA)'},
  {id:'41-ALT',nome:'Altamira - PA (41-ALT)'},
];

// Converte o código de filial (ex: "21-MOZ") no nome de exibição cadastrado em FILIAIS,
// ou devolve o próprio código quando ainda não há nome confirmado.
function nomeFilial(codigo) {
  const f = FILIAIS.find(f => f.id === codigo);
  return f ? f.nome : (codigo || '');
}

const TIPOS_DESPESA = [
  'Combustível','Lubrificante','Pedágio','Ônibus','Reparos/Manutenção',
  'Uber','Refeição','Balsa','Hotel','Taxi','Carga/Descarga','Outros'
];

// Vocabulário esperado por tipo de despesa — usado pelo OCR para confrontar o
// conteúdo da nota com o tipo selecionado no lançamento (ex.: uma nota com "parafuso"
// e nenhum termo de Refeição não é compatível com uma despesa lançada como Refeição).
// Termos escolhidos para evitar campos padrão de DANFE (frete, peso bruto, transportador
// etc. aparecem em qualquer NF-e, não são discriminantes) e focar em vocabulário real de
// estabelecimento/item. Lista expansível pelo TI/financeiro, assim como ITENS_PROIBIDOS.
// 'Outros' não tem lista própria — aceita qualquer conteúdo.
const CORRELACAO_TIPO_DESPESA = {
  'Refeição': [
    'restaurante','lanchonete','padaria','pizzaria','churrascaria','hamburgueria',
    'cafeteria','buffet','self-service','self service','rodízio','marmita','marmitex',
    'prato feito','refeição','almoço','jantar','café da manhã','salgados','espetinho',
    'sorveteria','sanduíches','comida','suco de laranja','suco natural','prato do dia','couvert'
  ],
  'Combustível': [
    'combustível','gasolina','etanol','álcool combustível','óleo diesel','diesel s10',
    'gnv','posto de combustível','posto de gasolina','abastecimento de veículo','frentista','arla 32'
  ],
  'Lubrificante': [
    'lubrificante','óleo lubrificante','óleo de motor','graxa automotiva','troca de óleo',
    'óleo 5w30','óleo 20w50','filtro de óleo'
  ],
  'Pedágio': [
    'pedágio','praça de pedágio','concessionária de rodovia','tarifa de pedágio',
    'categoria de veículo','sem parar','conectcar','veloe','artesp','agetop',
    'ecovias','autopista','comprovante de pedágio'
  ],
  'Ônibus': [
    'ônibus','passagem rodoviária','rodoviária','viação','bilhete de passagem','bp-e',
    'plataforma de embarque','poltrona','trecho rodoviário'
  ],
  'Reparos/Manutenção': [
    'oficina mecânica','mecânico','autopeças','parafuso','porca','arruela','rolamento',
    'correia dentada','troca de pneu','alinhamento e balanceamento','revisão veicular',
    'retífica de motor','funilaria','pintura automotiva','pastilha de freio','amortecedor',
    'suspensão','vela de ignição','bateria automotiva','borracharia','chapeação'
  ],
  'Uber': [
    'uber','99 pop','corrida solicitada','motorista parceiro','aplicativo de transporte','tarifa dinâmica'
  ],
  'Taxi': [
    'táxi','taxímetro','cooperativa de táxi','corrida de táxi'
  ],
  'Balsa': [
    'balsa','travessia fluvial','ferry boat','embarque de veículo','outorga de travessia'
  ],
  'Hotel': [
    'hotel','pousada','hospedagem','diária','check-in','check-out','hóspede','pernoite',
    'apartamento','suíte','flat'
  ],
  'Carga/Descarga': [
    'serviço de carga','descarga de mercadoria','carga e descarga','estiva',
    'ajudante de carga','paletização','empilhadeira','movimentação de carga',
    'conferência de carga','carregamento de mercadoria','descarregamento de mercadoria'
  ]
};

const TIPOS_ATIVIDADE = [
  'Visita a clientes','Prospecção','Reunião interna','Treinamento',
  'Auditoria','Evento/Feira','Entrega de produto','Outros'
];

// Itens proibidos em notas fiscais lançadas (lista expansível pelo TI/financeiro)
const ITENS_PROIBIDOS = [
  'cerveja','cervejas','chopp','cigarro','cigarros','tabaco','tabacaria',
  'bebida alcoolica','bebidas alcoolicas','whisky','whiskey','vodka','cachaca',
  'vinho','espumante','narguile'
];

// Identificadores de demonstração já existentes na base da Agroquima (MOCK).
// Em produção, a verificação de pré-cadastro deve chamar a API real (token Fernando/TI)
// em vez desta lista local — ver API_CONFIG em api.js.
const PRE_CADASTRADOS_DEMO = [
  { tipo: 'representante', identificador: '00000000000100', filial: '21-MOZ', senhaDefault: 'Jv.852456' },
  { tipo: 'estagiario', identificador: '00000000000', filial: '4-RVD', senhaDefault: 'Jv.852456' },
  { tipo: 'clt', identificador: 'joao.mendes@agroquima.com.br', filial: '1-MTZ', senhaDefault: 'Jv.852456' },
  { tipo: 'clt', identificador: 'gerente.rv@agroquima.com.br', filial: '4-RVD', senhaDefault: 'Jv.852456' }
];
