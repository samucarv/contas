import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Set a fallback timeout for the login request
    const timeoutId = setTimeout(() => {
      console.warn('[Login] Submission timeout reached after 20s');
      setLoading(false);
      setError('A conexão com o servidor está demorando muito. Verifique sua rede ou tente novamente.');
    }, 20000);

    try {
      console.log('[Login] Starting signInWithPassword...');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[Login] Supabase response received', error ? 'with error' : 'successfully');
      clearTimeout(timeoutId);

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        console.log('[Login] Navigating to dashboard...');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('[Login] Exception during sign in:', err);
      clearTimeout(timeoutId);
      setError(err.message || 'Ocorreu um erro inesperado ao tentar entrar.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen flex flex-col">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 md:px-20 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-primary rounded-lg p-2 text-white">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">Finanças Pessoais</h2>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Segurança</a>
              <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Suporte</a>
            </div>
          </header>
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-[480px] space-y-8 bg-white dark:bg-slate-900/50 p-8 md:p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-2 text-center md:text-left">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Bem-vindo de volta</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Gerencie seu dinheiro com segurança e simplicidade.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold">E-mail</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400"
                      placeholder="seu@email.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold">Senha</label>
                    <a className="text-xs font-semibold text-primary hover:underline" href="#">Esqueceu a senha?</a>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">lock</span>
                    <input
                      className="w-full pl-12 pr-12 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400"
                      placeholder="Digite sua senha"
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" type="button">
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary/20 focus:ring-offset-0 transition-all cursor-pointer" type="checkbox" />
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium group-hover:text-slate-900 dark:group-hover:text-slate-200">Lembrar de mim</span>
                  </label>
                </div>
                <button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Acessando...' : 'Entrar'}
                  <span className="material-symbols-outlined text-xl">login</span>
                </button>
              </form>
              <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                Novo por aqui? <Link className="text-primary font-bold hover:underline" to="/register">Crie uma conta gratuita</Link>
              </p>
            </div>
          </main>
          <footer className="px-6 md:px-20 py-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-background-dark/50">
            <p className="text-xs text-slate-500 dark:text-slate-500">© 2024 Finanças Pessoais. Todos os direitos reservados.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
