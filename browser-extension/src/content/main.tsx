import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App.tsx'
import {Application} from "@/api/application.ts";

console.log('[CRXJS] Hello world from content script!')


async function detectLoginForm() {

    let passwordInput;
    let emailInput ;

    const target = document.body;

    const response = await chrome.runtime.sendMessage({ type: 'FETCH_APPS' })
    const cachedApps: Application[] = response.apps


    const matchedApp = cachedApps.find(app =>
        new URL(app.credential.portal_link).hostname === window.location.hostname
    )

    if (matchedApp) {

        const config = { attributes: true, childList: true, subtree: true };

        const callback = (mutationList : MutationRecord[], _observer : MutationObserver) => {
            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                    if (passwordInput != null) {
                        emailInput =  passwordInput.previousElementSibling as HTMLInputElement;
                        if (emailInput != null) {
                            emailInput.value = matchedApp.credential.username;
                            passwordInput.value = matchedApp.credential.password_digest;
                        }
                        break;
                    }
                } else if (mutation.type === "attributes") {
                    console.log(`The ${mutation.attributeName} attribute was modified.`);
                }
            }
        };

        const observer = new MutationObserver(callback);

        observer.observe(target, config);

        // observer.disconnect();

        passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
        if (passwordInput != null) {
            emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
            if (emailInput != null) {
                emailInput.value = matchedApp.credential.username;
                passwordInput.value = matchedApp.credential.password_digest;

                const loginButton = document.querySelector('button[type="submit"]');
                if (loginButton != null) {
                    console.log(loginButton);
                    // loginButton.addEventListener('click', consoleHello);

                }
            }
        }
    }
}

const container = document.createElement('div')
container.id = 'crxjs-app'
document.body.appendChild(container)
await detectLoginForm()
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
