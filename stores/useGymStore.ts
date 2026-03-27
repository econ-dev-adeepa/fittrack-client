import { create } from "zustand";

export interface Gym {
    id: string;
    name: string;
    location: string;
    description?: string;
    phone?: string;
}

interface GymStoreState {
    gyms: Gym[] | undefined;
    selectedGym: Gym | null;
}

interface GymStoreActions {
    setGyms: (gyms: Gym[]) => void;
    setSelectedGym: (gym: Gym | null) => void;
}

export type GymStore = GymStoreState & GymStoreActions;

const useGymStore = create<GymStore>((set) => ({
    gyms: undefined,
    selectedGym: null,
    setGyms: (gyms) => set({ gyms }),
    setSelectedGym: (gym) => set({ selectedGym: gym }),
}));

export default useGymStore;