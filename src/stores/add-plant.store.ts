import { create } from 'zustand';

type AddPlantState = {
    name: string;
    photoUri: string | null;   // local URI from image picker
    photoUrl: string | null;   // Supabase Storage URL after upload
    location: string;
    wateringDays: number;
    remindersEnabled: boolean;
    waterAmountMl: number | null;
    fertilizeDays: number | null;
    repotDays: number | null;
    setName: (name: string) => void;
    setPhotoUri: (uri: string | null) => void;
    setPhotoUrl: (url: string | null) => void;
    setLocation: (location: string) => void;
    setWateringDays: (days: number) => void;
    setRemindersEnabled: (enabled: boolean) => void;
    setWaterAmountMl: (ml: number | null) => void;
    setFertilizeDays: (days: number | null) => void;
    setRepotDays: (days: number | null) => void;
    reset: () => void;
};

const initial = {
    name: '',
    photoUri: null,
    photoUrl: null,
    location: '',
    wateringDays: 7,
    remindersEnabled: false,
    waterAmountMl: null,
    fertilizeDays: 30,
    repotDays: 365,
};

export const useAddPlantStore = create<AddPlantState>((set) => ({
    ...initial,
    setName: (name) => set({ name }),
    setPhotoUri: (photoUri) => set({ photoUri }),
    setPhotoUrl: (photoUrl) => set({ photoUrl }),
    setLocation: (location) => set({ location }),
    setWateringDays: (wateringDays) => set({ wateringDays }),
    setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),
    setWaterAmountMl: (waterAmountMl) => set({ waterAmountMl }),
    setFertilizeDays: (fertilizeDays) => set({ fertilizeDays }),
    setRepotDays: (repotDays) => set({ repotDays }),
    reset: () => set(initial),
}));
