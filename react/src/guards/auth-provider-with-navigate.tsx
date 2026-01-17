import { useNavigate } from "react-router-dom";
import { AuthProvider } from "react-oidc-context";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const AuthProviderWithNavigate = ({ children}) => {
    const navigate = useNavigate();

    const domain = import.meta.env.VITE_REACT_APP_DOMAIN;
    const clientId = import.meta.env.VITE_REACT_APP_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REACT_APP_CALLBACK_URL;
    const audience = import.meta.env.VITE_REACT_APP_AUDIENCE;

    const authority =
        import.meta.env.VITE_REACT_APP_AUTHORITY ||
        (domain ? `https://${domain}` : undefined);

    const onSigninCallback = async () => {
        navigate(window.location.pathname);
        window.history.replaceState({}, document.title, window.location.pathname);
    };

    if (!(authority && clientId && redirectUri)) {
        return null;
    }

    const oidcConfig = {
        authority,
        client_id: clientId,
        redirect_uri: redirectUri,
        post_logout_redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid profile email",
        ...(audience ? { extraQueryParams: { audience } } : {}),
        onSigninCallback,
        automaticSilentRenew: false,
    };

    return <AuthProvider {...oidcConfig}>{children}</AuthProvider>;
};
