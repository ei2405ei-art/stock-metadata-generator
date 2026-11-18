Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "node """ & dir & "\server.js""", 0, False
' Значок в трее: проверка, что сервер отвечает (без окон)
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & dir & "\tray.ps1""", 0, False
