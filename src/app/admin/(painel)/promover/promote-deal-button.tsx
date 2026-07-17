"use client";

import { useState, useSyncExternalStore } from "react";

import { Check, Copy, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { buildWhatsAppMessage, type WhatsAppDealInfo } from "@/features/deals/whatsapp-message";

const WHATSAPP_WEB_URL = "https://web.whatsapp.com/";

/** userAgent só existe no cliente; via useSyncExternalStore não dá mismatch. */
const subscribeNoop = () => () => {};

function getIsMobileSnapshot(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeNoop, getIsMobileSnapshot, () => false);
}

/**
 * Monta a mensagem-template da oferta e leva para o WhatsApp. No celular o
 * deep-link `wa.me` já entrega o texto com emojis certinhos. No computador o
 * app corrompe os emojis vindos do link, então copiamos a mensagem (o
 * clipboard preserva tudo) para colar no grupo com Ctrl+V.
 */
export function PromoteDealButton({ deal }: { deal: WhatsAppDealInfo }) {
  const [open, setOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  const message = buildWhatsAppMessage(deal, customMessage);

  async function copyMessage(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return true;
    } catch {
      window.prompt("Copie a mensagem:", message);
      return false;
    }
  }

  function sendOnMobile() {
    void copyMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }

  async function copyForDesktop() {
    await copyMessage();
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
        className="sm:max-w-lg"
        footer={
          isMobile ? (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Fechar
              </Button>
              <Button variant="confirm" size="sm" onClick={sendOnMobile}>
                <MessageCircle className="size-4" aria-hidden />
                Enviar no WhatsApp
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <a
                href={WHATSAPP_WEB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand order-2 text-center text-xs underline transition-colors sm:order-1 sm:mr-auto sm:text-left"
              >
                Abrir WhatsApp Web
              </a>
              <Button
                variant="outline"
                size="sm"
                className="order-3 sm:order-2"
                onClick={() => setOpen(false)}
              >
                Fechar
              </Button>
              <Button
                variant="confirm"
                size="sm"
                className="order-1 sm:order-3"
                onClick={copyForDesktop}
              >
                {copied ? (
                  <>
                    <Check className="size-4" aria-hidden />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" aria-hidden />
                    Copiar mensagem
                  </>
                )}
              </Button>
            </div>
          )
        }
      >
        <div className="flex flex-col gap-4">
          <div
            data-testid="whatsapp-preview"
            className="border-border bg-surface-raised rounded-lg border p-3 text-sm whitespace-pre-wrap"
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

          <p className="text-muted-foreground text-xs leading-relaxed">
            {isMobile
              ? "Toque em enviar, escolha o grupo dos seus clientes e pronto."
              : "Copie a mensagem e cole no grupo do WhatsApp (Ctrl+V) — assim os emojis e o layout saem certinhos, igual ao celular."}
          </p>
        </div>
      </Modal>
    </>
  );
}
