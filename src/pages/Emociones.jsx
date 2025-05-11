import { useState } from 'react';
import { motion } from 'framer-motion';

const emocionesBasicas = {
  alegria: {
    nombre: 'Alegría',
    subcategorias: ['euforia', 'satisfacción', 'entusiasmo', 'felicidad'],
  },
  tristeza: {
    nombre: 'Tristeza',
    subcategorias: ['pena', 'desesperanza', 'soledad', 'nostalgia'],
  },
  miedo: {
    nombre: 'Miedo',
    subcategorias: ['ansiedad', 'pánico', 'preocupación', 'terror'],
  },
  enojo: {
    nombre: 'Enojo',
    subcategorias: ['ira', 'frustración', 'resentimiento', 'rabia'],
  },
  sorpresa: {
    nombre: 'Sorpresa',
    subcategorias: ['asombro', 'desconcierto', 'impacto', 'admiración'],
  },
  asco: {
    nombre: 'Asco',
    subcategorias: ['repulsión', 'desagrado', 'rechazo', 'aversión'],
  },
};

const emocionesSociales = {
  amor: {
    nombre: 'Amor',
    subcategorias: ['ternura', 'afecto', 'compasión', 'cariño'],
  },
  gratitud: {
    nombre: 'Gratitud',
    subcategorias: ['reconocimiento', 'agradecimiento', 'aprecio', 'valoración'],
  },
  culpa: {
    nombre: 'Culpa',
    subcategorias: ['remordimiento', 'arrepentimiento', 'vergüenza', 'pesar'],
  },
  orgullo: {
    nombre: 'Orgullo',
    subcategorias: ['satisfacción', 'logro', 'autoestima', 'dignidad'],
  },
  celos: {
    nombre: 'Celos',
    subcategorias: ['envidia', 'posesividad', 'inseguridad', 'competitividad'],
  },
};

const Emociones = () => {
  const [emocionSeleccionada, setEmocionSeleccionada] = useState(null);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(null);

  const handleEmocionClick = (categoria, emocion) => {
    setEmocionSeleccionada({ categoria, ...emocion });
    setSubcategoriaSeleccionada(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Emociones</h1>
        <p className="mt-2 text-lg text-gray-600">
          Identifica y explora tus emociones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Emociones Básicas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Emociones Básicas</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(emocionesBasicas).map(([key, emocion]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg shadow-md cursor-pointer ${
                  emocionSeleccionada?.nombre === emocion.nombre
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleEmocionClick('basicas', emocion)}
              >
                <h3 className="font-medium text-gray-900">{emocion.nombre}</h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emociones Sociales */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Emociones Sociales</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(emocionesSociales).map(([key, emocion]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg shadow-md cursor-pointer ${
                  emocionSeleccionada?.nombre === emocion.nombre
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleEmocionClick('sociales', emocion)}
              >
                <h3 className="font-medium text-gray-900">{emocion.nombre}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Subcategorías */}
      {emocionSeleccionada && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subcategorías de {emocionSeleccionada.nombre}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emocionSeleccionada.subcategorias.map((subcategoria) => (
              <motion.div
                key={subcategoria}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg cursor-pointer text-center ${
                  subcategoriaSeleccionada === subcategoria
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSubcategoriaSeleccionada(subcategoria)}
              >
                <span className="text-gray-700">{subcategoria}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Emociones; 