import { create } from "zustand";

export type FieldType = "text" | "textarea" | "checkbox" | "dropdown" | "date";

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  helpText?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface FormState {
  fields: Field[];
  addField: (field: Field) => void;
  removeField: (id: string) => void;
  updateField: (field: Field) => void;
  setFields: (fields: Field[]) => void;
}

export const useFormStore = create<FormState>((set) => ({
  fields: [],
  addField: (field) => set((state) => ({ fields: [...state.fields, field] })),
  removeField: (id) =>
    set((state) => ({ fields: state.fields.filter((f) => f.id !== id) })),
  updateField: (field) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === field.id ? field : f)),
    })),
  setFields: (fields) => set(() => ({ fields })),
}));
