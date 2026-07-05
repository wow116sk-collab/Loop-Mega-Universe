import React from "react";
import { createRoot } from "react-dom/client";
import AccountingApp from "./accounting-app-peak-v1.6.jsx";

const el = document.getElementById("root");
el.innerHTML = "";
createRoot(el).render(<AccountingApp />);
