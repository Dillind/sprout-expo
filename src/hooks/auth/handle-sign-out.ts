import supabase from '@/src/lib/supabase';
import useUserStore from '@/src/stores/user-store';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { toast } from 'sonner-native';

export const useSignOut = () => {
    const [isLoading, setIsLoading] = useState(false);
    const setUser = useUserStore((s) => s.setUser);

    const handleSignOut = useCallback(async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(undefined);

            if (router.canDismiss()) router.dismissAll();
            router.replace('/(public)/(auth)/sign-in');

            toast.success('Signed out');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [setUser]);

    return { handleSignOut, isLoading };
};
