$bvids = @(
    'BV1qgVDzREi7','BV1fo1qYbE9D','BV11u4y1A7QT','BV155411w7DX','BV1Vb4y157ny','BV1EJhCz7E2n',
    'BV12h8JzZEFE','BV1Yr5k6LEjS','BV1ku411p7uB','BV1nriqYTE8c','BV1ou4m1c724',
    'BV1Dd5N6gE1s','BV1FMNoeYEB9','BV1z4411X7QK','BV1mG411u7SD','BV1mxkhYyEkM',
    'BV1CACnYCECM','BV12p9cYsEXb','BV1dLKzzTEWH','BV1sw5p63Ech','BV1Az4y1G7Sd',
    'BV13C411a7ts','BV1FU4y1x7bP','BV1bYoLBNEEn','BV1Wt9dY6EYd','BV1xgQGYjEsm',
    'BV1sx4y157Gv','BV147411m7ST','BV1bu4y1j7Sj','BV1hXVYzAEU5','BV1zeN1zsE2j',
    'BV1FX516vEC3','BV1KGe3zCEHQ','BV13toLBzEAp'
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
                subtitle = $d.subtitle.list.Count
            }
            Write-Progress -Activity "获取B站视频信息" -Status "[$($i+1)/$total] $bvid" -PercentComplete (($i+1)/$total*100)
            Write-Output "[$($i+1)/$total] OK $bvid - $($d.title)"
        } else {
            Write-Output "[$($i+1)/$total] ERR $bvid - code=$($resp.code)"
        }
    } catch {
        Write-Output "[$($i+1)/$total] FAIL $bvid - $_"
    }
    Start-Sleep -Milliseconds 300
}

$results | Export-Csv -Path "D:\OPC\smallhome\bilibili_videos.csv" -Encoding UTF8 -NoTypeInformation
Write-Output "`n===== 完成 ======"
Write-Output "总数: $($results.Count)"
Write-Output "有字幕: $(($results | Where-Object { $_.subtitle -gt 0 }).Count)"
$results | Format-Table bvid, title, author, views, subtitle -AutoSize
