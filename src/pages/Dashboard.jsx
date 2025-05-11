import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, EmojiHappyIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/outline';

const Dashboard = () => {
  const [estadoActual, setEstadoActual] = useState({
    sensaciones: [],
    emocion: null,
    estadoAnimo: null,
  });

  const secciones = [
    {
      id: 1,
      titulo: 'Sensaciones Físicas',
      descripcion: 'Registra y monitorea tus sensaciones corporales',
      icono: HeartIcon,
      ruta: '/sensaciones',
      color: 'bg-pink-100',
      textColor: 'text-pink-800',
    },
    {
      id: 2,
      titulo: 'Emociones',
      descripcion: 'Explora y comprende tus emociones',
      icono: EmojiHappyIcon,
      ruta: '/emociones',
      color: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    {
      id: 3,
      titulo: 'Estados de Ánimo',
      descripcion: 'Sigue tu estado emocional a lo largo del tiempo',
      icono: ChartBarIcon,
      ruta: '/estados-animo',
      color: 'bg-green-100',
      textColor: 'text-green-800',
    },
    {
      id: 4,
      titulo: 'Recursos',
      descripcion: 'Técnicas y herramientas para la gestión emocional',
      icono: BookOpenIcon,
      ruta: '/recursos',
      color: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido a Emotional Vibes</h1>
        <p className="mt-2 text-lg text-gray-600">
          Tu espacio para la gestión y el bienestar emocional
        </p>
      </div>

      {/* Estado Actual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-medium text-gray-900">Sensaciones Actuales</h3>
          <div className="mt-2 space-y-2">
            {estadoActual.sensaciones.length > 0 ? (
              estadoActual.sensaciones.map((sensacion) => (
                <span
                  key={sensacion}
                  className="inline-block px-2 py-1 text-sm bg-gray-100 rounded-full"
                >
                  {sensacion}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No hay sensaciones registradas</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-medium text-gray-900">Emoción Principal</h3>
          <p className="mt-2 text-gray-600">
            {estadoActual.emocion || 'No hay emoción registrada'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-medium text-gray-900">Estado de Ánimo</h3>
          <p className="mt-2 text-gray-600">
            {estadoActual.estadoAnimo || 'No hay estado de ánimo registrado'}
          </p>
        </div>
      </div>

      {/* Secciones Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {secciones.map((seccion) => {
          const Icon = seccion.icono;
          return (
            <motion.div
              key={seccion.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-lg shadow-md cursor-pointer ${seccion.color}`}
              onClick={() => window.location.href = seccion.ruta}
            >
              <div className="flex items-center space-x-4">
                <Icon className={`h-8 w-8 ${seccion.textColor}`} />
                <div>
                  <h3 className={`text-lg font-medium ${seccion.textColor}`}>
                    {seccion.titulo}
                  </h3>
                  <p className="text-sm text-gray-600">{seccion.descripcion}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sugerencias Rápidas */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sugerencias para Hoy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Ejercicio de Respiración</h3>
            <p className="text-sm text-gray-600">
              Tómate 5 minutos para practicar la respiración 4-7-8
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Reflexión Diaria</h3>
            <p className="text-sm text-gray-600">
              Registra tus emociones y pensamientos del día
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Estiramientos</h3>
            <p className="text-sm text-gray-600">
              Realiza una secuencia corta de estiramientos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 