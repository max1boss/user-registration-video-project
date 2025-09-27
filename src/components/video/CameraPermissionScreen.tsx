import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface CameraPermissionScreenProps {
  error: string | null;
  onRequestAccess: () => void;
}

const CameraPermissionScreen: React.FC<CameraPermissionScreenProps> = ({
  error,
  onRequestAccess
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-6">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
        <Icon name="Video" size={40} className="text-blue-600" />
      </div>
      
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-3">Видеозапись</h2>
        <p className="text-gray-600 mb-2">
          📹 Записывайте видео до <strong>5 минут</strong>
        </p>
        <p className="text-gray-600 mb-6">
          💾 Максимальный размер <strong>200МБ</strong>
        </p>
        
        <Button onClick={onRequestAccess} size="lg" className="w-full">
          <Icon name="Camera" size={20} className="mr-2" />
          Включить камеру
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={20} className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraPermissionScreen;