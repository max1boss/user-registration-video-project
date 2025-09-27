import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';

interface Lead {
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
  leads: Lead[];
}

interface UsersListProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onDownloadAllUserAudios: (user: User) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onEditUser: (userId: string, currentName: string) => void;
  deletingUserId: string | null;
  editingUserId: string | null;
  formatDate: (dateString: string) => string;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  selectedUser,
  onSelectUser,
  onDownloadAllUserAudios,
  onDeleteUser,
  onEditUser,
  deletingUserId,
  editingUserId,
  formatDate
}) => {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 10;
  
  const displayedUsers = showAll ? 
    users.slice(currentPage * usersPerPage, (currentPage + 1) * usersPerPage) : 
    users.slice(0, 5);
  
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
      <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Пользователи</h3>
                <p className="text-sm text-gray-500">{users.length} всего</p>
              </div>
            </div>
            {!showAll && users.length > 5 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAll(true)}
                className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
              >
                Показать всех ({users.length})
              </Button>
            )}
            {showAll && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAll(false);
                  setCurrentPage(0);
                }}
                className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
              >
                Показать первых 5
              </Button>
            )}
          </CardTitle>
          {showAll && (
            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
              <span>
                Показано {currentPage * usersPerPage + 1}-{Math.min((currentPage + 1) * usersPerPage, users.length)} из {users.length} пользователей
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="h-8 w-8 p-0"
                >
                  <Icon name="ChevronLeft" size={14} />
                </Button>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                  {currentPage + 1} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages - 1}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Icon name="ChevronRight" size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className={showAll ? "max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" : ""}>
          <div className="space-y-3">
            {displayedUsers.map((user) => (
              <div
                key={user.id}
                className={`relative group p-4 border border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedUser?.id === user.id 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-md' 
                    : 'bg-white/80 hover:bg-white/90 hover:border-gray-300'
                }`}
                onClick={() => onSelectUser(user)}
              >
                {selectedUser?.id === user.id && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
                )}
                <div className="relative flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <Icon name="Calendar" size={12} className="inline mr-1" />
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
                      >
                        <Icon name="FileText" size={12} className="mr-1" />
                        {user.leads.length} лидов
                      </Badge>
                      {user.leads.filter(l => l.has_audio).length > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0"
                        >
                          <Icon name="Volume2" size={12} className="mr-1" />
                          {user.leads.filter(l => l.has_audio).length} аудио
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {user.leads.filter(l => l.has_audio).length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadAllUserAudios(user);
                          }}
                          className="h-8 px-2 bg-white/80 border-gray-200 hover:bg-white text-xs"
                        >
                          <Icon name="Download" size={12} className="mr-1" />
                          Скачать
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={editingUserId === user.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditUser(user.id, user.name);
                        }}
                        className="h-8 w-8 p-0 bg-white/80 border-gray-200 hover:bg-white"
                      >
                        {editingUserId === user.id ? (
                          <Icon name="Loader2" size={12} className="animate-spin" />
                        ) : (
                          <Icon name="Edit" size={12} />
                        )}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deletingUserId === user.id}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 border-red-200 text-red-600"
                          >
                            {deletingUserId === user.id ? (
                              <Icon name="Loader2" size={12} className="animate-spin" />
                            ) : (
                              <Icon name="Trash2" size={12} />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить пользователя <strong>{user.name}</strong> ({user.email})?
                              <br /><br />
                              <span className="text-destructive">
                                ⚠️ Это действие удалит:
                                <br />• Учетную запись пользователя
                                <br />• Все его лиды ({user.leads.length} шт.)
                                <br />• Все связанные видеозаписи
                              </span>
                              <br /><br />
                              Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteUser(user.id, user.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Удалить пользователя
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersList;