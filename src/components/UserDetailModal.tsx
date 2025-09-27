import React from 'react';

interface UserDetailModalProps {
  selectedUser: any | null;
  showUserDetail: boolean;
  playingAudio: string | null;
  onCloseUserDetail: () => void;
  onAudioPlay: (audioId: string) => void;
  onAudioPause: () => void;
  parseChildInfo: (comments: string) => any;
  formatDuration: (seconds: number) => string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  selectedUser,
  showUserDetail,
  playingAudio,
  onCloseUserDetail,
  onAudioPlay,
  onAudioPause,
  parseChildInfo,
  formatDuration
}) => {
  if (!showUserDetail || !selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h2>
            <p className="text-gray-600">{selectedUser.email}</p>
            <p className="text-sm text-gray-400">
              Регистрация: {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('ru-RU') : 'Неизвестно'}
            </p>
          </div>
          <button
            onClick={onCloseUserDetail}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Контент с прокруткой */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Статистика пользователя */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedUser.leads?.length || 0}
                </div>
                <div className="text-blue-800">Лидов</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selectedUser.leads?.reduce((acc: number, lead: any) => acc + (lead.audios?.length || 0), 0) || 0}
                </div>
                <div className="text-green-800">Аудиозаписей</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedUser.leads?.filter((lead: any) => lead.comments && lead.comments.trim()).length || 0}
                </div>
                <div className="text-purple-800">С комментариями</div>
              </div>
            </div>

            {/* Лиды пользователя */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Лиды и аудиозаписи</h3>
              {selectedUser.leads && selectedUser.leads.length > 0 ? (
                <div className="space-y-4">
                  {selectedUser.leads.map((lead: any, leadIndex: number) => {
                    const leadInfo = parseChildInfo(lead.comments || '');
                    return (
                      <div key={lead.id || leadIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">Лид #{leadIndex + 1}</h4>
                            <p className="text-sm text-gray-500">
                              {lead.created_at ? new Date(lead.created_at).toLocaleString('ru-RU') : 'Дата неизвестна'}
                            </p>
                          </div>
                          {lead.audios && lead.audios.length > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {lead.audios.length} аудиозаписей
                            </span>
                          )}
                        </div>

                        {/* Информация из комментариев */}
                        {lead.comments && lead.comments.trim() && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-700 mb-2">Информация о клиенте:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {leadInfo.parentName && (
                                <div><span className="font-medium">Родитель:</span> {leadInfo.parentName}</div>
                              )}
                              {leadInfo.childName && (
                                <div><span className="font-medium">Ребенок:</span> {leadInfo.childName}</div>
                              )}
                              {leadInfo.childAge && (
                                <div><span className="font-medium">Возраст:</span> {leadInfo.childAge}</div>
                              )}
                              {leadInfo.phone && (
                                <div><span className="font-medium">Телефон:</span> {leadInfo.phone}</div>
                              )}
                            </div>
                            {(!leadInfo.parentName && !leadInfo.childName && !leadInfo.childAge && !leadInfo.phone) && (
                              <div className="text-gray-600 italic">
                                Исходный комментарий: {lead.comments}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Аудиозаписи */}
                        {lead.audios && lead.audios.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Аудиозаписи:</h5>
                            <div className="space-y-2">
                              {lead.audios.map((audio: any, audioIndex: number) => (
                                <div key={audio.id || audioIndex} className="border border-gray-100 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">
                                      Запись #{audioIndex + 1}
                                      {audio.created_at && (
                                        <span className="ml-2">
                                          ({new Date(audio.created_at).toLocaleString('ru-RU')})
                                        </span>
                                      )}
                                    </span>
                                    {audio.duration && (
                                      <span className="text-xs text-gray-500">
                                        {formatDuration(audio.duration)}
                                      </span>
                                    )}
                                  </div>
                                  {audio.file_url ? (
                                    <div className="flex items-center gap-2">
                                      <audio 
                                        controls 
                                        className="flex-1"
                                        onPlay={() => onAudioPlay(audio.id)}
                                        onPause={onAudioPause}
                                      >
                                        <source src={audio.file_url} type="audio/mpeg" />
                                        <source src={audio.file_url} type="audio/wav" />
                                        <source src={audio.file_url} type="audio/ogg" />
                                        Ваш браузер не поддерживает аудио элемент.
                                      </audio>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 text-sm italic">
                                      Аудиофайл недоступен
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(!lead.audios || lead.audios.length === 0) && (
                          <div className="text-gray-500 text-sm italic">
                            Нет аудиозаписей
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>У этого пользователя пока нет лидов</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;