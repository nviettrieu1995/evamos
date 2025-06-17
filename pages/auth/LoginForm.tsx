import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { APP_NAME } from '../../constants';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'; // Changed path

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { t } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      onSuccess();
    } else {
      setError('Invalid username or password. Please try again.'); // Consider localizing this error
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('loginWelcome')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('loginPrompt')} {APP_NAME}
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <Input
          id="username"
          label={t('username')}
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          id="password"
          label={t('password')}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div>
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            disabled={loading}
            leftIcon={<LockClosedIcon className="h-5 w-5"/>}
          >
            {t('login')}
          </Button>
        </div>
        <div className="text-sm text-center">
            <a href="#/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                {t('forgotPassword')}
            </a>
        </div>
         <div className="text-sm text-center">
            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <a href="#/register" className="font-medium text-primary hover:text-primary-dark">
                {t('register')}
            </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;