// Classes do Section/Columns do Construtor — iguais no canvas do editor e no render do site.
export const BG: Record<string, string> = {
  none: "",
  card: "rounded-lg border border-border-custom bg-card-bg p-6",
  green: "rounded-lg bg-green p-6 text-white [&_h2]:text-white",
  dark: "rounded-lg bg-[#111827] p-6 text-white [&_h2]:text-white",
};

// Slots do Puck renderizam um <div> próprio e aceitam className.
export const COL = "min-w-0 space-y-5";
