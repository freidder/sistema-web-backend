$base = 'http://localhost:5000'

function Try-Invoke($Method, $Path, $Body=$null, $Token=$null) {
    $uri = "$base$Path"
    $params = @{ Method = $Method; Uri = $uri; ContentType = 'application/json' }
    if ($Body -ne $null) { $params.Body = ($Body | ConvertTo-Json -Depth 5) }
    if ($Token) { $params.Headers = @{ Authorization = "Bearer $Token" } }

    try {
        $resp = Invoke-RestMethod @params
        Write-Output "[OK] $Method $Path -> `n$($resp | ConvertTo-Json -Depth 5)`n"
        return @{ ok = $true; resp = $resp }
    } catch {
        $e = $_.Exception
        if ($e.Response) {
            $sr = New-Object System.IO.StreamReader($e.Response.GetResponseStream())
            $txt = $sr.ReadToEnd()
            Write-Output "[ERR] $Method $Path -> $txt`n"
            return @{ ok = $false; error = $txt }
        } else {
            Write-Output "[ERR] $Method $Path -> $($e.Message)`n"
            return @{ ok = $false; error = $e.Message }
        }
    }
}

Write-Output "Starting automated API tests against $base`n"

# 1) Health check
Try-Invoke -Method Get -Path '/'

# 2) Register invalid user (expect validation errors)
$bad = @{ name='T'; email='not-an-email'; password='123' }
Try-Invoke -Method Post -Path '/api/auth/register' -Body $bad

# 3) Register admin
$admin = @{ name='Admin Test'; email='admin.test@example.com'; password='Pass123!'; role='admin' }
Try-Invoke -Method Post -Path '/api/auth/register' -Body $admin

# 4) Login admin
$login = @{ email='admin.test@example.com'; password='Pass123!' }
$r = Try-Invoke -Method Post -Path '/api/auth/login' -Body $login
$adminToken = $null
if ($r.ok -and $r.resp.token) { $adminToken = $r.resp.token }

# 5) Create project valid
$proj = @{ client='Cliente Auto'; address='Calle 1'; sidingType='Vinyl'; area=100; price=2500; status='pending'; startDate=(Get-Date).ToString('o'); notes='Test' }
$create = Try-Invoke -Method Post -Path '/api/projects' -Body $proj -Token $adminToken
$projectId = $null
if ($create.ok -and $create.resp._id) { $projectId = $create.resp._id }

# 6) Create project invalid (area negative)
$badproj = @{ client='Cliente Bad'; address='Calle 2'; sidingType='Wood'; area=-5; price=100 }
Try-Invoke -Method Post -Path '/api/projects' -Body $badproj -Token $adminToken

# 7) Register employee and login
$emp = @{ name='Emp Test'; email='emp.test@example.com'; password='Pass123!'; role='employee' }
Try-Invoke -Method Post -Path '/api/auth/register' -Body $emp
$r2 = Try-Invoke -Method Post -Path '/api/auth/login' -Body @{ email='emp.test@example.com'; password='Pass123!' }
$empToken = $null
if ($r2.ok -and $r2.resp.token) { $empToken = $r2.resp.token }

# 8) Employee tries to change status -> expect forbidden
if ($projectId) { Try-Invoke -Method Put -Path ("/api/projects/$projectId") -Body @{ status='finished' } -Token $empToken }

# 9) Register supervisor and login, change status
$sup = @{ name='Sup Test'; email='sup.test@example.com'; password='Pass123!'; role='supervisor' }
Try-Invoke -Method Post -Path '/api/auth/register' -Body $sup
$r3 = Try-Invoke -Method Post -Path '/api/auth/login' -Body @{ email='sup.test@example.com'; password='Pass123!' }
$supToken = $null
if ($r3.ok -and $r3.resp.token) { $supToken = $r3.resp.token }
if ($projectId) { Try-Invoke -Method Put -Path ("/api/projects/$projectId") -Body @{ status='in_progress' } -Token $supToken }

# 10) Employee tries to delete project -> expect forbidden
if ($projectId) { Try-Invoke -Method Delete -Path ("/api/projects/$projectId") -Token $empToken }

# 11) Admin deletes project
if ($projectId) { Try-Invoke -Method Delete -Path ("/api/projects/$projectId") -Token $adminToken }

# 12) List projects
Try-Invoke -Method Get -Path '/api/projects' -Token $adminToken

Write-Output "Automated tests finished.`n"
