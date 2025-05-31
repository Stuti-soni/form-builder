import { create } from "zustand";
import { Field } from "./formStore";

interface StepState {
  steps: Field[][];
  current: number;
  setSteps: (steps: Field[][]) => void;
  next: () => void;
  prev: () => void;
  resetSteps: (fields: Field[]) => void;
}

export const useStepStore = create<StepState>((set) => ({
  steps: [[]],
  current: 0,
  setSteps: (steps) => set({ steps }),
  next: () => set((s) => ({ current: Math.min(s.steps.length - 1, s.current + 1) })),
  prev: () => set((s) => ({ current: Math.max(0, s.current - 1) })),
  resetSteps: (fields) => {
    const mid = Math.ceil(fields.length / 2);
    set({
      steps: [fields.slice(0, mid), fields.slice(mid)],
      current: 0,
    });
  },
}));
