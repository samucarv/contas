
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Optional: Auto login or redirect to login page
            setTimeout(() => navigate('/login'), 3000);
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
                    </header>
                    <main className="flex-1 flex items-center justify-center p-6">
                        <div className="w-full max-w-[480px] space-y-8 bg-white dark:bg-slate-900/50 p-8 md:p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col gap-2 text-center md:text-left">
                                <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Criar uma conta</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Comece a gerenciar suas finanças de forma simples.</p>
                            </div>

                            {success ? (
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-4">
                                    <div className="size-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto">
                                        <span className="material-symbols-outlined text-2xl">check</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-green-600 dark:text-green-500">Conta criada com sucesso!</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Verifique seu e-mail para confirmar o cadastro. Você será redirecionado para o login em instantes.</p>
                                </div>
                            ) : (
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
                                        <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold">Senha</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                            <input
                                                className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400"
                                                placeholder="Mínimo 6 caracteres"
                                                required
                                                type="password"
                                                minLength={6}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold">Confirmar Senha</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_reset</span>
                                            <input
                                                className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400"
                                                placeholder="Repita sua senha"
                                                required
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Criando conta...' : 'Cadastrar'}
                                        <span className="material-symbols-outlined text-xl">person_add</span>
                                    </button>
                                </form>
                            )}

                            <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                                Já tem uma conta? <Link className="text-primary font-bold hover:underline" to="/login">Acesse agora</Link>
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
