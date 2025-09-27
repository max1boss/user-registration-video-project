import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Lead {
  id: string;
  title: string;
  parentName: string;
  childName: string;
  age: string;
  phone: string;
  comments: string;
  created_at: string;
  has_audio: boolean;
  status: 'new' | 'in_progress' | 'completed';
}

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface UserLeadsListProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const UserLeadsList: React.FC<UserLeadsListProps> = ({ user, onBack, onLogout }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'in_progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');

  // Симуляция загрузки данных
  useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: '1',
        title: 'Консультация по детскому промо',
        parentName: 'Анна Иванова',
        childName: 'Максим',
        age: '7 лет',
        phone: '+7 (999) 123-45-67',
        comments: 'Интересуется программой для ребенка школьного возраста',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        has_audio: true,
        status: 'new'
      },
      {
        id: '2',
        title: 'Запрос на фотосессию',
        parentName: 'Сергей Петров',
        childName: 'София',
        age: '5 лет',
        phone: '+7 (999) 234-56-78',
        comments: 'Хочет профессиональную детскую фотосессию',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        has_audio: false,
        status: 'in_progress'
      },
      {
        id: '3',
        title: 'Видеосъемка дня рождения',
        parentName: 'Мария Сидорова',
        childName: 'Артем',
        age: '10 лет',
        phone: '+7 (999) 345-67-89',
        comments: 'Планирует большой праздник, нужен видеооператор',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        has_audio: true,
        status: 'completed'
      }
    ];

    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      default: return 'Неизвестно';
    }
  };

  // Фильтрация и сортировка
  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = 
        lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
          <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <Icon name="Loader2" size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Загрузка лидов...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack}
                className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Мои лиды
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredLeads.length} из {leads.length} лидов
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:block">
                {user.name}
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
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Filters and Search */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  
                  {/* Search */}
                  <div className="relative">
                    <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск по названию, имени или телефону..."
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

                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Статус:</span>
                      <div className="flex gap-2">
                        {['all', 'new', 'in_progress', 'completed'].map((status) => (
                          <Button
                            key={status}
                            variant={filterStatus === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus(status as any)}
                            className="text-xs"
                          >
                            {status === 'all' ? 'Все' : getStatusText(status as Lead['status'])}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Сортировка:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="date">По дате</option>
                        <option value="title">По названию</option>
                        <option value="status">По статусу</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leads List */}
          {filteredLeads.length > 0 ? (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} formatDate={formatDate} />
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl blur opacity-20"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="FileText" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterStatus !== 'all' ? 'Ничего не найдено' : 'Пока нет лидов'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Попробуйте изменить параметры поиска'
                      : 'Создайте первый лид, чтобы начать работу'
                    }
                  </p>
                  {(searchTerm || filterStatus !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                      }}
                    >
                      <Icon name="X" size={14} className="mr-2" />
                      Очистить фильтры
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Компонент карточки лида
interface LeadCardProps {
  lead: Lead;
  formatDate: (dateString: string) => string;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, formatDate }) => {
  const [showFullComments, setShowFullComments] = useState(false);
  
  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      default: return 'Неизвестно';
    }
  };

  const getStatusIcon = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'Clock';
      case 'in_progress': return 'Play';
      case 'completed': return 'CheckCircle';
      default: return 'Circle';
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-2">
                {lead.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icon name="Calendar" size={14} />
                <span>{formatDate(lead.created_at)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(lead.status)} border-0`}>
                <Icon name={getStatusIcon(lead.status) as any} size={12} className="mr-1" />
                {getStatusText(lead.status)}
              </Badge>
              {lead.has_audio && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0">
                  <Icon name="Volume2" size={12} className="mr-1" />
                  Аудио
                </Badge>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="User" size={12} className="text-blue-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Родитель</span>
                  <p className="font-medium text-gray-900">{lead.parentName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon name="Baby" size={12} className="text-purple-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Ребенок</span>
                  <p className="font-medium text-gray-900">{lead.childName || '—'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="Calendar" size={12} className="text-green-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Возраст</span>
                  <p className="font-medium text-gray-900">{lead.age || '—'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <Icon name="Phone" size={12} className="text-orange-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Телефон</span>
                  <p className="font-medium text-gray-900">{lead.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          {lead.comments && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="MessageSquare" size={12} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-500 text-xs">Комментарии</span>
                  <div className="text-sm text-gray-700 mt-1">
                    {lead.comments.length > 150 && !showFullComments ? (
                      <>
                        <p className="line-clamp-3">{lead.comments}</p>
                        <button
                          onClick={() => setShowFullComments(true)}
                          className="text-blue-600 hover:text-blue-700 text-xs mt-2 font-medium"
                        >
                          Показать полностью
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{lead.comments}</p>
                        {lead.comments.length > 150 && (
                          <button
                            onClick={() => setShowFullComments(false)}
                            className="text-blue-600 hover:text-blue-700 text-xs mt-2 font-medium"
                          >
                            Свернуть
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLeadsList;