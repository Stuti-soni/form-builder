import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Field } from "../store/formStore";

// Utility to get and set responses in localStorage
function getResponses(formId: string) {
  return JSON.parse(localStorage.getItem(`formBuilderResponses:${formId}`) || "[]");
}
function saveResponse(formId: string, response: any) {
  const all = getResponses(formId);
  all.push(response);
  localStorage.setItem(`formBuilderResponses:${formId}` , JSON.stringify(all));
}

export default function FormById() {
  const { id } = useParams();
  const [fields, setFields] = useState<Field[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<any>({});

  useEffect(() => {
    const data = localStorage.getItem(`formBuilderData:${id}`);
    if (data) setFields(JSON.parse(data));
  }, [id]);

  if (!fields.length) return <div className="p-8">Form not found or empty.</div>;

  const handleChange = (field: Field, value: any) => {
    setValues((v: any) => ({ ...v, [field.id]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Validate required checkbox group
    for (const field of fields) {
      if (field.type === "checkbox" && field.required && field.options && field.options.length > 0) {
        if (!Array.isArray(values[field.id]) || values[field.id].length === 0) {
          alert(`Please select at least one option for: ${field.label}`);
          return;
        }
      }
    }
    saveResponse(id!, values);
    setSubmitted(true);
  };

  if (submitted) return <div className="p-8 text-green-600 font-bold">Thank you! Your response has been recorded.</div>;

  return (
    <form className="p-8 max-w-2xl mx-auto space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Fill Form</h2>
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block mb-1 font-medium text-black dark:text-white">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.helpText && <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">{field.helpText}</div>}
          {field.type === "text" && (
            <input
              className="w-full p-2 border rounded text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-white dark:bg-gray-900"
              placeholder={field.placeholder}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern}
              value={values[field.id] || ""}
              onChange={e => handleChange(field, e.target.value)}
            />
          )}
          {field.type === "textarea" && (
            <textarea
              className="w-full p-2 border rounded text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 bg-white dark:bg-gray-900"
              placeholder={field.placeholder}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              value={values[field.id] || ""}
              onChange={e => handleChange(field, e.target.value)}
            />
          )}
          {field.type === "checkbox" && field.options && field.options.length > 0 ? (
            <div className="flex flex-col gap-1">
              {field.options.map((opt: string, i: number) => (
                <label key={i} className="flex items-center gap-2 text-black dark:text-white">
                  <input
                    type="checkbox"
                    checked={Array.isArray(values[field.id]) ? values[field.id].includes(opt) : false}
                    onChange={e => {
                      let arr = Array.isArray(values[field.id]) ? [...values[field.id]] : [];
                      if (e.target.checked) arr.push(opt);
                      else arr = arr.filter((v: string) => v !== opt);
                      handleChange(field, arr);
                    }}
                    required={field.required && (!Array.isArray(values[field.id]) || values[field.id].length === 0)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : field.type === "checkbox" ? (
            <input
              type="checkbox"
              className="accent-primary"
              checked={!!values[field.id]}
              onChange={e => handleChange(field, e.target.checked)}
            />
          ) : null}
          {field.type === "dropdown" && (
            <select
              className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-900"
              required={field.required}
              value={values[field.id] || ""}
              onChange={e => handleChange(field, e.target.value)}
            >
              <option value="">Select...</option>
              {(field.options || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          )}
          {field.type === "date" && (
            <input
              type="date"
              className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-900"
              required={field.required}
              value={values[field.id] || ""}
              onChange={e => handleChange(field, e.target.value)}
            />
          )}
        </div>
      ))}
      <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">Submit</button>
    </form>
  );
}
