import LoginView from '@/components/LoginView'
import AppListView from '@/components/AppListView'
import './App.css'
import {useState} from "react";

export default function App() {

    type View = 'login' | 'appList' | 'appDetail'
    const [currentView, setCurrentView] = useState<View>('login')


    const renderComponent = (componentName: View) => {
        switch (componentName) {
            case 'login':
                return <LoginView onLoginSuccess={() => setCurrentView('appList')}/>;
            case 'appList':
                return <AppListView/>;
            // case 'appDetail':
            //     return <ComponentC />;
            default:
                return <h1>No component found</h1>;
        }
    };

    return (
        <div style={{ width: '400px', height: '600px' }} className="h-full p-2.5">
            {/* Buttons to change the state 'page' can be added here */}
            {renderComponent(currentView)}
        </div>
    );
}
