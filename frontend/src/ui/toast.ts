const root = () => document.getElementById("overlay-toast")!;

let timer: number | null = null;

export function showToast(message: string, kind: "info" | "error" = "info"): void {
  const el = root();
  if (timer !== null) window.clearTimeout(timer);
  el.innerHTML = `<div class="card toast ${kind === "error" ? "toast-error" : ""}">${escape(message)}</div>`;
  el.hidden = false;
  timer = window.setTimeout(() => {
    el.hidden = true;
    el.innerHTML = "";
    timer = null;
  }, 3500);
}

function escape(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
