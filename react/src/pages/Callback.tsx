import {useEffect} from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { usePortfolio } from "../contexts/PortfolioContext";
import { getPortfolio, createPortfolio } from "../services/portfolioService";

export const CallbackPage = () => {
    const { isLoading, isAuthenticated, error, user } = useAuth();
    const navigate = useNavigate();
    const { setAssets } = usePortfolio();

    useEffect(() => {
        const initializePortfolio = async () => {
            if (isAuthenticated) {
                const token = user?.access_token || "";
            
                try {
                    // Check if portfolio exists
                    let portfolioResponse = await getPortfolio(token);

                    // If portfolio doesn't exist (error), create it
                    if (portfolioResponse.error) {
                        await createPortfolio(token);
                        
                        // Fetch the newly created portfolio
                        portfolioResponse = await getPortfolio(token);
                    }
                    
                    // Load portfolio assets into context
                    if (portfolioResponse.data) {
                        console.log('Fetched portfolio (raw response):', portfolioResponse.data);
                        
                        // Set assets to context
                        if (portfolioResponse.data.assets && Array.isArray(portfolioResponse.data.assets)) {
                            setAssets(portfolioResponse.data.assets);
                        }
                    }
                } catch (error) {
                    console.error('Error initializing portfolio:', error);
                }
                
                navigate("/dashboard", { replace: true });
            }
        };
        
        initializePortfolio();
    }, [isAuthenticated, navigate, user, setAssets]);
    

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
