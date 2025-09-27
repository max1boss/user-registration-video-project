import React, { useState } from 'react';

interface EditUserModalProps {
  editingUser: any | null;
  showEditModal: boolean;
  onSaveUserChanges: (user: any) => void;
  onCloseEditModal: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  editingUser,
  showEditModal,
  onSaveUserChanges,
  onCloseEditModal
}) => {
  const [name, setName] = useState(editingUser?.name || '');
  const [email, setEmail] = useState(editingUser?.email || '');

  React.useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || '');
      setEmail(editingUser.email || '');
    }
  }, [editingUser]);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      return;
    }

    onSaveUserChanges({
      ...editingUser,
      name: name.trim(),
      email: email.trim()
    });
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    onCloseEditModal();
  };

  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Редактировать пользователя</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите имя"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите email"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Сохранить
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;