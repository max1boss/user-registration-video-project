import React, { useState } from 'react';

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
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const totalPages = Math.ceil(users.length / usersPerPage);
  const displayedUsers = showAllUsers 
    ? users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
    : users.slice(0, 5);
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
          displayedUsers.map((userData) => (
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
        
        {/* Кнопки управления отображением */}
        {users.length > 5 && (
          <div className="px-6 py-4 border-t border-gray-200">
            {!showAllUsers ? (
              <div className="text-center">
                <button
                  onClick={() => setShowAllUsers(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Показать всех пользователей ({users.length})
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Сейчас показаны первые 5 пользователей
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowAllUsers(false);
                      setCurrentPage(1);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Показать только первых 5
                  </button>
                  <span className="text-sm text-gray-600">
                    Показано {(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, users.length)} из {users.length}
                  </span>
                </div>
                
                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
                    >
                      ←
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;