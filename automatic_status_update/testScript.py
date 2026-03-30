import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os
from fastapi import FastAPI, Header, Request

fastapi = FastAPI()
load_dotenv()

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")

PROTECTED_URL = lambda portal_link: f"{portal_link.split('/account')[0]}/apply/status"


LOGIN_API = os.getenv("LOGIN_API")
APPLICATIONS_API = os.getenv("APPLICATIONS_API")
UPDATE_APPLICATIONS_API = lambda app_id: f"{APPLICATIONS_API}/{app_id}"

def json_to_array(json_data):

    apps_array = []

    for apps in json_data["applications"]:
        apps_array.append(apps)

    return apps_array


def get_apps(application_route, headers):

    apps = requests.get(application_route, headers=headers)

    return json_to_array(apps.json())

def scrape_status(app):

    app_info = app['application_credential']

    login_route = app_info['portal_link']

    payload = {
        'email': app_info['username'],
        'password': app_info['password_digest']
    }

    with requests.Session() as session:

        session.get(login_route, data=payload)

        protected_page_response = session.get(PROTECTED_URL(login_route))

        soup = BeautifulSoup(protected_page_response.content, 'html.parser')

        try:

            status = soup.find('strong', string=lambda t: 'Current Application Status' in t).next_sibling
        except AttributeError:
            status = "Applied"


    return status.strip()


def is_status_change(new_status, old_status):

    return not(new_status == old_status)

def update_status(new_status,app_id, headers):

    requests.patch(UPDATE_APPLICATIONS_API(app_id),json={"status" : new_status},headers=headers)

def main(apps):

    headers = {
        'Authorization': f'Bearer {os.getenv("API_KEY")}',
        'Content-Type': 'application/json'
    }


    is_updated = False
    for app in apps:
        new_status = scrape_status(app)
        if is_status_change(new_status,app['status']):
            update_status(new_status,app['id'],headers)
            is_updated = True

    return is_updated


@fastapi.post("/automaticStatusUpdate")
async def update_statuses(request: Request, authorization: str = Header(None)):
    API_KEY = os.getenv("API_KEY")
    if authorization.split(" ")[1] == API_KEY:
        body = await request.json()
        is_updated = main(body)
        return {"Updated": is_updated}
    else:
        return {"Auth": "Not Authenticated"}
