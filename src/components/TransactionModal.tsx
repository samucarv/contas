
import React, { useState } from 'react';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        description: string;
        amount: number;
        type: 'expense' | 'deduction';
        date: string;
        installments: number;
    }) => Promise<void>;
    initialType?: 'expense' | 'deduction';
}

export default function TransactionModal({ isOpen, onClose, onSave, initialType = 'expense' }: TransactionModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'expense' | 'deduction'>(initialType);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [installments, setInstallments] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                description,
                amount: parseFloat(amount),
                type,
                date,
                installments,
            });
            onClose();
            // Reset form
            setDescription('');
            setAmount('');
            setInstallments(1);
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Erro ao salvar transação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nova Transação</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${type === 'expense'
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            Despesa
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('deduction')}
                            className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${type === 'deduction'
                                    ? 'bg-amber-500/10 border-amber-500 text-amber-600'
                                    : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            Desconto
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Descrição</label>
                        <input
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Ex: Aluguel, Supermercado..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Valor (R$)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="0,00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                            Parcelamento
                            <span className="text-primary">{installments}x</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="48"
                            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            value={installments}
                            onChange={(e) => setInstallments(parseInt(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>À vista</span>
                            <span>48 parcelas</span>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Transação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
