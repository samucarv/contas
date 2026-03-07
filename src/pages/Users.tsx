
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
    id: string;
    email: string;
    role: 'admin' | 'user';
    created_at: string;
}

export default function Users() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching profiles:', error);
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const toggleRole = async (id: string, currentRole: string) => {
        const roleToSet = currentRole === 'admin' ? 'user' : 'admin';
        const { error } = await supabase
            .from('profiles')
            .update({ role: roleToSet })
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar cargo: ' + error.message);
        } else {
            fetchProfiles();
        }
    };

    const handleCreateUser = () => {
        // In a real app with Supabase, creating an AUTH user for someone else 
        // requires the Admin API (service_role key) which shouldn't be on the frontend.
        // I will show a message explaining that the user needs to register first.
        alert(`Para cadastrar ${newEmail}, peça para que registre-se em /register. Após o registro, você poderá alterar o perfil dele para ${newRole} nesta tela.`);
        setIsModalOpen(false);
        setNewEmail('');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Gerenciar Usuários</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">Controle as permissões de acesso ao sistema.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Novo Usuário
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Novo Usuário</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                            Devido às políticas de segurança, os novos usuários devem se cadastrar na página de registro. Informe o e-mail abaixo para facilitar a futura gestão do perfil.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">E-mail do Usuário</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                                    placeholder="exemplo@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Perfil de Acesso</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                                >
                                    <option value="user">Usuário (Apenas Relatórios)</option>
                                    <option value="admin">Administrador (Acesso Total)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateUser}
                                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                            >
                                Prosseguir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">E-mail</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Cargo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Criado em</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400">Carregando usuários...</td></tr>
                            ) : profiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{profile.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${profile.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-600'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {profile.role === 'admin' ? 'Administrador' : 'Usuário'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleRole(profile.id, profile.role)}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Alterar para {profile.role === 'admin' ? 'Usuário' : 'Administrador'}
                                        </button>
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
