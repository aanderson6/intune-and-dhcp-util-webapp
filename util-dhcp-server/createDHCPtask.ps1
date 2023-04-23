param (
  [Parameter(mandatory=$true)] $MAC,
  [Parameter(mandatory=$true)] $RandomFileNum
)

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-executionpolicy bypass -f C:\Scripts\GetDHCP\getdhcp.ps1 $($MAC) $($RandomFileNum)"
$trigger = New-ScheduledTaskTrigger -Once -At (get-date).AddSeconds(1.5)
$task = New-ScheduledTask -Action $action -Trigger $trigger
Register-ScheduledTask -TaskName "GetDHCP$($RandomFileNum)" -InputObject $task -User "NT AUTHORITY\SYSTEM" | out-null