// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import DivisiPage from "./pages/DivisiPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Induk: Memanggil Layout (Sidebar & Header) */}
        <Route path="/" element={<Layout />}>
          {/* Route Anak: Akan masuk ke dalam <Outlet /> di Layout */}
          <Route index element={<Overview />} />
          <Route
            path="divisi-ip"
            element={<DivisiPage namaDivisi="Divisi IP" />}
          />
          <Route
            path="divisi-ks"
            element={<DivisiPage namaDivisi="Divisi KS" />}
          />
          <Route
            path="divisi-p"
            element={<DivisiPage namaDivisi="Divisi P" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
