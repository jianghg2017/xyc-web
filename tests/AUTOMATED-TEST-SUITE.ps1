# 🧪 自动化测试套件 - 公司官网动态内容系统
# 测试日期：2026-04-14
# 测试类型：功能验证测试

$ErrorActionPreference = "Stop"
$testResults = @()
$testStartTime = Get-Date
$apiBaseUrl = "http://localhost:3000/api"
$frontendUrl = "http://localhost:5173"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  公司官网动态内容系统 - 自动化测试报告" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试开始时间：$testStartTime" -ForegroundColor Gray
Write-Host "测试环境：开发环境" -ForegroundColor Gray
Write-Host "后端地址：$apiBaseUrl" -ForegroundColor Gray
Write-Host "前端地址：$frontendUrl" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

# 测试辅助函数
function Write-TestHeader {
    param($title)
    Write-Host "`n--- $title ---" -ForegroundColor Yellow
}

function Write-Pass {
    param($name, $details = "")
    $testResults += @{
        Name = $name
        Status = "PASS"
        Details = $details
        Duration = 0
    }
    Write-Host "  ✅ PASS: $name" -ForegroundColor Green
    if ($details) { Write-Host "     $details" -ForegroundColor Gray }
}

function Write-Fail {
    param($name, $error)
    $testResults += @{
        Name = $name
        Status = "FAIL"
        Details = $error
        Duration = 0
    }
    Write-Host "  ❌ FAIL: $name" -ForegroundColor Red
    Write-Host "     错误：$error" -ForegroundColor Red
}

function Write-Skip {
    param($name, $reason)
    $testResults += @{
        Name = $name
        Status = "SKIP"
        Details = $reason
        Duration = 0
    }
    Write-Host "  ⏭️  SKIP: $name ($reason)" -ForegroundColor DarkGray
}

# ============================================
# 测试 1: 服务健康检查
# ============================================
Write-TestHeader "测试 1: 服务健康检查"

try {
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $body = $response.Content | ConvertFrom-Json
        if ($body.success -eq $true) {
            Write-Pass "后端服务健康检查" "状态：$($body.data.status), 运行时间：$($body.data.uptime)"
        } else {
            Write-Fail "后端服务健康检查" "API 返回 success=false"
        }
    } else {
        Write-Fail "后端服务健康检查" "HTTP 状态码：$($response.StatusCode)"
    }
} catch {
    Write-Fail "后端服务健康检查" $_.Exception.Message
}

try {
    $response = Invoke-WebRequest -Uri "$frontendUrl" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Pass "前端服务健康检查" "HTTP 状态码：200, 内容长度：$($response.Content.Length) 字节"
    } else {
        Write-Fail "前端服务健康检查" "HTTP 状态码：$($response.StatusCode)"
    }
} catch {
    Write-Fail "前端服务健康检查" $_.Exception.Message
}

# ============================================
# 测试 2: 公共数据 API
# ============================================
Write-TestHeader "测试 2: 公共数据 API 测试"

$publicEndpoints = @(
    @{ Name = "核心优势"; Endpoint = "/features"; ExpectedCount = 3 },
    @{ Name = "公司统计"; Endpoint = "/stats"; ExpectedCount = 4 },
    @{ Name = "发展历程"; Endpoint = "/timeline"; ExpectedCount = 6 },
    @{ Name = "核心价值观"; Endpoint = "/values"; ExpectedCount = 3 },
    @{ Name = "网站设置"; Endpoint = "/settings"; ExpectedCount = 12 },
    @{ Name = "轮播图"; Endpoint = "/banners"; ExpectedCount = 3 }
)

foreach ($endpoint in $publicEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$apiBaseUrl$($endpoint.Endpoint)" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            $body = $response.Content | ConvertFrom-Json
            if ($body.success -eq $true) {
                $dataCount = if ($body.data -is [array]) { $body.data.Count } else { 1 }
                if ($dataCount -ge $endpoint.ExpectedCount) {
                    Write-Pass "GET$($endpoint.Endpoint)" "返回 $($dataCount) 条数据 (预期 ≥$($endpoint.ExpectedCount))"
                } else {
                    Write-Fail "GET$($endpoint.Endpoint)" "数据数量不足：$($dataCount) < $($endpoint.ExpectedCount)"
                }
            } else {
                Write-Fail "GET$($endpoint.Endpoint)" "API 返回 success=false"
            }
        } else {
            Write-Fail "GET$($endpoint.Endpoint)" "HTTP 状态码：$($response.StatusCode)"
        }
    } catch {
        Write-Fail "GET$($endpoint.Endpoint)" $_.Exception.Message
    }
}

# ============================================
# 测试 3: 新闻 API
# ============================================
Write-TestHeader "测试 3: 新闻 API 测试"

try {
    # 测试新闻列表
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/news?page=1&limit=10" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $body = $response.Content | ConvertFrom-Json
        if ($body.success -eq $true) {
            Write-Pass "GET /api/news (列表)" "分页数据结构正确"
            if ($body.data.PSObject.Properties.Name -contains "list" -and $body.data.PSObject.Properties.Name -contains "pagination") {
                Write-Pass "  - 分页结构" "包含 list 和 pagination 字段"
            } else {
                Write-Fail "  - 分页结构" "缺少 list 或 pagination 字段"
            }
        } else {
            Write-Fail "GET /api/news (列表)" "API 返回 success=false"
        }
    } else {
        Write-Fail "GET /api/news (列表)" "HTTP 状态码：$($response.StatusCode)"
    }
} catch {
    Write-Fail "GET /api/news (列表)" $_.Exception.Message
}

# ============================================
# 测试 4: 产品 API
# ============================================
Write-TestHeader "测试 4: 产品 API 测试"

try {
    # 测试产品列表
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/products?page=1&limit=10" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $body = $response.Content | ConvertFrom-Json
        if ($body.success -eq $true) {
            Write-Pass "GET /api/products (列表)" "分页数据结构正确"
            if ($body.data.PSObject.Properties.Name -contains "list" -and $body.data.PSObject.Properties.Name -contains "pagination") {
                Write-Pass "  - 分页结构" "包含 list 和 pagination 字段"
            } else {
                Write-Fail "  - 分页结构" "缺少 list 或 pagination 字段"
            }
        } else {
            Write-Fail "GET /api/products (列表)" "API 返回 success=false"
        }
    } else {
        Write-Fail "GET /api/products (列表)" "HTTP 状态码：$($response.StatusCode)"
    }
} catch {
    Write-Fail "GET /api/products (列表)" $_.Exception.Message
}

# ============================================
# 测试 5: 图片资源访问
# ============================================
Write-TestHeader "测试 5: 图片资源访问测试"

$imageTests = @(
    "/images/logo/logo.png",
    "/images/banners/banner-1.jpg",
    "/images/banners/banner-2.jpg",
    "/images/banners/banner-3.jpg"
)

foreach ($imagePath in $imageTests) {
    try {
        $response = Invoke-WebRequest -Uri "$apiBaseUrl$imagePath" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Pass "图片$($imagePath)" "文件大小：$([math]::Round($response.Content.Length / 1KB, 2)) KB"
        } elseif ($response.StatusCode -eq 404) {
            Write-Skip "图片$($imagePath)" "文件不存在 (占位符)"
        } else {
            Write-Fail "图片$($imagePath)" "HTTP 状态码：$($response.StatusCode)"
        }
    } catch {
        Write-Fail "图片$($imagePath)" $_.Exception.Message
    }
}

# 测试图片目录结构
Write-Host "`n  检查图片目录结构..." -ForegroundColor Gray
$imageDirs = @("products", "news", "banners", "team", "logo")
$basePath = "D:\codes\aicode\win-web\TASK-001\backend\public\images"
foreach ($dir in $imageDirs) {
    $fullPath = Join-Path $basePath $dir
    if (Test-Path $fullPath) {
        Write-Pass "  图片目录：$dir" "存在"
    } else {
        Write-Fail "  图片目录：$dir" "不存在"
    }
}

# ============================================
# 测试 6: 数据库连接测试
# ============================================
Write-TestHeader "测试 6: 数据库连接测试"

try {
    # 通过 API 间接测试数据库连接
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/stats" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $body = $response.Content | ConvertFrom-Json
        if ($body.success -eq $true -and $body.data -ne $null) {
            Write-Pass "数据库连接" "成功读取 company_stats 表"
            Write-Pass "  - 数据完整性" "返回 $($body.data.Count) 条记录"
        } else {
            Write-Fail "数据库连接" "API 返回 success=false 或 data=null"
        }
    } else {
        Write-Fail "数据库连接" "HTTP 状态码：$($response.StatusCode)"
    }
} catch {
    Write-Fail "数据库连接" $_.Exception.Message
}

# ============================================
# 测试 7: API 响应格式验证
# ============================================
Write-TestHeader "测试 7: API 响应格式验证"

try {
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/features" -UseBasicParsing -TimeoutSec 10
    $body = $response.Content | ConvertFrom-Json
    
    # 检查必需字段
    $requiredFields = @("success", "data", "timestamp")
    $missingFields = @()
    foreach ($field in $requiredFields) {
        if (-not $body.PSObject.Properties.Name -contains $field) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -eq 0) {
        Write-Pass "API 响应格式" "包含所有必需字段 (success, data, timestamp)"
    } else {
        Write-Fail "API 响应格式" "缺少字段：$($missingFields -join ', ')"
    }
    
    # 检查数据结构
    if ($body.data -is [array] -and $body.data.Count -gt 0) {
        $firstItem = $body.data[0]
        $itemFields = @("id", "title", "description", "icon")
        $missingItemFields = @()
        foreach ($field in $itemFields) {
            if (-not $firstItem.PSObject.Properties.Name -contains $field) {
                $missingItemFields += $field
            }
        }
        
        if ($missingItemFields.Count -eq 0) {
            Write-Pass "  - 数据结构" "核心优势包含所有必需字段"
        } else {
            Write-Fail "  - 数据结构" "缺少字段：$($missingItemFields -join ', ')"
        }
    }
} catch {
    Write-Fail "API 响应格式验证" $_.Exception.Message
}

# ============================================
# 测试 8: 前端 API 调用测试
# ============================================
Write-TestHeader "测试 8: 前端 API 调用测试"

try {
    # 检查前端是否配置了正确的 API 地址
    $envFile = "D:\codes\aicode\win-web\TASK-001\frontend\.env"
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile -Encoding UTF8
        $apiUrlLine = $envContent | Where-Object { $_ -match "VITE_API_URL" }
        if ($apiUrlLine -match "VITE_API_URL=http://localhost:3000/api") {
            Write-Pass "前端 API 配置" "VITE_API_URL 配置正确"
        } else {
            Write-Fail "前端 API 配置" "VITE_API_URL 配置不正确：$apiUrlLine"
        }
    } else {
        Write-Fail "前端 API 配置" ".env 文件不存在"
    }
} catch {
    Write-Fail "前端 API 配置" $_.Exception.Message
}

# ============================================
# 测试 9: 代码文件完整性
# ============================================
Write-TestHeader "测试 9: 代码文件完整性"

$requiredFiles = @(
    "backend/controllers/public-data.js",
    "backend/controllers/news.js",
    "backend/controllers/products.js",
    "backend/routes/public-data.js",
    "frontend/src/api/public.ts",
    "frontend/src/pages/Home/index.tsx"
)

foreach ($file in $requiredFiles) {
    $fullPath = Join-Path "D:\codes\aicode\win-web\TASK-001" $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Pass "文件：$file" "存在 ($([math]::Round($size / 1KB, 2)) KB)"
    } else {
        Write-Fail "文件：$file" "不存在"
    }
}

# ============================================
# 测试 10: 文档完整性
# ============================================
Write-TestHeader "测试 10: 文档完整性"

$docFiles = @(
    "DEVELOPMENT-PLAN.md",
    "DEVELOPMENT-PROGRESS.md",
    "backend/database/schema.md",
    "backend/public/images/README.md"
)

foreach ($doc in $docFiles) {
    $fullPath = Join-Path "D:\codes\aicode\win-web\TASK-001" $doc
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Pass "文档：$doc" "存在 ($([math]::Round($size / 1KB, 2)) KB)"
    } else {
        Write-Fail "文档：$doc" "不存在"
    }
}

# ============================================
# 生成测试报告
# ============================================
$testEndTime = Get-Date
$testDuration = New-TimeSpan -Start $testStartTime -End $testEndTime

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skipCount = ($testResults | Where-Object { $_.Status -eq "SKIP" }).Count
$totalCount = $testResults.Count

$passRate = if ($totalCount -gt 0) { [math]::Round(($passCount / $totalCount) * 100, 2) } else { 0 }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  测试报告总结" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试总数量：$totalCount" -ForegroundColor White
Write-Host "  ✅ 通过：$passCount" -ForegroundColor Green
Write-Host "  ❌ 失败：$failCount" -ForegroundColor Red
Write-Host "  ⏭️  跳过：$skipCount" -ForegroundColor DarkGray
Write-Host "通过率：$($passRate)%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })
Write-Host "测试耗时：$($testDuration.TotalSeconds) 秒" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

# 详细测试结果
if ($failCount -gt 0) {
    Write-Host "❌ 失败的测试项:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Details)" -ForegroundColor Red
    }
}

if ($skipCount -gt 0) {
    Write-Host "`n⏭️  跳过的测试项:" -ForegroundColor DarkGray
    $testResults | Where-Object { $_.Status -eq "SKIP" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Details)" -ForegroundColor DarkGray
    }
}

# 保存测试报告到文件
$reportPath = "D:\codes\aicode\win-web\TASK-001\tests\TEST-REPORT-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n📄 测试报告已保存：$reportPath" -ForegroundColor Cyan

# 返回结果供后续处理
$testResults | ConvertTo-Json -Depth 10
