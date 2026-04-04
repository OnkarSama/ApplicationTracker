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

async function saveCredential(appId: number, credential: object, jwtToken: string): Promise<boolean> {
    const headers = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
    }
    const body = JSON.stringify({ application_credential: credential })
    const url  = `${baseUrl}/applications/${appId}/application_credential`

    // Try PATCH first; if no record exists yet (404), fall back to POST
    const patch = await fetch(url, { method: 'PATCH', headers, body })
    if (patch.ok) return true

    if (patch.status === 404) {
        const post = await fetch(url, { method: 'POST', headers, body })
        return post.ok
    }

    return false
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
            saveCredential(appId, credential, jwtToken)
                .then(success => sendResponse({ success }))
                .catch(() => sendResponse({ success: false }))
        })
    }

    return true
});
