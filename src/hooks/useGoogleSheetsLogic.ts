import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { GoogleSheetsExporter, getServiceAccountKey, saveServiceAccountKey } from '@/utils/googleSheetsExport';
import { User } from './useAdminData';

export const useGoogleSheetsLogic = () => {
  const [exportingToSheets, setExportingToSheets] = useState(false);
  const [showServiceAccountModal, setShowServiceAccountModal] = useState(false);
  const [serviceAccountKey, setServiceAccountKey] = useState<any>(null);
  const [autoExportEnabled, setAutoExportEnabled] = useState(false);
  
  const { toast } = useToast();

  const loadServiceAccountKey = async () => {
    const key = await getServiceAccountKey();
    setServiceAccountKey(key);
  };

  const loadAutoExportSetting = () => {
    const saved = localStorage.getItem('google_sheets_auto_export');
    setAutoExportEnabled(saved === 'true');
  };

  const handleToggleAutoExport = (enabled: boolean) => {
    setAutoExportEnabled(enabled);
    localStorage.setItem('google_sheets_auto_export', enabled.toString());
    
    toast({
      title: enabled ? '✅ Автоэкспорт включен' : '⚪ Автоэкспорт выключен',
      description: enabled 
        ? 'Новые лиды будут автоматически добавляться в Google Таблицы' 
        : 'Автоматический экспорт отключен',
      duration: 3000
    });
  };

  const exportToGoogleSheets = async (users: User[]) => {
    if (!serviceAccountKey) {
      setShowServiceAccountModal(true);
      return;
    }

    setExportingToSheets(true);
    
    try {
      const exporter = new GoogleSheetsExporter(serviceAccountKey);
      const result = await exporter.exportUsersToSheets(users);
      
      if (result.success) {
        toast({
          title: '✅ Экспорт завершен',
          description: `Данные ${result.exportedCount} лидов экспортированы в Google Таблицы`,
        });
      } else {
        throw new Error(result.error || 'Ошибка экспорта');
      }
    } catch (error) {
      toast({
        title: 'Ошибка экспорта',
        description: `Не удалось экспортировать данные: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive'
      });
    } finally {
      setExportingToSheets(false);
    }
  };

  const handleServiceAccountSubmit = (keyText: string) => {
    try {
      const key = JSON.parse(keyText);
      saveServiceAccountKey(key);
      setServiceAccountKey(key);
      setShowServiceAccountModal(false);
      
      toast({
        title: '✅ Ключ сохранен',
        description: 'Google Service Account ключ успешно сохранен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Неверный формат JSON ключа',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadServiceAccountKey();
    loadAutoExportSetting();
  }, []);

  return {
    exportingToSheets,
    showServiceAccountModal,
    serviceAccountKey,
    autoExportEnabled,
    setShowServiceAccountModal,
    exportToGoogleSheets,
    handleServiceAccountSubmit,
    handleToggleAutoExport
  };
};