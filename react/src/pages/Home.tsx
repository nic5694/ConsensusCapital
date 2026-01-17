import { useEffect, useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import "../App.css";
import { useAuth } from "react-oidc-context";
import { getProfile } from "../services/profileService.ts";

function Home() {
    const [count, setCount] = useState(0);

    const { user } = useAuth();

    const [profileText, setProfileText] = useState<string | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            // reset view
            setProfileText(null);
            setProfileError(null);

            if (!user?.access_token) return;

            try {
                setLoadingProfile(true);

                const profileResponse = await getProfile(user.access_token);

                if (profileResponse.data) {
                    setProfileText(JSON.stringify(profileResponse.data, null, 2));
                } else if (profileResponse.error) {
                    setProfileError(profileResponse.error.message);
                } else {
                    setProfileError("Unknown error: no data and no error returned.");
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                setProfileError("Unexpected error while fetching profile.");
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [user?.access_token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
            <div>
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>

            <h1>Vite + React</h1>

            <div className="card">
                <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>

                <div className="mt-4 w-full">
                    {!user?.access_token && (
                        <p className="opacity-70">Not logged in (no access token).</p>
                    )}

                    {loadingProfile && <p>Loading profile...</p>}

                    {profileError && <p className="text-red-500">Error: {profileError}</p>}

                    {profileText && (
                        <pre className="text-left p-4 rounded mt-3 overflow-auto max-w-[80vw]">
              {profileText}
            </pre>
                    )}
                </div>
            </div>

            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </div>
    );
}

export default Home;
