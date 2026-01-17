import { Routes, Route } from 'react-router-dom'
import { PortfolioProvider } from './contexts/PortfolioContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Portfolio from './pages/Portfolio'
import NotFound from './pages/NotFound'
import './App.css'
import {CallbackPage} from "./pages/Callback.tsx";
import {AuthenticationGuard} from "./guards/authentication-guard.tsx";

function App() {
    return (
          <PortfolioProvider>
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<AuthenticationGuard component={Home}/>}/>
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="*" element={<NotFound/>}/>
            </Route>
            <Route path="/callback" element={<CallbackPage/>}/>
            <Route path="/login" element={<Login/>}/>
        </Routes>
            </PortfolioProvider>
    )
}

export default App
