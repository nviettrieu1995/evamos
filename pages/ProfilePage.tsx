
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { t } = useLocalization();
  const { currentUser } = useAuth();

  // Mock form state
  const [name, setName] = React.useState(currentUser?.name || '');
  const [username, setUsername] = React.useState(currentUser?.username || '');
  // Password change fields would go here

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('profileUpdateNotImplemented') || 'Profile update functionality is not implemented.');
  };

  return (
    <Card title={t('userProfile') || 'User Profile'}>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        {t('manageYourProfile') || 'Manage your profile information and settings.'}
      </p>
      
      <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
        <Input 
          label={t('fullName') || 'Full Name'} 
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          label={t('username')} 
          id="profile-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled // Usually username is not editable or has special conditions
          className="bg-gray-100 dark:bg-gray-700"
        />
        {/* Add fields for password change here */}
        <Button type="submit">{t('updateProfile') || 'Update Profile'}</Button>
      </form>
    </Card>
  );
};

// Add to locales.ts:
// vi: { userProfile: 'Hồ sơ người dùng', manageYourProfile: 'Quản lý thông tin hồ sơ và cài đặt của bạn.', profileUpdateNotImplemented: 'Chức năng cập nhật hồ sơ chưa được triển khai.', updateProfile: 'Cập nhật hồ sơ' }
// ru: { userProfile: 'Профиль пользователя', manageYourProfile: 'Управляйте информацией вашего профиля и настройками.', profileUpdateNotImplemented: 'Функция обновления профиля не реализована.', updateProfile: 'Обновить профиль' }

export default ProfilePage;
