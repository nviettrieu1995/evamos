
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../../hooks/useLocalization';
import ThemeToggle from '../../components/ui/ThemeToggle';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterPage: React.FC = () => {
  const { t } = useLocalization();

  // Basic form state, no actual registration logic for this placeholder
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('registrationNotImplemented') || 'Registration functionality is not implemented in this demo.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 flex space-x-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Card title={t('register')} className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label={t('username')} 
            id="username-register" 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <Input 
            label={t('password')} 
            id="password-register" 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required 
          />
          <Input 
            label={t('confirmPassword') || 'Confirm Password'} 
            id="confirm-password-register" 
            type="password" 
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required 
          />
          <Button type="submit" className="w-full">
            {t('register')}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          {t('alreadyHaveAccount') || 'Already have an account?'} {' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            {t('login')}
          </Link>
        </p>
      </Card>
    </div>
  );
};

// Add to locales.ts:
// vi: { registrationNotImplemented: 'Chức năng đăng ký chưa được triển khai.', confirmPassword: 'Xác nhận mật khẩu', alreadyHaveAccount: 'Đã có tài khoản?' }
// ru: { registrationNotImplemented: 'Функция регистрации не реализована.', confirmPassword: 'Подтвердите пароль', alreadyHaveAccount: 'Уже есть аккаунт?' }


export default RegisterPage;
