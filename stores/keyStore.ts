import { create, createStore } from 'zustand';

type KeyStoreState = {
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
}

type KeyStoreActions = {
    setCredentials: (accessToken: string, refreshToken: string, idToken: string) => void;
    clearCredentials: () => void;
}

type KeyStore = KeyStoreState & KeyStoreActions;

const keyStore = createStore<KeyStore>()((set) => ({
    accessToken: null,
    refreshToken: null,
    idToken: null,
    setCredentials: (accessToken: string, refreshToken: string, idToken: string) => set({ accessToken, refreshToken, idToken }),
    clearCredentials: () => set({ accessToken: null, refreshToken: null, idToken: null }),
}))

export default keyStore;