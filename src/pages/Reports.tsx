
import { useState, useEffect, useCallback } from 'react';
import { Transaction, transactionService } from '../services/transactionService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
];

export default function Reports() {
    const [currentMonth, setCurrentMonth] = useState(String(new Date().getMonth() + 1));
    const [currentYear] = useState(new Date().getFullYear());
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await transactionService.getTransactionsByMonth(currentYear, parseInt(currentMonth));
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    }, [currentYear, currentMonth]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const monthLabel = months.find(m => m.value === currentMonth)?.label;

        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(`Relatório Financeiro`, 14, 22);

        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`${monthLabel} ${currentYear}`, 14, 30);

        // Sort: expenses first, then deductions
        const sortedTransactions = [...transactions].sort((a, b) => {
            if (a.type === b.type) return new Date(a.date).getTime() - new Date(b.date).getTime();
            return a.type === 'expense' ? -1 : 1;
        });

        const tableData = sortedTransactions.map(t => [
            new Date(t.date).toLocaleDateString('pt-BR'),
            t.description,
            t.type === 'expense' ? 'Despesa' : 'Desconto',
            `${t.current_installment}/${t.total_installments}`,
            formatCurrency(Number(t.amount))
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Data', 'Descrição', 'Tipo', 'Parcela', 'Valor']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [59, 130, 246], // primary blue
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'left'
            },
            columnStyles: {
                4: { halign: 'right' }
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            }
        });

        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalDeductions = transactions.filter(t => t.type === 'deduction').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const finalBalance = totalExpenses - totalDeductions;

        const finalY = (doc as any).lastAutoTable.finalY + 15;

        // Background for summary
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(14, finalY - 5, 182, 35, 'F');

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Total Despesas:`, 20, finalY + 5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${formatCurrency(totalExpenses)}`, 190, finalY + 5, { align: 'right' });

        doc.setTextColor(100, 116, 139);
        doc.text(`Total Descontos:`, 20, finalY + 12);
        doc.setTextColor(180, 83, 9); // amber-700
        doc.text(`- ${formatCurrency(totalDeductions)}`, 190, finalY + 12, { align: 'right' });

        doc.setDrawColor(226, 232, 240);
        doc.line(20, finalY + 17, 190, finalY + 17);

        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(`Saldo Final:`, 20, finalY + 25);
        doc.text(`${formatCurrency(finalBalance)}`, 190, finalY + 25, { align: 'right' });

        doc.save(`relatorio_${monthLabel.toLowerCase()}_${currentYear}.pdf`);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Relatórios Mensais</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">Consulte e exporte seus lançamentos financeiros.</p>
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:min-w-[160px]">
                        <select
                            className="form-select block w-full pl-3 pr-10 py-2.5 text-sm font-medium border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-primary focus:border-primary rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none transition-colors"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(e.target.value)}
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label} {currentYear}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        Exportar PDF
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Data</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Parcela</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400">Carregando dados...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">Nenhum lançamento encontrado para este período.</td></tr>
                            ) : transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{t.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${t.type === 'expense'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-amber-500/10 text-amber-600'
                                            }`}>
                                            {t.type === 'expense' ? 'Despesa' : 'Desconto'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{t.current_installment}/{t.total_installments}</td>
                                    <td className={`px-6 py-4 text-sm font-black text-right ${t.type === 'expense' ? 'text-slate-900 dark:text-white' : 'text-amber-600'
                                        }`}>
                                        {formatCurrency(Number(t.amount))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
