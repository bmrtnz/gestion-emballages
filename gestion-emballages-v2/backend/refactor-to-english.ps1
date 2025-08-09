# PowerShell script to refactor French module names to English

Write-Host "Starting refactoring process..." -ForegroundColor Green

# Step 1: Rename directories
Write-Host "`nStep 1: Renaming directories..." -ForegroundColor Yellow

$renames = @(
    @{old="src\modules\articles"; new="src\modules\products"},
    @{old="src\modules\commandes"; new="src\modules\orders"},
    @{old="src\modules\fournisseurs"; new="src\modules\suppliers"},
    @{old="src\modules\listes-achat"; new="src\modules\shopping-carts"},
    @{old="src\modules\previsions"; new="src\modules\forecasts"},
    @{old="src\modules\transferts"; new="src\modules\transfers"}
)

foreach ($rename in $renames) {
    if (Test-Path $rename.old) {
        Move-Item -Path $rename.old -Destination $rename.new -Force
        Write-Host "  Renamed: $($rename.old) -> $($rename.new)" -ForegroundColor Cyan
    }
}

# Step 2: Update imports and references in all TypeScript files
Write-Host "`nStep 2: Updating imports and references..." -ForegroundColor Yellow

$replacements = @(
    @{old="@modules/articles"; new="@modules/products"},
    @{old="@modules/commandes"; new="@modules/orders"},
    @{old="@modules/fournisseurs"; new="@modules/suppliers"},
    @{old="@modules/listes-achat"; new="@modules/shopping-carts"},
    @{old="@modules/previsions"; new="@modules/forecasts"},
    @{old="@modules/transferts"; new="@modules/transfers"},
    @{old="from './articles"; new="from './products"},
    @{old="from './commandes"; new="from './orders"},
    @{old="from './fournisseurs"; new="from './suppliers"},
    @{old="from './listes-achat"; new="from './shopping-carts"},
    @{old="from './previsions"; new="from './forecasts"},
    @{old="from './transferts"; new="from './transfers"},
    @{old="from '../articles"; new="from '../products"},
    @{old="from '../commandes"; new="from '../orders"},
    @{old="from '../fournisseurs"; new="from '../suppliers"},
    @{old="from '../listes-achat"; new="from '../shopping-carts"},
    @{old="from '../previsions"; new="from '../forecasts"},
    @{old="from '../transferts"; new="from '../transfers"}
)

$files = Get-ChildItem -Path "src" -Include "*.ts","*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($replacement in $replacements) {
        if ($content -match [regex]::Escape($replacement.old)) {
            $content = $content -replace [regex]::Escape($replacement.old), $replacement.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nRefactoring complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update entity names and class names manually" -ForegroundColor White
Write-Host "  2. Update database table names via migration" -ForegroundColor White
Write-Host "  3. Update API routes in controllers" -ForegroundColor White
Write-Host "  4. Test all modules" -ForegroundColor White