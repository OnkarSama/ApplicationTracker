import re
import asyncio

from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os
from fastapi import FastAPI, Header, Request
from playwright.async_api import async_playwright
import requests

fastapi = FastAPI()
load_dotenv()

# Credentials used to authenticate with our own backend API
EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")

# Base URL for our backend's applications API
LOGIN_API = os.getenv("LOGIN_API")
APPLICATIONS_API = os.getenv("APPLICATIONS_API")

# Builds the PATCH endpoint URL for a specific application by ID
UPDATE_APPLICATIONS_API = lambda app_id: f"{APPLICATIONS_API}/{app_id}"


def json_to_array(json_data):
    """
    Converts the JSON response from the applications API into a flat list.

    The API returns { "applications": [...] }, so this extracts that array
    into a plain list for easier iteration.

    Args:
        json_data (dict): The parsed JSON response from the applications API.

    Returns:
        list: A list of application objects.
    """
    apps_array = []

    for apps in json_data["applications"]:
        apps_array.append(apps)

    return apps_array


def get_apps(application_route, headers):
    """
    Fetches all applications from our backend API.

    Makes a GET request to the applications endpoint and returns
    the results as a flat list.

    Args:
        application_route (str): The full URL of the applications API endpoint.
        headers (dict): Auth headers containing the Bearer token.

    Returns:
        list: A list of application objects from the API.
    """
    apps = requests.get(application_route, headers=headers)

    return json_to_array(apps.json())


async def scrape_status(app, browser):
    """
    Logs into an application portal and scrapes the status page for status-related text.

    Opens a new browser tab, navigates to the portal's login page, fills in the
    stored credentials, submits the form, then navigates to the status page URL.
    Strips script/style tags and searches for any text containing "application"
    to identify status-related content.

    Each call runs in its own browser tab so multiple apps can be scraped in parallel
    without interfering with each other.

    Args:
        app (dict): A single application object from the API, including nested
                    'application_credential' with portal_link, status_page_link,
                    username, and password_digest.
        browser: A Playwright browser instance shared across all parallel scrapes.

    Returns:
        tuple: (app_id, status) where status is a list of matched strings from the
               page, or "Applied" if scraping fails.
    """
    if not app.get('application_credential'):
        print(f"{app.get('company', app['id'])}: skipped (no credentials)")
        return app['id'], app['status']

    app_info = app['application_credential']

    login_route = app_info['portal_link']
    status_route = app_info['status_page_link']

    if not status_route:
        print(f"{app['company']}: skipped (no status page URL)")
        return app['id'], app['status']

    # Open a new tab in the shared browser for this app
    page = await browser.new_page(
        user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    )
    await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    # Navigate to the portal login page — only need the form to render, not full JS
    await page.goto(login_route)
    await page.wait_for_load_state('load')

    # Try common input field selectors for the username/email field
    # since different portals use different field names
    email_selectors = ['[data-automation-id="formField-email"] input', 'input[data-automation-id="email"]', 'input[type="email"]', 'input[name*="email"]', 'input[name*="user"]', 'input[name*="login"]']
    for selector in email_selectors:
        try:
            await page.wait_for_selector(selector, state='visible', timeout=5000)
            await page.locator(selector).click()
            await page.locator(selector).fill(app_info['username'])
            print(f"[{app['company']}] filled email with selector: {selector}")
            break
        except Exception:
            continue

    # Fill password — Workday uses data-automation-id, others use type="password"
    password_selector = 'input[data-automation-id="password"]' if await page.locator('input[data-automation-id="password"]').count() > 0 else 'input[type="password"]'
    await page.locator(password_selector).click()
    await page.locator(password_selector).fill(app_info['password_digest'])

    # Workday hides the real submit button behind a div overlay (click_filter);
    # force=True bypasses the overlay and clicks the button directly
    if await page.locator('[data-automation-id="signInSubmitButton"]').count() > 0:
        await page.locator('[data-automation-id="signInSubmitButton"]').click(force=True)
    elif await page.locator('[data-automation-id="click_filter"]').count() > 0:
        await page.locator('[data-automation-id="click_filter"]').click()
    else:
        await page.press(password_selector, 'Enter')

    await page.wait_for_load_state('load')
    # Wait for redirect away from login page (needed for SPAs like Workday)
    try:
        await page.wait_for_url(lambda url: url != login_route, timeout=10000)
    except Exception:
        pass
    print(f"[{app['company']}] post-login URL: {page.url}")

    # Print any error messages shown on the page after login attempt
    error_selectors = ['[data-automation-id*="error"]', '[role="alert"]', '.error', '#error']
    for sel in error_selectors:
        for el in await page.locator(sel).all():
            try:
                text = (await el.inner_text()).strip()
                if text:
                    print(f"[{app['company']}] login error: {text}")
            except Exception:
                continue

    # Always wait for networkidle to ensure JS-rendered content is fully loaded
    await page.goto(status_route, wait_until='networkidle')

    # Parse the fully rendered HTML with BeautifulSoup
    soup = BeautifulSoup(await page.content(), 'html.parser')
    await page.close()

    # Remove script and style tags so they don't pollute the text search
    for tag in soup(["script", "style"]):
        tag.decompose()

    # Priority-ordered keyword map — checked from most to least decisive
    # so a "congratulations" page doesn't also match a generic "applied" mention
    STATUS_KEYWORDS = [
        ("Offer",              ["congratulations", "we are pleased", "pleased to inform", "offer of admission", "you have been accepted", "been admitted", "proud to offer"]),
        ("Rejected",           ["unfortunately", "regret to inform", "not selected", "unable to offer", "not moving forward", "we will not be", "we are unable to", "cannot offer", "no longer under consideration", "no longer being considered"]),
        ("Awaiting Decision",  ["awaiting decision", "decision will be", "decision has been made", "decision is now available", "your decision is available", "decision released", "decision pending", "decision has been released"]),
        ("Interview",          ["interview has been scheduled", "would like to schedule an interview", "invite you to interview", "phone screen scheduled", "we'd like to speak with you"]),
        ("Under Review",       ["under review", "being reviewed", "ready for review", "currently reviewing", "in review", "being considered", "under consideration", "application is complete", "application is now complete", "in process"]),
        ("Applied",            ["received your application", "application has been received", "thank you for submitting", "we have received your application"]),
    ]

    # Statuses ranked by progression — a status can only move forward, never back
    STATUS_RANK = {
        "Wishlist": 0, "Applied": 1, "Under Review": 2,
        "Awaiting Decision": 3, "Interview": 4, "Offer": 5, "Rejected": 5,
    }

    status = app['status']

    # Keyword match on full page text — ordered from most to least decisive
    matched_phrase = None
    page_text = soup.get_text(separator=' ', strip=True).lower()
    print(f"--- {app['company']} ---\n{page_text}\n---")
    for mapped_status, keywords in STATUS_KEYWORDS:
        for kw in keywords:
            if kw in page_text:
                status = mapped_status
                matched_phrase = f'keyword: "{kw}"'
                break
        if matched_phrase:
            break

    # Only update if new status is a forward progression — never downgrade
    current_rank = STATUS_RANK.get(app['status'], 0)
    new_rank = STATUS_RANK.get(status, 0)
    if new_rank < current_rank:
        status = app['status']
        matched_phrase = f'blocked downgrade to "{status}"'

    print(f'{app["company"]}: {status} (matched: {matched_phrase})')
    return app['id'], status


def is_status_change(new_status, old_status):
    """
    Checks whether the scraped status differs from the stored status.

    Args:
        new_status: The status scraped from the portal.
        old_status: The status currently stored in our database.

    Returns:
        bool: True if the status has changed, False otherwise.
    """
    return not(new_status == old_status)


def update_status(new_status, app_id, headers):
    """
    Sends a PATCH request to our backend API to update an application's status.

    Args:
        new_status: The new status value to set.
        app_id (int): The ID of the application to update.
        headers (dict): Auth headers containing the Bearer token.
    """
    requests.patch(UPDATE_APPLICATIONS_API(app_id), json={"status": new_status}, headers=headers)


async def main(apps):
    """
    Scrapes all applications in parallel and updates any whose status has changed.

    Launches a single shared browser instance, then runs scrape_status for all
    apps concurrently using asyncio.gather. After all scrapes complete, compares
    each result to the stored status and patches any that have changed.

    Args:
        apps (list): A list of application objects to process.

    Returns:
        bool: True if at least one application's status was updated, False otherwise.
    """
    headers = {
        'Authorization': f'Bearer {os.getenv("API_KEY")}',
        'Content-Type': 'application/json'
    }

    is_updated = False

    async with async_playwright() as p:
        # Launch one browser shared across all parallel scrapes to avoid
        # the overhead of spinning up a new browser per application
        browser = await p.chromium.launch(
    headless=False,
    args=['--disable-blink-features=AutomationControlled']
)
        # Scrape all apps concurrently — return_exceptions means one failure
        # doesn't cancel the rest
        results = await asyncio.gather(*[scrape_status(app, browser) for app in apps], return_exceptions=True)

        await browser.close()

    # Build a lookup map so we can match scraped results back to their app objects
    apps_by_id = {app['id']: app for app in apps}
    for result in results:
        if isinstance(result, Exception):
            print(f'Scrape error: {result}')
            continue
        app_id, new_status = result
        if is_status_change(new_status, apps_by_id[app_id]['status']):
            update_status(new_status, app_id, headers)
            is_updated = True

    return is_updated


@fastapi.post("/automaticStatusUpdate")
async def update_statuses(request: Request, authorization: str = Header(None)):
    """
    POST endpoint that triggers a status update check for all provided applications.

    Validates the Bearer token from the Authorization header, then runs the
    main scraping flow against the list of apps in the request body.

    Args:
        request (Request): The incoming FastAPI request. Body should be a list of
                           application objects.
        authorization (str): The Authorization header value (expected: "Bearer <token>").

    Returns:
        dict: {"Updated": True/False} on success, or {"Auth": "Not Authenticated"} if
              the token is invalid.
    """
    API_KEY = os.getenv("API_KEY")
    if authorization.split(" ")[1] == API_KEY:
        body = await request.json()
        is_updated = await main(body)
        return {"Updated": is_updated}
    else:
        return {"Auth": "Not Authenticated"}