import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress DOM errors caused by browser extensions (Grammarly, translators, password managers)
// that inject nodes into the DOM and break React's reconciliation
const origRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
  if (child.parentNode !== this) {
    console.warn("[DOM] removeChild: node is not a child — likely a browser extension conflict");
    return child;
  }
  return origRemoveChild.call(this, child) as T;
};

createRoot(document.getElementById("root")!).render(<App />);
