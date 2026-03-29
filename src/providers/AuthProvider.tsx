import supabase from '@/src/lib/supabase';
import useUserStore from '@/src/stores/user-store';
import { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    session: Session | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
});

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const setUser = useUserStore((s) => s.setUser);

    async function fetchAndSetUser(userId: string, email: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Failed to fetch user:', error);
            setUser(undefined);
        } else {
            setUser({ ...data, email });
        }
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            console.warn('Auth initialization timed out, forcing isLoading = false');
            setIsLoading(false);
        }, 5000);

        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                clearTimeout(timeout);
                setSession(session);
                if (session) {
                    fetchAndSetUser(session.user.id, session.user.email ?? '').finally(() =>
                        setIsLoading(false),
                    );
                } else {
                    setIsLoading(false);
                }
            })
            .catch(() => {
                clearTimeout(timeout);
                setIsLoading(false);
            });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            clearTimeout(timeout);
            setSession(session);
            if (session) {
                await fetchAndSetUser(session.user.id, session.user.email ?? '');
            } else {
                setUser(undefined);
            }
            setIsLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <AuthContext.Provider value={{ session, isLoading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
