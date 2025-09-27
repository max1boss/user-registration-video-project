import React from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Личный кабинет</h1>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">👤 Профиль</h3>
              <div className="space-y-2">
                <p><strong>Имя:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Роль:</strong> {user.role || 'пользователь'}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">📊 Статистика</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Мои лиды: <span className="font-medium">—</span></p>
                <p className="text-sm text-gray-600">Аудиозаписи: <span className="font-medium">—</span></p>
                <p className="text-sm text-gray-600">Последняя активность: <span className="font-medium">—</span></p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">⚡ Быстрые действия</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="text-2xl mb-2">📝</div>
                  <h3 className="font-medium mb-1">Создать лид</h3>
                  <p className="text-sm text-gray-600">Добавить новую информацию о клиенте</p>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="text-2xl mb-2">🎵</div>
                  <h3 className="font-medium mb-1">Загрузить аудио</h3>
                  <p className="text-sm text-gray-600">Прикрепить аудиозапись к лиду</p>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-medium mb-1">Мои лиды</h3>
                  <p className="text-sm text-gray-600">Просмотр и редактирование</p>
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">
                  💡 <strong>Подсказка:</strong> Используйте быстрые действия для работы с лидами. 
                  Все данные автоматически сохраняются и доступны администратору.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;