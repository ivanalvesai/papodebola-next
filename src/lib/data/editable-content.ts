// Registro dos textos editáveis do site (fonte da verdade dos DEFAULTS + rótulos).
// SEM imports de servidor (fs) — pode ser importado pelo painel (client) e pelas
// páginas (server). Cada texto editável tem um id estável usado no <Editable id>.
export type EditableType = "text" | "multiline";

export interface EditableDef {
  page: string; // rota afetada (pra revalidar ao salvar)
  pageLabel: string;
  section: string;
  label: string;
  default: string; // texto usado quando não há override
  type: EditableType;
}

export const EDITABLE: Record<string, EditableDef> = {
  // ===== Página inicial =====
  "home.meta.title": { page: "/", pageLabel: "Página inicial", section: "SEO", label: "Meta title (Google / aba)", type: "text", default: "Papo de Bola | Futebol e Esportes do Brasil e do Mundo" },
  "home.meta.description": { page: "/", pageLabel: "Página inicial", section: "SEO", label: "Meta description", type: "multiline", default: "Acompanhe notícias de futebol e esportes, jogos de hoje, resultados ao vivo, tabelas, classificações e as principais competições do mundo." },
  "home.h1": { page: "/", pageLabel: "Página inicial", section: "SEO", label: "H1 (invisível na tela, vale pro SEO)", type: "text", default: "Papo de Bola — Futebol brasileiro e mundial: notícias, jogos ao vivo e classificações" },

  // ===== Sobre =====
  "sobre.meta.title": { page: "/sobre", pageLabel: "Sobre", section: "SEO", label: "Meta title", type: "text", default: "Sobre o Papo de Bola" },
  "sobre.meta.description": { page: "/sobre", pageLabel: "Sobre", section: "SEO", label: "Meta description", type: "multiline", default: "Conheça o Papo de Bola: portal de futebol brasileiro e mundial com notícias, placares ao vivo, classificações e cobertura de outros esportes. Nossa história, linha editorial e compromisso com a informação." },
  "sobre.h1": { page: "/sobre", pageLabel: "Sobre", section: "Conteúdo", label: "Título principal (H1)", type: "text", default: "Sobre o Papo de Bola" },
  "sobre.subtitle": { page: "/sobre", pageLabel: "Sobre", section: "Conteúdo", label: "Subtítulo do topo", type: "text", default: "Futebol e esporte, com a paixão de quem vive a bola desde 2004." },
  "sobre.intro": { page: "/sobre", pageLabel: "Sobre", section: "Conteúdo", label: "Parágrafo de abertura", type: "multiline", default: "O Papo de Bola é um portal independente dedicado ao futebol brasileiro e mundial. Reunimos em um só lugar notícias, placares ao vivo, classificações, calendários, escalações, estatísticas e os bastidores das principais competições — tudo de forma rápida, gratuita e fácil de acompanhar, no computador ou no celular." },
  "sobre.historia.h2": { page: "/sobre", pageLabel: "Sobre", section: "Nossa história", label: "Título", type: "text", default: "Nossa história" },
  "sobre.historia.p": { page: "/sobre", pageLabel: "Sobre", section: "Nossa história", label: "Texto", type: "multiline", default: "O Papo de Bola nasceu em 2004 como um espaço para torcedores que queriam ir além do placar — entender o jogo, debater escalações e acompanhar de perto os times do coração. De lá para cá, o portal evoluiu junto com a internet: passou por diferentes formatos até a versão atual, totalmente reconstruída com tecnologia moderna para entregar páginas rápidas, dados em tempo real e uma experiência de leitura limpa, sem poluição." },
  "sobre.encontra.h2": { page: "/sobre", pageLabel: "Sobre", section: "O que você encontra", label: "Título", type: "text", default: "O que você encontra aqui" },
  "sobre.producao.h2": { page: "/sobre", pageLabel: "Sobre", section: "Como produzimos", label: "Título", type: "text", default: "Como produzimos o conteúdo" },
  "sobre.producao.p1": { page: "/sobre", pageLabel: "Sobre", section: "Como produzimos", label: "Texto 1", type: "multiline", default: "Acreditamos em informação correta e bem apurada. Nossas matérias são escritas e revisadas pela equipe de redação, com foco em clareza, contexto e linguagem acessível ao torcedor. Os dados esportivos — placares, escalações, classificações e estatísticas — vêm de provedores especializados e fontes oficiais das competições, e são atualizados automaticamente para refletir o que acontece em campo." },
  "sobre.producao.p2": { page: "/sobre", pageLabel: "Sobre", section: "Como produzimos", label: "Texto 2", type: "multiline", default: "Quando um conteúdo é corrigido ou atualizado, buscamos fazê-lo de forma transparente. Se você encontrar alguma informação imprecisa, fale com a gente — levamos as correções a sério." },
  "sobre.independencia.h2": { page: "/sobre", pageLabel: "Sobre", section: "Independência e publicidade", label: "Título", type: "text", default: "Independência e publicidade" },
  "sobre.contato.h2": { page: "/sobre", pageLabel: "Sobre", section: "Fale com a gente", label: "Título", type: "text", default: "Fale com a gente" },
};

export interface EditablePageGroup {
  page: string;
  pageLabel: string;
  items: { id: string; def: EditableDef }[];
}

// Agrupa os editáveis por página (preservando a ordem de declaração) — pro painel.
export function editableByPage(): EditablePageGroup[] {
  const groups: EditablePageGroup[] = [];
  for (const [id, def] of Object.entries(EDITABLE)) {
    let g = groups.find((x) => x.page === def.page);
    if (!g) {
      g = { page: def.page, pageLabel: def.pageLabel, items: [] };
      groups.push(g);
    }
    g.items.push({ id, def });
  }
  return groups;
}
