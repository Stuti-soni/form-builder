import { useState } from "react";

const modes = [
  { label: "Desktop", className: "max-w-2xl" },
  { label: "Tablet", className: "max-w-lg" },
  { label: "Mobile", className: "max-w-xs" },
];

export default function PreviewModeToggle({ onChange }: { onChange: (className: string) => void }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-2 mb-4">
      {modes.map((m, i) => (
        <button
          key={m.label}
          className={`px-2 py-1 rounded border ${active === i ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => {
            setActive(i);
            onChange(m.className);
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
