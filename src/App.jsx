import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Sensaciones from './pages/Sensaciones';
import Emociones from './pages/Emociones';
import EstadosAnimo from './pages/EstadosAnimo';
import Recursos from './pages/Recursos';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sensaciones" element={<Sensaciones />} />
              <Route path="/emociones" element={<Emociones />} />
              <Route path="/estados-animo" element={<EstadosAnimo />} />
              <Route path="/recursos" element={<Recursos />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App; 