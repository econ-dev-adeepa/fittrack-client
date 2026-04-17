import { create } from "zustand";

export interface Gym {
    id: string;
    name: string;
    location: string;
    description?: string;
    phone?: string;
    createdByAdminId: string;
    operationalDays?: string; 
    openTime?: string;         
    closeTime?: string;         
    capacity?: number;
}

interface GymStoreState {
    gyms: Gym[] | undefined;
    selectedGym: Gym | null;
    activeGymName: string | null;
}

interface GymStoreActions {
    setGyms: (gyms: Gym[]) => void;
    setSelectedGym: (gym: Gym | null) => void;
    setActiveGymName: (name: string | null) => void;
}

export type GymStore = GymStoreState & GymStoreActions;

const useGymStore = create<GymStore>((set) => ({
    gyms: undefined,
    selectedGym: null,
    activeGymName: null,
    setGyms: (gyms) => set({ gyms }),
    setSelectedGym: (gym) => set({ selectedGym: gym }),
    setActiveGymName: (name) => set({ activeGymName: name }), 
}));

export default useGymStore;