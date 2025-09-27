import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { User } from './useAdminData';

export const useExcelExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = async (users: User[]) => {
    setExporting(true);
    
    try {
      // Подготавливаем данные для экспорта
      const excelData: any[] = [];
      
      // Добавляем заголовки
      excelData.push([
        'Имя пользователя',
        'Email пользователя', 
        'Дата регистрации',
        'Название лида',
        'Комментарии к лиду',
        'Дата создания лида',
        'Есть аудио'
      ]);

      // Извлекаем все лиды из всех пользователей
      for (const user of users) {
        for (const lead of user.leads) {
          excelData.push([
            user.name || '',
            user.email || '',
            user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '',
            lead.title || '',
            lead.comments || '',
            lead.created_at ? new Date(lead.created_at).toLocaleDateString('ru-RU') : '',
            lead.has_audio ? 'Да' : 'Нет'
          ]);
        }
        
        // Если у пользователя нет лидов, добавляем строку с данными пользователя
        if (user.leads.length === 0) {
          excelData.push([
            user.name || '',
            user.email || '',
            user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '',
            '(нет лидов)',
            '',
            '',
            ''
          ]);
        }
      }

      // Создаем рабочую книгу
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      // Настраиваем ширину колонок
      const columnWidths = [
        { wch: 20 }, // Имя пользователя
        { wch: 25 }, // Email пользователя
        { wch: 15 }, // Дата регистрации
        { wch: 25 }, // Название лида
        { wch: 40 }, // Комментарии к лиду
        { wch: 15 }, // Дата создания лида
        { wch: 12 }  // Есть аудио
      ];
      worksheet['!cols'] = columnWidths;

      // Добавляем лист в книгу
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Лиды пользователей');

      // Генерируем имя файла с текущей датой
      const currentDate = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
      const fileName = `leads_export_${currentDate}.xlsx`;

      // Экспортируем файл
      XLSX.writeFile(workbook, fileName);

      const totalLeads = users.reduce((sum, user) => sum + user.leads.length, 0);
      
      toast({
        title: '✅ Excel файл скачан',
        description: `Экспортированы данные ${users.length} пользователей и ${totalLeads} лидов`,
        duration: 5000
      });

    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: 'Ошибка экспорта',
        description: `Не удалось создать Excel файл: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportToExcel
  };
};