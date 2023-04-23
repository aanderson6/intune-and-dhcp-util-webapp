param (
  [Parameter(mandatory=$true)] $MAC,
  [Parameter(mandatory=$true)] $RandomFileNum
)

Get-DhcpServerv4Scope | Get-DhcpServerv4Lease | where-object {$_.ClientId -like "$($MAC)"} | Select-Object IPAddress,ClientId,HostName,LeaseExpiryTime | ConvertTo-Json | Out-File -FilePath "C:\Scripts\GetDHCP\$($RandomFileNum).txt"
Start-Sleep 30
Remove-Item -Path "C:\Scripts\GetDHCP\$($RandomFileNum).txt"
Unregister-ScheduledTask -TaskName "GetDHCP$($RandomFileNum)" -Confirm:$false