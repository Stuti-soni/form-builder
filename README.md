# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

# Remix Form Builder

A modern, drag-and-drop form builder app built with Remix, Tailwind CSS, Zustand, and ShadCN UI.

## Features

- **Drag-and-drop**: Add and reorder fields (Text, Textarea, Checkbox, Dropdown, Date) with a modern UI.
- **Undo/Redo**: Robust undo/redo for all form changes.
- **Field Configuration**: Configure label, placeholder, required, help text, min/max/pattern, and more.
- **Checkbox & Dropdown**: Checkbox supports single tickable box; Dropdown supports options.
- **Multi-step Forms**: Split forms into multiple steps.
- **Real-time Preview**: See your form as you build, with Desktop/Tablet/Mobile preview modes.
- **Template Management**: Save, load, and delete custom and predefined templates.
- **Shareable Links**: Generate public links to share and fill forms.
- **Response Collection**: Collect and view responses for each form (saved in localStorage).
- **Dark/Light Mode**: Beautiful, animated UI with full theme support.

## Tech Stack

- [Remix](https://remix.run/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [ShadCN UI](https://ui.shadcn.com/)
- [react-dnd](https://react-dnd.github.io/react-dnd/about)
- [react-icons](https://react-icons.github.io/react-icons/)

## Usage

1. Clone the repo and install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Author

- GitHub: [Stuti-soni](https://github.com/Stuti-soni)
- Email: 22bec121@iiitdmj.ac.in

---

Enjoy building beautiful forms!
