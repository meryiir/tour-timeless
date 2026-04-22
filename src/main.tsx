import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import "flag-icons/css/flag-icons.min.css";

const rootElement = document.getElementById("root")!;

// react-snap pre-renders pages by running React in headless Chrome and saving
// the resulting DOM. When it does, React replaces #root's children (including
// the #app-loader placeholder) with the actual component tree. On subsequent
// real-user visits the pre-rendered HTML is served; #app-loader is gone from
// #root, so we hydrate instead of doing a full render.
const isPrerendered = !document.getElementById("app-loader");

if (isPrerendered) {
  hydrateRoot(rootElement, <App />);
} else {
  createRoot(rootElement).render(<App />);
}
