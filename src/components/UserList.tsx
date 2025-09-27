import React from 'react';

interface UserListProps {
  users: any[];
  statistics: { total_users: number; total_leads: number; total_audios: number };
  isLoading: boolean;
  onLoadUsers: () => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
  onUserClick: (user: any) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  statistics,
  isLoading,
  onLoadUsers,
  onEditUser,
  onDeleteUser,
  onUserClick
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            👥 Пользователи ({statistics.total_users})
          </h2>
          <button 
            onClick={onLoadUsers}
            className="text-blue-600 hover:text-blue-800 text-sm"
            disabled={isLoading}
          >
            {isLoading ? '🔄 Загрузка...' : '🔄 Обновить'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Кликните на пользователя, чтобы просмотреть все его лиды и прослушать аудиозаписи
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Загрузка пользователей...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>Пользователи не найдены</p>
          </div>
        ) : (
          users.slice(0, 5).map((userData) => (
            <div key={userData.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
              <div 
                className="flex-1"
                onClick={() => onUserClick(userData)}
              >
                <div className="font-medium text-gray-900">{userData.name}</div>
                <div className="text-sm text-gray-500">{userData.email}</div>
                <div className="text-xs text-gray-400">
                  Регистрация: {userData.created_at ? new Date(userData.created_at).toLocaleString('ru-RU') : 'Неизвестно'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span 
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                    userData.leads?.length > 0 
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => onUserClick(userData)}
                >
                  {userData.leads?.length || 0} лидов
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditUser(userData);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteUser(userData.id);
                  }}
                  className="p-2 text-red-400 hover:text-red-600"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
        
        {users.length > 5 && (
          <div className="px-6 py-4 text-center text-gray-500">
            <p className="text-sm">+ ещё {users.length - 5} пользователей</p>
            <p className="text-xs mt-1">Используйте кнопку CSV для экспорта всех данных</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;