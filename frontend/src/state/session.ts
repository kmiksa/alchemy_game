import type { Customer } from "../api/client";

export type Session = {
  currentCustomer: Customer | null;
  cauldronContents: string[];
  reputation: number;
};

type Listener = (state: Readonly<Session>) => void;

const state: Session = {
  currentCustomer: null,
  cauldronContents: [],
  reputation: 0,
};

const listeners = new Set<Listener>();

export const session = {
  get(): Readonly<Session> {
    return state;
  },
  setCurrentCustomer(c: Customer | null): void {
    state.currentCustomer = c;
    notify();
  },
  addIngredient(slug: string): void {
    state.cauldronContents.push(slug);
    notify();
  },
  clearCauldron(): void {
    state.cauldronContents = [];
    notify();
  },
  setReputation(value: number): void {
    state.reputation = value;
    notify();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(state);
    return () => listeners.delete(listener);
  },
};

function notify(): void {
  listeners.forEach((l) => l(state));
}
