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
      
      // Отладка: посмотрим на структуру данных
      console.log('Данные с сервера:', data);
      if (data.users && data.users.length > 0) {
        console.log('Первый пользователь:', data.users[0]);
        if (data.users[0].leads && data.users[0].leads.length > 0) {
          console.log('Первый лид:', data.users[0].leads[0]);
          console.log('Комментарии лида:', data.users[0].leads[0].comments);
        }
      }
      
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

  const parseChildInfo = (comments: string) => {
    console.log('Парсим комментарии:', comments);
    
    // Функция для извлечения информации из структурированных комментариев лида
    let parentName = '';
    let childName = '';
    let childAge = '';
    let phone = '';
    
    if (comments) {
      // Попробуем разные варианты парсинга
      
      // Вариант 1: Ищем "Родитель: Имя" (с переносом строки)
      const parentMatch = comments.match(/Родитель:\s*([^\n\r]+)/i);
      if (parentMatch) {
        parentName = parentMatch[1].trim();
      }
      
      // Вариант 2: Ищем "Ребенок: Имя"  
      const childMatch = comments.match(/Ребенок:\s*([^\n\r]+)/i);
      if (childMatch) {
        childName = childMatch[1].trim();
      }
      
      // Вариант 3: Ищем "Возраст: число"
      const ageMatch = comments.match(/Возраст:\s*([^\n\r]+)/i);
      if (ageMatch) {
        childAge = ageMatch[1].trim();
      }
      
      // Вариант 4: Ищем "Телефон: номер"
      const phoneMatch = comments.match(/Телефон:\s*([^\n\r]+)/i);
      if (phoneMatch) {
        phone = phoneMatch[1].trim();
      }
      
      // Если структурированный парсинг не сработал, попробуем альтернативный подход
      if (!parentName && !childName && !childAge && !phone) {
        // Возможно данные разделены запятыми или другими символами
        const parts = comments.split(/[,\n\r]+/);
        parts.forEach(part => {
          const trimmed = part.trim();
          if (trimmed.toLowerCase().includes('родитель')) {
            parentName = trimmed.replace(/родитель:?\s*/i, '').trim();
          } else if (trimmed.toLowerCase().includes('ребенок')) {
            childName = trimmed.replace(/ребенок:?\s*/i, '').trim();
          } else if (trimmed.toLowerCase().includes('возраст')) {
            childAge = trimmed.replace(/возраст:?\s*/i, '').trim();
          } else if (trimmed.toLowerCase().includes('телефон')) {
            phone = trimmed.replace(/телефон:?\s*/i, '').trim();
          }
        });
      }
    }
    
    console.log('Результат парсинга:', { parentName, childName, childAge, phone });
    return { parentName, childName, childAge, phone };
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