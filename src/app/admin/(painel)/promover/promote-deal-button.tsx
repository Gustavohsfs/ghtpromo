"use client";

import { useState } from "react";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { buildWhatsAppMessage, type WhatsAppDealInfo } from "@/features/deals/whatsapp-message";

/**
 * Monta a mensagem-template da oferta, copia para o clipboard e abre o
 * WhatsApp com o texto pré-preenchido — o usuário escolhe o grupo e envia.
 */
export function PromoteDealButton({ deal }: { deal: WhatsAppDealInfo }) {
  const [open, setOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const message = buildWhatsAppMessage(deal, customMessage);

  async function copyAndOpen() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem clipboard (contexto não seguro etc.): o texto pré-preenchido ainda resolve.
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }

  return (
    <>
      <Button variant="confirm" size="sm" onClick={() => setOpen(true)}>
        <MessageCircle className="size-4" aria-hidden />
        Promover
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Promover no WhatsApp"
        className="max-w-lg"
      >
        <div className="flex flex-col gap-4">
          <div
            data-testid="whatsapp-preview"
            className="border-border bg-surface-raised max-h-64 overflow-y-auto rounded-lg border p-3 text-sm whitespace-pre-wrap"
          >
            {message}
          </div>

          <TextareaField
            label="Mensagem opcional"
            name="customMessage"
            placeholder="Ex.: Corre que o estoque é limitado!"
            value={customMessage}
            onChange={(event) => setCustomMessage(event.target.value)}
            hint="Entra no final da mensagem."
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button variant="confirm" size="sm" onClick={copyAndOpen}>
              {copied ? "Copiado!" : "Copiar e abrir WhatsApp"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
