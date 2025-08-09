# PowerShell script to fix remaining property inconsistencies

Write-Host "Fixing remaining property inconsistencies..." -ForegroundColor Green

# Define specific fixes for inconsistencies found in the generated files
$specificFixes = @(
    # Fix virtual property references that still use French names
    @{old='this\.nomComplet'; new='this.fullName'},
    @{old='this\.telephone'; new='this.phone'},
    @{old='this\.poste'; new='this.position'},
    @{old='this\.nom'; new='this.name'},
    @{old='this\.groupeId'; new='this.groupId'},
    @{old='this\.groupe'; new='this.group'},
    @{old='this\.fournisseurId'; new='this.supplierId'},
    @{old='contact\.estPrincipal'; new='contact.isPrincipal'},
    @{old='updateDto\.estPrincipal'; new='updateDto.isPrincipal'},
    @{old='contact\.estPrincipal'; new='contact.isPrincipal'},
    @{old='!contact\.estPrincipal'; new='!contact.isPrincipal'},
    @{old='site\.isPrincipal'; new='site.isPrincipal'},
    @{old='site\.nom'; new='site.name'},
    @{old='platform\.nom'; new='platform.name'},
    
    # Fix incorrect index references
    @{old="@Index\(\['fournisseurId', 'estPrincipal'\]"; new="@Index(['supplierId', 'isPrincipal']"},
    @{old="@Index\(\['platformId', 'estPrincipal'\]"; new="@Index(['platformId', 'isPrincipal']"},
    
    # Fix remaining relationship property names
    @{old='demande\.requestingStationId'; new='demande.requestingStation'},
    @{old='demande\.sourceStationId'; new='demande.sourceStation'},
    
    # Fix enum references that are still in French
    @{old='estPrincipal: true'; new='isPrincipal: true'},
    @{old='estPrincipal: false'; new='isPrincipal: false'},
    @{old="'estPrincipal', \{ isPrincipal: true \}"; new="'isPrincipal', { isPrincipal: true }"},
    
    # Fix import path inconsistencies
    @{old='Supplier-contact\.entity'; new='supplier-contact.entity'},
    @{old='Supplier-site\.entity'; new='supplier-site.entity'},
    @{old='Supplier\.entity'; new='supplier.entity'},
    @{old='Product-Supplier\.entity'; new='product-supplier.entity'},
    @{old='Order-Product\.entity'; new='order-product.entity'}
)

# Apply fixes to all TypeScript files
Write-Host "`nApplying specific fixes..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Include "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($fix in $specificFixes) {
        if ($content -match $fix.old) {
            $content = $content -replace $fix.old, $fix.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Fixed: $($file.Name)" -ForegroundColor Cyan
    }
}

# Fix specific problematic references in interfaces
Write-Host "`nUpdating interface implementations..." -ForegroundColor Yellow

$interfaceFile = "src\common\interfaces\business-contact.interface.ts"
if (Test-Path $interfaceFile) {
    $content = Get-Content $interfaceFile -Raw
    
    $interfaceUpdates = @(
        @{old='nomComplet:'; new='fullName:'},
        @{old='poste\?:'; new='position?:'},
        @{old='telephone\?:'; new='phone?:'},
        @{old='estPrincipal:'; new='isPrincipal:'}
    )
    
    $changed = $false
    foreach ($update in $interfaceUpdates) {
        if ($content -match $update.old) {
            $content = $content -replace $update.old, $update.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $interfaceFile -Value $content -NoNewline
        Write-Host "  Updated: business-contact.interface.ts" -ForegroundColor Cyan
    }
}

Write-Host "`nProperty inconsistency fixes complete!" -ForegroundColor Green