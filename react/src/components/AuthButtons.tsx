import { useAuth } from 'react-oidc-context';

const AuthButtons = () => {
    const auth = useAuth();

    if (auth.isLoading) {
        return <div>Loading authentication state...</div>;
    }

    if (auth.error) {
        return <div>Oops, an error occurred: {auth.error.message}</div>;
    }

    const handleLogin = async () => {
        await auth.signinRedirect();
    };


    const handleLogout = () => {
        auth.signoutRedirect({
            post_logout_redirect_uri: window.location.origin,
        }).then(r =>
            console.log(r)
        );
    };

    if (auth.isAuthenticated) {

        return (
            <div>
                <span>Hello, {auth.user?.profile.name}</span>
                <button className="button__logout" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
        );
    } else {
        return <button className="button__login" onClick={handleLogin}>
            Log In
        </button>;
    }
};

export default AuthButtons;
