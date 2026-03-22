import baseUrl from "@/api/baseUrl.ts";

async function fetchApps() {
    const { jwtToken } = await chrome.storage.local.get('jwtToken')
    if (!jwtToken) return []

    // console.log('Fetching from:', `${baseUrl}/applications`)
    // console.log('JWT found:', !!jwtToken)

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
    return true
});