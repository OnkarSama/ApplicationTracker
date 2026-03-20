import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os

load_dotenv()

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")

PROTECTED_URL = lambda portal_link: f"{portal_link.split('/account')[0]}/apply/status"


LOGIN_API = os.getenv("LOGIN_API")
APPLICATIONS_API = os.getenv("APPLICATIONS_API")
UPDATE_APPLICATIONS_API = lambda app_id: f"{APPLICATIONS_API}/{app_id}"

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

        protected_page_response = session.get(PROTECTED_URL(login_route))

        soup = BeautifulSoup(protected_page_response.content, 'html.parser')

        try:

            status = soup.find('strong', string=lambda t: 'Current Application Status' in t).next_sibling
        except AttributeError:
            status = "DNE"


    return status.strip()


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
