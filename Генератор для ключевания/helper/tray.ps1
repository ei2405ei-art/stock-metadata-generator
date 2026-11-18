# Adobe helper — значок в трее + проверка состояния.
# Зелёный: сервер отвечает. Красный: не отвечает (всплывающее предупреждение).
# Двойной клик — проверить сейчас; правый клик — меню.
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$healthUrl = "http://localhost:8787/health"
$lastState = $null

function New-TrayIcon([string]$letter, [System.Drawing.Color]$color){
  $bmp = New-Object System.Drawing.Bitmap(32, 32)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $brush = New-Object System.Drawing.SolidBrush($color)
  $g.FillEllipse($brush, 1, 1, 30, 30)
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 3)
  $g.DrawEllipse($pen, 1, 1, 30, 30)
  $font = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = "Center"
  $fmt.LineAlignment = "Center"
  $g.DrawString($letter, $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 0, 32, 32)), $fmt)
  $g.Dispose()
  return [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
}

$iconOk   = New-TrayIcon "A" ([System.Drawing.Color]::FromArgb(46, 204, 113))
$iconBad  = New-TrayIcon "A" ([System.Drawing.Color]::FromArgb(231, 76, 60))

$ni = New-Object System.Windows.Forms.NotifyIcon
$ni.Icon = $iconOk
$ni.Visible = $true
$ni.Text = "Adobe helper: проверка..."

function Get-Health{
  try{
    $r = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3
    if($r.StatusCode -eq 200){
      $j = $r.Content | ConvertFrom-Json
      if($j.ok){ return $j }
    }
    return $null
  }catch{ return $null }
}

function Update-Status([bool]$silent){
  $h = Get-Health
  if($h){
    $ni.Icon = $iconOk
    if($h.count -gt 0){
      $ni.Text = "Adobe helper: работает, файлов " + [string]$h.count
    }else{
      $ni.Text = "Adobe helper: работает, индекса нет"
    }
    if($lastState -eq $false -and -not $silent){
      $ni.ShowBalloonTip(4000, "Adobe helper", "Сервер снова отвечает.", "Info")
    }
    $script:lastState = $true
  }else{
    $ni.Icon = $iconBad
    $ni.Text = "Adobe helper: НЕ работает"
    if($lastState -ne $false -and -not $silent){
      $ni.ShowBalloonTip(6000, "Adobe helper", "Сервер http://localhost:8787 не отвечает. Проверьте, запущен ли helper (start.bat).", "Error")
    }
    $script:lastState = $false
  }
}

# --- меню правой кнопки ---
$menu = New-Object System.Windows.Forms.ContextMenuStrip
$itemCheck = $menu.Items.Add("Проверить сейчас")
$itemOpen  = $menu.Items.Add("Открыть страницу состояния")
$itemExit  = $menu.Items.Add("Выход")
$itemCheck.Add_Click({ Update-Status $false })
$itemOpen.Add_Click({ Start-Process $healthUrl })
$itemExit.Add_Click({ $ni.Visible = $false; [System.Windows.Forms.Application]::Exit() })
$ni.ContextMenuStrip = $menu
$ni.Add_DoubleClick({ Update-Status $false })

# --- таймер: тихая проверка каждые 30 секунд ---
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 30000
$timer.Add_Tick({ Update-Status $true })
$timer.Start()

Update-Status $true
[System.Windows.Forms.Application]::Run()
