"use client";

// Campo "Time" do bloco "Escalação no campo" (editor /cms). Substitui o input de texto por:
//   1) um dropdown dos times conhecidos (config Série A/EU + Payload Série B), e
//   2) um botão "Buscar escalação provável" que preenche formação + os 11 jogadores
//      (nome, número e ID da foto) a partir do jogo anterior do time.
// O editor pode editar qualquer jogador depois — só preenche o array; não trava nada.
//
// O valor armazenado continua sendo o NOME do time (o conversor em articles-payload.ts usa
// f.team pro cabeçalho do card). O ID é derivado do nome via a lista carregada do endpoint.

import { useEffect, useMemo, useState } from "react";
import { useField, useForm, useFormFields } from "@payloadcms/ui";

type Team = { id: number; name: string };
type SuggestPlayer = { name: string; number: string; playerId: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LineupTeamField = (props: any) => {
  const path: string = props?.path || props?.field?.name || "team";
  const label: string = props?.field?.label || "Time";
  const { value, setValue } = useField<string>({ path });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { addFieldRow, replaceFieldRow, dispatchFields } = useForm() as any;

  // Caminhos irmãos dentro do form do bloco (ex.: "formation", "players").
  const base = path.includes(".") ? path.slice(0, path.lastIndexOf(".") + 1) : "";
  const playersPath = `${base}players`;
  const formationPath = `${base}formation`;

  // Quantas linhas o array de jogadores tem agora (pra substituir/adicionar/remover).
  const rowCount = useFormFields(([fields]) => {
    const prefix = `${playersPath}.`;
    let n = 0;
    for (const k of Object.keys(fields)) {
      if (k.startsWith(prefix) && k.endsWith(".name")) {
        const idx = Number(k.slice(prefix.length, k.length - ".name".length));
        if (Number.isInteger(idx)) n = Math.max(n, idx + 1);
      }
    }
    return n;
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err" | ""; text: string }>({ kind: "", text: "" });

  useEffect(() => {
    fetch("/api/lineup-suggest?teams=1")
      .then((r) => r.json())
      .then((d) => setTeams(Array.isArray(d?.teams) ? d.teams : []))
      .catch(() => {});
  }, []);

  const idByName = useMemo(() => new Map(teams.map((t) => [t.name, t.id])), [teams]);

  // Se o valor atual não está na lista (post antigo digitado à mão), mostra como opção extra.
  const showExtra = value && !idByName.has(value);

  async function autofill() {
    const id = idByName.get(value || "");
    if (!id) {
      setMsg({ kind: "err", text: "Selecione um time da lista antes de buscar." });
      return;
    }
    setBusy(true);
    setMsg({ kind: "", text: "" });
    try {
      const r = await fetch(`/api/lineup-suggest?teamId=${id}`);
      const d = await r.json();
      const players: SuggestPlayer[] = Array.isArray(d?.players) ? d.players : [];
      if (!players.length) {
        setMsg({ kind: "err", text: "Não encontrei a escalação do jogo anterior desse time." });
        return;
      }
      if (d.formation) dispatchFields({ type: "UPDATE", path: formationPath, value: String(d.formation) });

      const target = players.slice(0, 11);
      for (let i = 0; i < target.length; i++) {
        const p = target[i];
        const sub = {
          name: { value: p.name, initialValue: p.name, valid: true },
          number: { value: p.number || "", initialValue: p.number || "", valid: true },
          playerId: { value: p.playerId || "", initialValue: p.playerId || "", valid: true },
        };
        if (i < rowCount) {
          replaceFieldRow({ path: playersPath, schemaPath: playersPath, rowIndex: i, subFieldState: sub });
        } else {
          addFieldRow({ path: playersPath, schemaPath: playersPath, rowIndex: i, subFieldState: sub });
        }
      }
      // Remove linhas sobrando (de trás pra frente pra não deslocar índices).
      for (let i = rowCount - 1; i >= target.length; i--) {
        dispatchFields({ type: "REMOVE_ROW", path: playersPath, rowIndex: i });
      }

      setMsg({
        kind: "ok",
        text: `Preenchido: ${target.length} jogadores${d.formation ? ` · ${d.formation}` : ""}. Ajuste o que precisar.`,
      });
    } catch {
      setMsg({ kind: "err", text: "Erro ao buscar a escalação. Tente de novo." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field-type" style={{ marginBottom: 20 }}>
      <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
        {label}
        <span style={{ color: "var(--theme-error-500, #e11d48)" }}> *</span>
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          style={{
            flex: "1 1 220px",
            minHeight: 40,
            padding: "8px 10px",
            borderRadius: 4,
            border: "1px solid var(--theme-elevation-150, #cbd5e1)",
            background: "var(--theme-input-bg, #fff)",
            color: "var(--theme-elevation-800, #111)",
          }}
        >
          <option value="">— Selecione o time —</option>
          {showExtra && <option value={value}>{value} (fora da lista)</option>}
          {teams.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={autofill}
          disabled={busy || !value}
          className="btn btn--style-secondary btn--size-small"
          style={{
            minHeight: 40,
            padding: "0 14px",
            borderRadius: 4,
            cursor: busy || !value ? "not-allowed" : "pointer",
            opacity: busy || !value ? 0.6 : 1,
            border: "1px solid var(--theme-elevation-150, #cbd5e1)",
            background: "var(--theme-elevation-50, #f1f5f9)",
            color: "var(--theme-elevation-800, #111)",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {busy ? "Buscando…" : "🔍 Buscar escalação provável"}
        </button>
      </div>
      {msg.text && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: msg.kind === "err" ? "var(--theme-error-500, #e11d48)" : "var(--theme-success-500, #16a34a)",
          }}
        >
          {msg.text}
        </p>
      )}
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--theme-elevation-500, #64748b)" }}>
        Puxa a escalação do jogo anterior (nomes, números e fotos). Você pode editar cada jogador abaixo.
      </p>
    </div>
  );
};

export default LineupTeamField;
