# PowerShell script to fix remaining refactoring issues

Write-Host "Fixing remaining refactoring issues..." -ForegroundColor Green

# Step 1: Fix API routes and tags in controllers
Write-Host "`nStep 1: Updating API routes and tags..." -ForegroundColor Yellow

$controllerRoutes = @(
    @{file="src\modules\orders\orders.controller.ts"; oldRoute="commandes"; newRoute="orders"; oldTag="Commandes"; newTag="Orders"},
    @{file="src\modules\suppliers\suppliers.controller.ts"; oldRoute="fournisseurs"; newRoute="suppliers"; oldTag="Fournisseurs"; newTag="Suppliers"},
    @{file="src\modules\suppliers\supplier-contacts.controller.ts"; oldRoute="fournisseurs"; newRoute="suppliers"; oldTag="Fournisseur Contacts"; newTag="Supplier Contacts"},
    @{file="src\modules\shopping-carts\shopping-carts.controller.ts"; oldRoute="listes-achat"; newRoute="shopping-carts"; oldTag="Listes d'achat"; newTag="Shopping Carts"},
    @{file="src\modules\transfers\transfers.controller.ts"; oldRoute="transferts"; newRoute="transfers"; oldTag="Transferts"; newTag="Transfers"}
)

foreach ($route in $controllerRoutes) {
    if (Test-Path $route.file) {
        $content = Get-Content $route.file -Raw
        
        # Update @Controller route
        $content = $content -replace "@Controller\('$($route.oldRoute)'\)", "@Controller('$($route.newRoute)')"
        
        # Update @ApiTags
        $content = $content -replace "@ApiTags\('$($route.oldTag)'\)", "@ApiTags('$($route.newTag)')"
        
        Set-Content -Path $route.file -Value $content -NoNewline
        Write-Host "  Updated routes in: $(Split-Path $route.file -Leaf)" -ForegroundColor Cyan
    }
}

# Step 2: Fix import paths that have incorrect casing
Write-Host "`nStep 2: Fixing import paths..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Include "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    # Fix common import path issues
    $fixes = @(
        @{old="create-Product\.dto"; new="create-product.dto"},
        @{old="update-Product\.dto"; new="update-product.dto"},
        @{old="create-Product-Supplier\.dto"; new="create-product-supplier.dto"},
        @{old="Order\.entity"; new="order.entity"},
        @{old="Order-globale\.entity"; new="global-order.entity"},
        @{old="Forecast\.entity"; new="forecast.entity"}
    )
    
    foreach ($fix in $fixes) {
        if ($content -match $fix.old) {
            $content = $content -replace $fix.old, $fix.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Fixed imports in: $($file.Name)" -ForegroundColor Gray
    }
}

# Step 3: Update database table names in entity decorators
Write-Host "`nStep 3: Updating database table names..." -ForegroundColor Yellow

$tableUpdates = @(
    @{file="src\modules\products\entities\product.entity.ts"; oldTable="articles"; newTable="products"},
    @{file="src\modules\products\entities\product-supplier.entity.ts"; oldTable="articles_fournisseurs"; newTable="products_suppliers"},
    @{file="src\modules\orders\entities\order.entity.ts"; oldTable="commandes"; newTable="orders"},
    @{file="src\modules\orders\entities\order-product.entity.ts"; oldTable="commandes_articles"; newTable="orders_products"},
    @{file="src\modules\orders\entities\global-order.entity.ts"; oldTable="commandes_globales"; newTable="global_orders"},
    @{file="src\modules\suppliers\entities\supplier.entity.ts"; oldTable="fournisseurs"; newTable="suppliers"},
    @{file="src\modules\suppliers\entities\supplier-site.entity.ts"; oldTable="fournisseurs_sites"; newTable="supplier_sites"},
    @{file="src\modules\suppliers\entities\supplier-contact.entity.ts"; oldTable="fournisseur_contacts"; newTable="supplier_contacts"},
    @{file="src\modules\shopping-carts\entities\shopping-cart.entity.ts"; oldTable="listes_achat"; newTable="shopping_carts"},
    @{file="src\modules\shopping-carts\entities\shopping-cart-item.entity.ts"; oldTable="listes_achat_items"; newTable="shopping_cart_items"},
    @{file="src\modules\forecasts\entities\forecast.entity.ts"; oldTable="previsions"; newTable="forecasts"},
    @{file="src\modules\transfers\entities\transfer-request.entity.ts"; oldTable="demandes_transfert"; newTable="transfer_requests"},
    @{file="src\modules\transfers\entities\transfer-request-product.entity.ts"; oldTable="demandes_transfert_articles"; newTable="transfer_request_products"},
    @{file="src\modules\stocks\entities\stock-supplier.entity.ts"; oldTable="stocks_fournisseurs"; newTable="stocks_suppliers"}
)

foreach ($update in $tableUpdates) {
    if (Test-Path $update.file) {
        $content = Get-Content $update.file -Raw
        
        # Update @Entity decorator
        if ($content -match "@Entity\('$($update.oldTable)'\)") {
            $content = $content -replace "@Entity\('$($update.oldTable)'\)", "@Entity('$($update.newTable)')"
            Set-Content -Path $update.file -Value $content -NoNewline
            Write-Host "  Updated table name in: $(Split-Path $update.file -Leaf)" -ForegroundColor Cyan
        }
    }
}

# Step 4: Update column names for foreign keys
Write-Host "`nStep 4: Updating foreign key column names..." -ForegroundColor Yellow

$columnUpdates = @(
    @{pattern="article_id"; replacement="product_id"},
    @{pattern="fournisseur_id"; replacement="supplier_id"},
    @{pattern="commande_id"; replacement="order_id"},
    @{pattern="liste_achat_id"; replacement="shopping_cart_id"}
)

$entityFiles = Get-ChildItem -Path "src\modules" -Include "*entity.ts" -Recurse

foreach ($file in $entityFiles) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($update in $columnUpdates) {
        if ($content -match $update.pattern) {
            $content = $content -replace $update.pattern, $update.replacement
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated foreign key columns in: $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nAll refactoring issues fixed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Create database migration for table renames" -ForegroundColor White
Write-Host "  2. Test the application" -ForegroundColor White
Write-Host "  3. Update any remaining frontend references" -ForegroundColor White