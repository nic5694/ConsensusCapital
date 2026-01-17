import {useEffect} from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

export const CallbackPage = () => {
    const { isLoading, isAuthenticated, error } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (error) {
        return (
                <div className="content-layout">
                    <h1 id="page-title" className="content__title">Authentication error</h1>
                    <div className="content__body">
                        <p id="page-description">We couldn’t complete the sign-in process.</p>
                        <p className="content__hint"><code>{error.message}</code></p>
                        <button
                            className="button button__primary"
                            onClick={() => navigate("/", { replace: true })}
                        >
                            Back to home
                        </button>
                    </div>
                </div>
        );
    }

    if (isLoading || !isAuthenticated) {
        return (
                <div className="content-layout">
                    <h1 id="page-title" className="content__title">Signing you in…</h1>
                    <div className="content__body">
                        <p id="page-description">Please wait while we complete the sign-in process.</p>
                        <div className="spinner" aria-label="Loading" />
                    </div>
                </div>
        );
    }

    return (
            <div className="content-layout">
                <h1 id="page-title" className="content__title">Signed in</h1>
                <div className="content__body">
                    <p>You are now signed in. Redirecting…</p>
                </div>
            </div>
    );
};
