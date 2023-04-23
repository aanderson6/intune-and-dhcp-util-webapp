from flask import Flask, render_template
import AzureGraph
import DHCPInfo
import json

app = Flask(__name__)

@app.route('/api/getDeviceAPStatus/<serialNumber>')
def getDeviceAPStatus(serialNumber):
    return AzureGraph.getDeviceAPStatus(serialNumber)

@app.route('/api/getMacDHCPInfo/<macAddress>')
def getMacDHCPInfo(macAddress):
    dhcp_return = DHCPInfo.getMacDHCPInfo(macAddress)
    return str(dhcp_return)

@app.route('/')
def autopilotChecker():
    return render_template("index.html")

if __name__ == "__main__":
    app.run()