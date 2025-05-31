import React, { useRef, useEffect } from "react";
import { useFormStore } from "../store/formStore";
import { useStepStore } from "../store/stepStore";
import { loadFromLocal } from "../utils/storage";
import { useDrop, useDrag } from "react-dnd";
import { v4 as uuid } from "uuid";

// Deep comparison for steps
function stepsAreEqual(a: any[][], b: any[][]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      const af = a[i][j],
        bf = b[i][j];
      if (!af || !bf) return false;
      // Compare all relevant field properties
      if (
        af.id !== bf.id ||
        af.type !== bf.type ||
        af.label !== bf.label ||
        af.placeholder !== bf.placeholder
      ) {
        return false;
      }
    }
  }
  return true;
}

export default function FormCanvas() {
  const fields = useFormStore((s) => s.fields);
  const setFields = useFormStore((s) => s.setFields);
  const { steps, current, setSteps, next, prev } = useStepStore();
  const stepsSetRef = useRef(false);

  // Load fields from local storage only if fields are empty
  useEffect(() => {
    if (fields.length === 0) {
      const saved = loadFromLocal();
      if (saved && saved.length > 0) {
        setFields(saved);
      }
    }
    // eslint-disable-next-line
  }, [fields.length]);

  // Update steps only if fields are present and steps are not already set for these fields
  useEffect(() => {
    if (fields.length === 0) return;
    const mid = Math.ceil(fields.length / 2);
    const newSteps = [fields.slice(0, mid), fields.slice(mid)];
    if (!stepsAreEqual(steps, newSteps)) {
      setSteps(newSteps);
      stepsSetRef.current = true;
    } else {
      stepsSetRef.current = false;
    }
    // eslint-disable-next-line
  }, [fields]);

  // Drag-and-drop: accept FIELD_TYPE from Sidebar and FIELD_REORDER from Canvas
  const addField = useFormStore((s) => s.addField);
  const updateField = useFormStore((s) => s.updateField);
  const removeField = useFormStore((s) => s.removeField);
  const [, drop] = useDrop({
    accept: ["FIELD_TYPE", "FIELD_REORDER"],
    drop: (item: any, monitor) => {
      if (monitor.getItemType() === "FIELD_TYPE") {
        addField({ id: uuid(), label: item.type, type: item.type as any });
      }
    },
    hover: (item: any, monitor) => {
      // No-op for now
    },
  });

  // Drag-and-drop reorder logic
  function DraggableField({ field, index }: { field: any; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: "FIELD_REORDER",
        item: { id: field.id, index },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [field, index]
    );
    const [{ isOver }, dropField] = useDrop({
      accept: "FIELD_REORDER",
      hover: (item: any) => {
        if (item.index !== index) {
          const updated = [...fields];
          const [removed] = updated.splice(item.index, 1);
          updated.splice(index, 0, removed);
          setFields(updated);
          item.index = index;
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    });
    drag(dropField(ref));
    return (
      <div
        ref={ref}
        className={`mb-4 field bg-gray-50 border p-2 rounded relative transition-all duration-200 ${
          isDragging ? "opacity-50 scale-95 animate-fadeInScale" : ""
        } ${isOver ? "ring-2 ring-primary" : ""}`}
      >
        <FieldConfig
          field={field}
          updateField={updateField}
          removeField={removeField}
        />
      </div>
    );
  }

  // Field configuration UI
  function FieldConfig({ field, updateField, removeField }: any) {
    return (
      <div>
        <div className="flex gap-2 items-center mb-1">
          <input
            className="border rounded px-2 py-1 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-white dark:bg-gray-900"
            value={field.label}
            onChange={(e) => updateField({ ...field, label: e.target.value })}
            placeholder="Label"
          />
          <button
            onClick={() => removeField(field.id)}
            className="text-red-500 text-xs ml-2"
          >
            ✕
          </button>
        </div>
        {["text", "textarea"].includes(field.type) && (
          <input
            className="border rounded px-2 py-1 text-xs mb-1 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-white dark:bg-gray-900"
            value={field.placeholder || ""}
            onChange={(e) =>
              updateField({ ...field, placeholder: e.target.value })
            }
            placeholder="Placeholder"
          />
        )}
        {field.type === "dropdown" && (
          <input
            className="border rounded px-2 py-1 text-xs mb-1 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-white dark:bg-gray-900"
            value={field.options ? field.options.join(",") : ""}
            onChange={(e) =>
              updateField({ ...field, options: e.target.value.split(",") })
            }
            placeholder="Options (comma separated)"
          />
        )}
        {field.type === "checkbox" && (
          <div className="flex flex-col gap-1 mb-2">
            <label className="flex items-center gap-2 text-xs text-black dark:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={field.checked || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField({ ...field, checked: e.target.checked })}
                tabIndex={0}
              />
              {field.label || "Checkbox"}
            </label>
          </div>
        )}
        <div className="flex gap-2 items-center mt-1">
          <label className="text-xs text-black dark:text-white">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) =>
                updateField({ ...field, required: e.target.checked })
              }
            />{" "}
            Required
          </label>
          {/* Add min/max/pattern for text fields */}
          {["text", "textarea"].includes(field.type) && (
            <>
              <input
                type="number"
                className="border rounded px-1 py-0.5 text-xs w-16 text-black dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                value={field.minLength || ""}
                onChange={(e) =>
                  updateField({
                    ...field,
                    minLength: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Min"
              />
              <input
                type="number"
                className="border rounded px-1 py-0.5 text-xs w-16 text-black dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                value={field.maxLength || ""}
                onChange={(e) =>
                  updateField({
                    ...field,
                    maxLength: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Max"
              />
              <input
                type="text"
                className="border rounded px-1 py-0.5 text-xs w-24 text-black dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                value={field.pattern || ""}
                onChange={(e) => updateField({ ...field, pattern: e.target.value })}
                placeholder="Pattern"
              />
            </>
          )}
        </div>
        <input
          className="border rounded px-2 py-1 text-xs mt-1 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-white dark:bg-gray-900"
          value={field.helpText || ''}
          onChange={(e) => updateField({ ...field, helpText: e.target.value })}
          placeholder="Help text"
        />
      </div>
    );
  }

  // Real-time validation preview for each field
  function FieldPreview({ field }: any) {
    const [value, setValue] = React.useState('');
    const [touched, setTouched] = React.useState(false);
    let error = '';
    if (touched) {
      if (field.required && !value) error = 'Required';
      if (field.minLength && value.length < field.minLength) error = `Min ${field.minLength} chars`;
      if (field.maxLength && value.length > field.maxLength) error = `Max ${field.maxLength} chars`;
      if (field.pattern && value && !(new RegExp(field.pattern).test(value))) error = 'Invalid format';
    }
    return (
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1 text-black dark:text-white">{field.label}{field.required && ' *'}</label>
        {field.type === 'text' && (
          <input
            className={`w-full p-2 border rounded text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-white dark:bg-gray-900 ${error ? 'border-red-400' : ''}`}
            placeholder={field.placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
          />
        )}
        {field.type === 'textarea' && (
          <textarea
            className={`w-full p-2 border rounded text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-white dark:bg-gray-900 ${error ? 'border-red-400' : ''}`}
            placeholder={field.placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
          />
        )}
        {field.type === 'checkbox' && (
          <label className="flex items-center gap-2 text-black dark:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={e => { setValue(e.target.checked ? 'true' : ''); setTouched(true); }}
            />
            {field.label || 'Checkbox'}
          </label>
        )}
        {field.type === 'dropdown' && (
          <select className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-900" onBlur={() => setTouched(true)}>
            <option value="">Select...</option>
            {(field.options || []).map((opt: string, i: number) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        )}
        {field.type === 'date' && (
          <input type="date" className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-900" onBlur={() => setTouched(true)} />
        )}
        {field.helpText && <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">{field.helpText}</div>}
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
    );
  }

  if (!steps.length || steps.every((s) => s.length === 0)) return null;

  return (
    <div
      ref={drop}
      className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 preview-card min-h-[350px] text-black dark:text-white flex flex-col gap-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <img
          src={window.matchMedia('(prefers-color-scheme: dark)').matches ? '/logo-dark.png' : '/logo-light.png'}
          alt="FormBuilder Logo"
          className="w-10 h-10 rounded-full shadow-lg ring-2 ring-primary/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md transition-transform duration-300 hover:scale-110 hover:ring-primary/80"
        />
        <h2 className="text-lg font-bold tracking-tight">Form Preview</h2>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Step {current + 1} of {steps.length}</span>
      </div>
      <div className="flex flex-col gap-4">
        {steps[current].map((field, i) => (
          <div key={field.id} className="mb-2 field bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm relative group transition-all duration-200 animate-fadeInScale">
            <FieldPreview field={field} />
            <button onClick={() => removeField(field.id)} className="absolute top-2 right-2 text-red-500 opacity-70 hover:opacity-100 text-lg font-bold bg-white dark:bg-gray-900 rounded-full w-7 h-7 flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-150">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2 self-end">
        <button
          onClick={prev}
          disabled={current === 0}
          className="px-3 py-1.5 border rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium shadow-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={next}
          disabled={current === steps.length - 1}
          className="px-3 py-1.5 border rounded-lg bg-primary text-primary-foreground font-medium shadow-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
