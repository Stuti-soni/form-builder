import { create } from "zustand";
import { Field } from "./formStore";

interface HistoryState {
  history: Field[][];
  pointer: number;
  set: (fields: Field[]) => void;
  undo: () => void;
  redo: () => void;
  goTo: (pointer: number) => Field[];
  canUndo: boolean;
  canRedo: boolean;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [[]],
  pointer: 0,
  set: (fields) => {
    const { pointer, history } = get();
    const newFields = fields.map((f) => ({ ...f })); // ensure new reference
    const newHistory = history.slice(0, pointer + 1);
    newHistory.push(newFields);
    set({ history: newHistory, pointer: newHistory.length - 1 });
  },
  undo: () => {
    set((state) => ({ pointer: Math.max(0, state.pointer - 1) }));
  },
  redo: () => {
    set((state) => ({ pointer: Math.min(state.history.length - 1, state.pointer + 1) }));
  },
  goTo: (pointer) => {
    const { history } = get();
    const safePointer = Math.max(0, Math.min(pointer, history.length - 1));
    set({ pointer: safePointer });
    // Always return a new reference
    return history[safePointer] ? history[safePointer].map((f) => ({ ...f })) : [];
  },
  get canUndo() {
    return get().pointer > 0;
  },
  get canRedo() {
    return get().pointer < get().history.length - 1;
  },
}));
