import requests
import json
import re

from bs4 import BeautifulSoup

EMAIL = 'onkardhillon73@gmail.com'
PASSWORD = 'password123'

PROTECTED_URL = "https://gradapp.wpi.edu/apply/status" # Replace with target URL



LOGIN_API = "http://localhost:4000/api/session"
APPLICATIONS_API = "http://localhost:4000/api/applications"


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


def get_apps(jwt, application_rout, session):
    headers = {
        'User-Agent': 'ReqBin Python Client/1.0',
        'Authorization': f'Bearer {jwt}',
        'Content-Type': 'application/json'
    }

    apps = session.get(APPLICATIONS_API, headers=headers)

    return json_to_array(apps.json())

def scrape_status(app):

    app_info = app['credential']

    login_route = app_info['portal_link']

    print(login_route)

    payload = {
        'email': app_info['username'],
        'password': app_info['password_digest']
    }

    with requests.Session() as session:

        session_info = session.get(login_route, data=payload)

        # 3. Access the protected page using the same session
        protected_page_response = session.get(PROTECTED_URL)

        # 4. Parse the page content with BeautifulSoup
        soup = BeautifulSoup(protected_page_response.content, 'html.parser')

        # Example: Extract the title of the protected page
        print(f"Status: {soup.find('strong', string=lambda t: 'Current Application Status' in t).next_sibling}")





def main():

    payload = {
        'email_address': EMAIL,
        'password': PASSWORD
    }

    jwt, session = get_jwt(payload, LOGIN_API)

    apps = get_apps(jwt, APPLICATIONS_API, session)

    for app in apps:
        scrape_status(app)

main()

    #
    # # 3. Access the protected page using the same session
    # protected_page_response = session.get(PROTECTED_URL)
    #
    # # 4. Parse the page content with BeautifulSoup
    # soup = BeautifulSoup(protected_page_response.content, 'html.parser')
    #
    # # Example: Extract the title of the protected page
    # print(f"Page Title: {soup.find('strong', string=lambda t: 'Current Application Status' in t).next_sibling}")

# with open('/Users/onkar/Desktop/ApplicationTracker/automatic_status_update/file.html', 'w') as outfile:
#     outfile.write(soup.prettify())