import requests
import re

from bs4 import BeautifulSoup

EMAIL = "onkardhillon73@gmail.com"
PASSWORD = "password123"
LOGIN_URL = "https://gradapp.wpi.edu/account/login" # Replace with actual login URL
PROTECTED_URL = "https://gradapp.wpi.edu/apply/status" # Replace with target URL


LOGIN_API = "http://localhost:4000/api/session"
APPLICATIONS_API = "http://localhost:4000/api/applications"

with requests.Session() as session:
    # 1. Prepare the payload (replace 'user' and 'pass' with actual field names)
    payload = {
        'email_address': EMAIL,
        'password': PASSWORD
    }

    # 2. POST the credentials to log in
    session_info = session.post(LOGIN_API, data=payload)

    jwt = session_info.json()["token"]



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