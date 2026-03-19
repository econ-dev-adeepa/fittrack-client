import { create, createStore } from 'zustand';

type KeyStoreState = {
    accessToken: string | undefined;
    refreshToken: string | undefined;
    idToken: string | undefined;
}

type KeyStoreActions = {
    setCredentials: (accessToken?: string, refreshToken?: string, idToken?: string) => void;
    clearCredentials: () => void;
}

type KeyStore = KeyStoreState & KeyStoreActions;

const keyStore = createStore<KeyStore>()((set) => ({
    accessToken: undefined,
    refreshToken: undefined,
    idToken: undefined,
    setCredentials: (accessToken?: string, refreshToken?: string, idToken?: string) => set({ accessToken, refreshToken, idToken }),
    clearCredentials: () => set({ accessToken: undefined, refreshToken: undefined, idToken: undefined}),
}))

export default keyStore;