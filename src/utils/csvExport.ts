export const parseChildInfo = (comments: string) => {
  // Функция для извлечения информации из комментариев
  let parentName = '';
  let childName = '';
  let childAge = '';
  let phone = '';
  let isStructured = false;
  
  if (comments && comments.trim() !== '') {
    // Проверяем содержит ли комментарий структурированные данные
    const hasStructuredData = comments.toLowerCase().includes('родитель:') || 
                              comments.toLowerCase().includes('ребенок:') ||
                              comments.toLowerCase().includes('возраст:') ||
                              comments.toLowerCase().includes('телефон:');
    
    if (hasStructuredData) {
      isStructured = true;
      // Парсим данные разделенные запятыми в формате: "Родитель: X, Ребенок: Y, Возраст: Z, Телефон: W"
      const parts = comments.split(',').map(part => part.trim());
      
      parts.forEach(part => {
        if (part.toLowerCase().startsWith('родитель:')) {
          parentName = part.replace(/^родитель:\s*/i, '').trim();
        } else if (part.toLowerCase().startsWith('ребенок:')) {
          childName = part.replace(/^ребенок:\s*/i, '').trim();
        } else if (part.toLowerCase().startsWith('возраст:')) {
          childAge = part.replace(/^возраст:\s*/i, '').trim();
        } else if (part.toLowerCase().startsWith('телефон:')) {
          phone = part.replace(/^телефон:\s*/i, '').trim();
        }
      });
    }
  }
  
  return { 
    parentName, 
    childName, 
    childAge, 
    phone, 
    isStructured,
    originalComments: comments 
  };
};

export const createCSVContent = (users: any[]) => {
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
          `"${(leadInfo.parentName || '').replace(/"/g, '""')}"`, // Столбец B: Родитель из комментариев
          `"${(leadInfo.childName || '').replace(/"/g, '""')}"`, // Столбец C: Ребенок из комментариев
          `"${(leadInfo.childAge || '').replace(/"/g, '""')}"`, // Столбец D: Возраст из комментариев  
          `"${(leadInfo.phone || '').replace(/"/g, '""')}"` // Столбец E: Телефон из комментариев
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

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const downloadCSV = (users: any[]) => {
  const csvContent = createCSVContent(users);
  
  // Добавляем BOM (Byte Order Mark) для правильной кодировки UTF-8 в Excel
  const BOM = '\uFEFF';
  const fullContent = BOM + csvContent;
  
  // Создаем Blob с правильной кодировкой
  const blob = new Blob([fullContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  // Создаем ссылку для скачивания
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  
  // Генерируем имя файла с текущей датой
  const currentDate = new Date();
  const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeString = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  const fileName = `leads_data_${dateString}_${timeString}.csv`;
  
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  // Добавляем к DOM, кликаем и удаляем
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Освобождаем URL
  URL.revokeObjectURL(url);
};