import json
import msal 
import requests
import pandas
import urllib.parse
from datetime import datetime, timedelta, date

# Static Globals
graphApiVersion = "beta"
uri = "https://graph.microsoft.com/{v}/{r}"
headers = None
tokenexpire = None

# Functions
# Authenticate and Query
def authenticate():
    global headers
    global tokenexpire
    authority = "https://login.microsoftonline.com/xxxxxxxxx"
    appID = ""
    appSecret = ""
    scope = ["https://graph.microsoft.com/.default"]

    app = msal.ConfidentialClientApplication(appID, authority=authority, client_credential=appSecret)
    token = app.acquire_token_silent(scope, account=None)
    if not token:
        token = app.acquire_token_for_client(scopes=scope)
    headers = {'Authorization': 'Bearer ' + token['access_token']}
    tokenexpire = datetime.today() + timedelta(seconds=3500)

def query(version, request, Format=True):
    global headers
    global token
    if headers is None:
        authenticate()
    if datetime.today() > tokenexpire:
        authenticate()
    dest = uri.format(v=version, r=request)
    result = requests.get(dest, headers=headers).json()
    if Format:
        print(pandas.json_normalize(result["value"]))
    else:
        return result["value"]

# Specific APIs

def autopilotDeviceBySerialNumber(serialNumber, Format=True):
    parsedSerialNumber = urllib.parse.quote(serialNumber)
    return query(graphApiVersion, f"deviceManagement/windowsAutopilotDeviceIdentities?$filter=contains(serialNumber,'{parsedSerialNumber}')", Format)

def endpointDeviceBySerialNumber(serialNumber, Format=True):
    parsedSerialNumber = urllib.parse.quote(serialNumber)
    return query(graphApiVersion, f"deviceManagement/managedDevices?$filter=contains(serialNumber,'{parsedSerialNumber}')", Format)

def endpointDeviceUsersByDevEMID(deviceEMID, Format=True):
    parsedDeviceEMID = urllib.parse.quote(deviceEMID)
    return query(graphApiVersion, f"deviceManagement/managedDevices/{parsedDeviceEMID}/users", Format)

def getDeviceAPStatus(serialNumber):

    autopilotSNDevs = autopilotDeviceBySerialNumber(serialNumber, False)
    if autopilotSNDevs:
        inAutopilot = False
        for x in autopilotSNDevs:
            if x["serialNumber"].strip() == serialNumber.upper():
                inAutopilot = True
    else:
        inAutopilot = False

    intuneDevice = endpointDeviceBySerialNumber(serialNumber, Format=False)
    if intuneDevice:
        inIntune = True

        correctEnrolledDateTime = intuneDevice[0]['managedDeviceName']
        correctEnrolledDateString = correctEnrolledDateTime.split("_")[2]
        correctEnrolledDate = datetime.strptime(correctEnrolledDateString, '%m/%d/%Y').date()

        autopilotStartDate = datetime(2022, 4, 1).date()
        inIntuneBeforeAutopilot = autopilotStartDate > correctEnrolledDate
        deviceName = intuneDevice[0]['deviceName']
        devEMID = intuneDevice[0]['id']
        userResult = endpointDeviceUsersByDevEMID(devEMID, False)
        if (len(userResult) == 0):
            primaryUser = "Unknown"
        else:
            primaryUser = userResult[0]["displayName"]
            if (primaryUser == ""):
                primaryUser = "Unknown"
        syncDateTimeString = intuneDevice[0]["lastSyncDateTime"]
        syncDateString = syncDateTimeString.split('T')[0]
        syncDate = datetime.strptime(syncDateString, '%Y-%m-%d').date()
        todayDate = date.today()
        diffDate = todayDate - syncDate
        daysSinceSync = diffDate.days
    else:
        inIntune = False
        inIntuneBeforeAutopilot = False
        deviceName = "Unknown"
        primaryUser = "Unknown"
        daysSinceSync = "0"

    returnDict = {
        "inIntune": inIntune,
        "inAutopilot": inAutopilot,
        "inIntuneBeforeAutopilot": inIntuneBeforeAutopilot,
        "hostname": deviceName,
        "primaryUser": primaryUser,
        "daysSinceSync": daysSinceSync
    }

    return returnDict
    