// Tradução EN→PT-BR dos nomes de seleções nacionais — usado na Copa do Mundo 2026
// (futebol) e na agenda de vôlei (Liga das Nações / Golden League, que também são
// seleções e vêm em inglês da API).
// As chaves precisam bater EXATAMENTE com o nome que a AllSportsApi retorna
// (UTF-8: "Curaçao", "Côte d'Ivoire", "Türkiye"). Nome não mapeado cai no
// fallback (retorna o original) — então é seguro a API adicionar/trocar times.

const COUNTRY_PT: Record<string, string> = {
  Algeria: "Argélia",
  Argentina: "Argentina",
  Australia: "Austrália",
  Austria: "Áustria",
  Belgium: "Bélgica",
  "Bosnia & Herzegovina": "Bósnia e Herzegovina",
  Brazil: "Brasil",
  "Cabo Verde": "Cabo Verde",
  Canada: "Canadá",
  Colombia: "Colômbia",
  Croatia: "Croácia",
  "Curaçao": "Curaçao",
  Czechia: "Tchéquia",
  "Côte d'Ivoire": "Costa do Marfim",
  "DR Congo": "RD Congo",
  Ecuador: "Equador",
  Egypt: "Egito",
  England: "Inglaterra",
  France: "França",
  Germany: "Alemanha",
  Ghana: "Gana",
  Haiti: "Haiti",
  Iran: "Irã",
  Iraq: "Iraque",
  Japan: "Japão",
  Jordan: "Jordânia",
  Mexico: "México",
  Morocco: "Marrocos",
  Netherlands: "Holanda",
  "New Zealand": "Nova Zelândia",
  Norway: "Noruega",
  Panama: "Panamá",
  Paraguay: "Paraguai",
  Portugal: "Portugal",
  Qatar: "Catar",
  "Saudi Arabia": "Arábia Saudita",
  Scotland: "Escócia",
  Senegal: "Senegal",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  Spain: "Espanha",
  Sweden: "Suécia",
  Switzerland: "Suíça",
  Tunisia: "Tunísia",
  "Türkiye": "Turquia",
  USA: "Estados Unidos",
  Uruguay: "Uruguai",
  Uzbekistan: "Uzbequistão",

  // Seleções de vôlei (Liga das Nações / Golden League) que não jogam a Copa.
  Bulgaria: "Bulgária",
  China: "China",
  "Chinese Taipei": "Taipé Chinesa",
  Cuba: "Cuba",
  "Dominican Republic": "República Dominicana",
  Finland: "Finlândia",
  Greece: "Grécia",
  India: "Índia",
  Italy: "Itália",
  Poland: "Polônia",
  Romania: "Romênia",
  Serbia: "Sérvia",
  Slovakia: "Eslováquia",
  Slovenia: "Eslovênia",
  Thailand: "Tailândia",
  Ukraine: "Ucrânia",
};

export function translateCountry(name: string): string {
  return COUNTRY_PT[name] || name;
}
