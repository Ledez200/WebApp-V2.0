import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ChartBarIcon } from '@heroicons/react/outline';

const estadosAnimo = [
  { id: 1, nombre: 'Calma', color: 'bg-blue-100', textColor: 'text-blue-800' },
  { id: 2, nombre: 'Paz', color: 'bg-green-100', textColor: 'text-green-800' },
  { id: 3, nombre: 'Claridad', color: 'bg-purple-100', textColor: 'text-purple-800' },
  { id: 4, nombre: 'Motivación', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { id: 5, nombre: 'Esperanza', color: 'bg-pink-100', textColor: 'text-pink-800' },
  { id: 6, nombre: 'Frustración', color: 'bg-red-100', textColor: 'text-red-800' },
  { id: 7, nombre: 'Desmotivación', color: 'bg-gray-100', textColor: 'text-gray-800' },
  { id: 8, nombre: 'Ansiedad', color: 'bg-orange-100', textColor: 'text-orange-800' },
];

const EstadosAnimo = () => {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [nota, setNota] = useState('');

  const handleRegistro = () => {
    if (estadoSeleccionado) {
      const nuevoRegistro = {
        id: Date.now(),
        estado: estadoSeleccionado,
        nota,
        fecha: new Date().toISOString(),
      };
      setRegistros([...registros, nuevoRegistro]);
      setEstadoSeleccionado(null);
      setNota('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Estados de Ánimo</h1>
        <p className="mt-2 text-lg text-gray-600">
          Registra y sigue tus estados de ánimo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Selección de Estado */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">¿Cómo te sientes hoy?</h2>
          <div className="grid grid-cols-2 gap-4">
            {estadosAnimo.map((estado) => (
              <motion.div
                key={estado.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg shadow-md cursor-pointer ${
                  estadoSeleccionado?.id === estado.id
                    ? 'ring-2 ring-primary-500'
                    : 'hover:bg-gray-50'
                } ${estado.color}`}
                onClick={() => setEstadoSeleccionado(estado)}
              >
                <h3 className={`font-medium ${estado.textColor}`}>{estado.nombre}</h3>
              </motion.div>
            ))}
          </div>

          {estadoSeleccionado && (
            <div className="mt-4 space-y-4">
              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
                placeholder="¿Quieres agregar alguna nota sobre cómo te sientes?"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
              <button
                className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
                onClick={handleRegistro}
              >
                Registrar Estado
              </button>
            </div>
          )}
        </div>

        {/* Historial de Estados */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Historial</h2>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <CalendarIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <ChartBarIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {registros.map((registro) => (
              <div
                key={registro.id}
                className="p-4 bg-white rounded-lg shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full ${registro.estado.color} ${registro.estado.textColor}`}>
                    {registro.estado.nombre}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(registro.fecha).toLocaleDateString()}
                  </span>
                </div>
                {registro.nota && (
                  <p className="mt-2 text-gray-700">{registro.nota}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadosAnimo; 