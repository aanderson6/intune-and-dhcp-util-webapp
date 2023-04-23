#!/bin/bash
SECONDS=0

RANFILENUM=$RANDOM

ssh 10.0.0.1 -F dhcp-ssh/ssh-config "powershell.exe -executionpolicy bypass -f C:\\Scripts\\GetDHCP\\createDHCPtask.ps1 $1 $RANFILENUM"

FILEEXISTS=$(ssh -F dhcp-ssh/ssh-config 10.0.0.1 "test-path -path \"C:\\Scripts\\GetDHCP\\$RANFILENUM.txt\"")

FILEEXISTS=${FILEEXISTS//$'\r'}
while [ ! "$FILEEXISTS" = "True" ]
do
    if [ $SECONDS -gt 15 ]; then
        exit 1
    fi
    
    sleep .25
    FILEEXISTS=$(ssh -F dhcp-ssh/ssh-config 10.0.0.1 "test-path -path \"C:\\Scripts\\GetDHCP\\$RANFILENUM.txt\"")
    FILEEXISTS=${FILEEXISTS//$'\r'}
done


FILEEMPTY=$(ssh -F dhcp-ssh/ssh-config 10.0.0.1 "(get-content -path \"C:\\Scripts\\GetDHCP\\$RANFILENUM.txt\") -eq \$null")
FILEEMPTY=${FILEEMPTY//$'\r'}
while [ "$FILEEMPTY" = "True" ]
do
    printf -v CURRENTTIME '%(%s)T'
    if [ $SECONDS -gt 15 ]; then
        exit 1
    fi

    sleep .25
    FILEEMPTY=$(ssh -F dhcp-ssh/ssh-config 10.0.0.1 "(get-content -path \"C:\\Scripts\\GetDHCP\\$RANFILENUM.txt\") -eq \$null")
    FILEEMPTY=${FILEEMPTY//$'\r'}
done

RESULTS=$(ssh -F dhcp-ssh/ssh-config 10.0.0.1 "\$temp = get-content -path \"C:\\Scripts\\GetDHCP\\$RANFILENUM.txt\"; write-host \$temp")
echo $RESULTS
