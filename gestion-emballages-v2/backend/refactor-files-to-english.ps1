# PowerShell script to rename files and update class names to English

Write-Host "Starting file and class name refactoring..." -ForegroundColor Green

# Define all file renames
$fileRenames = @(
    # Products module (formerly articles)
    @{old="src\modules\products\articles.controller.ts"; new="src\modules\products\products.controller.ts"},
    @{old="src\modules\products\articles.module.ts"; new="src\modules\products\products.module.ts"},
    @{old="src\modules\products\articles.service.ts"; new="src\modules\products\products.service.ts"},
    @{old="src\modules\products\dto\create-article.dto.ts"; new="src\modules\products\dto\create-product.dto.ts"},
    @{old="src\modules\products\dto\update-article.dto.ts"; new="src\modules\products\dto\update-product.dto.ts"},
    @{old="src\modules\products\dto\create-article-fournisseur.dto.ts"; new="src\modules\products\dto\create-product-supplier.dto.ts"},
    @{old="src\modules\products\entities\article.entity.ts"; new="src\modules\products\entities\product.entity.ts"},
    @{old="src\modules\products\entities\article-fournisseur.entity.ts"; new="src\modules\products\entities\product-supplier.entity.ts"},
    
    # Orders module (formerly commandes)
    @{old="src\modules\orders\commandes.controller.ts"; new="src\modules\orders\orders.controller.ts"},
    @{old="src\modules\orders\commandes.module.ts"; new="src\modules\orders\orders.module.ts"},
    @{old="src\modules\orders\commandes.service.ts"; new="src\modules\orders\orders.service.ts"},
    @{old="src\modules\orders\dto\create-commande.dto.ts"; new="src\modules\orders\dto\create-order.dto.ts"},
    @{old="src\modules\orders\dto\update-commande.dto.ts"; new="src\modules\orders\dto\update-order.dto.ts"},
    @{old="src\modules\orders\dto\create-commande-globale.dto.ts"; new="src\modules\orders\dto\create-global-order.dto.ts"},
    @{old="src\modules\orders\dto\update-commande-globale.dto.ts"; new="src\modules\orders\dto\update-global-order.dto.ts"},
    @{old="src\modules\orders\entities\commande.entity.ts"; new="src\modules\orders\entities\order.entity.ts"},
    @{old="src\modules\orders\entities\commande-article.entity.ts"; new="src\modules\orders\entities\order-product.entity.ts"},
    @{old="src\modules\orders\entities\commande-globale.entity.ts"; new="src\modules\orders\entities\global-order.entity.ts"},
    
    # Suppliers module (formerly fournisseurs)
    @{old="src\modules\suppliers\fournisseurs.controller.ts"; new="src\modules\suppliers\suppliers.controller.ts"},
    @{old="src\modules\suppliers\fournisseurs.module.ts"; new="src\modules\suppliers\suppliers.module.ts"},
    @{old="src\modules\suppliers\fournisseurs.service.ts"; new="src\modules\suppliers\suppliers.service.ts"},
    @{old="src\modules\suppliers\fournisseur-contacts.controller.ts"; new="src\modules\suppliers\supplier-contacts.controller.ts"},
    @{old="src\modules\suppliers\fournisseur-contacts.service.ts"; new="src\modules\suppliers\supplier-contacts.service.ts"},
    @{old="src\modules\suppliers\dto\create-fournisseur.dto.ts"; new="src\modules\suppliers\dto\create-supplier.dto.ts"},
    @{old="src\modules\suppliers\dto\update-fournisseur.dto.ts"; new="src\modules\suppliers\dto\update-supplier.dto.ts"},
    @{old="src\modules\suppliers\dto\create-fournisseur-contact.dto.ts"; new="src\modules\suppliers\dto\create-supplier-contact.dto.ts"},
    @{old="src\modules\suppliers\dto\update-fournisseur-contact.dto.ts"; new="src\modules\suppliers\dto\update-supplier-contact.dto.ts"},
    @{old="src\modules\suppliers\entities\fournisseur.entity.ts"; new="src\modules\suppliers\entities\supplier.entity.ts"},
    @{old="src\modules\suppliers\entities\fournisseur-site.entity.ts"; new="src\modules\suppliers\entities\supplier-site.entity.ts"},
    @{old="src\modules\suppliers\entities\fournisseur-contact.entity.ts"; new="src\modules\suppliers\entities\supplier-contact.entity.ts"},
    
    # Shopping carts module (formerly listes-achat)
    @{old="src\modules\shopping-carts\listes-achat.controller.ts"; new="src\modules\shopping-carts\shopping-carts.controller.ts"},
    @{old="src\modules\shopping-carts\listes-achat.module.ts"; new="src\modules\shopping-carts\shopping-carts.module.ts"},
    @{old="src\modules\shopping-carts\listes-achat.service.ts"; new="src\modules\shopping-carts\shopping-carts.service.ts"},
    @{old="src\modules\shopping-carts\dto\create-liste-achat.dto.ts"; new="src\modules\shopping-carts\dto\create-shopping-cart.dto.ts"},
    @{old="src\modules\shopping-carts\dto\update-liste-achat.dto.ts"; new="src\modules\shopping-carts\dto\update-shopping-cart.dto.ts"},
    @{old="src\modules\shopping-carts\entities\liste-achat.entity.ts"; new="src\modules\shopping-carts\entities\shopping-cart.entity.ts"},
    @{old="src\modules\shopping-carts\entities\liste-achat-item.entity.ts"; new="src\modules\shopping-carts\entities\shopping-cart-item.entity.ts"},
    
    # Forecasts module (formerly previsions)
    @{old="src\modules\forecasts\entities\prevision.entity.ts"; new="src\modules\forecasts\entities\forecast.entity.ts"},
    
    # Transfers module (formerly transferts)
    @{old="src\modules\transfers\transferts.controller.ts"; new="src\modules\transfers\transfers.controller.ts"},
    @{old="src\modules\transfers\transferts.module.ts"; new="src\modules\transfers\transfers.module.ts"},
    @{old="src\modules\transfers\transferts.service.ts"; new="src\modules\transfers\transfers.service.ts"},
    @{old="src\modules\transfers\dto\create-demande-transfert.dto.ts"; new="src\modules\transfers\dto\create-transfer-request.dto.ts"},
    @{old="src\modules\transfers\dto\update-demande-transfert.dto.ts"; new="src\modules\transfers\dto\update-transfer-request.dto.ts"},
    @{old="src\modules\transfers\entities\demande-transfert.entity.ts"; new="src\modules\transfers\entities\transfer-request.entity.ts"},
    @{old="src\modules\transfers\entities\demande-transfert-article.entity.ts"; new="src\modules\transfers\entities\transfer-request-product.entity.ts"},
    
    # Stocks module
    @{old="src\modules\stocks\dto\create-stock-fournisseur.dto.ts"; new="src\modules\stocks\dto\create-stock-supplier.dto.ts"},
    @{old="src\modules\stocks\dto\update-stock-fournisseur.dto.ts"; new="src\modules\stocks\dto\update-stock-supplier.dto.ts"},
    @{old="src\modules\stocks\entities\stock-fournisseur.entity.ts"; new="src\modules\stocks\entities\stock-supplier.entity.ts"}
)

# Step 1: Rename files
Write-Host "`nStep 1: Renaming files..." -ForegroundColor Yellow
foreach ($rename in $fileRenames) {
    if (Test-Path $rename.old) {
        Move-Item -Path $rename.old -Destination $rename.new -Force
        Write-Host "  Renamed: $(Split-Path $rename.old -Leaf) -> $(Split-Path $rename.new -Leaf)" -ForegroundColor Cyan
    }
}

# Step 2: Update class names and references in all files
Write-Host "`nStep 2: Updating class names and references..." -ForegroundColor Yellow

$classReplacements = @(
    # Products/Articles
    @{old="Article"; new="Product"},
    @{old="ArticlesController"; new="ProductsController"},
    @{old="ArticlesService"; new="ProductsService"},
    @{old="ArticlesModule"; new="ProductsModule"},
    @{old="ArticleFournisseur"; new="ProductSupplier"},
    @{old="CreateArticleDto"; new="CreateProductDto"},
    @{old="UpdateArticleDto"; new="UpdateProductDto"},
    @{old="CreateArticleFournisseurDto"; new="CreateProductSupplierDto"},
    @{old="article-fournisseur"; new="product-supplier"},
    @{old="article.entity"; new="product.entity"},
    @{old="articles.controller"; new="products.controller"},
    @{old="articles.service"; new="products.service"},
    @{old="articles.module"; new="products.module"},
    
    # Orders/Commandes
    @{old="Commande"; new="Order"},
    @{old="CommandesController"; new="OrdersController"},
    @{old="CommandesService"; new="OrdersService"},
    @{old="CommandesModule"; new="OrdersModule"},
    @{old="CommandeGlobale"; new="GlobalOrder"},
    @{old="CommandeArticle"; new="OrderProduct"},
    @{old="CreateCommandeDto"; new="CreateOrderDto"},
    @{old="UpdateCommandeDto"; new="UpdateOrderDto"},
    @{old="CreateCommandeGlobaleDto"; new="CreateGlobalOrderDto"},
    @{old="UpdateCommandeGlobaleDto"; new="UpdateGlobalOrderDto"},
    @{old="commande-article"; new="order-product"},
    @{old="commande-globale"; new="global-order"},
    @{old="commande.entity"; new="order.entity"},
    @{old="commandes.controller"; new="orders.controller"},
    @{old="commandes.service"; new="orders.service"},
    @{old="commandes.module"; new="orders.module"},
    
    # Suppliers/Fournisseurs
    @{old="Fournisseur"; new="Supplier"},
    @{old="FournisseursController"; new="SuppliersController"},
    @{old="FournisseursService"; new="SuppliersService"},
    @{old="FournisseursModule"; new="SuppliersModule"},
    @{old="FournisseurSite"; new="SupplierSite"},
    @{old="FournisseurContact"; new="SupplierContact"},
    @{old="FournisseurContactsController"; new="SupplierContactsController"},
    @{old="FournisseurContactsService"; new="SupplierContactsService"},
    @{old="CreateFournisseurDto"; new="CreateSupplierDto"},
    @{old="UpdateFournisseurDto"; new="UpdateSupplierDto"},
    @{old="CreateFournisseurContactDto"; new="CreateSupplierContactDto"},
    @{old="UpdateFournisseurContactDto"; new="UpdateSupplierContactDto"},
    @{old="fournisseur-site"; new="supplier-site"},
    @{old="fournisseur-contact"; new="supplier-contact"},
    @{old="fournisseur.entity"; new="supplier.entity"},
    @{old="fournisseurs.controller"; new="suppliers.controller"},
    @{old="fournisseurs.service"; new="suppliers.service"},
    @{old="fournisseurs.module"; new="suppliers.module"},
    @{old="fournisseur-contacts"; new="supplier-contacts"},
    
    # Shopping Carts/Listes Achat
    @{old="ListeAchat"; new="ShoppingCart"},
    @{old="ListesAchatController"; new="ShoppingCartsController"},
    @{old="ListesAchatService"; new="ShoppingCartsService"},
    @{old="ListesAchatModule"; new="ShoppingCartsModule"},
    @{old="ListeAchatItem"; new="ShoppingCartItem"},
    @{old="CreateListeAchatDto"; new="CreateShoppingCartDto"},
    @{old="UpdateListeAchatDto"; new="UpdateShoppingCartDto"},
    @{old="liste-achat-item"; new="shopping-cart-item"},
    @{old="liste-achat.entity"; new="shopping-cart.entity"},
    @{old="listes-achat.controller"; new="shopping-carts.controller"},
    @{old="listes-achat.service"; new="shopping-carts.service"},
    @{old="listes-achat.module"; new="shopping-carts.module"},
    
    # Forecasts/Previsions
    @{old="Prevision"; new="Forecast"},
    @{old="prevision.entity"; new="forecast.entity"},
    
    # Transfers/Transferts
    @{old="DemandeTransfert"; new="TransferRequest"},
    @{old="TransfertsController"; new="TransfersController"},
    @{old="TransfertsService"; new="TransfersService"},
    @{old="TransfertsModule"; new="TransfersModule"},
    @{old="DemandeTransfertArticle"; new="TransferRequestProduct"},
    @{old="CreateDemandeTransfertDto"; new="CreateTransferRequestDto"},
    @{old="UpdateDemandeTransfertDto"; new="UpdateTransferRequestDto"},
    @{old="demande-transfert-article"; new="transfer-request-product"},
    @{old="demande-transfert.entity"; new="transfer-request.entity"},
    @{old="transferts.controller"; new="transfers.controller"},
    @{old="transferts.service"; new="transfers.service"},
    @{old="transferts.module"; new="transfers.module"},
    
    # Stocks
    @{old="StockFournisseur"; new="StockSupplier"},
    @{old="CreateStockFournisseurDto"; new="CreateStockSupplierDto"},
    @{old="UpdateStockFournisseurDto"; new="UpdateStockSupplierDto"},
    @{old="stock-fournisseur"; new="stock-supplier"}
)

$files = Get-ChildItem -Path "src" -Include "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($replacement in $classReplacements) {
        # Use word boundaries for class names to avoid partial replacements
        $pattern = "\b" + [regex]::Escape($replacement.old) + "\b"
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nFile and class name refactoring complete!" -ForegroundColor Green
Write-Host "`nRemaining manual tasks:" -ForegroundColor Yellow
Write-Host "  1. Update API routes in controllers (@Controller, @Get, etc.)" -ForegroundColor White
Write-Host "  2. Update database table names in @Entity decorators" -ForegroundColor White
Write-Host "  3. Update foreign key column names" -ForegroundColor White
Write-Host "  4. Create and run database migration" -ForegroundColor White