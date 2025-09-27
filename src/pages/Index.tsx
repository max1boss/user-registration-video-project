import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';

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
      <AdminDashboard
        user={user}
        token={token}
        onLogout={handleLogout}
        adminApiUrl={API_URLS.admin}
      />
    );
  }

  // Regular user interface
  return (
    <UserDashboard
      user={user}
      onLogout={handleLogout}
    />
  );
};

export default Index;