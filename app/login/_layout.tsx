import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import { Slot } from "expo-router";
import AuthContext from "../../stores/authContext";


export default function LoginLayout() {
  const discovery = useAutoDiscovery(process.env.EXPO_PUBLIC_KEYCLOAK_URL);

  const redirectUri = makeRedirectUri({
    scheme: "fittrack",
    path: "login/login_redirect",
  })

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "fittrack-client",
      redirectUri,
      scopes: ["openid", "profile", "email"],
      extraParams: {
        prompt: 'login',
        max_age: '0',
      },
    },
    discovery
  );

  return (
    <AuthContext.Provider value={{ request, response, promptAsync, redirectUri, discovery }}>
      <Slot />
    </AuthContext.Provider>
  );
}