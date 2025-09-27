import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ServiceAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (keyText: string) => void;
}

const ServiceAccountModal: React.FC<ServiceAccountModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [keyText, setKeyText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyText.trim()) {
      onSubmit(keyText.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Настройка Google Sheets</CardTitle>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Icon name="X" size={20} />
          </button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              <Icon name="Info" size={16} className="inline mr-2" />
              Как получить Google Service Account ключ:
            </h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Перейдите в <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Создайте проект или выберите существующий</li>
              <li>Включите Google Sheets API в разделе "API и сервисы"</li>
              <li>Создайте Service Account в разделе "Учетные данные"</li>
              <li>Скачайте JSON ключ и скопируйте его содержимое сюда</li>
              <li>Предоставьте доступ к таблице для email из ключа</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Google Service Account ключ (JSON):
              </label>
              <textarea
                value={keyText}
                onChange={(e) => setKeyText(e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-xs resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Вставьте полное содержимое JSON файла ключа
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2"
              >
                <Icon name="Save" size={16} />
                Сохранить ключ
              </button>
            </div>
          </form>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">
              <Icon name="Shield" size={16} className="inline mr-2" />
              Безопасность:
            </h4>
            <p className="text-sm text-amber-700">
              Ключ сохраняется локально в браузере и используется только для экспорта в ваши Google Таблицы. 
              Данные не передаются на сторонние серверы.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceAccountModal;