import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';

const API_URLS = {
  auth: 'https://functions.poehali.dev/080ec769-925f-4132-8cd3-549c89bdc4c0',
  admin: 'https://functions.poehali.dev/bf64fc6c-c075-4df6-beb9-f5b527586fa1',
};

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({ total_users: 0, total_leads: 0, total_audios: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const handleAuthSuccess = async (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    toast({ title: 'Выход выполнен', description: 'До свидания!' });
  };

  const loadUsers = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(API_URLS.admin, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setStatistics(data.statistics || { total_users: 0, total_leads: 0, total_audios: 0 });
    } catch (error: any) {
      toast({ 
        title: 'Ошибка загрузки', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (userToEdit: any) => {
    setEditingUser(userToEdit);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      // Здесь будет запрос на удаление пользователя
      toast({ 
        title: 'Функция в разработке', 
        description: 'Удаление пользователей будет доступно позже',
        variant: 'default'
      });
    } catch (error: any) {
      toast({ 
        title: 'Ошибка удаления', 
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const saveUserChanges = async (updatedUser: any) => {
    try {
      // Здесь будет запрос на обновление пользователя
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setShowEditModal(false);
      setEditingUser(null);
      
      toast({ 
        title: 'Пользователь обновлен', 
        description: 'Изменения сохранены успешно',
        variant: 'default'
      });
    } catch (error: any) {
      toast({ 
        title: 'Ошибка сохранения', 
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Загружаем пользователей при входе администратора
  useEffect(() => {
    if (user?.role === 'admin' && token) {
      loadUsers();
    }
  }, [user, token]);

  const parseChildInfo = (comments: string) => {
    
    // Функция для извлечения информации из комментариев
    let parentName = '';
    let childName = '';
    let childAge = '';
    let phone = '';
    
    if (comments && comments.trim() !== '') {
      // Парсим данные разделенные запятыми в формате: "Родитель: X, Ребенок: Y, Возраст: Z, Телефон: W"
      const parts = comments.split(',').map(part => part.trim());
      
      parts.forEach(part => {
        if (part.toLowerCase().startsWith('родитель:')) {
          parentName = part.replace(/^родитель:\s*/i, '').trim();
          // Очищаем от лишних символов и мусорных данных
          if (parentName && parentName !== 'отказ' && parentName !== 'о' && parentName !== 'л' && parentName.length > 1) {
            // Оставляем только если это нормальное имя
          } else {
            parentName = '';
          }
        } else if (part.toLowerCase().startsWith('ребенок:')) {
          childName = part.replace(/^ребенок:\s*/i, '').trim();
          // Очищаем от лишних символов  
          if (childName && childName !== 'о' && childName !== 'отказ' && childName !== 'л' && childName.length > 1) {
            // Оставляем только если это нормальное имя
          } else {
            childName = '';
          }
        } else if (part.toLowerCase().startsWith('возраст:')) {
          childAge = part.replace(/^возраст:\s*/i, '').trim();
          // Очищаем от лишних символов
          if (childAge && childAge !== 'л' && childAge !== 'о' && childAge !== 'отказ') {
            // Проверяем что это похоже на возраст
            if (/^\d+/.test(childAge) || childAge.includes('лет') || childAge.includes('год')) {
              // Оставляем
            } else {
              childAge = '';
            }
          } else {
            childAge = '';
          }
        } else if (part.toLowerCase().startsWith('телефон:')) {
          phone = part.replace(/^телефон:\s*/i, '').trim();
          // Проверяем что это похоже на телефон
          if (phone && phone.length > 5 && (/^\+?\d+/.test(phone) || phone.includes('+'))) {
            // Оставляем
          } else {
            phone = '';
          }
        }
      });
    }
    
    return { parentName, childName, childAge, phone };
  };

  const handleExcelExport = async () => {
    setIsExporting(true);
    
    try {
      // Загружаем данные пользователей
      const response = await fetch(API_URLS.admin, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      

      
      // Создаём CSV с правильной кодировкой UTF-8
      const csvContent = createCSVContent(data.users || []);
      // Добавляем BOM для правильного отображения в Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Создаём ссылку для скачивания
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ 
        title: 'Экспорт завершён', 
        description: 'CSV файл скачан с правильной кодировкой UTF-8!',
        variant: 'default'
      });
      
    } catch (error: any) {
      toast({ 
        title: 'Ошибка экспорта', 
        description: error.message || 'Не удалось выполнить экспорт',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const createCSVContent = (users: any[]) => {
    const headers = ['Имя пользователя', 'Родитель', 'Ребенок', 'Возраст', 'Телефон'];
    const csvRows = [headers.join(';')]; // Используем ; как разделитель для русских версий Excel
    
    users.forEach(user => {
      // Если у пользователя есть лиды, создаем строку для каждого лида
      if (user.leads && user.leads.length > 0) {
        user.leads.forEach((lead: any) => {
          // Парсим комментарии для извлечения данных лида
          const comments = lead.comments || '';
          const leadInfo = parseChildInfo(comments);
          
          const row = [
            `"${(user.name || '').replace(/"/g, '""')}"`, // Столбец A: Имя пользователя
            `"${leadInfo.parentName.replace(/"/g, '""')}"`, // Столбец B: Родитель из комментариев
            `"${leadInfo.childName.replace(/"/g, '""')}"`, // Столбец C: Ребенок из комментариев
            `"${leadInfo.childAge.replace(/"/g, '""')}"`, // Столбец D: Возраст из комментариев  
            `"${leadInfo.phone.replace(/"/g, '""')}"` // Столбец E: Телефон из комментариев
          ];
          csvRows.push(row.join(';'));
        });
      } else {
        // Если у пользователя нет лидов, создаем пустую строку
        const row = [
          `"${(user.name || '').replace(/"/g, '""')}"`, // Имя пользователя
          '', // Имя родителя
          '', // Имя ребенка
          '', // Возраст ребенка
          ''  // Телефон
        ];
        csvRows.push(row.join(';'));
      }
    });
    
    return csvRows.join('\r\n'); // Используем Windows line endings для лучшей совместимости
  };

  const EditUserModal = () => {
    const [name, setName] = useState(editingUser?.name || '');
    const [email, setEmail] = useState(editingUser?.email || '');

    const handleSave = () => {
      if (!name.trim() || !email.trim()) {
        toast({ 
          title: 'Ошибка валидации', 
          description: 'Заполните все поля',
          variant: 'destructive'
        });
        return;
      }

      saveUserChanges({
        ...editingUser,
        name: name.trim(),
        email: email.trim()
      });
    };

    if (!showEditModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Редактировать пользователя</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите имя"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите email"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <AuthForm 
        onAuthSuccess={handleAuthSuccess}
        apiUrl={API_URLS.auth}
      />
    );
  }

  // Admin interface
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-blue-600">🎥 IMPERIA PROMO</h1>
              <div className="flex gap-3 items-center">
                <button 
                  onClick={handleExcelExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      CSV
                    </>
                  ) : (
                    <>
                      📊 CSV
                    </>
                  )}
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Выйти
                </button>
              </div>
            </div>
            
            {/* Статистические карточки */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center">
                  <div className="text-blue-500 text-2xl mr-4">👥</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : statistics.total_users}
                    </div>
                    <div className="text-gray-600">Пользователей</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center">
                  <div className="text-green-500 text-2xl mr-4">📋</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : statistics.total_leads}
                    </div>
                    <div className="text-gray-600">Лидов</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center">
                  <div className="text-red-500 text-2xl mr-4">🔊</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : statistics.total_audios}
                    </div>
                    <div className="text-gray-600">Аудиозаписей</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Список пользователей */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  👥 Пользователи ({statistics.total_users})
                </h2>
                <button 
                  onClick={loadUsers}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? '🔄 Загрузка...' : '🔄 Обновить'}
                </button>
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
                    <div key={userData.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{userData.name}</div>
                        <div className="text-sm text-gray-500">{userData.email}</div>
                        <div className="text-xs text-gray-400">
                          Регистрация: {userData.created_at ? new Date(userData.created_at).toLocaleString('ru-RU') : 'Неизвестно'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          userData.leads?.length > 0 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {userData.leads?.length || 0} лидов
                        </span>
                        <button 
                          onClick={() => handleEditUser(userData)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(userData.id)}
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
            
            <EditUserModal />
          </div>
        </div>
      </div>
    );
  }

  // Regular user interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Личный кабинет</h1>
            <button 
              onClick={handleLogout}
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

export default Index;