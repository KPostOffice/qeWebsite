from __future__ import print_function
from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools


def authorize():
    SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly"
    store = file.Storage("credentials.json")
    creds = store.get()
    if not creds or creds.invalid:
        flags = tools.argparser.parse_args(args = [])
        flow = client.flow_from_clientsecrets("client_secret.json", SCOPES)
        creds = tools.run_flow(flow, store, flags)

    sheetService = build("sheets", "v4", http = creds.authorize(Http()))
    driveService = build("drive", "v3", http = creds.authorize(Http()))

    return (sheetService, driveService)
