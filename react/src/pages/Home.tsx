import { useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import "../App.css";
import { useAuth } from "react-oidc-context";

function Home() {
    const [count, setCount] = useState(0);

    const { user } = useAuth();

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
                </div>
            </div>

            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </div>
    );
}

export default Home;
