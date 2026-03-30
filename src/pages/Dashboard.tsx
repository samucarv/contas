import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useState, useEffect, useCallback } from 'react';
import { Transaction, transactionService } from '../services/transactionService';
import TransactionModal from '../components/TransactionModal';

// Extend jsPDF with autotable plugin
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

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

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(String(new Date().getMonth() + 1));
  const [currentYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalInitialType, setModalInitialType] = useState<'expense' | 'deduction'>('expense');

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

  const handleSaveTransaction = async (data: any) => {
    await transactionService.addTransaction(data);
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação? No caso de parcelamentos, todos os registros vinculados podem ser afetados.')) {
      await transactionService.deleteTransaction(id, true);
      fetchTransactions();
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const expenses = filteredTransactions.filter(t => t.type === 'expense');
  const deductions = filteredTransactions.filter(t => t.type === 'deduction');

  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDeductions = deductions.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const finalBalance = totalExpenses - totalDeductions;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const monthLabel = months.find(m => m.value === currentMonth)?.label || '';

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(`Dashboard - Relatório Financeiro`, 14, 22);

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

    doc.autoTable({
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

    doc.save(`relatorio_dashboard_${monthLabel.toLowerCase()}_${currentYear}.pdf`);
  };


  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Dashboard de Despesas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">Acompanhe seus gastos e descontos mensais com facilidade.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary placeholder:text-slate-400 transition-colors"
              placeholder="Buscar transação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex flex-col min-w-[140px]">
              <select
                className="form-select block w-full pl-3 pr-10 py-2 text-sm font-medium border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-primary focus:border-primary rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none transition-colors"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label} {currentYear}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </div>
            </div>
            <button
              onClick={() => { setModalInitialType('expense'); setIsModalOpen(true); }}
              className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="hidden sm:inline">Nova Despesa</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Despesas Mensais Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold">Despesas Mensais</h2>
              </div>
              <button
                onClick={() => { setModalInitialType('expense'); setIsModalOpen(true); }}
                className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
              >
                Adicionar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parcelas</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Valor</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Carregando...</td></tr>
                  ) : expenses.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Nenhuma despesa encontrada.</td></tr>
                  ) : expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{expense.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{expense.current_installment}/{expense.total_installments}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-semibold text-right">{formatCurrency(Number(expense.amount))}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Despesas a Descontar Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">savings</span>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold">Despesas a Descontar</h2>
              </div>
              <button
                onClick={() => { setModalInitialType('deduction'); setIsModalOpen(true); }}
                className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
              >
                Adicionar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parcelas</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Valor</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Carregando...</td></tr>
                  ) : deductions.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Nenhum desconto encontrado.</td></tr>
                  ) : deductions.map((deduction) => (
                    <tr key={deduction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{deduction.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{deduction.current_installment}/{deduction.total_installments}</td>
                      <td className="px-6 py-4 text-sm text-amber-600 dark:text-amber-500 font-semibold text-right">{formatCurrency(Number(deduction.amount))}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(deduction.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Summary Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-slate-900 dark:text-white text-lg font-bold">Resumo Financeiro</h2>
            </div>
            <div className="p-6 flex flex-col gap-6">
              {/* Stat 1 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <span>Despesas Mensais</span>
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalExpenses)}
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalExpenses / 5000) * 100)}%` }}></div>
                </div>
              </div>
              {/* Stat 2 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <span>Despesas a Descontar</span>
                  <span className="material-symbols-outlined text-[18px]">trending_down</span>
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                  {formatCurrency(totalDeductions)}
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalDeductions / 2000) * 100)}%` }}></div>
                </div>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              {/* Final Balance */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                  <span>Total Final</span>
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                </div>
                <div className="text-3xl font-black text-primary">
                  {formatCurrency(finalBalance)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Saldo remanescente após todos os descontos aplicados.</p>
              </div>
              <button 
                onClick={exportToPDF}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">file_download</span>
                Exportar Relatório PDF
              </button>
            </div>
          </div>
          {/* Monthly Tip Card */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 flex gap-4">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">lightbulb</span>
            </div>
            <div>
              <h4 className="text-primary font-bold text-sm mb-1">Dica de Economia</h4>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">Acompanhe seus gastos para ter uma visão clara de onde está indo seu dinheiro.</p>
            </div>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialType={modalInitialType}
      />
    </div>
  );
}
