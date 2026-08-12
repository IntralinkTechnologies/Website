$root = Split-Path -Parent $PSScriptRoot
$port = 8787

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css"
  ".js"   = "application/javascript"
  ".png"  = "image/png"
  ".webp" = "image/webp"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".ico"  = "image/x-icon"
  ".xml"  = "application/xml"
  ".txt"  = "text/plain"
  ".json" = "application/json"
  ".svg"  = "image/svg+xml"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response

  $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
  if ($path -eq "/") { $path = "/index.html" }

  $filePath = Join-Path $root ($path.TrimStart("/"))
  $fullRoot = (Resolve-Path $root).Path

  try {
    $resolved = (Resolve-Path -LiteralPath $filePath -ErrorAction Stop).Path
  } catch {
    $resolved = $null
  }

  if ($resolved -and $resolved.StartsWith($fullRoot) -and (Test-Path -LiteralPath $resolved -PathType Leaf)) {
    $ext = [System.IO.Path]::GetExtension($resolved).ToLower()
    $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($resolved)
    $response.ContentType = $contentType
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $response.StatusCode = 404
    $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
    $response.OutputStream.Write($notFound, 0, $notFound.Length)
  }

  $response.OutputStream.Close()
}
