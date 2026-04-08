import LoginView from '@/components/LoginView'
import AppListView from '@/components/AppListView'
import AppDetailView from "@/components/AppDetailView";
import './index.css'
import { useState, useEffect } from "react";
import type { Application } from "@/api/application.ts";

export type Theme = 'dark' | 'light'

type View = 'login' | 'appList' | 'appDetail'

export default function App() {
    const [currentView, setCurrentView] = useState<View | null>(null)
    const [selectedApp, setSelectedApp]  = useState<Application | null>(null)
    const [theme, setTheme]              = useState<Theme>('dark')

    useEffect(() => {
        chrome.storage.local.get(['jwtToken', 'currentView', 'selectedApp', 'theme'], (result) => {
            const t = (result.theme as Theme) || 'dark'
            setTheme(t)

            if (!result.jwtToken) { setCurrentView('login'); return }

            const savedView = result.currentView as View
            if (savedView && savedView !== 'login') {
                setCurrentView(savedView)
                if (savedView === 'appDetail' && result.selectedApp) {
                    setSelectedApp(result.selectedApp as Application)
                }
            } else {
                setCurrentView('appList')
            }
        })
    }, [])

    const toggleTheme = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        chrome.storage.local.set({ theme: next })
    }

    const navigate = (view: View, app: Application | null = null) => {
        chrome.storage.local.get('jwtToken', (result) => {
            if (!result.jwtToken && view !== 'login') {
                setCurrentView('login')
                chrome.storage.local.set({ currentView: 'login' })
                return
            }
            setCurrentView(view)
            setSelectedApp(app)
            chrome.storage.local.set({ currentView: view, selectedApp: app ?? null })
        })
    }

    const handleLogout = () => {
        chrome.storage.local.remove(['jwtToken', 'currentView', 'selectedApp'], () => {
            setSelectedApp(null)
            setCurrentView('login')
        })
    }

    if (currentView === null) return null

    const renderComponent = () => {
        switch (currentView) {
            case 'login':
                return <LoginView theme={theme} toggleTheme={toggleTheme} onLoginSuccess={() => navigate('appList')} />
            case 'appList':
                return <AppListView theme={theme} toggleTheme={toggleTheme} onAppClick={(app) => navigate('appDetail', app)} onLogout={handleLogout} />
            case 'appDetail':
                if (!selectedApp) { navigate('appList'); return null }
                return <AppDetailView theme={theme} toggleTheme={toggleTheme} app={selectedApp} onBack={() => navigate('appList')} />
            default:
                return null
        }
    }

    return (
        <div className={`${theme} w-[400px] h-[600px] bg-heroui-background overflow-hidden`}>
            {renderComponent()}
        </div>
    )
}
