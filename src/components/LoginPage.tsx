import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginPageProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export function LoginPage({ onSuccess, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (success) {
      onSuccess();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-glu-light flex items-center justify-center px-4">
      <div className="bg-white p-10 w-full max-w-lg shadow-2xl border-4 border-glu-orange">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-glu-gray hover:text-glu-orange transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>{t('auth.backToHome')}</span>
          </button>
        )}
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-glu-orange to-glu-green flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">GLU</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('auth.adminLogin')}</h1>
          <p className="text-glu-gray text-lg">{t('auth.accessCms')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-3">
              {t('auth.email')}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full bg-glu-light border-2 border-glu-gray focus:ring-2 focus:ring-glu-orange focus:border-glu-orange py-4 text-lg"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-3">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-glu-light border-2 border-glu-gray focus:ring-2 focus:ring-glu-orange focus:border-glu-orange py-4 text-lg pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-glu-gray hover:text-gray-900"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 text-lg font-medium">
              {t('auth.invalidCredentials')}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-glu-orange hover:bg-orange-600 text-white py-4 text-lg font-semibold flex items-center justify-center space-x-3 border-2 border-glu-orange hover:border-orange-600"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn size={24} />
                <span>{t('auth.signIn')}</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}