import {useEffect} from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { usePortfolio } from "../contexts/PortfolioContext";

export const CallbackPage = () => {
    const { isLoading, isAuthenticated, error, user } = useAuth();
    const navigate = useNavigate();
    const { setAssets } = usePortfolio();

    useEffect(() => {
        const createPortfolio = async () => {
            if (isAuthenticated) {
                const token = user?.access_token || "";
                const baseUrl = import.meta.env.VITE_REACT_APP_API_SERVER_URL + "/api/v1/portfolios";
            
                try {
                    // Check if portfolio exists
                    let getResponse = await fetch(baseUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    // If portfolio doesn't exist (404), create it
                    if (!getResponse.ok) {
                        console.log('Portfolio not found, creating new portfolio');
                        const createResponse = await fetch(baseUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({})
                        });

                        if (createResponse.ok) {
                            console.log('Created portfolio');
                            
                            // Fetch the newly created portfolio
                            getResponse = await fetch(baseUrl, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                        }
                    }
                    
                    // Load portfolio assets into context
                    if (getResponse.ok) {
                        const portfolio = await getResponse.json();
                        console.log('Fetched portfolio (raw response):', portfolio);
                        
                        // Set assets to context
                        if (portfolio.assets && Array.isArray(portfolio.assets)) {
                            setAssets(portfolio.assets);
                        }
                    }
                } catch (error) {
                    console.error('Error creating portfolio:', error);
                }
                
                navigate("/", { replace: true });
            }
        };
        
        createPortfolio();
    }, [isAuthenticated, navigate, user]);
    

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
