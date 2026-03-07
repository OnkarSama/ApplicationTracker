import requests
import json
import re

from bs4 import BeautifulSoup

EMAIL = 'onkardhillon73@gmail.com'
PASSWORD = 'password123'

PROTECTED_URL = "https://gradapp.wpi.edu/apply/status" # Replace with target URL



LOGIN_API = "http://localhost:4000/api/session"
APPLICATIONS_API = "http://localhost:4000/api/applications"
UPDATE_APPLICATIONS_API = lambda app_id: f"http://localhost:4000/api/applications/{app_id}"

def get_jwt(payload,login_route):

    with requests.Session() as session:

        session_info = session.post(login_route, data=payload)

        jwt = session_info.json()["token"]

    return jwt, session

def json_to_array(json_data):

    apps_array = []

    for apps in json_data["applications"]:
        apps_array.append(apps)

    return apps_array


def get_apps(application_route, session, headers):

    apps = session.get(application_route, headers=headers)

    return json_to_array(apps.json())

def scrape_status(app):

    app_info = app['credential']

    login_route = app_info['portal_link']

    payload = {
        'email': app_info['username'],
        'password': app_info['password_digest']
    }

    with requests.Session() as session:

        session.get(login_route, data=payload)

        protected_page_response = session.get(PROTECTED_URL)

        soup = BeautifulSoup(protected_page_response.content, 'html.parser')

        status = soup.find('strong', string=lambda t: 'Current Application Status' in t).next_sibling

    return status.strip()

def get_old_statuses(apps):

    old_statuses = []

    for app in apps:
        old_statuses.append(app['status'])

    return old_statuses

def is_status_change(new_status, old_status):

    return not(new_status == old_status)

def update_status(new_status,app_id, session, headers):

    session_info = session.patch(UPDATE_APPLICATIONS_API(app_id),json={"status" : new_status},headers=headers)
    print(session_info.content)



def main():

    payload = {
        'email_address': EMAIL,
        'password': PASSWORD
    }

    jwt, session = get_jwt(payload, LOGIN_API)

    headers = {
        'User-Agent': 'ReqBin Python Client/1.0',
        'Authorization': f'Bearer {jwt}',
        'Content-Type': 'application/json'
    }

    apps = get_apps(APPLICATIONS_API, session, headers)


    for app in apps:
        new_status = scrape_status(app)
        if is_status_change(new_status,app['status']):
            update_status(new_status,app['id'],session,headers)

main()
