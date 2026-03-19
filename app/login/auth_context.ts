import { AuthRequest, AuthSessionResult, AuthRequestPromptOptions, DiscoveryDocument } from "expo-auth-session";
import { createContext } from "react";

export interface AuthContextType {
  request: AuthRequest | null;
  response: AuthSessionResult | null;
  promptAsync: (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>;
  redirectUri: string;
  discovery: DiscoveryDocument | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;
