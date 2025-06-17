
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../../hooks/useLocalization';
import ThemeToggle from '../../components/ui/ThemeToggle';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useLocalization();
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('forgotPasswordNotImplemented') || 'Forgot password functionality is not implemented in this demo.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 flex space-x-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Card title={t('forgotPassword')} className="w-full max-w-md">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {t('forgotPasswordInstruction') || 'Enter your email address and we will send you a link to reset your password.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label={t('emailAddress') || 'Email Address'} 
            id="email-forgot" 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required 
          />
          <Button type="submit" className="w-full">
            {t('sendResetLink') || 'Send Reset Link'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            {t('backToLogin') || 'Back to Login'}
          </Link>
        </p>
      </Card>
    </div>
  );
};

// Add to locales.ts:
// vi: { forgotPasswordNotImplemented: 'Chức năng quên mật khẩu chưa được triển khai.', forgotPasswordInstruction: 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.', emailAddress: 'Địa chỉ Email', sendResetLink: 'Gửi liên kết đặt lại', backToLogin: 'Quay lại Đăng nhập' }
// ru: { forgotPasswordNotImplemented: 'Функция восстановления пароля не реализована.', forgotPasswordInstruction: 'Введите ваш адрес электронной почты, и мы вышлем вам ссылку для сброса пароля.', emailAddress: 'Адрес электронной почты', sendResetLink: 'Отправить ссылку для сброса', backToLogin: 'Вернуться к Входу' }

export default ForgotPasswordPage;
