/* eslint-disable @typescript-eslint/no-explicit-any */

export function InfoCardBlock({ block }: { block: any }) {
  return (
    <div className="rounded-lg bg-body p-4">
      <div className="text-sm font-semibold text-text-primary">{block.label}</div>
      <div className="text-sm text-text-muted">
        {block.href ? (
          <a href={block.href} className="text-green hover:underline">
            {block.value}
          </a>
        ) : (
          block.value
        )}
      </div>
    </div>
  );
}
