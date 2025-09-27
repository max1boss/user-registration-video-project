import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';

const API_URLS = {
  auth: 'https://functions.poehali.dev/080ec769-925f-4132-8cd3-549c89bdc4c0',
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

  if (!user) {
    return (
      <AuthForm 
        onAuthSuccess={handleAuthSuccess}
        apiUrl={API_URLS.auth}
      />
    );
  }

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
            <h2 className="text-lg mb-4">Статус пользователя</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Роль:</strong> {user.role || 'пользователь'}</p>
            <p><strong>ID:</strong> {user.id}</p>
            
            {user.role === 'admin' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">
                  🔧 Администраторская панель с Excel экспортом готова! 
                  Функция заменила Google Sheets.
                </p>
              </div>
            )}
            
            {user.role !== 'admin' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">
                  📝 Пользовательские функции готовы к восстановлению.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;