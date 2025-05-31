import { useDrag } from "react-dnd";
import { Button } from "../components/ui/button";
import { useFormStore } from "../store/formStore";
import { v4 as uuid } from "uuid";

const FIELD_TYPES = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Textarea" },
  { type: "checkbox", label: "Checkbox" },
  { type: "dropdown", label: "Dropdown" },
  { type: "date", label: "Date" },
];

function DraggableFieldType({ type, label }: { type: string; label: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FIELD_TYPE",
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  const icons: Record<string, JSX.Element> = {
    text: <span className="mr-2">📝</span>,
    textarea: <span className="mr-2">📄</span>,
    checkbox: <span className="mr-2">☑️</span>,
    dropdown: <span className="mr-2">🔽</span>,
    date: <span className="mr-2">📅</span>,
  };
  return (
    <div
      ref={drag}
      className={`flex items-center px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white shadow-sm cursor-move transition-all duration-200 hover:scale-105 hover:shadow-xl hover:bg-primary/10 dark:hover:bg-primary/20 mb-1 ${
        isDragging ? "opacity-40 scale-95 animate-fadeInScale" : ""
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {icons[type]}
      <span className="font-medium">{label}</span>
    </div>
  );
}

export default function Sidebar() {
  // Only access window in the browser
  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return (
    <div className="p-4 space-y-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 min-h-[350px] flex flex-col items-center">
      <img
        src={isDark ? "/logo-dark.png" : "/logo-light.png"}
        alt="FormBuilder Logo"
        className="w-16 h-16 mb-2 rounded-full shadow-lg ring-2 ring-primary/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md transition-transform duration-300 hover:scale-110 hover:ring-primary/80"
      />
      <h2 className="text-2xl font-extrabold text-black dark:text-white mb-2 tracking-tight bg-gradient-to-r from-primary/80 to-fuchsia-500/60 bg-clip-text text-transparent drop-shadow-md">
        Add Field
      </h2>
      <div className="w-full border-b border-gray-200 dark:border-gray-700 mb-3" />
      <div className="w-full flex flex-col gap-3">
        {FIELD_TYPES.map((f) => (
          <DraggableFieldType key={f.type} type={f.type} label={f.label} />
        ))}
      </div>
    </div>
  );
}
