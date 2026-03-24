import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App.tsx'

const container = document.createElement('div')
container.id = 'crxjs-fill-overlay'
// Reset any page styles that might bleed into our container
container.style.cssText = 'all: initial; position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; font-family: system-ui, sans-serif;'
document.body.appendChild(container)

createRoot(container).render(
    <StrictMode>
        <App />
    </StrictMode>
)
