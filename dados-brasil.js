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

// Filiais Agroquima (mockadas - ajustar com dados reais)
const FILIAIS = [
  {id:'ADM',nome:'Administração - GO (ADM)'},
  {id:'RVD',nome:'Rio Verde - GO (RVD)'},
  {id:'JAT',nome:'Jataí - GO (JAT)'},
  {id:'ANP',nome:'Anápolis - GO (ANP)'},
  {id:'LUZ',nome:'Luziânia - GO (LUZ)'},
  {id:'CAT',nome:'Catalão - GO (CAT)'},
  {id:'ITA',nome:'Itumbiara - GO (ITA)'},
  {id:'BEL',nome:'Belém - PA (BEL)'},
  {id:'PAL',nome:'Palmas - TO (PAL)'},
  {id:'CUI',nome:'Cuiabá - MT (CUI)'},
  {id:'UBE',nome:'Uberaba - MG (UBE)'},
  {id:'UBL',nome:'Uberlândia - MG (UBL)'},
];

const TIPOS_DESPESA = [
  'Combustível','Lubrificante','Pedágio','Ônibus','Reparos/Manutenção',
  'Uber','Refeição','Balsa','Hotel','Taxi','Carga/Descarga','Outros'
];

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
  { tipo: 'representante', identificador: '00000000000100' },
  { tipo: 'estagiario', identificador: '00000000000' },
  { tipo: 'clt', identificador: 'joao.mendes@agroquima.com.br' },
  { tipo: 'clt', identificador: 'gerente.rv@agroquima.com.br' }
];
