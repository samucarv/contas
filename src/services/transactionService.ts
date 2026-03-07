
import { supabase } from '../lib/supabase';

export interface Transaction {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    type: 'expense' | 'deduction';
    date: string;
    total_installments: number;
    current_installment: number;
    parent_id?: string;
    created_at: string;
}

export const transactionService = {
    async getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async addTransaction(payload: {
        description: string;
        amount: number;
        type: 'expense' | 'deduction';
        date: string;
        installments: number;
    }) {
        const { description, amount, type, date, installments } = payload;
        const items = [];
        const baseDate = new Date(date + 'T00:00:00');

        if (installments > 1) {
            // Create first installment to get its ID (parent)
            const { data: parentData, error: parentError } = await supabase
                .from('transactions')
                .insert({
                    description,
                    amount,
                    type,
                    date,
                    total_installments: installments,
                    current_installment: 1,
                })
                .select()
                .single();

            if (parentError) throw parentError;

            const parentId = parentData.id;

            // Create subsequent installments
            for (let i = 2; i <= installments; i++) {
                const nextDate = new Date(baseDate);
                nextDate.setMonth(baseDate.getMonth() + (i - 1));

                items.push({
                    description,
                    amount,
                    type,
                    date: nextDate.toISOString().split('T')[0],
                    total_installments: installments,
                    current_installment: i,
                    parent_id: parentId,
                });
            }

            if (items.length > 0) {
                const { error: batchError } = await supabase.from('transactions').insert(items);
                if (batchError) throw batchError;
            }

            return parentData;
        } else {
            // Single transaction
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    description,
                    amount,
                    type,
                    date,
                    total_installments: 1,
                    current_installment: 1,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    async deleteTransaction(id: string, cascade: boolean = false) {
        if (cascade) {
            // This will delete the parent and all children if parent_id FK is set to cascade
            const { error } = await supabase.from('transactions').delete().match({ id });
            if (error) throw error;
        } else {
            const { error } = await supabase.from('transactions').delete().match({ id });
            if (error) throw error;
        }
    }
};
