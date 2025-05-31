import type { MetaFunction } from "@remix-run/node";
import Sidebar from "../components/Sidebar";
import FormCanvas from "../components/FormCanvas";
import { useEffect, useState, useRef } from "react";
import { useFormStore } from "~/store/formStore";
import { saveToLocal, loadFromLocal, predefinedTemplates, saveTemplateToLocal, loadCustomTemplates } from "~/utils/storage";
import ThemeToggle from "../components/ThemeToggle";
import PreviewModeToggle from "../components/PreviewModeToggle";
import { v4 as uuid } from "uuid";
import { FaUndo, FaRedo, FaShareSquare } from 'react-icons/fa';
import "../tailwind.animations.css";
import "../tailwind.css";
import "../inter-font.css";

// Utility to get and set responses in localStorage
function getAllFormResponses() {
  // Returns an array of {formId, responses}
  const keys = Object.keys(localStorage).filter(k => k.startsWith('formBuilderResponses:'));
  return keys.map(key => ({
    formId: key.replace('formBuilderResponses:', ''),
    responses: JSON.parse(localStorage.getItem(key) || '[]')
  }));
}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { fields, setFields } = useFormStore();
  const [previewClass, setPreviewClass] = useState("max-w-2xl");
  // --- Undo/Redo with two stacks ---
  const undoStack = useRef<Array<typeof fields>>([]);
  const redoStack = useRef<Array<typeof fields>>([]);
  const isUndoRedo = useRef(false);

  // On mount, initialize undoStack with initial fields
  useEffect(() => {
    // Always push the initial state, even if empty
    undoStack.current = [fields.map(f => ({ ...f }))];
    redoStack.current = [];
    // eslint-disable-next-line
  }, []);

  // Push to undoStack on every fields change (except undo/redo)
  useEffect(() => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }
    // Only push if different from last
    if (
      JSON.stringify(fields) !== JSON.stringify(undoStack.current[undoStack.current.length - 1])
    ) {
      undoStack.current.push(fields.map(f => ({ ...f })));
      redoStack.current = [];
    }
  }, [fields]);

  // Undo handler
  const handleUndo = () => {
    if (undoStack.current.length > 1) {
      const current = undoStack.current.pop();
      if (current) redoStack.current.push(current);
      const prev = undoStack.current[undoStack.current.length - 1];
      if (prev) {
        isUndoRedo.current = true;
        setFields(prev.map(f => ({ ...f })));
      }
    }
  };

  // Redo handler
  const handleRedo = () => {
    if (redoStack.current.length > 0) {
      const next = redoStack.current.pop();
      if (next) {
        undoStack.current.push(next);
        isUndoRedo.current = true;
        setFields(next.map(f => ({ ...f })));
      }
    }
  };

  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [showResponses, setShowResponses] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);

  // SSR-safe window usage
  const isBrowser = typeof window !== "undefined";

  useEffect(() => {
    const saved = loadFromLocal();
    if (saved) setFields(saved);
  }, [setFields]);

  useEffect(() => {
    saveToLocal(fields);
  }, [fields]);

  useEffect(() => {
    setCustomTemplates(loadCustomTemplates());
  }, [showTemplates]);

  const saveShareable = () => {
    if (!isBrowser) return;
    const id = uuid();
    localStorage.setItem(`formBuilderData:${id}`, JSON.stringify(fields));
    window.prompt("Share this form link:", `${window.location.origin}/form/${id}`);
  };

  const loadTemplate = (fields: any[]) => {
    setFields(fields.map(f => ({ ...f, id: uuid() })));
    setShowTemplates(false);
  };

  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      saveTemplateToLocal(templateName, fields);
      setCustomTemplates(loadCustomTemplates());
      setShowSaveTemplate(false);
      setTemplateName("");
    }
  };

  const deleteTemplateFromLocal = (name: string) => {
    const templates = loadCustomTemplates();
    const filtered = templates.filter((tpl: any) => tpl.name !== name);
    localStorage.setItem("formBuilderCustomTemplates", JSON.stringify(filtered));
    setCustomTemplates(filtered);
  };

  const handleShowResponses = () => {
    // Get all responses for this form (by id)
    const id = window.prompt('Enter Form ID to view responses:');
    if (!id) return;
    const resp = JSON.parse(localStorage.getItem(`formBuilderResponses:${id}`) || '[]');
    setResponses(resp);
    setShowResponses(true);
  };

  return (
    <div className="p-8 min-h-screen relative bg-gradient-to-br from-blue-50 via-fuchsia-50 to-pink-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800 overflow-x-hidden font-inter antialiased text-gray-900 dark:text-gray-100">
      {/* Animated background shapes */}
      <div className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-gradient-to-br from-blue-400/30 to-fuchsia-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[260px] h-[260px] bg-gradient-to-tr from-pink-400/20 to-yellow-300/20 rounded-full blur-2xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 w-[180px] h-[180px] bg-gradient-to-br from-fuchsia-400/20 to-blue-300/20 rounded-full blur-2xl animate-float-fast" style={{transform: 'translate(-50%, -50%)'}} />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between mb-4 gap-2 font-semibold tracking-tight text-lg md:text-xl">
          <ThemeToggle />
          <PreviewModeToggle onChange={setPreviewClass} />
          <button onClick={() => setShowTemplates(v => !v)} className="px-2 py-1 border rounded transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-primary/50" type="button">Templates</button>
          <button onClick={() => setShowSaveTemplate(true)} className="px-2 py-1 border rounded transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-primary/50" type="button">Save as Template</button>
          <button onClick={handleUndo} disabled={undoStack.current.length <= 1} className="px-2 py-1 border rounded flex items-center gap-1 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed" type="button">
            <FaUndo /> Undo
          </button>
          <button onClick={handleRedo} disabled={redoStack.current.length === 0} className="px-2 py-1 border rounded flex items-center gap-1 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed" type="button">
            <FaRedo /> Redo
          </button>
          <button onClick={saveShareable} className="px-2 py-1 border rounded bg-primary text-primary-foreground flex items-center gap-1 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-primary/50">
            <FaShareSquare /> Share Form
          </button>
          <button onClick={handleShowResponses} className="px-2 py-1 border rounded transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-primary/50" type="button">View Responses</button>
        </div>
        {showTemplates && (
          <div className="mb-4 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl max-w-md mx-auto animate-fadeInScale font-inter">
            <h3 className="font-bold mb-4 text-black dark:text-white text-lg flex items-center gap-2">
              {isBrowser && (
                <img
                  src={window.matchMedia('(prefers-color-scheme: dark)').matches ? '/logo-dark.png' : '/logo-light.png'}
                  alt="Logo"
                  className="w-8 h-8 rounded-full shadow-lg ring-2 ring-primary/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md transition-transform duration-300 hover:scale-110 hover:ring-primary/80"
                />
              )}
              Templates
            </h3>
            <div className="flex flex-col gap-2">
              {predefinedTemplates.map((tpl) => (
                <button key={tpl.name} className="block px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg w-full text-left text-black dark:text-white bg-gray-50 dark:bg-gray-800 font-medium shadow-sm hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-150" onClick={() => loadTemplate(tpl.fields)}>
                  {tpl.name}
                </button>
              ))}
              {customTemplates.length > 0 && <div className="mt-2 font-semibold text-black dark:text-white">Your Templates</div>}
              {customTemplates.map((tpl) => (
                <div key={tpl.name} className="flex items-center gap-2 group">
                  <button
                    className="block flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-black dark:text-white bg-gray-50 dark:bg-gray-800 font-medium shadow-sm hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-150"
                    onClick={() => loadTemplate(tpl.fields)}
                  >
                    {tpl.name}
                  </button>
                  <button
                    className="text-red-500 opacity-70 hover:opacity-100 px-2 py-1 rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                    title="Delete template"
                    onClick={() => deleteTemplateFromLocal(tpl.name)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {showSaveTemplate && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 animate-fadeIn font-inter">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-md w-full animate-fadeInScale">
              <h3 className="font-bold mb-4 text-black dark:text-white text-lg flex items-center gap-2">
                {isBrowser && (
                  <img
                    src={window.matchMedia('(prefers-color-scheme: dark)').matches ? '/logo-dark.png' : '/logo-light.png'}
                    alt="Logo"
                    className="w-8 h-8 rounded-full shadow-lg ring-2 ring-primary/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md transition-transform duration-300 hover:scale-110 hover:ring-primary/80"
                  />
                )}
                Save Current Form as Template
              </h3>
              <input
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mb-4 w-full text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-gray-50 dark:bg-gray-800 shadow-sm"
                placeholder="Template name"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 border rounded-lg bg-primary text-primary-foreground font-medium shadow-sm" onClick={handleSaveTemplate}>Save</button>
                <button className="px-4 py-2 border rounded-lg text-black dark:text-white bg-gray-100 dark:bg-gray-800 font-medium shadow-sm" onClick={() => setShowSaveTemplate(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {showResponses && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 animate-fadeIn font-inter">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full animate-fadeInScale overflow-auto max-h-[80vh]">
              <h3 className="font-bold mb-4 text-black dark:text-white text-lg flex items-center gap-2">Form Responses</h3>
              {responses.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-300">No responses found for this Form ID.</div>
              ) : (
                <div className="space-y-4">
                  {responses.map((resp, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="font-semibold mb-2 text-primary">Response #{i + 1}</div>
                      <pre className="text-xs whitespace-pre-wrap break-all text-black dark:text-white">{JSON.stringify(resp, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 border rounded-lg bg-primary text-primary-foreground font-medium shadow-sm" onClick={() => setShowResponses(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 layout">
          <Sidebar />
          <div className={`md:col-span-3 ${previewClass}`}>
            <FormCanvas />
          </div>
        </div>
      </div>
    </div>
  );
}
