const STATUS_MAP: Record<string, string> = {
  // Match status
  '1st half': '1º Tempo',
  '2nd half': '2º Tempo',
  'Halftime': 'Intervalo',
  'Half Time': 'Intervalo',
  'HT': 'Intervalo',
  'Full Time': 'Encerrado',
  'FT': 'Encerrado',
  'Finished': 'Encerrado',
  'Not started': 'Não iniciado',
  'Postponed': 'Adiado',
  'Cancelled': 'Cancelado',
  'Suspended': 'Suspenso',
  'Interrupted': 'Interrompido',
  'Abandoned': 'Abandonado',
  'Extra Time': 'Prorrogação',
  'ET': 'Prorrogação',
  'Extra time half time': 'Intervalo Prorr.',
  'Penalties': 'Pênaltis',
  'Penalty': 'Pênaltis',
  'After Pens': 'Após Pênaltis',
  'After Extra Time': 'Após Prorrogação',
  'AET': 'Após Prorrogação',
  'Break Time': 'Intervalo',
  'Awaiting updates': 'Aguardando',
  'Live': 'Ao Vivo',
  'Ended': 'Encerrado',
  'AP': 'Após Pênaltis',
  'Started': 'Iniciado',
  'About to start': 'Prestes a iniciar',
  // Periods (other sports)
  '1st period': '1º Período',
  '2nd period': '2º Período',
  '3rd period': '3º Período',
  'Overtime': 'Prorrogação',
};

const PARTIAL_MATCHES: [string, string][] = [
  ['1st half', '1º Tempo'],
  ['2nd half', '2º Tempo'],
  ['half', 'Intervalo'],
  ['extra', 'Prorrogação'],
  ['penal', 'Pênaltis'],
  ['finish', 'Encerrado'],
  ['ended', 'Encerrado'],
  ['postpone', 'Adiado'],
  ['cancel', 'Cancelado'],
  ['suspend', 'Suspenso'],
  ['start', 'Iniciado'],
];

export function translateStatus(description: string | undefined | null): string {
  if (!description) return '';

  // Exact match
  if (STATUS_MAP[description]) return STATUS_MAP[description];

  // Case-insensitive exact match
  const lower = description.toLowerCase();
  for (const [en, pt] of Object.entries(STATUS_MAP)) {
    if (lower === en.toLowerCase()) return pt;
  }

  // Partial matches
  for (const [partial, pt] of PARTIAL_MATCHES) {
    if (lower.includes(partial)) return pt;
  }

  return description;
}
