"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("pdb_cookies_accepted");
    if (!accepted) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem("pdb_cookies_accepted", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-footer-bg text-white p-4 shadow-lg">
      <div className="mx-auto max-w-[1240px] flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm flex-1">
          Este site utiliza cookies para melhorar sua experiência. Ao continuar
          navegando, você concorda com nossa{" "}
          <a href="/privacidade" className="underline text-green-light">
            Política de Privacidade
          </a>
          .
        </p>
        <Button
          onClick={handleAccept}
          className="bg-green hover:bg-green-hover text-white font-semibold px-6 shrink-0"
        >
          Aceitar
        </Button>
      </div>
    </div>
  );
}
