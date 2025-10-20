import React from 'react'
import Header from './pages/Header.jsx'
import Footer from './pages/Footer.jsx'
import Main from "./pages/Main.jsx";

export default function App() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
            <Header />
            <Main />
            <Footer />
        </div>
    )
}
