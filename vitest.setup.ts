import "@testing-library/jest-dom/vitest";

// O jsdom ainda não implementa os métodos de <dialog>. Polyfill mínimo para
// testar componentes que usam showModal()/close() (ex.: Modal/ConfirmDialog).
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.show ??= function show(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}
