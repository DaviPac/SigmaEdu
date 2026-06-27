'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAvaAuth } from '@/components/ava/ava-auth-context';
import { ArrowRight, LoaderCircle, ShieldCheck } from 'lucide-react';

type Mode = 'login' | 'register';

export default function AvaLoginPage() {
  const { login, register, loading: authLoading } = useAvaAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password || loading) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setUsername('');
    setPassword('');
    setSuccess(false);
  }

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <LoaderCircle className="w-6 h-6 animate-spin text-[#1D9E75]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      {/* Subtle background gradient */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 20% 40%, #1D9E75 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 80% 20%, #185FA5 0%, transparent 50%)
          `,
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-xl shadow-black/5 dark:shadow-black/30">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-7">
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center text-sm font-semibold"
              style={{ background: '#1D9E75', color: '#E1F5EE' }}
            >
              S
            </div>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              SigmaEdu
            </span>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Nome de usuário"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              disabled={loading || success}
              autoComplete="username"
              className={`w-full rounded-xl border bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm
                outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500
                text-gray-900 dark:text-gray-100
                focus:border-[#1D9E75]/50 focus:ring-2 focus:ring-[#1D9E75]/10
                ${error ? 'border-red-400/60' : 'border-gray-200 dark:border-gray-700'}`}
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading || success}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className={`w-full rounded-xl border bg-gray-50 dark:bg-gray-800 px-4 py-2.5 pr-12 text-sm
                  outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500
                  text-gray-900 dark:text-gray-100
                  focus:border-[#1D9E75]/50 focus:ring-2 focus:ring-[#1D9E75]/10
                  ${error ? 'border-red-400/60' : 'border-gray-200 dark:border-gray-700'}`}
              />
              <button
                type="submit"
                disabled={!username.trim() || !password || loading || success}
                className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center
                  justify-center rounded-lg transition-all duration-200
                  ${
                    username.trim() && password && !loading && !success
                      ? 'bg-[#1D9E75] text-white hover:bg-[#189068] cursor-pointer'
                      : 'text-gray-300 dark:text-gray-600 cursor-default'
                  }`}
              >
                {loading ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : success ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </motion.div>
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  className="text-center text-xs text-red-500"
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!username.trim() || !password || loading || success}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  username.trim() && password && !loading && !success
                    ? 'bg-[#1D9E75] text-white hover:bg-[#189068] cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                }`}
            >
              {loading
                ? 'Aguarde...'
                : success
                  ? 'Redirecionando...'
                  : mode === 'login'
                    ? 'Entrar'
                    : 'Criar conta'}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-gray-400 dark:text-gray-500">
            Plataforma de preparação para o ENEM
          </p>
        </div>
      </motion.div>
    </div>
  );
}
