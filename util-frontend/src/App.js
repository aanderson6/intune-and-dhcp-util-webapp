import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs"; 
import './App.css';

let requestNumber = 0;
let lastMACSearchlength = 0;

function calculateResult(inIntune, inAutopilot, enrolledBeforeAP, daysSinceSync, primaryUser, hostname) {
    // Possibilities: no I/no AP, I/AP/eBAP, I/AP/neBAP, I/no AP, no I/AP
    //                 UNMANAGED, MANAGED BUT JOINED BEFORE AP, OK, MANAGED - NOT ENROLLED, ENROLLED - NOT MANAGED

    let resultsText = "";
    let resultsWarn = false;
    let resultsCrit = false;
    let hostnameClass = "";
    let primaryUserClass = "";
    let daysSinceSyncClass = "";
    let autopilotClass = "";
    let intuneClass = "";
    let enrolledClass = "";
    let resultClass = "";
    let formClass = "";

    if (hostname === "Unknown") {
        hostnameClass = "textCrit";
        resultsText += "Device hostname is unknown. ";
        resultsWarn = true;
    } else if (hostname.startsWith("D-") || hostname.startsWith("L-")) {
        hostnameClass = "textOk";
    } else {
        hostnameClass = "textCrit";
        if (!enrolledBeforeAP) {
            resultsText += "Device hostname indicates enrollment problems may exist. ";
        }
        resultsCrit = true;
    }

    if (primaryUser === "Unknown") {
        primaryUserClass = "textWarn";
        if (inIntune) {
            resultsText += "Device primary user is unknown. ";
        }
        resultsWarn = true;
    } else {
        primaryUserClass = "textOk";
    }

    if (daysSinceSync > 30) {
        daysSinceSyncClass = "textCrit";
        resultsText += "Device has not checked in for more than 30 days. ";
        resultsWarn = true;
    } else if (daysSinceSync > 25) {
        daysSinceSyncClass = "textWarn";
        resultsText += "Device has not checked in for more than 25 days. ";
        resultsWarn = true;
    } else {
        daysSinceSyncClass = "textOk";
    }

    if (!(inAutopilot)) {
        autopilotClass = "textWarn";
        resultsText += "Device is not in Autopilot and is unenrolled. ";
        resultsWarn = true;
    } else {
        autopilotClass = "textOk";
    }

    if (!(inIntune)) {
        intuneClass = "textWarn";
        resultsText += "Device is not in Endpoint Manager and is unmanaged. ";
        resultsCrit = true;
    } else {
        intuneClass = "textOk";
    }

    if (enrolledBeforeAP) {
        enrolledClass = "textWarn";
        resultsText += "Device was enrolled before modern deployment was set up. ";
        resultsWarn = true;
    } else {
        enrolledClass = "textOk";
    }

    if (resultsCrit === true) {
        resultClass = "results textCrit";
        formClass = "formgrid formCrit";
        resultsText += "This device critically needs to wiped and enrolled.";
    } else if (resultsWarn === true) {
        resultClass = "results textWarn";
        formClass = "formgrid formWarn";
        resultsText += "This device may experience issues and wiping and enrolling it may help.";
    } else {
        resultClass = "results textOk";
        formClass = "formgrid formOk";
        resultsText = "Device enrollment and management looks ok.";
    }

    return {'resultDisplay': resultsText, 'resultClass': resultClass, 'formClass': formClass, 'autopilotClass': autopilotClass, 'intuneClass': intuneClass, 'enrolledClass': enrolledClass, 'hostnameClass': hostnameClass, 'primaryUserClass': primaryUserClass, 'daysSinceSyncClass': daysSinceSyncClass};
    
}

//let tempcounter = false

async function getStatusBySerialNumber(serialNumber) {
    let currenturl = new URL(window.location.href);
    let apiurl = "/api/getDeviceAPStatus/" + serialNumber;
    let url = currenturl.origin + apiurl
    //console.log("async");
    //console.log(serialNumber);
    //console.log("async");
    let response = await (await fetch(url, {referrerPolicy: "unsafe-url"})).json();
    return response;
    //tempcounter = !tempcounter
    //console.log(serialNumber)
    //return {"inAutopilot":tempcounter,"inIntune":tempcounter,"inIntuneBeforeAutopilot":tempcounter}
}

async function getIPByMAC(macAddress) {
    let currenturl = new URL(window.location.href);
    let apiurl = "/api/getMacDHCPInfo/" + macAddress;
    let url = currenturl.origin + apiurl
    //console.log("async");
    //console.log(serialNumber);
    console.log("async");
    let response = await (await fetch(url, {referrerPolicy: "unsafe-url"})).json();
    console.log(response);
    return response;
    //tempcounter = !tempcounter
    //console.log(serialNumber)
    //return {"inAutopilot":tempcounter,"inIntune":tempcounter,"inIntuneBeforeAutopilot":tempcounter}
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {inAutopilot: null, inIntune: null, enrolledBeforeAP: null, formClass: "formgrid formOk", autopilotClass: "textOk", intuneClass: "textOk", enrolledClass: "textOk", resultClass: "results textOk", resultDisplay: "", hostname: null, hostnameClass: "textOk", daysSinceSync: null, daysSinceSyncClass: "textOk", primaryUser: null, primaryUserClass: "textOk", macResultClass: "results textOk", macResultDisplay: "", macReturnIP: null, macReturnHostname: null, macReturnLease: null, macSearchBox: ""};
        this.updateAPSearchState = this.updateAPSearchState.bind(this);
        this.updateMACSearchState = this.updateMACSearchState.bind(this);
        this.resetView = this.resetView.bind(this);
        
    }

    resetView(e) {
        //this.setState = {inAutopilot: null, inIntune: null, enrolledBeforeAP: null, formClass: "formgrid formOk", autopilotClass: "textOk", intuneClass: "textOk", enrolledClass: "textOk", resultClass: "results textOk", resultDisplay: "", hostname: null, hostnameClass: "textOk", daysSinceSync: null, daysSinceSyncClass: "textOk", primaryUser: null, primaryUserClass: "textOk", macResultClass: "results textOk", macResultDisplay: "asdf", macReturnIP: null, macReturnHostname: null, macReturnLease: null};
        (async function(that) {
            that.setState({inAutopilot: null, inIntune: null, enrolledBeforeAP: null, formClass: "formgrid formOk", autopilotClass: "textOk", intuneClass: "textOk", enrolledClass: "textOk", resultClass: "results textOk", resultDisplay: "", hostname: null, hostnameClass: "textOk", daysSinceSync: null, daysSinceSyncClass: "textOk", primaryUser: null, primaryUserClass: "textOk", macResultClass: "results textOk", macResultDisplay: "", macReturnIP: null, macReturnHostname: null, macReturnLease: null, macSearchBox: ""});
        })(this);
        //console.log("testing!!!");
    }

    updateMACSearchState(e) {

        let tempSearchBoxValue = e.target.value;
        let tempSBVLength = tempSearchBoxValue.length;

        let dashMACRegMatch = /^([a-zA-Z0-9]{2}-)+[a-zA-Z0-9]{2}$|^([a-zA-Z0-9]{2}-)+[a-zA-Z0-9]$|^([a-zA-Z0-9]{2}-)+$|^([a-zA-Z0-9]{2})$|^([a-zA-Z0-9])$/
        let colonMacRegMatch = /^([a-zA-Z0-9]{2}:)+[a-zA-Z0-9]{2}$|^([a-zA-Z0-9]{2}:)+[a-zA-Z0-9]$|^([a-zA-Z0-9]{2}:)+$|^([a-zA-Z0-9]{2})$|^([a-zA-Z0-9])$/
        let noColonDashMAC = /^([a-zA-Z0-9]+)$/

        if (!(String(tempSearchBoxValue) === "")) {
            if (tempSBVLength > 17) {
                return;
            } else if (!dashMACRegMatch.test(tempSearchBoxValue)) {
                if (!colonMacRegMatch.test(tempSearchBoxValue)) {
                    if (noColonDashMAC.test(tempSearchBoxValue) && (tempSBVLength < 13)) {
                        let charsInserted = 0;
                        for (let charPos = 2; charPos <= tempSBVLength; charPos+=2) {
                            if (charPos+charsInserted === tempSearchBoxValue.length) {
                                if (tempSearchBoxValue.length !== 17) {
                                    tempSearchBoxValue = tempSearchBoxValue + "-";
                                    charsInserted++;
                                }
                            } else {
                                tempSearchBoxValue = tempSearchBoxValue.slice(0, charPos+charsInserted) + "-" + tempSearchBoxValue.slice(charPos+charsInserted);
                                charsInserted++;
                            }
                        }
                    } else {
                        return
                    }
                } else {
                    if ((tempSBVLength === 2 || tempSBVLength === 5 || tempSBVLength === 8 || tempSBVLength === 11 || tempSBVLength === 14) && lastMACSearchlength < tempSBVLength) {
                        tempSearchBoxValue = tempSearchBoxValue + ":";
                    }
                }
            } else {
                if ((tempSBVLength === 2 || tempSBVLength === 5 || tempSBVLength === 8 || tempSBVLength === 11 || tempSBVLength === 14) && lastMACSearchlength < tempSBVLength) {
                    tempSearchBoxValue = tempSearchBoxValue + "-";
                }
            }
        }
        
        lastMACSearchlength = tempSearchBoxValue.length;        
        this.setState({macSearchBox: tempSearchBoxValue});

        let dashMacValid = /^([a-zA-Z0-9]{2}-){5}[a-zA-Z0-9]{2}$/;
        let colonMacValid = /^([a-zA-Z0-9]{2}:){5}[a-zA-Z0-9]{2}$/;
        let macAddress = tempSearchBoxValue;
        //this.setState({macResultClass: "results textOk", macResultDisplay: "", macReturnIP: null, macReturnHostname: null, macReturnLease: null});
        (async function(macAddress, that) {
            requestNumber++;
            let tempNumber = requestNumber;
            // if empty
            if (macAddress==="" || macAddress===null) {
                //this.setState({macResultClass: "results textOk", macResultDisplay: "", macReturnIP: null, macReturnHostname: null, macReturnLease: null});
                that.setState({macResultClass: "results textOk", macResultDisplay: "", macReturnIP: null, macReturnHostname: null, macReturnLease: null});
            // if invalid
            } else if (!macAddress.length === 17) {
                that.setState({macResultClass: "results textWarn", macResultDisplay: "MAC Address is not long enough --- XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX", macReturnIP: null, macReturnHostname: null, macReturnLease: null});
            } else if (!(dashMacValid.test(macAddress) || colonMacValid.test(macAddress))) {
                //this.setState({macResultClass: "results textCrit", macResultDisplay: "MAC Address must be in the format of either XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX", macReturnIP: null, macReturnHostname: null, macReturnLease: null});
                that.setState({macResultClass: "results textCrit", macResultDisplay: "MAC Address must be in the format of either XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX", macReturnIP: null, macReturnHostname: null, macReturnLease: null});
            // if valid
            } else {
                // set 'loading' message since this takes so long
                //this.setState({macResultClass: "results textOk", macResultDisplay: "Loading...this may take a few seconds...", macReturnIP: "Loading", macReturnHostname: "Loading", macReturnLease: "Loading"});
                that.setState({macResultClass: "results textOk", macResultDisplay: "Loading...this may take a few seconds...", macReturnIP: "Loading", macReturnHostname: "Loading", macReturnLease: "Loading"});

                //convert : MAC to - MAC
                if (colonMacValid.test(macAddress)) {
                    macAddress = macAddress.replace(/:/g, "-");
                }

                //call api
                let macStatus = await getIPByMAC(macAddress);

                // if this is still the most recent request
                if (tempNumber === requestNumber) {
                    //if return blank
                    if (macStatus[0]["ClientId"] === "" || macStatus[0]["ClientId"] === null) {

                        that.setState({macResultClass: "results textWarn", macResultDisplay: "The provided MAC address doesn't appear to exist in current DHCP records", macReturnIP: "Unknown", macReturnHostname: "Unknown", macReturnLease: "Unknown"});

                    //multiple return
                    } else if (macStatus.length > 1) {
                        let indexInExpiry = 0;
                        let tempLeaseExp = 0;
                        let finalIndex = 0;
                        macStatus.forEach(getMostRecentExpiry);

                        function getMostRecentExpiry(item) {
                            if (item["LeaseExpiryTime"] > tempLeaseExp) {
                                tempLeaseExp = item["LeaseExpiryTime"];
                                finalIndex = indexInExpiry;
                            }
                            indexInExpiry++;
                        }

                        macStatus[finalIndex]["LeaseExpiryTime"] = new Date(macStatus[finalIndex]["LeaseExpiryTime"]*1).toLocaleString('en-us');
                        that.setState({macResultClass: "results textOk", macResultDisplay: "", macReturnIP: macStatus[finalIndex]["IP"], macReturnHostname: macStatus[finalIndex]["HostName"], macReturnLease: macStatus[finalIndex]["LeaseExpiryTime"]});

                    //single return
                    } else {
                        macStatus[0]["LeaseExpiryTime"] = new Date(macStatus[0]["LeaseExpiryTime"]*1).toLocaleString('en-us');
                        that.setState({macResultClass: "results textOk", macResultDisplay: "", macReturnIP: macStatus[0]["IP"], macReturnHostname: macStatus[0]["HostName"], macReturnLease: macStatus[0]["LeaseExpiryTime"]});
                    }
                }
            }
        })(macAddress, this);

        

    }

    updateAPSearchState(e) {
        let serialNumber = e.target.value;
        (async function(serialNumber, that) {
            // requestnumber is for matching that this is the most recent request so that old requests aren't rendered if the user types fast
            requestNumber++;
            let tempNumber = requestNumber;

            //if empty
            if (serialNumber==="" || serialNumber===null) {
              that.setState({inAutopilot: null, inIntune: null, enrolledBeforeAP: null, resultClass: "results textOk", resultDisplay: "", formClass: "formgrid formOk", autopilotClass: "textOk", intuneClass: "textOk", enrolledClass: "textOk", hostname: null, hostnameClass: "textOk", daysSinceSync: null, daysSinceSyncClass: "textOk", primaryUser: null, primaryUserClass: "textOk"});
            // if includes a space
            } else if (serialNumber.includes(" ")) {
              that.setState({inAutopilot: null, inIntune: null, enrolledBeforeAP: null, resultClass: "results textWarn", resultDisplay: "No spaces in serial numbers.", formClass: "formgrid formOk", autopilotClass: "textOk", intuneClass: "textOk", enrolledClass: "textOk", hostname: null, hostnameClass: "textOk", daysSinceSync: null, daysSinceSyncClass: "textOk", primaryUser: null, primaryUserClass: "textOk"});
            // if serialnumber matches hostname structure
            } else if (serialNumber.startsWith("D-") || serialNumber.startsWith("L-") || serialNumber.startsWith("DESKTOP-")) {
              that.setState({inAutopilot: null, inIntune: null, enrolledBeforeAP: null, resultClass: "results textWarn", resultDisplay: "Use serial number not hostname.", formClass: "formgrid formOk", autopilotClass: "textOk", intuneClass: "textOk", enrolledClass: "textOk", hostname: null, hostnameClass: "textOk", daysSinceSync: null, daysSinceSyncClass: "textOk", primaryUser: null, primaryUserClass: "textOk"});
            // if valid
            } else {
              // call api
              let snStatus = await getStatusBySerialNumber(serialNumber);
              if (tempNumber === requestNumber) {
                // calculateResult sets the css styling variables as needed to match return info
                let results = calculateResult(snStatus["inIntune"], snStatus["inAutopilot"], snStatus["inIntuneBeforeAutopilot"], snStatus["daysSinceSync"], snStatus["primaryUser"], snStatus["hostname"]);
                if (serialNumber.startsWith("D") || serialNumber.startsWith("d")) {
                  that.setState({inAutopilot: snStatus["inAutopilot"], inIntune: snStatus["inIntune"], enrolledBeforeAP: snStatus["inIntuneBeforeAutopilot"], resultClass: results.resultClass, resultDisplay: (results.resultDisplay + " ---- You have entered a Serial Number starting with 'D'. While some S/Ns do start with 'D' it's possible you have entered an Asset-Tag. Be sure to double check that this is not an Asset-Tag!"), formClass: results.formClass, autopilotClass: results.autopilotClass, intuneClass: results.intuneClass, enrolledClass: results.enrolledClass, hostname: snStatus["hostname"], hostnameClass: results.hostnameClass, primaryUser: snStatus["primaryUser"], primaryUserClass: results.primaryUserClass, daysSinceSync: snStatus["daysSinceSync"], daysSinceSyncClass: results.daysSinceSyncClass});
                } else {
                  that.setState({inAutopilot: snStatus["inAutopilot"], inIntune: snStatus["inIntune"], enrolledBeforeAP: snStatus["inIntuneBeforeAutopilot"], resultClass: results.resultClass, resultDisplay: results.resultDisplay, formClass: results.formClass, autopilotClass: results.autopilotClass, intuneClass: results.intuneClass, enrolledClass: results.enrolledClass, hostname: snStatus["hostname"], hostnameClass: results.hostnameClass, primaryUser: snStatus["primaryUser"], primaryUserClass: results.primaryUserClass, daysSinceSync: snStatus["daysSinceSync"], daysSinceSyncClass: results.daysSinceSyncClass});
                }
              }
            }
        })(serialNumber, this);
      }

    

    updateMACSearch(e) {
        
      }

    
    render() {
        return (
            <div className="Background">
                <div className="Title">
                    Utility Tools
                </div>
                <Tabs className="Tabs" onSelect={this.resetView}>
                    <TabList>
                        <Tab>Enrollment Checker</Tab>
                        <Tab>MAC-to-IP Checker</Tab>
                    </TabList>
                    <TabPanel>
                        <div label="Enrollment Checker" className={this.state.formClass}>
                            <div className="formgridheader">Enrollment Checker</div>
                            <div className="searchdiv"><input className="searchbox" type="text" onChange={this.updateAPSearchState} onPaste={this.updateAPSearchState} placeholder="Serial Number" /></div>
                            <label className="leftlabel">In Autopilot:</label><label className={this.state.autopilotClass} >{(this.state.inAutopilot == null) ? "" : (this.state.inAutopilot ? "Yes" : "No")}</label>
                            <label className="leftlabel">In Intune:</label><label className={this.state.intuneClass} >{(this.state.inIntune == null) ? "" : (this.state.inIntune ? "Yes" : "No")}</label>
                            <label className="leftlabel">Enrolled Before AP:</label><label className={this.state.enrolledClass} >{(this.state.enrolledBeforeAP == null) ? "" : (this.state.enrolledBeforeAP ? "Yes" : "No")}</label>
                            <label className="leftlabel">Device Hostname:</label><label className={this.state.hostnameClass} >{(this.state.hostname == null) ? "" : this.state.hostname}</label>
                            <label className="leftlabel">Primary User:</label><label className={this.state.primaryUserClass} >{(this.state.primaryUser == null) ? "" : this.state.primaryUser}</label>
                            <label className="leftlabel">Days Since Check-In:</label><label className={this.state.daysSinceSyncClass} >{(this.state.daysSinceSync == null) ? "" : this.state.daysSinceSync}</label>
                            <label className="resultsLabel">Result</label>
                            <label className={this.state.resultClass} >{this.state.resultDisplay}</label>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div label="MAC-to-IP Checker" className={this.state.formClass}>
                            <div className="formgridheader">MAC-to-IP Checker</div>
                            <div className="searchdiv"><input className="searchbox" type="text" onChange={this.updateMACSearchState} onPaste={this.updateMACSearchState} placeholder="MAC Address" value={this.state.macSearchBox} /></div>
                            <label className="leftlabel">HostName:</label><label className="textOk" >{(this.state.macReturnHostname == null) ? "" : this.state.macReturnHostname}</label>
                            <label></label><label></label>
                            <label className="leftlabel">IP Lease Expiration:</label><label className="textOk" >{(this.state.macReturnLease == null) ? "" : this.state.macReturnLease}</label>
                            <label></label><label></label>
                            <label className="leftlabel">IP:</label><label className="textOk" >{(this.state.macReturnIP == null) ? "" : this.state.macReturnIP}</label>
                            
                            
                            <label className="resultsLabel"></label>
                            <label className={this.state.macResultClass} >{this.state.macResultDisplay}</label>
                        </div>
                    </TabPanel>
                    </Tabs>
                </div>
        )
    }
}

export default App;