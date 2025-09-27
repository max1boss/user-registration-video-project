import { google } from 'googleapis';

interface LeadData {
  id: string;
  title: string;
  comments: string;
  created_at: string;
  audio_filename?: string;
  has_audio: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  leads: LeadData[];
}

export class GoogleSheetsExporter {
  private serviceAccountKey: any;
  private spreadsheetId: string = '13qDlzyvsrX2qInjp8EJ8wGSNshUkhb_D_ePNg12R1gQ';
  
  constructor(serviceAccountKey: any) {
    this.serviceAccountKey = serviceAccountKey;
  }

  private async getAuthClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: this.serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    return await auth.getClient();
  }

  async exportUsersToSheets(users: User[]): Promise<{ success: boolean; exportedCount: number; error?: string }> {
    try {
      const authClient = await this.getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      // Подготавливаем данные для экспорта
      const values = [
        ['Имя родителя', 'Информация о ребенке', 'Возраст ребенка', 'Телефон', 'Имя пользователя']
      ];

      let exportedCount = 0;
      
      // Извлекаем все лиды из всех пользователей
      for (const user of users) {
        for (const lead of user.leads) {
          values.push([
            lead.title || '',           // Столбец A: Имя родителя
            lead.comments || '',        // Столбец B: Информация о ребенке
            '',                         // Столбец C: Возраст ребенка (пока пустой)
            '',                         // Столбец D: Телефон (пока пустой)
            user.name || ''            // Столбец E: Имя пользователя
          ]);
          exportedCount++;
        }
      }

      // Очищаем существующие данные
      await sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: 'A:E'
      });

      // Записываем новые данные
      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `A1:E${values.length}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: values
        }
      });

      return {
        success: true,
        exportedCount: exportedCount
      };

    } catch (error) {
      console.error('Google Sheets export error:', error);
      return {
        success: false,
        exportedCount: 0,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка экспорта'
      };
    }
  }

  async addLeadToSheets(lead: LeadData, userName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const authClient = await this.getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      // Добавляем новую строку в конец таблицы
      const newRow = [
        lead.title || '',           // Столбец A: Имя родителя
        lead.comments || '',        // Столбец B: Информация о ребенке
        '',                         // Столбец C: Возраст ребенка (пока пустой)
        '',                         // Столбец D: Телефон (пока пустой)
        userName || ''             // Столбец E: Имя пользователя
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'A:E',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [newRow]
        }
      });

      return { success: true };

    } catch (error) {
      console.error('Google Sheets add lead error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка добавления лида'
      };
    }
  }
}

// Функция для получения ключа сервисного аккаунта из localStorage или API
export async function getServiceAccountKey(): Promise<any | null> {
  try {
    // Пытаемся получить ключ из localStorage (для демо/тестирования)
    const storedKey = localStorage.getItem('google_service_account_key');
    if (storedKey) {
      return JSON.parse(storedKey);
    }

    // В реальном сценарии ключ должен быть получен с backend'а
    // Для простоты демонстрации возвращаем null
    // Пользователь может вставить ключ через интерфейс
    return null;
    
  } catch (error) {
    console.error('Error getting service account key:', error);
    return null;
  }
}

// Функция для сохранения ключа сервисного аккаунта
export function saveServiceAccountKey(key: any): void {
  try {
    localStorage.setItem('google_service_account_key', JSON.stringify(key));
  } catch (error) {
    console.error('Error saving service account key:', error);
  }
}