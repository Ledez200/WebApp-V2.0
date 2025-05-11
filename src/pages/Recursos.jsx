import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, HeartIcon, LightBulbIcon, BookOpenIcon } from '@heroicons/react/outline';

const recursos = [
  {
    id: 1,
    categoria: 'Respiración',
    titulo: 'Respiración 4-7-8',
    descripcion: 'Inhala por 4 segundos, mantén por 7 segundos, exhala por 8 segundos. Repite 4 veces.',
    pasos: [
      'Siéntate cómodamente con la espalda recta',
      'Coloca la punta de la lengua detrás de los dientes superiores',
      'Exhala completamente por la boca',
      'Inhala por la nariz contando hasta 4',
      'Mantén la respiración contando hasta 7',
      'Exhala completamente por la boca contando hasta 8',
      'Repite el ciclo 4 veces'
    ],
    icono: HeartIcon,
  },
  {
    id: 2,
    categoria: 'Journaling',
    titulo: 'Reflexión Emocional',
    descripcion: 'Ejercicio de escritura para explorar y procesar emociones.',
    pasos: [
      'Describe la situación que estás experimentando',
      'Identifica las emociones que sientes',
      'Explora los pensamientos asociados',
      'Reflexiona sobre posibles soluciones',
      'Escribe un mensaje de auto-compasión'
    ],
    icono: BookOpenIcon,
  },
  {
    id: 3,
    categoria: 'Actividad Física',
    titulo: 'Estiramientos Conscientes',
    descripcion: 'Secuencia de estiramientos para liberar tensión física y emocional.',
    pasos: [
      'Estira los brazos hacia arriba',
      'Inclínate hacia adelante',
      'Gira el cuello suavemente',
      'Estira las piernas',
      'Respira profundamente durante cada movimiento'
    ],
    icono: PlayIcon,
  },
  {
    id: 4,
    categoria: 'Mindfulness',
    titulo: 'Escaneo Corporal',
    descripcion: 'Técnica de atención plena para conectar con sensaciones físicas.',
    pasos: [
      'Acuéstate o siéntate cómodamente',
      'Cierra los ojos y respira profundamente',
      'Lleva tu atención a cada parte del cuerpo',
      'Observa las sensaciones sin juzgar',
      'Regresa a la respiración'
    ],
    icono: LightBulbIcon,
  },
];

const Recursos = () => {
  const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
  const [pasoActual, setPasoActual] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleRecursoClick = (recurso) => {
    setRecursoSeleccionado(recurso);
    setPasoActual(0);
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    if (pasoActual < recursoSeleccionado.pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    }
  };

  const handlePrevStep = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Recursos de Autorregulación</h1>
        <p className="mt-2 text-lg text-gray-600">
          Técnicas y herramientas para gestionar tus emociones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lista de Recursos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Recursos Disponibles</h2>
          <div className="space-y-4">
            {recursos.map((recurso) => {
              const Icon = recurso.icono;
              return (
                <motion.div
                  key={recurso.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg shadow-md cursor-pointer ${
                    recursoSeleccionado?.id === recurso.id
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleRecursoClick(recurso)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${recursoSeleccionado?.id === recurso.id ? 'text-primary-500' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{recurso.titulo}</h3>
                      <p className="text-sm text-gray-500">{recurso.categoria}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detalle del Recurso */}
        {recursoSeleccionado && (
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {recursoSeleccionado.titulo}
              </h2>
              <p className="text-gray-600 mb-4">{recursoSeleccionado.descripcion}</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Paso {pasoActual + 1} de {recursoSeleccionado.pasos.length}</h3>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700"
                      onClick={handlePrevStep}
                      disabled={pasoActual === 0}
                    >
                      <PauseIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700"
                      onClick={handleNextStep}
                      disabled={pasoActual === recursoSeleccionado.pasos.length - 1}
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{recursoSeleccionado.pasos[pasoActual]}</p>
                </div>

                <div className="flex justify-center space-x-2">
                  {recursoSeleccionado.pasos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === pasoActual ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recursos; 