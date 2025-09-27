import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';
import AppHeader from '@/components/AppHeader';
import AdminPanel from '@/components/AdminPanel';

const API_URLS = {
  auth: 'https://functions.poehali.dev/080ec769-925f-4132-8cd3-549c89bdc4c0',
  admin: 'https://functions.poehali.dev/bf64fc6c-c075-4df6-beb9-f5b527586fa1',
  adminVideo: 'https://functions.poehali.dev/72f44b46-a11c-4ea3-addb-cb69aee5546e',
  deleteUser: 'https://functions.poehali.dev/d99ce676-54d7-46f7-8738-a2dd9264061e',
  editUser: 'https://functions.poehali.dev/d99ce676-54d7-46f7-8738-a2dd9264061e'
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

  // Admin interface
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
        <AppHeader user={user} onLogout={handleLogout} />
        <AdminPanel 
          token={token}
          adminApiUrl={API_URLS.admin}
          videoApiUrl={API_URLS.adminVideo}
          deleteUserApiUrl={API_URLS.deleteUser}
          editUserApiUrl={API_URLS.editUser}
        />
      </div>
    );
  }

  // Regular user interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <AppHeader user={user} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg mb-4">Добро пожаловать, {user.name}!</h2>
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