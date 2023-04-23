import re
import subprocess
import json

def getMacDHCPInfo(mac_addr):
    pattern_match = re.search(r"^([a-zA-Z0-9]{2}-){5}[a-zA-Z0-9]{2}$", mac_addr)
    if not pattern_match:
        returnJSON = [{
            "ClientId": "",
            "Hostname": "",
            "LeaseExpiryTime": "",
            "IP": ""           
        }]
        emptyDeviceJSON = json.dumps(returnJSON)
    run_bash_cmd = "./dhcp-ssh/getdhcp.sh"
    
    try:
        deviceInfo = subprocess.check_output([run_bash_cmd, mac_addr], cwd="/var/www/util")
        deviceJSON = json.loads(deviceInfo)

        if isinstance(deviceJSON, dict):
            deviceJSON["IP"] = deviceJSON["IPAddress"]["IPAddressToString"]
            del deviceJSON["IPAddress"]

            rawTime = deviceJSON["LeaseExpiryTime"]
            start = rawTime.find('/Date(') + 6
            end = rawTime.find(')/', start)
            fixedTime = rawTime[start:end]
            deviceJSON["LeaseExpiryTime"] = fixedTime
            deviceJSONout = []
            deviceJSONout.append(deviceJSON)
        else:
            deviceJSONout = []
            for deviceJSONitem in deviceJSON:
                deviceJSONitem["IP"] = deviceJSONitem["IPAddress"]["IPAddressToString"]
                del deviceJSONitem["IPAddress"]

                rawTime = deviceJSONitem["LeaseExpiryTime"]
                start = rawTime.find('/Date(') + 6
                end = rawTime.find(')/', start)
                fixedTime = rawTime[start:end]
                deviceJSONitem["LeaseExpiryTime"] = fixedTime
                deviceJSONout.append(deviceJSONitem)
        
        return json.dumps(deviceJSONout)
    except:
        returnJSON = [{
            "ClientId": "",
            "Hostname": "",
            "LeaseExpiryTime": "",
            "IP": ""           
        }]
        emptyDeviceJSON = json.dumps(returnJSON)
        return emptyDeviceJSON