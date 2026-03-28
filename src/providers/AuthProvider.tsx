import supabase from '@/src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

export type Profile = {
    id: string;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
};

type AuthContextType = {
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    profile: null,
    isLoading: true,
});

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                    fetchProfile(session.user.id);
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
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) {
                console.error('Failed to fetch profile:', error);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthContext.Provider value={{ session, profile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
