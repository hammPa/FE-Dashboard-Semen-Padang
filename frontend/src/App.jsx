// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout     from "./components/Layout";
import Overview   from "./pages/Overview";
import DivisiIP   from "./pages/DivisiIP";
import DivisiKS   from "./pages/DivisiKS";
import DivisiP    from "./pages/DivisiP";
import Pengaturan from "./pages/Pengaturan";
import AIChatbot  from "./components/AIChatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="divisi-ip"  element={<DivisiIP />} />
          <Route path="divisi-ks"  element={<DivisiKS />} />
          <Route path="divisi-p"   element={<DivisiP />} />
          <Route path="pengaturan" element={<Pengaturan />} />
        </Route>
      </Routes>
      {/* Global AI Chatbot floating button */}
      <AIChatbot />
    </BrowserRouter>
  );
}

export default App;