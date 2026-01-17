import {Route, Routes} from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import './App.css'
import {CallbackPage} from "./pages/Callback.tsx";
import {AuthenticationGuard} from "./guards/authentication-guard.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<AuthenticationGuard component={Home}/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Route>
            <Route path="/callback" element={<CallbackPage/>}/>
            <Route path="/login" element={<Login/>}/>
        </Routes>
    )
}

export default App
