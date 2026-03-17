import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {HeroUIProvider} from "@heroui/react";
import App from './App.tsx'
import './index.css'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ToastProvider} from "@heroui/toast";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <HeroUIProvider>
                <ToastProvider placement="bottom-center"/>
                <App/>
            </HeroUIProvider>
        </QueryClientProvider>
    </StrictMode>,
)
