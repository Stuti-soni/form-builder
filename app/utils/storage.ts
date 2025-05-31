export const saveToLocal = (data: any) => {
  localStorage.setItem("formBuilderData", JSON.stringify(data));
};

export const loadFromLocal = (): any => {
  const data = localStorage.getItem("formBuilderData");
  return data ? JSON.parse(data) : null;
};

export const predefinedTemplates = [
  {
    name: 'Contact Us',
    fields: [
      { id: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
      { id: 'email', label: 'Email', type: 'text', required: true, placeholder: 'you@example.com', pattern: '^\\S+@\\S+\\.\\S+$' },
      { id: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'How can we help?' },
    ],
  },
  {
    name: 'Feedback',
    fields: [
      { id: 'feedback', label: 'Feedback', type: 'textarea', required: true, placeholder: 'Your feedback' },
      { id: 'email', label: 'Email (optional)', type: 'text', required: false, placeholder: 'you@example.com', pattern: '^\\S+@\\S+\\.\\S+$' },
    ],
  },
];

export const saveTemplateToLocal = (name: string, fields: any[]) => {
  const customTemplates = loadCustomTemplates();
  customTemplates.push({ name, fields });
  localStorage.setItem('formBuilderCustomTemplates', JSON.stringify(customTemplates));
};

export const loadCustomTemplates = (): any[] => {
  const data = localStorage.getItem('formBuilderCustomTemplates');
  return data ? JSON.parse(data) : [];
};
