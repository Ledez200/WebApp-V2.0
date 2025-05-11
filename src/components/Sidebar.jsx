import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  HeartIcon, 
  FaceSmileIcon, 
  SunIcon, 
  BookOpenIcon 
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Sensaciones', href: '/sensaciones', icon: HeartIcon },
    { name: 'Emociones', href: '/emociones', icon: FaceSmileIcon },
    { name: 'Estados de Ánimo', href: '/estados-animo', icon: SunIcon },
    { name: 'Recursos', href: '/recursos', icon: BookOpenIcon },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
          <h1 className="text-xl font-bold text-white">Gestión Producción</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 group"
            >
              <item.icon className="w-6 h-6 mr-3 text-gray-500 group-hover:text-indigo-600" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 