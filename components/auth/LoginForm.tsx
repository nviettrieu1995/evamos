import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { APP_NAME } from '../../constants';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig'; // Đường dẫn tùy bạn đặt

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, username, password);
      onSuccess(); // Đăng nhập thành công
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
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
          type="email"
          icon={UserIcon}
          value={username}
          onChange={(e: any) => setUsername(e.target.value)}
          placeholder="Email"
          required
        />
        <Input
          type="password"
          icon={LockClosedIcon}
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Đang đăng nhập...' : t('login')}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
