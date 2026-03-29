import { UserPayloadDto } from '@/src/types/user';
import { create } from 'zustand';

type State = {
    user: UserPayloadDto | undefined;
};

type Action = {
    setUser: (user: UserPayloadDto | undefined) => void;
};

const useUserStore = create<State & Action>((set) => ({
    user: undefined,
    setUser: (user) => set({ user }),
}));

export default useUserStore;
