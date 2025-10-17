// js/firebase.js
// Importa como módulo en tus páginas: <script type="module" src="./js/archivo.js"></script>
// Usa la versión modular de Firebase (CDN). Si prefieres otra versión, cámbiala.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// --- PON TU CONFIGURACIÓN AQUÍ (separada del resto) ---
const firebaseConfig = {
  apiKey: "AIzaSyDWSVWoc_qu-LKyjsNAU-ZXnRp_lsMXzZA",
  authDomain: "chathes-a7d82.firebaseapp.com",
  projectId: "chathes-a7d82",
  storageBucket: "chathes-a7d82.firebasestorage.app",
  messagingSenderId: "724374821810",
  appId: "1:724374821810:web:cab014ce0a0d19effae2ab"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
