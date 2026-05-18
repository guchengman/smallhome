# fetch_bilibili.ps1 — Fetch Bilibili video metadata for article import
# Usage: pwsh .agents/skills/smallhome_import/scripts/fetch_bilibili.ps1
# Before running, edit the $bvids array below with the video IDs you want to import.

$bvids = @(
    'BV1qgVDzREi7','BV1fo1qYbE9D','BV11u4y1A7QT','BV155411w7DX','BV1Vb4y157ny','BV1EJhCz7E2n',
    'BV12h8JzZEFE','BV1Yr5k6LEjS','BV1ku411p7uB','BV1nriqYTE8c','BV1ou4m1c724'
)

$results = @()
$total = $bvids.Count
foreach ($i in 0..($total-1)) {
    $bvid = $bvids[$i]
    try {
        $resp = Invoke-RestMethod -Uri "https://api.bilibili.com/x/web-interface/view?bvid=$bvid" -ErrorAction Stop
        if ($resp.code -eq 0) {
            $d = $resp.data
            $results += [PSCustomObject]@{
                bvid = $bvid
                title = $d.title
                author = $d.owner.name
                views = $d.stat.view
                cover = $d.pic
                desc = $d.desc
            }
            Write-Progress -Activity "Fetching Bilibili videos" -Status "[$($i+1)/$total] $bvid" -PercentComplete (($i+1)/$total*100)
            Write-Output "[$($i+1)/$total] OK $bvid - $($d.title)"
        } else {
            Write-Output "[$($i+1)/$total] ERR $bvid - code=$($resp.code)"
        }
    } catch {
        Write-Output "[$($i+1)/$total] FAIL $bvid - $_"
    }
    Start-Sleep -Milliseconds 300
}

# Save to CSV — can be used by generate_articles.ps1
$csvPath = Join-Path (Split-Path $PSScriptRoot -Parent) "references\bilibili_videos.csv"
$results | Export-Csv -Path $csvPath -Encoding UTF8 -NoTypeInformation

Write-Output "`n===== Done ====="
Write-Output "Total: $($results.Count) videos"
Write-Output "CSV saved to: $csvPath"
$results | Format-Table bvid, title, author, views -AutoSize
