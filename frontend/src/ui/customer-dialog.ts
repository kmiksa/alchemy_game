import type { Customer } from "../api/client";

export type CustomerDialog = {
  show: (c: Customer) => void;
  hide: () => void;
  onServe: (cb: () => void) => void;
};

export function createCustomerDialog(): CustomerDialog {
  const root = document.getElementById("overlay-customer-dialog")!;
  let serveCallback: (() => void) | null = null;

  function render(c: Customer): void {
    root.innerHTML = `
      <div class="card customer-card">
        <h2>${escape(c.name)}</h2>
        <p class="persona">${escape(c.persona)}</p>
        <p class="narrative">${escape(c.ailment_narrative)}</p>
        <button id="customer-serve-btn" class="btn primary">Serve from cauldron</button>
      </div>
    `;
    root.hidden = false;
    document.getElementById("customer-serve-btn")!.addEventListener("click", () => {
      serveCallback?.();
    });
  }

  return {
    show: render,
    hide: () => {
      root.hidden = true;
      root.innerHTML = "";
    },
    onServe: (cb) => {
      serveCallback = cb;
    },
  };
}

function escape(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
