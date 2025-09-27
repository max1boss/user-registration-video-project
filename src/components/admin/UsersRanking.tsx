import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface UsersRankingProps {
  users: User[];
  onBack: () => void;
  formatDate: (dateString: string) => string;
}

const UsersRanking: React.FC<UsersRankingProps> = ({ users, onBack, formatDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Сортируем пользователей по количеству лидов (убывание)
  const sortedUsers = [...users].sort((a, b) => b.leads.length - a.leads.length);
  
  // Фильтрация по поиску
  const filteredUsers = sortedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedUsers = showAll ? filteredUsers : filteredUsers.slice(0, 10);

  // Функция для получения медали
  const getMedal = (position: number) => {
    switch (position) {
      case 1:
        return { emoji: '🥇', color: 'from-yellow-400 to-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' };
      case 2:
        return { emoji: '🥈', color: 'from-gray-400 to-gray-500', textColor: 'text-gray-700', bgColor: 'bg-gray-50' };
      case 3:
        return { emoji: '🥉', color: 'from-orange-400 to-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' };
      default:
        return null;
    }
  };

  // Подсчет статистики
  const totalUsers = users.length;
  const totalLeads = users.reduce((sum, user) => sum + user.leads.length, 0);
  const totalAudios = users.reduce((sum, user) => sum + user.leads.filter(lead => lead.has_audio).length, 0);
  const averageLeadsPerUser = totalUsers > 0 ? (totalLeads / totalUsers).toFixed(1) : '0';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-xs text-gray-500">Всего пользователей</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
                <p className="text-xs text-gray-500">Всего лидов</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalAudios}</p>
                <p className="text-xs text-gray-500">Аудиозаписей</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{averageLeadsPerUser}</p>
                <p className="text-xs text-gray-500">Среднее лидов/юзер</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск пользователей..."
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

      {/* Users Ranking */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
        <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Icon name="Trophy" size={16} className="text-white" />
                </div>
                Топ пользователей
              </CardTitle>
              {!showAll && filteredUsers.length > 10 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
                >
                  Показать всех ({filteredUsers.length})
                </Button>
              )}
              {showAll && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAll(false)}
                  className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
                >
                  Показать топ-10
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayedUsers.length > 0 ? (
                displayedUsers.map((user, index) => {
                  const position = sortedUsers.findIndex(u => u.id === user.id) + 1;
                  const medal = getMedal(position);
                  const audioCount = user.leads.filter(lead => lead.has_audio).length;
                  
                  return (
                    <UserRankingCard
                      key={user.id}
                      user={user}
                      position={position}
                      medal={medal}
                      audioCount={audioCount}
                      formatDate={formatDate}
                      allUsers={users}
                    />
                  );
                })
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
                      : 'В системе пока нет пользователей'
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

// Компонент карточки пользователя в рейтинге
interface UserRankingCardProps {
  user: User;
  position: number;
  medal: { emoji: string; color: string; textColor: string; bgColor: string } | null;
  audioCount: number;
  formatDate: (dateString: string) => string;
  allUsers: User[];
}

const UserRankingCard: React.FC<UserRankingCardProps> = ({ 
  user, 
  position, 
  medal, 
  audioCount, 
  formatDate,
  allUsers
}) => {
  return (
    <div className={`relative group p-5 border rounded-xl transition-all duration-300 hover:shadow-lg ${
      medal ? `${medal.bgColor} border-opacity-30` : 'bg-white hover:bg-gray-50'
    } ${medal?.color ? `border-2` : 'border-gray-200 hover:border-gray-300'}`}>
      
      {medal && (
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${medal.color} rounded-xl blur opacity-20`}></div>
      )}
      
      <div className="relative">
        <div className="flex items-center justify-between">
          {/* Position and User Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Position with Medal */}
            <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
              {medal ? (
                <div className={`w-12 h-12 bg-gradient-to-r ${medal.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {medal.emoji}
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">
                  {position}
                </div>
              )}
            </div>

            {/* User Avatar and Info */}
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold truncate text-lg ${medal ? medal.textColor : 'text-gray-900'}`}>
                  {user.name}
                </h4>
                {position <= 3 && (
                  <Badge variant="secondary" className={medal ? `${medal.bgColor} ${medal.textColor} border-0` : ''}>
                    Топ-{position}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={12} />
                  <span>{formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Mail" size={12} />
                  <span className="truncate max-w-32">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 ml-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${medal ? medal.textColor : 'text-gray-900'}`}>
                {user.leads.length}
              </div>
              <div className="text-xs text-gray-500">лидов</div>
            </div>
            
            {audioCount > 0 && (
              <div className="text-center">
                <div className={`text-lg font-semibold ${medal ? medal.textColor : 'text-purple-600'}`}>
                  {audioCount}
                </div>
                <div className="text-xs text-gray-500">аудио</div>
              </div>
            )}

            {/* Performance Badge */}
            <div className="text-center">
              {user.leads.length >= 10 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                  <Icon name="TrendingUp" size={12} className="mr-1" />
                  Активный
                </Badge>
              ) : user.leads.length >= 5 ? (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                  <Icon name="Target" size={12} className="mr-1" />
                  Средний
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0">
                  <Icon name="Clock" size={12} className="mr-1" />
                  Новичок
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar for Top Users */}
        {position <= 10 && user.leads.length > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${medal ? medal.color : 'from-blue-500 to-purple-500'} transition-all duration-1000`}
                style={{ 
                  width: `${Math.min((user.leads.length / Math.max(...allUsers.map(u => u.leads.length))) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
              <span>Активность</span>
              <span>{Math.round((user.leads.length / Math.max(...allUsers.map(u => u.leads.length))) * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersRanking;