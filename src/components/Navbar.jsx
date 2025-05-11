import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, HeartIcon, EmojiHappyIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/outline';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: HomeIcon },
    { path: '/sensaciones', name: 'Sensaciones', icon: HeartIcon },
    { path: '/emociones', name: 'Emociones', icon: EmojiHappyIcon },
    { path: '/estados-animo', name: 'Estados de Ánimo', icon: ChartBarIcon },
    { path: '/recursos', name: 'Recursos', icon: BookOpenIcon },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">Emotional Vibes</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-1" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 