; Custom NSIS installer script for Escape from Churkov
; This file extends the default electron-builder NSIS installer

; Add game to Windows Firewall exceptions so multiplayer works
!macro customInstall
  DetailPrint "Adding Escape from Churkov firewall exception..."
  nsExec::ExecToStack 'netsh advfirewall firewall add rule name="Escape from Churkov" dir=in action=allow program="$INSTDIR\Escape from Churkov.exe" enable=yes'
  nsExec::ExecToStack 'netsh advfirewall firewall add rule name="Escape from Churkov" dir=out action=allow program="$INSTDIR\Escape from Churkov.exe" enable=yes'
!macroend

!macro customUnInstall
  DetailPrint "Removing Escape from Churkov firewall exception..."
  nsExec::ExecToStack 'netsh advfirewall firewall delete rule name="Escape from Churkov"'
!macroend
