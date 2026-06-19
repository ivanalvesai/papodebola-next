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
  "sobre.meta.title": { page: "/sobre-nos", pageLabel: "Sobre", section: "SEO", label: "Meta title", type: "text", default: "Sobre Nós" },
  "sobre.meta.description": { page: "/sobre-nos", pageLabel: "Sobre", section: "SEO", label: "Meta description", type: "multiline", default: "Conheça quem está por trás do Papo de Bola, portal independente de futebol e esportes desde 2004, com notícias, placares e classificações." },
  "sobre.h1": { page: "/sobre-nos", pageLabel: "Sobre", section: "Conteúdo", label: "Título principal (H1)", type: "text", default: "Sobre Nós" },
  "sobre.subtitle": { page: "/sobre-nos", pageLabel: "Sobre", section: "Conteúdo", label: "Subtítulo do topo", type: "text", default: "Futebol e esporte, com a paixão de quem vive a bola desde 2004." },
  "sobre.intro": { page: "/sobre-nos", pageLabel: "Sobre", section: "Conteúdo", label: "Parágrafo de abertura", type: "multiline", default: "Somos um portal independente de esportes com notícias, placares ao vivo, classificações, calendários, escalações, estatísticas e os bastidores das principais competições, tudo de forma rápida, gratuita e acessível no computador ou no celular." },
  "sobre.historia.h2": { page: "/sobre-nos", pageLabel: "Sobre", section: "Nossa história", label: "Título", type: "text", default: "Nossa História" },
  "sobre.historia.p": { page: "/sobre-nos", pageLabel: "Sobre", section: "Nossa história", label: "Texto", type: "multiline", default: "Somos Lucas Lima e Ivan Alves, profissionais com mais de 15 anos em TI e marketing digital. Retomamos um portal criado em 2004 com foco exclusivo em futebol e decidimos ir além: reconstruímos tudo do zero com tecnologia moderna e expandimos a cobertura para todos os esportes. Acompanhamos futebol de perto, brasileiro, mundial e de várzea, com contato direto com a cena do futebol amador de Santana de Parnaíba e região, mas nossa visão sempre foi atender amantes de todos os esportes, entregando páginas rápidas, dados em tempo real e uma experiência de leitura limpa." },
  "sobre.encontra.h2": { page: "/sobre-nos", pageLabel: "Sobre", section: "O que você encontra", label: "Título", type: "text", default: "O Que Você Encontra Aqui" },
  "sobre.producao.h2": { page: "/sobre-nos", pageLabel: "Sobre", section: "Como produzimos", label: "Título", type: "text", default: "Como Produzimos o Conteúdo" },
  "sobre.producao.p1": { page: "/sobre-nos", pageLabel: "Sobre", section: "Como produzimos", label: "Texto 1", type: "multiline", default: "Acreditamos em informação correta e bem apurada. Nossas matérias são escritas e revisadas com foco em clareza, contexto e linguagem acessível ao torcedor. Os dados esportivos, placares, escalações, classificações e estatísticas são extraídos diretamente das fontes oficiais de cada competição e atualizados em tempo real para refletir o que acontece em campo." },
  "sobre.producao.p2": { page: "/sobre-nos", pageLabel: "Sobre", section: "Como produzimos", label: "Texto 2", type: "multiline", default: "Quando um conteúdo é corrigido ou atualizado, fazemos isso de forma transparente. Se você encontrar alguma informação imprecisa, fale com a gente, levamos isso a sério." },
  "sobre.independencia.h2": { page: "/sobre-nos", pageLabel: "Sobre", section: "Independência e publicidade", label: "Título", type: "text", default: "Independência e Publicidade" },
  "sobre.contato.h2": { page: "/sobre-nos", pageLabel: "Sobre", section: "Fale com a gente", label: "Título", type: "text", default: "Fale com a gente" },
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
