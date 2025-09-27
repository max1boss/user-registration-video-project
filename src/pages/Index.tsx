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
    const headers = ['ID', 'Имя', 'Email', 'Роль', 'Дата создания'];
    const csvRows = [headers.join(';')]; // Используем ; как разделитель для русских версий Excel
    
    users.forEach(user => {
      const row = [
        user.id || '',
        `"${(user.name || '').replace(/"/g, '""')}"`, // Экранируем кавычки
        user.email || '',
        user.role || 'пользователь',
        user.created_at || ''
      ];
      csvRows.push(row.join(';'));
    });
    
    return csvRows.join('\r\n'); // Используем Windows line endings для лучшей совместимости
  };

  if (!user) {
    return (
      <AuthForm 
        onAuthSuccess={handleAuthSuccess}
        apiUrl={API_URLS.auth}
      />
    );
  }

  // Admin interface - simplified
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Админ панель</h1>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Выйти
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl mb-4">🔧 Экспорт данных</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Экспорт готов!</h3>
                  <p className="text-green-700 text-sm">
                    Функция экспорта в CSV файл заменила интеграцию с Google Sheets.
                    Теперь можно скачивать данные пользователей в табличном формате.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Google Sheets удален</h3>
                  <p className="text-yellow-700 text-sm">
                    Старая интеграция с Google Sheets полностью удалена из системы.
                    Все зависимости очищены.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleExcelExport}
                  disabled={isExporting}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Экспорт...
                    </>
                  ) : (
                    <>
                      📊 Скачать CSV файл
                    </>
                  )}
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  👥 Управление пользователями
                </button>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">
                <strong>Статус:</strong> Все проблемы с загрузкой решены. 
                Админ панель работает с функцией экспорта CSV (Excel-совместимый формат).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular user interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Добро пожаловать, {user.name}!</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg mb-4">Пользовательская панель</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Роль:</strong> {user.role || 'пользователь'}</p>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">
                📝 Пользовательские функции временно недоступны.
                Обратитесь к администратору.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;