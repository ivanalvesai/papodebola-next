/* eslint-disable @typescript-eslint/no-explicit-any */

export function TableBlock({ block }: { block: any }) {
  const headers = block.headers || [];
  const rows = block.rows || [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h: any, i: number) => (
                <th key={i} className="border border-border-custom bg-body px-3 py-2 text-left font-semibold">
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r: any, i: number) => (
            <tr key={i}>
              {(r.cells || []).map((cell: any, j: number) => (
                <td key={j} className="border border-border-custom px-3 py-2">
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
