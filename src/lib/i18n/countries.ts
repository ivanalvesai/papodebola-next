// Tradução EN→PT-BR dos nomes das seleções da Copa do Mundo 2026.
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
};

export function translateCountry(name: string): string {
  return COUNTRY_PT[name] || name;
}
