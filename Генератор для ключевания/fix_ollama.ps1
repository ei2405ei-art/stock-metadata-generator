\ = 'C:\Users\User\Documents\New OpenCode Project\Генератор для ключевания\batch-keyworder.html'
\ = Get-Content -LiteralPath \ -Raw -Encoding UTF8
\ = \.IndexOf('ollamaRequest')
if (\ -ge 0) {
  \ = \.IndexOf('messages:', \)
  if (\ -ge 0) {
    \ = \.LastIndexOf("
", \)
    \ = \.IndexOf("
", \+1)
    if (\ -ge 0 -and \ -gt \) {
      \ = '    messages: [{role:"user", content: (Array.isArray(imgs) && imgs.length) ? [{type:"text", text:prompt}, ...content] : prompt}],'
      \ = \.Substring(0,\+1) + \ + \.Substring(\)
      Set-Content -LiteralPath \ -Value \ -Encoding UTF8
      Write-Host 'FIXED'
      exit 0
    }
  }
}
Write-Host 'SKIP'
exit 0
