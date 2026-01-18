import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";

function Header() {
  const { isAuthenticated, signoutRedirect } = useAuth();

  const handleLogout = () => {
    signoutRedirect({
      post_logout_redirect_uri: window.location.origin + "/",
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 border-b border-solid border-[#283639] bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="text-primary">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight whitespace-nowrap">
            CONSENSUS-CAPITAL
          </h2>
        </Link>
        <nav className="hidden md:flex items-center gap-10 flex-shrink-0">

          <Link className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap" to="/">Home</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap" to="/dashboard">Dashboard</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap" to="/portfolio">Manage</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap" to="/risk-analysis">Risk Analysis</Link>
        </nav>
        <div className="flex gap-4 flex-shrink-0">
          {isAuthenticated ? (
            <button
              className="flex items-center justify-center rounded-lg h-10 px-6 bg-red-500 text-white text-sm font-bold transition-all hover:bg-red-600 active:scale-95 whitespace-nowrap"
              onClick={handleLogout}
            >
              <span>Log Out</span>
            </button>
          ) : (
            <Link to="/login">
              <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
                <span>Get Started</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
