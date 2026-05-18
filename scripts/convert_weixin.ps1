# Convert Weixin articles to smallhome format
param(
    [string]$articlesDir = ".\weixin-articles",
    [string]$outputDir = ".\src\content\articles\zh",
    [string]$imageDir = ".\public\images\articles"
)

$slugMap = @{
    "小户型装修攻略！" = "wechat-xiaohuxing-zhuangxiu-gonglue"
    "小户型装修的5个建议，至少别反着装" = "wechat-5-tips-xiaohuxing"
    "小户型 大收纳：小户型在装修前必须要知道的收纳技巧" = "wechat-xiaohuxing-shouna-tips"
    "小户型收纳式家具的设计创新方法研究" = "wechat-shouna-furniture-design"
    "ins案例 | 小户型收纳完美技巧" = "wechat-ins-shouna-tips"
    "这才是真正的北欧风！9个北欧小户型设计案例" = "wechat-beiou-9-cases"
    "全案实景 | ins风简约现代小户型设计案例" = "wechat-ins-feng-cases"
    "瑞典超mini小户型设计里的经典案例，丰富且有趣#fashion空间#" = "wechat-swedish-mini-design"
    "小户型设计案例" = "wechat-design-cases"
    "小户型装修案例，89㎡小三房收纳空间多到爆炸【第4期】" = "wechat-89sqm-storage"
    "53平小户型装修改造 打造一家三口的幸福小世界" = "wechat-53sqm-renovation"
    "52平小户型，改造成了两居室，外加一个衣帽间，超有格调！" = "wechat-52sqm-two-bedroom"
    "50㎡loft小户型，空间利用到极致！" = "wechat-50sqm-loft"
    "55㎡小户型收纳扩容模板，全是封神亮点" = "wechat-55sqm-storage-template"
    "小户型收纳全屋攻略，让家的容量增加一倍！" = "wechat-full-house-storage"
    "小户型卧室收纳难怎么办？5个收纳扩容大法来帮忙" = "wechat-bedroom-storage-5tips"
    "看看人家小户型，北欧风家居搭配看起来有180㎡！" = "wechat-beiou-180sqm"
    "2套北欧风小户型，走心的设计，让空间大起来！" = "wechat-2-beiou-design"
    "小户型客厅如何设计？看设计师给你的一些建议" = "wechat-living-room-design"
    "8款小户型客厅装修效果图，每一款设计都美丽大方，紧凑有型！" = "wechat-8-living-room"
    "居家整理收纳万能技巧，小户型瞬间扩容" = "wechat-home-storage-universal-tips"
    "小户型北欧风格装修效果图" = "wechat-nordic-style-gallery"
    "厦门租房搬家后，小户型收纳技巧，省空间不杂乱" = "wechat-rental-storage-tips"
    "收纳小技巧，小户型显大，整洁省心" = "wechat-storage-tips-look-bigger"
    "小户型客厅怎么装才好看又实用？24款看完照搬就好了！" = "wechat-24-living-room-designs"
    "小户型客厅怎么装才好看又实用？4款风格看完照搬就好了！" = "wechat-4-style-living-room"
    "小户型客厅这样做超级显大" = "wechat-living-room-look-bigger"
    "小户型扩容秘籍！适乐居收纳好物专场" = "wechat-storage-products-guide"
}

$descMap = @{
    "小户型装修攻略！" = "小户型装修全攻略，从空间规划到风格选择，打造舒适小家的完整指南"
    "小户型装修的5个建议，至少别反着装" = "小户型装修最容易犯的5个错误，避开这些坑让你的小家越住越舒适"
    "小户型 大收纳：小户型在装修前必须要知道的收纳技巧" = "装修前必看的小户型收纳技巧，从设计阶段就做好收纳规划"
    "小户型收纳式家具的设计创新方法研究" = "小户型收纳式家具的创新设计方法，让每一件家具都兼具收纳功能"
    "ins案例 | 小户型收纳完美技巧" = "精选ins小户型收纳案例，学习网红家居博主的收纳妙招"
    "这才是真正的北欧风！9个北欧小户型设计案例" = "9个纯正北欧风小户型设计案例，教你装出高级感"
    "全案实景 | ins风简约现代小户型设计案例" = "ins风简约现代小户型实景案例，清新自然的家居灵感"
    "瑞典超mini小户型设计里的经典案例，丰富且有趣#fashion空间#" = "瑞典极小户型设计案例，看北欧设计师如何玩转小空间"
    "小户型设计案例" = "精选小户型设计案例合集，多种风格满足不同需求"
    "小户型装修案例，89㎡小三房收纳空间多到爆炸【第4期】" = "89平小三房装修案例，超强收纳设计让空间多到爆炸"
    "53平小户型装修改造 打造一家三口的幸福小世界" = "53平小屋的华丽变身，三口之家的温馨小世界"
    "52平小户型，改造成了两居室，外加一个衣帽间，超有格调！" = "52平巧改两居室外加衣帽间，小户型也能拥有品质生活"
    "50㎡loft小户型，空间利用到极致！" = "50平loft公寓装修，空间利用到每一寸，小户型天花板"
    "55㎡小户型收纳扩容模板，全是封神亮点" = "55平收纳扩容神作，每一处设计都值得抄作业"
    "小户型收纳全屋攻略，让家的容量增加一倍！" = "全屋收纳攻略，从玄关到卧室，让小家容量翻倍"
    "小户型卧室收纳难怎么办？5个收纳扩容大法来帮忙" = "卧室太小不够放？5个收纳技巧让你的卧室瞬间变大"
    "看看人家小户型，北欧风家居搭配看起来有180㎡！" = "北欧风家居搭配技巧，让小户型看起来比实际大一倍"
    "2套北欧风小户型，走心的设计，让空间大起来！" = "两套北欧风小户型设计，用心的设计让小家越住越大"
    "小户型客厅如何设计？看设计师给你的一些建议" = "设计师分享小户型客厅设计要点，打造实用又美观的客厅空间"
    "8款小户型客厅装修效果图，每一款设计都美丽大方，紧凑有型！" = "8款小户型客厅装修方案，紧凑有型不显拥挤"
    "居家整理收纳万能技巧，小户型瞬间扩容" = "居家收纳万能技巧，从墙面到衣柜让小户型瞬间扩容20㎡"
    "小户型北欧风格装修效果图" = "北欧风小户型装修效果图合集，简约清爽的家居灵感"
    "厦门租房搬家后，小户型收纳技巧，省空间不杂乱" = "租房搬家后的小户型收纳技巧，让空间整洁不杂乱"
    "收纳小技巧，小户型显大，整洁省心" = "实用收纳小技巧，让小户型秒变温馨大空间"
    "小户型客厅怎么装才好看又实用？24款看完照搬就好了！" = "24款小户型客厅设计方案，多种风格照搬就好"
    "小户型客厅怎么装才好看又实用？4款风格看完照搬就好了！" = "4种风格小户型客厅设计，现代简约北欧风全都有"
    "小户型客厅这样做超级显大" = "不做吊顶用对颜色，小户型客厅也能看起来超级大"
    "小户型扩容秘籍！适乐居收纳好物专场" = "小户型扩容收纳好物推荐，浅色软装+透光设计让空间翻倍"
}

$catMap = @{
    "小户型装修攻略！" = @("area", "style")
    "小户型装修的5个建议，至少别反着装" = @("tips")
    "小户型 大收纳：小户型在装修前必须要知道的收纳技巧" = @("tips", "space")
    "小户型收纳式家具的设计创新方法研究" = @("tips")
    "ins案例 | 小户型收纳完美技巧" = @("tips", "gallery")
    "这才是真正的北欧风！9个北欧小户型设计案例" = @("style", "gallery")
    "全案实景 | ins风简约现代小户型设计案例" = @("style", "gallery")
    "瑞典超mini小户型设计里的经典案例，丰富且有趣#fashion空间#" = @("style", "gallery")
    "小户型设计案例" = @("gallery")
    "小户型装修案例，89㎡小三房收纳空间多到爆炸【第4期】" = @("area", "space")
    "53平小户型装修改造 打造一家三口的幸福小世界" = @("area", "space")
    "52平小户型，改造成了两居室，外加一个衣帽间，超有格调！" = @("area", "space")
    "50㎡loft小户型，空间利用到极致！" = @("area", "space")
    "55㎡小户型收纳扩容模板，全是封神亮点" = @("area", "tips")
    "小户型收纳全屋攻略，让家的容量增加一倍！" = @("tips", "space")
    "小户型卧室收纳难怎么办？5个收纳扩容大法来帮忙" = @("tips", "space")
    "看看人家小户型，北欧风家居搭配看起来有180㎡！" = @("style")
    "2套北欧风小户型，走心的设计，让空间大起来！" = @("style")
    "小户型客厅如何设计？看设计师给你的一些建议" = @("space", "tips")
    "8款小户型客厅装修效果图，每一款设计都美丽大方，紧凑有型！" = @("space", "gallery")
    "居家整理收纳万能技巧，小户型瞬间扩容" = @("space", "tips")
    "小户型北欧风格装修效果图" = @("style", "gallery")
    "厦门租房搬家后，小户型收纳技巧，省空间不杂乱" = @("space", "tips")
    "收纳小技巧，小户型显大，整洁省心" = @("space", "tips")
    "小户型客厅怎么装才好看又实用？24款看完照搬就好了！" = @("space", "style", "gallery")
    "小户型客厅怎么装才好看又实用？4款风格看完照搬就好了！" = @("space", "style")
    "小户型客厅这样做超级显大" = @("space", "tips")
    "小户型扩容秘籍！适乐居收纳好物专场" = @("space", "tips")
}

$tagMap = @{
    "小户型装修攻略！" = @("小户型", "装修攻略", "空间设计", "收纳")
    "小户型装修的5个建议，至少别反着装" = @("小户型", "避坑", "装修建议")
    "小户型 大收纳：小户型在装修前必须要知道的收纳技巧" = @("小户型", "收纳", "装修准备")
    "小户型收纳式家具的设计创新方法研究" = @("收纳家具", "创新设计", "多功能")
    "ins案例 | 小户型收纳完美技巧" = @("ins风", "收纳", "家居灵感")
    "这才是真正的北欧风！9个北欧小户型设计案例" = @("北欧风", "设计案例", "小户型")
    "全案实景 | ins风简约现代小户型设计案例" = @("ins风", "简约", "现代")
    "瑞典超mini小户型设计里的经典案例，丰富且有趣#fashion空间#" = @("瑞典设计", "极小户型", "北欧")
    "小户型设计案例" = @("设计案例", "小户型", "装修灵感")
    "小户型装修案例，89㎡小三房收纳空间多到爆炸【第4期】" = @("89㎡", "小三房", "收纳")
    "53平小户型装修改造 打造一家三口的幸福小世界" = @("53㎡", "小户型改造", "三口之家")
    "52平小户型，改造成了两居室，外加一个衣帽间，超有格调！" = @("52㎡", "两居室", "衣帽间")
    "50㎡loft小户型，空间利用到极致！" = @("50㎡", "loft", "空间利用")
    "55㎡小户型收纳扩容模板，全是封神亮点" = @("55㎡", "收纳", "扩容")
    "小户型收纳全屋攻略，让家的容量增加一倍！" = @("全屋收纳", "扩容", "攻略")
    "小户型卧室收纳难怎么办？5个收纳扩容大法来帮忙" = @("卧室收纳", "扩容", "技巧")
    "看看人家小户型，北欧风家居搭配看起来有180㎡！" = @("北欧风", "搭配", "扩容")
    "2套北欧风小户型，走心的设计，让空间大起来！" = @("北欧风", "设计", "小户型")
    "小户型客厅如何设计？看设计师给你的一些建议" = @("客厅设计", "设计师建议", "布局")
    "8款小户型客厅装修效果图，每一款设计都美丽大方，紧凑有型！" = @("客厅", "装修效果图", "设计")
    "居家整理收纳万能技巧，小户型瞬间扩容" = @("收纳", "扩容", "小户型", "整理技巧")
    "小户型北欧风格装修效果图" = @("北欧风", "装修效果图", "小户型", "风格")
    "厦门租房搬家后，小户型收纳技巧，省空间不杂乱" = @("收纳", "租房", "搬家", "省空间")
    "收纳小技巧，小户型显大，整洁省心" = @("收纳技巧", "显大", "整洁", "小户型")
    "小户型客厅怎么装才好看又实用？24款看完照搬就好了！" = @("客厅设计", "24款", "现代简约", "北欧风", "地中海")
    "小户型客厅怎么装才好看又实用？4款风格看完照搬就好了！" = @("客厅设计", "风格", "现代简约", "北欧风")
    "小户型客厅这样做超级显大" = @("客厅", "显大", "吊顶", "颜色搭配")
    "小户型扩容秘籍！适乐居收纳好物专场" = @("收纳好物", "扩容", "收纳用品", "软装")
}

Get-ChildItem -Path $articlesDir -Directory | ForEach-Object {
    $dir = $_.FullName
    $mdFile = Get-ChildItem -Path $dir -Filter "*.md" | Select-Object -First 1
    if (-not $mdFile) { return }

    $content = Get-Content -Path $mdFile.FullName -Raw

    # Extract title from frontmatter
    if ($content -match 'title:\s*"(.+)"') {
        $title = $matches[1]
    } else { return }

    $slug = $slugMap[$title]
    if (-not $slug) {
        Write-Host "No slug for: $title"
        return
    }
    Write-Host "Processing: $title -> $slug"

    $desc = $descMap[$title]
    $cats = $catMap[$title]
    $tags = $tagMap[$title]

    # Find first image to use as cover
    $imgDir = Join-Path -Path $dir -ChildPath "images"
    $firstImg = $null
    if (Test-Path $imgDir) {
        $firstImg = Get-ChildItem -Path $imgDir -File | Select-Object -First 1
    }

    $coverName = "$slug.jpg"
    $coverPath = ""

    if ($firstImg) {
        $ext = [System.IO.Path]::GetExtension($firstImg.Name)
        $coverName = "$slug$ext"
        Copy-Item -Path $firstImg.FullName -Destination (Join-Path $imageDir $coverName) -Force
        $coverPath = "/images/articles/$coverName"
    }

    # Copy remaining images
    if (Test-Path $imgDir) {
        $skip = $true
        Get-ChildItem -Path $imgDir -File | ForEach-Object {
            if ($skip) { $skip = $false; return }
            $newName = "$slug`_$($_.Name)"
            Copy-Item -Path $_.FullName -Destination (Join-Path $imageDir $newName) -Force
        }
    }

    # Build frontmatter
    $catsStr = ($cats | ForEach-Object { "`"$_`"" }) -join ", "
    $tagsStr = ($tags | ForEach-Object { "`"$_`"" }) -join ", "
    $today = (Get-Date).ToString("yyyy-MM-dd")

    # Remove old frontmatter and adjust image paths
    $body = $content
    $body = $body -replace '(?s)^---\n.*?\n---\n', ''
    $body = $body -replace '!\[image\]\(images/(img_\d+\.(?:gif|jpeg|jpg|png|webp))(?:#imgIndex=\d+)?\)', "![image](/images/articles/$slug`_`$1)"
    # Catch any remaining images/img_ references (without ![image] prefix, different extensions, etc.)
    $body = $body -replace '\]\(images/(img_\d+\.\w+)(?:#imgIndex=\d+)?\)', "](/images/articles/$slug`_`$1"

    # Build output
    $fm = @"
---
title: "$title"
description: "$desc"
publishedAt: "$today"
updatedAt: "$today"
categories: [$catsStr]
tags: [$tagsStr]
coverImage: "$coverPath"
author: "SmallHome"
---
"@

    $newContent = $fm + "`r`n`r`n" + $body

    $outputFile = Join-Path $outputDir "$slug.md"
    Set-Content -Path $outputFile -Value $newContent -Encoding UTF8
    Write-Host "  Created: $slug.md"
}
