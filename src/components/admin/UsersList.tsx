import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';

interface Lead {
  id: string;
  title: string;
  comments: string;
  created_at: string;
  audio_filename?: string;
  has_audio: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  leads: Lead[];
}

interface UsersListProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onDownloadAllUserAudios: (user: User) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onEditUser: (userId: string, currentName: string) => void;
  deletingUserId: string | null;
  editingUserId: string | null;
  formatDate: (dateString: string) => string;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  selectedUser,
  onSelectUser,
  onDownloadAllUserAudios,
  onDeleteUser,
  onEditUser,
  deletingUserId,
  editingUserId,
  formatDate
}) => {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const usersPerPage = 10;
  
  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const displayedUsers = showAll ? 
    filteredUsers.slice(currentPage * usersPerPage, (currentPage + 1) * usersPerPage) : 
    filteredUsers.slice(0, 5);
  
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Пользователи
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'пользователь' : 
               filteredUsers.length < 5 ? 'пользователя' : 'пользователей'} всего
            </p>
          </div>
          {!showAll && filteredUsers.length > 5 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAll(true)}
              className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
            >
              <Icon name="ChevronDown" size={16} className="mr-2" />
              Показать всех ({filteredUsers.length})
            </Button>
          )}
          {showAll && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowAll(false);
                setCurrentPage(0);
              }}
              className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
            >
              <Icon name="ChevronUp" size={16} className="mr-2" />
              Свернуть
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Pagination Info */}
        {showAll && filteredUsers.length > usersPerPage && (
          <div className="flex items-center justify-between text-sm text-gray-500 px-4 py-2 bg-gray-50 rounded-lg">
            <span>
              Показано {currentPage * usersPerPage + 1}-{Math.min((currentPage + 1) * usersPerPage, filteredUsers.length)} из {filteredUsers.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-8 w-8 p-0"
              >
                <Icon name="ChevronLeft" size={14} />
              </Button>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                {currentPage + 1} из {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-8 w-8 p-0"
              >
                <Icon name="ChevronRight" size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
        <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className={`space-y-4 ${showAll ? 'max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''}`}>
              {displayedUsers.length > 0 ? (
                displayedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isSelected={selectedUser?.id === user.id}
                    onSelect={() => onSelectUser(user)}
                    onDownloadAllUserAudios={onDownloadAllUserAudios}
                    onDeleteUser={onDeleteUser}
                    onEditUser={onEditUser}
                    deletingUserId={deletingUserId}
                    editingUserId={editingUserId}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Users" size={24} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Пользователи не найдены' : 'Нет пользователей'}
                  </h4>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? `По запросу "${searchTerm}" ничего не найдено`
                      : 'В системе пока нет зарегистрированных пользователей'
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      <Icon name="X" size={14} className="mr-2" />
                      Очистить поиск
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Отдельный компонент для карточки пользователя
interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  onDownloadAllUserAudios: (user: User) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onEditUser: (userId: string, currentName: string) => void;
  deletingUserId: string | null;
  editingUserId: string | null;
  formatDate: (dateString: string) => string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected,
  onSelect,
  onDownloadAllUserAudios,
  onDeleteUser,
  onEditUser,
  deletingUserId,
  editingUserId,
  formatDate
}) => {
  const audioCount = user.leads.filter(l => l.has_audio).length;

  return (
    <div
      className={`relative group p-5 border border-gray-200 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg scale-[1.02]' 
          : 'bg-white hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
      )}
      
      <div className="relative">
        <div className="flex items-start justify-between">
          {/* User Info */}
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              isSelected 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600'
            }`}>
              <span className="text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 truncate text-lg">{user.name}</h4>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Icon name="FileText" size={12} />
                  <span>{user.leads.length} лидов</span>
                </div>
                {audioCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Icon name="Volume2" size={12} />
                    <span>{audioCount} аудио</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col gap-2 items-end ml-4">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={isSelected 
                  ? 'bg-blue-100 text-blue-700 border-0' 
                  : 'bg-gray-100 text-gray-600 border-0'
                }
              >
                <Icon name="FileText" size={12} className="mr-1" />
                {user.leads.length} лидов
              </Badge>
              {audioCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className={isSelected 
                    ? 'bg-purple-100 text-purple-700 border-0' 
                    : 'bg-orange-100 text-orange-700 border-0'
                  }
                >
                  <Icon name="Volume2" size={12} className="mr-1" />
                  {audioCount} аудио
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {audioCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadAllUserAudios(user);
                  }}
                  className="h-8 px-2 bg-white/80 border-gray-200 hover:bg-white text-xs"
                  title="Скачать все аудио"
                >
                  <Icon name="Download" size={12} />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                disabled={editingUserId === user.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditUser(user.id, user.name);
                }}
                className="h-8 w-8 p-0 bg-white/80 border-gray-200 hover:bg-white"
                title="Редактировать пользователя"
              >
                {editingUserId === user.id ? (
                  <Icon name="Loader2" size={12} className="animate-spin" />
                ) : (
                  <Icon name="Edit" size={12} />
                )}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={deletingUserId === user.id}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                    title="Удалить пользователя"
                  >
                    {deletingUserId === user.id ? (
                      <Icon name="Loader2" size={12} className="animate-spin" />
                    ) : (
                      <Icon name="Trash2" size={12} />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-red-600">
                      <Icon name="AlertTriangle" size={20} className="inline mr-2" />
                      Удалить пользователя?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-relaxed">
                      Вы действительно хотите удалить пользователя <strong>{user.name}</strong> ({user.email})?
                      <br /><br />
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                        <strong>⚠️ Это действие удалит:</strong>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>• Учетную запись пользователя</li>
                          <li>• Все его лиды ({user.leads.length} шт.)</li>
                          <li>• Все связанные аудиозаписи</li>
                        </ul>
                      </div>
                      <br />
                      <strong>Это действие нельзя отменить.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                      Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteUser(user.id, user.name)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <Icon name="Trash2" size={14} className="mr-2" />
                      Удалить навсегда
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList;