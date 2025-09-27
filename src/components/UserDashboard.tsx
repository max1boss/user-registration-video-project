import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import CreateLeadForm from './CreateLeadForm';
import UserLeadsList from './UserLeadsList';

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
  const [activeSection, setActiveSection] = useState<'dashboard' | 'create' | 'leads'>('dashboard');
  const [stats, setStats] = useState({
    totalLeads: 0,
    audioLeads: 0,
    lastActivity: null as Date | null
  });

  // Симуляция загрузки статистики
  useEffect(() => {
    // Здесь будет реальная загрузка данных из API
    setStats({
      totalLeads: 12,
      audioLeads: 8,
      lastActivity: new Date()
    });
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (activeSection === 'create') {
    return (
      <CreateLeadForm 
        user={user}
        onBack={() => setActiveSection('dashboard')}
        onLogout={onLogout}
      />
    );
  }

  if (activeSection === 'leads') {
    return (
      <UserLeadsList 
        user={user}
        onBack={() => setActiveSection('dashboard')}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Icon name="Video" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  IMPERIA PROMO
                </h1>
                <p className="text-sm text-gray-500">Личный кабинет</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:block">
                Привет, {user.name}!
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Welcome Section */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Добро пожаловать, {user.name}!
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Управляйте своими лидами, загружайте аудиозаписи и отслеживайте прогресс. 
                      Вся информация автоматически синхронизируется с администратором.
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Icon name="Mail" size={16} />
                        <span>{user.email}</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                        <Icon name="CheckCircle" size={12} className="mr-1" />
                        {user.role || 'Пользователь'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Icon name="FileText" size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Всего лидов</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Icon name="Volume2" size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">С аудио</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.audioLeads}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <Icon name="Clock" size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Последняя активность</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(stats.lastActivity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Icon name="Zap" size={16} className="text-white" />
                  </div>
                  Быстрые действия
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Create Lead */}
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => setActiveSection('create')}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Icon name="Plus" size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Создать лид</h3>
                          <p className="text-sm text-gray-600">
                            Добавить новую информацию о клиенте с возможностью записи аудио
                          </p>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* View Leads */}
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => setActiveSection('leads')}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Icon name="List" size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Мои лиды</h3>
                          <p className="text-sm text-gray-600">
                            Просмотр, редактирование и управление всеми созданными лидами
                          </p>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Lightbulb" size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">💡 Советы по использованию</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• При создании лида можно сразу записать аудиокомментарий</li>
                        <li>• Все данные автоматически сохраняются и доступны администратору</li>
                        <li>• Используйте структурированные поля для лучшей организации</li>
                        <li>• Аудиозаписи помогают передать эмоции и детали разговора</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;