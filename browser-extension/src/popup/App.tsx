import LoginView from '@/components/LoginView'
import AppListView from '@/components/AppListView'
import AppDetailView from "@/components/AppDetailView";
import './index.css'
import { useState, useEffect } from "react";
import type { Application } from "@/api/application.ts";

type View = 'login' | 'appList' | 'appDetail'

export default function App() {
    const [currentView, setCurrentView] = useState<View | null>(null)
    const [selectedApp, setSelectedApp] = useState<Application | null>(null)

    // On mount: check auth and restore view
    useEffect(() => {
        chrome.storage.local.get(['jwtToken', 'currentView', 'selectedApp'], (result) => {
            if (!result.jwtToken) {
                setCurrentView('login')
                return
            }
            // Restore last view, but never restore login if authed
            const savedView = result.currentView as View
            if (savedView && savedView !== 'login') {
                setCurrentView(savedView)
                if (savedView === 'appDetail' && result.selectedApp) {
                    // @ts-ignore
                    setSelectedApp(result.selectedApp)
                }
            } else {
                setCurrentView('appList')
            }
        })
    }, [])

    const navigate = (view: View, app: Application | null = null) => {
        // Block navigation to protected views if not authed
        chrome.storage.local.get('jwtToken', (result) => {
            if (!result.jwtToken && view !== 'login') {
                setCurrentView('login')
                chrome.storage.local.set({ currentView: 'login' })
                return
            }
            setCurrentView(view)
            setSelectedApp(app)
            chrome.storage.local.set({
                currentView: view,
                selectedApp: app ?? null
            })
        })
    }

    const handleLogout = () => {
        chrome.storage.local.remove(['jwtToken', 'currentView', 'selectedApp'], () => {
            setSelectedApp(null)
            setCurrentView('login')
        })
    }

    // Null = still loading from storage, avoid flash
    if (currentView === null) return null

    const renderComponent = () => {
        switch (currentView) {
            case 'login':
                return <LoginView onLoginSuccess={() => navigate('appList')} />
            case 'appList':
                return <AppListView
                    onAppClick={(app) => navigate('appDetail', app)}
                    onLogout={handleLogout}
                />
            case 'appDetail':
                if (!selectedApp) {
                    navigate('appList')
                    return null
                }
                return <AppDetailView
                    app={selectedApp}
                    onBack={() => navigate('appList')}
                />
            default:
                return null
        }
    }

    return (
        <div style={{ width: '400px', height: '600px' }} className="h-full bg-heroui-background overflow-hidden">
            {renderComponent()}
        </div>
    )
}