import { useState } from 'react';
import { motion } from 'framer-motion';

const sensacionesFisicas = [
  { id: 1, nombre: 'Tensión muscular', categoria: 'Tensión' },
  { id: 2, nombre: 'Nudo en la garganta', categoria: 'Tensión' },
  { id: 3, nombre: 'Sudoración', categoria: 'Activación' },
  { id: 4, nombre: 'Palpitaciones', categoria: 'Activación' },
  { id: 5, nombre: 'Pesadez en el pecho', categoria: 'Tensión' },
  { id: 6, nombre: 'Hormigueo', categoria: 'Sensación' },
  { id: 7, nombre: 'Calor', categoria: 'Temperatura' },
  { id: 8, nombre: 'Frío', categoria: 'Temperatura' },
];

const Sensaciones = () => {
  const [sensacionesSeleccionadas, setSensacionesSeleccionadas] = useState([]);

  const toggleSensacion = (sensacion) => {
    setSensacionesSeleccionadas((prev) =>
      prev.includes(sensacion.id)
        ? prev.filter((id) => id !== sensacion.id)
        : [...prev, sensacion.id]
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sensaciones Físicas</h1>
        <p className="mt-2 text-lg text-gray-600">
          Selecciona las sensaciones físicas que estás experimentando
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensacionesFisicas.map((sensacion) => (
          <motion.div
            key={sensacion.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-lg shadow-md cursor-pointer transition-colors ${
              sensacionesSeleccionadas.includes(sensacion.id)
                ? 'bg-primary-100 border-2 border-primary-500'
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => toggleSensacion(sensacion)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {sensacion.nombre}
              </h3>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                {sensacion.categoria}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {sensacionesSeleccionadas.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sensaciones Seleccionadas
          </h2>
          <div className="space-y-2">
            {sensacionesSeleccionadas.map((id) => {
              const sensacion = sensacionesFisicas.find((s) => s.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="text-gray-700">{sensacion.nombre}</span>
                  <button
                    onClick={() => toggleSensacion(sensacion)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sensaciones; 