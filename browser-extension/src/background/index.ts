import baseUrl from "@/api/baseUrl.ts";

async function fetchApps() {
    const { jwtToken } = await chrome.storage.local.get('jwtToken')
    if (!jwtToken) return []

    const response = await fetch(`${baseUrl}/applications`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
    })
    const data = await response.json()
    return data.applications
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'FETCH_APPS') {
        fetchApps().then((apps) => sendResponse({ apps }))
    }

    if (message.type === 'GET_CURRENT_TAB_URL') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            sendResponse({ url: tabs[0]?.url ?? '' })
        })
    }

    if (message.type === 'SAVE_PORTAL') {
        const { appId, credential } = message
        chrome.storage.local.get('jwtToken', ({ jwtToken }) => {
            if (!jwtToken) { sendResponse({ success: false }); return }
            fetch(`${baseUrl}/applications/${appId}/application_credential`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ application_credential: credential }),
            })
            .then(r => r.json())
            .then(() => sendResponse({ success: true }))
            .catch(() => sendResponse({ success: false }))
        })
    }

    return true
});
