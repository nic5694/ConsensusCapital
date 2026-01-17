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

    if (auth.isAuthenticated) {

        return (
            <div className="flex flex-col gap-4">
                <span className="text-white text-center">Hello, {auth.user?.profile.name}</span>
            </div>
        );
    } else {
        return <button 
            className="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 glow-cyan" 
            onClick={handleLogin}
        >
            Log In
        </button>;
    }
};

export default AuthButtons;
