
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table, { Column } from '../components/ui/Table';
import { User, UserRole } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { generateUniqueId } from '../utils/helpers';
import { ROLES_CONFIG } from '../constants'; // For role name localization

// Mock users for display - this should ideally come from a context or service
let mockSystemUsers: User[] = [
    { id: 'user-admin-id', username: 'admin', role: UserRole.ADMIN, name: 'Admin User', email: 'admin@evamos.com' },
    { id: 'user-manager-id', username: 'quanly', role: UserRole.MANAGER, name: 'Manager User', email: 'manager@evamos.com' },
    { id: 'w1', username: 'hanh_worker', role: UserRole.WORKER, name: 'Hạnh', email: 'hanh@example.com' },
    { id: 'w2', username: 'tuananh_worker', role: UserRole.WORKER, name: 'Tuấn Anh', email: 'tuananh@example.com' },
];


const UserManagementPage: React.FC = () => {
  const { t } = useLocalization();
  const [users, setUsers] = useState<User[]>(mockSystemUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string } | null>(null);

  const roleOptions = Object.entries(ROLES_CONFIG).map(([roleKey, roleConfig]) => ({
    value: roleKey as UserRole,
    label: t(roleConfig.nameKey)
  }));


  const openAddModal = () => {
    setEditingUser({ username: '', name: '', email: '', role: UserRole.WORKER, password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser({...user, password: ''}); // Don't prefill password for editing
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = () => {
    if (!editingUser || !editingUser.username?.trim() || !editingUser.role) {
        alert(t('userFieldsRequired')); // Username and role are min
        return;
    }
    if (!editingUser.id && (!editingUser.password || editingUser.password.length < 6)) {
        alert(t('passwordMinLength')); // Password required for new users
        return;
    }
    
    // In a real app, password would be hashed. Here we just store it if provided for new user.
    // For editing, if password field is empty, it's not changed.
    const userData: User = {
        id: editingUser.id || generateUniqueId(),
        username: editingUser.username,
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role,
    };

    if (editingUser.id) { // Editing
        // Password update logic would be more complex (e.g., only if new password provided)
        setUsers(users.map(u => u.id === editingUser.id ? userData : u));
        // Update global mock list if editing
        mockSystemUsers = mockSystemUsers.map(u => u.id === editingUser.id ? userData : u);
    } else { // Adding
        setUsers([userData, ...users]);
        // Update global mock list if adding
        mockSystemUsers = [userData, ...mockSystemUsers];
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
        setUsers(users.filter(u => u.id !== id));
        mockSystemUsers = mockSystemUsers.filter(u => u.id !== id);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setEditingUser(prev => ({...prev, [name]: value }));
  };


  const columns: Column<User>[] = [
    { header: 'username', accessor: 'username', className: "font-semibold" },
    { header: 'fullName', accessor: 'name' },
    { header: 'emailAddress', accessor: 'email' },
    { header: 'role', accessor: (item) => roleOptions.find(r => r.value === item.role)?.label || item.role },
    {
      header: 'actions',
      accessor: 'id',
      render: (item: User) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} title={t('edit')}><PencilIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title={t('delete')} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <Card title={t('userManagement')} actions={
        <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>{t('createAccount')}</Button>
    }>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        {t('userManagementDescription')}
      </p>
      <Table columns={columns} data={users} />
      {isModalOpen && editingUser && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser.id ? t('editUser') : t('addUser')}
            footer={<><Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
            size="lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('username')} name="username" value={editingUser.username || ''} onChange={handleInputChange} required />
                <Input label={t('fullName')} name="name" value={editingUser.name || ''} onChange={handleInputChange} />
                <Input label={t('emailAddress')} name="email" type="email" value={editingUser.email || ''} onChange={handleInputChange} />
                <Select label={t('role')} name="role" value={editingUser.role || UserRole.WORKER} onChange={handleInputChange} options={roleOptions} required/>
                <Input label={t('password')} name="password" type="password" value={editingUser.password || ''} onChange={handleInputChange} placeholder={editingUser.id ? t('leaveEmptyToKeepCurrent') : ''} required={!editingUser.id} />
                {/* Add confirm password if needed */}
            </div>
          </Modal>
      )}
       <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-md text-center">
        <p className="text-gray-500 dark:text-gray-400">{t('userManagementDetailsPlaceholder')}</p>
      </div>
    </Card>
  );
};
// Add to locales.ts
// vi: { leaveEmptyToKeepCurrent: 'Để trống để giữ mật khẩu hiện tại' }
// ru: { leaveEmptyToKeepCurrent: 'Оставьте пустым, чтобы сохранить текущий пароль' }

export default UserManagementPage;
