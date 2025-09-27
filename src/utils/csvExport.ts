export const parseChildInfo = (comments: string) => {
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

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};