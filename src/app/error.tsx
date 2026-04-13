"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-orange mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Algo deu errado
        </h2>
        <p className="text-text-muted mb-6">
          Ocorreu um erro ao carregar esta pagina. Tente novamente.
        </p>
        <Button
          onClick={reset}
          className="bg-green hover:bg-green-hover text-white"
        >
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}
