# PowerShell script to refactor French properties to English

Write-Host "Starting property refactoring from French to English..." -ForegroundColor Green

# Define property mappings
$propertyMappings = @(
    # Global common properties
    @{old='nom:'; new='name:'},
    @{old='nom\?'; new='name?'},
    @{old='nom '; new='name '},
    @{old='adresse:'; new='address:'},
    @{old='adresse\?'; new='address?'},
    @{old='rue\?'; new='street?'},
    @{old='ville\?'; new='city?'},
    @{old='codePostal\?'; new='postalCode?'},
    @{old='pays\?'; new='country?'},
    @{old='telephone\?'; new='phone?'},
    @{old='telephone:'; new='phone:'},
    
    # Contact properties
    @{old='nomComplet:'; new='fullName:'},
    @{old='nomComplet\?'; new='fullName?'},
    @{old='nomComplet '; new='fullName '},
    @{old='poste\?'; new='position?'},
    @{old='poste:'; new='position:'},
    @{old='estPrincipal:'; new='isPrincipal:'},
    @{old='estPrincipal\?'; new='isPrincipal?'},
    @{old='estPrincipal '; new='isPrincipal '},
    
    # Supplier properties
    @{old='specialites:'; new='specialties:'},
    @{old='specialites\?'; new='specialties?'},
    @{old='fournisseurId:'; new='supplierId:'},
    @{old='fournisseurId\?'; new='supplierId?'},
    @{old='fournisseurId '; new='supplierId '},
    
    # Station properties
    @{old='identifiantInterne\?'; new='internalId?'},
    @{old='identifiantInterne:'; new='internalId:'},
    @{old='groupeId\?'; new='groupId?'},
    @{old='groupeId:'; new='groupId:'},
    @{old='contactPrincipal:'; new='mainContact:'},
    @{old='contactPrincipal\?'; new='mainContact?'},
    
    # Order properties
    @{old='numeroCommande:'; new='orderNumber:'},
    @{old='numeroCommande\?'; new='orderNumber?'},
    @{old='commandeGlobaleId\?'; new='globalOrderId?'},
    @{old='commandeGlobaleId:'; new='globalOrderId:'},
    @{old='statut:'; new='status:'},
    @{old='statut\?'; new='status?'},
    @{old='montantTotalHt:'; new='totalAmountExcludingTax:'},
    @{old='montantTotalHt\?'; new='totalAmountExcludingTax?'},
    @{old='dateLivraisonPrevue\?'; new='expectedDeliveryDate?'},
    @{old='dateLivraisonPrevue:'; new='expectedDeliveryDate:'},
    @{old='dateLivraisonReelle\?'; new='actualDeliveryDate?'},
    @{old='dateLivraisonReelle:'; new='actualDeliveryDate:'},
    @{old='dateCommande\?'; new='orderDate?'},
    @{old='dateCommande:'; new='orderDate:'},
    @{old='commentaires\?'; new='comments?'},
    @{old='commentaires:'; new='comments:'},
    @{old='adresseLivraison\?'; new='deliveryAddress?'},
    @{old='adresseLivraison:'; new='deliveryAddress:'},
    
    # Product properties
    @{old='codeArticle:'; new='productCode:'},
    @{old='codeArticle\?'; new='productCode?'},
    @{old='designation:'; new='description:'},
    @{old='designation\?'; new='description?'},
    @{old='categorie:'; new='category:'},
    @{old='categorie\?'; new='category?'},
    
    # Transfer properties
    @{old='numeroDemandeTransfert:'; new='transferRequestNumber:'},
    @{old='numeroDemandeTransfert\?'; new='transferRequestNumber?'},
    @{old='stationDemandeuse'; new='requestingStationId'},
    @{old='stationSource'; new='sourceStationId'},
    @{old='dateDemande\?'; new='requestDate?'},
    @{old='dateDemande:'; new='requestDate:'},
    @{old='dateTraitement\?'; new='processDate?'},
    @{old='dateTraitement:'; new='processDate:'},
    @{old='quantiteDemandee:'; new='requestedQuantity:'},
    @{old='quantiteDemandee\?'; new='requestedQuantity?'},
    @{old='quantiteApprouvee:'; new='approvedQuantity:'},
    @{old='quantiteApprouvee\?'; new='approvedQuantity?'},
    @{old='quantiteLivree:'; new='deliveredQuantity:'},
    @{old='quantiteLivree\?'; new='deliveredQuantity?'},
    
    # Stock properties
    @{old='quantiteStock:'; new='stockQuantity:'},
    @{old='quantiteStock\?'; new='stockQuantity?'},
    @{old='quantiteReservee:'; new='reservedQuantity:'},
    @{old='quantiteReservee\?'; new='reservedQuantity?'},
    @{old='quantiteMinimale:'; new='minimumQuantity:'},
    @{old='quantiteMinimale\?'; new='minimumQuantity?'},
    @{old='prixUnitaire:'; new='unitPrice:'},
    @{old='prixUnitaire\?'; new='unitPrice?'},
    @{old='dateInventaire\?'; new='inventoryDate?'},
    @{old='dateInventaire:'; new='inventoryDate:'},
    
    # Forecast properties
    @{old='annee:'; new='year:'},
    @{old='annee\?'; new='year?'},
    @{old='semaine:'; new='week:'},
    @{old='semaine\?'; new='week?'},
    @{old='quantitePrevue:'; new='forecastQuantity:'},
    @{old='quantitePrevue\?'; new='forecastQuantity?'},
    @{old='quantiteReelle:'; new='actualQuantity:'},
    @{old='quantiteReelle\?'; new='actualQuantity?'},
    
    # Relationship properties
    @{old='articleFournisseurs:'; new='productSuppliers:'},
    @{old='articleFournisseurs\?'; new='productSuppliers?'},
    @{old='commandes:'; new='orders:'},
    @{old='commandes\?'; new='orders?'},
    @{old='previsions:'; new='forecasts:'},
    @{old='previsions\?'; new='forecasts?'},
    @{old='listesAchat:'; new='shoppingCarts:'},
    @{old='listesAchat\?'; new='shoppingCarts?'},
    @{old='demandesTransfertEmises:'; new='outgoingTransferRequests:'},
    @{old='demandesTransfertEmises\?'; new='outgoingTransferRequests?'},
    @{old='demandesTransfertRecues:'; new='incomingTransferRequests:'},
    @{old='demandesTransfertRecues\?'; new='incomingTransferRequests?'},
    
    # Virtual properties
    @{old='contactPrincipalFromContacts'; new='principalContactFromContacts'},
    @{old='contactsActifs'; new='activeContacts'},
    @{old='nomCompletAvecGroupe'; new='fullNameWithGroup'},
    @{old='hasGroupe'; new='hasGroup'},
    @{old='typeStation'; new='stationType'}
)

# Column name mappings for @Column decorators
$columnMappings = @(
    @{old="name: 'nom_complet'"; new="name: 'full_name'"},
    @{old="name: 'est_principal'"; new="name: 'is_principal'"},
    @{old="name: 'identifiant_interne'"; new="name: 'internal_id'"},
    @{old="name: 'groupe_id'"; new="name: 'group_id'"},
    @{old="name: 'contact_principal'"; new="name: 'main_contact'"},
    @{old="name: 'numero_commande'"; new="name: 'order_number'"},
    @{old="name: 'commande_globale_id'"; new="name: 'global_order_id'"},
    @{old="name: 'supplier_id'"; new="name: 'supplier_id'"},  # Already correct
    @{old="name: 'montant_total_ht'"; new="name: 'total_amount_excluding_tax'"},
    @{old="name: 'date_livraison_prevue'"; new="name: 'expected_delivery_date'"},
    @{old="name: 'date_livraison_reelle'"; new="name: 'actual_delivery_date'"},
    @{old="name: 'date_commande'"; new="name: 'order_date'"},
    @{old="name: 'adresse_livraison'"; new="name: 'delivery_address'"},
    @{old="name: 'code_article'"; new="name: 'product_code'"},
    @{old="name: 'quantite_stock'"; new="name: 'stock_quantity'"},
    @{old="name: 'quantite_reservee'"; new="name: 'reserved_quantity'"},
    @{old="name: 'quantite_minimale'"; new="name: 'minimum_quantity'"},
    @{old="name: 'prix_unitaire'"; new="name: 'unit_price'"},
    @{old="name: 'date_inventaire'"; new="name: 'inventory_date'"},
    @{old="name: 'quantite_prevue'"; new="name: 'forecast_quantity'"},
    @{old="name: 'quantite_reelle'"; new="name: 'actual_quantity'"},
    @{old="name: 'numero_demande_transfert'"; new="name: 'transfer_request_number'"},
    @{old="name: 'station_demandeuse_id'"; new="name: 'requesting_station_id'"},
    @{old="name: 'station_source_id'"; new="name: 'source_station_id'"},
    @{old="name: 'date_demande'"; new="name: 'request_date'"},
    @{old="name: 'date_traitement'"; new="name: 'process_date'"},
    @{old="name: 'quantite_demandee'"; new="name: 'requested_quantity'"},
    @{old="name: 'quantite_approuvee'"; new="name: 'approved_quantity'"},
    @{old="name: 'quantite_livree'"; new="name: 'delivered_quantity'"}
)

# Step 1: Update property names in entity files
Write-Host "`nStep 1: Updating property names in entities..." -ForegroundColor Yellow

$entityFiles = Get-ChildItem -Path "src\modules" -Include "*.entity.ts" -Recurse

foreach ($file in $entityFiles) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($mapping in $propertyMappings) {
        if ($content -match $mapping.old) {
            $content = $content -replace $mapping.old, $mapping.new
            $changed = $true
        }
    }
    
    foreach ($mapping in $columnMappings) {
        if ($content -match [regex]::Escape($mapping.old)) {
            $content = $content -replace [regex]::Escape($mapping.old), $mapping.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Cyan
    }
}

# Step 2: Update DTO files
Write-Host "`nStep 2: Updating DTO files..." -ForegroundColor Yellow

$dtoFiles = Get-ChildItem -Path "src\modules" -Include "*.dto.ts" -Recurse

foreach ($file in $dtoFiles) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($mapping in $propertyMappings) {
        if ($content -match $mapping.old) {
            $content = $content -replace $mapping.old, $mapping.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Cyan
    }
}

# Step 3: Update service files
Write-Host "`nStep 3: Updating service files..." -ForegroundColor Yellow

$serviceFiles = Get-ChildItem -Path "src\modules" -Include "*.service.ts" -Recurse

foreach ($file in $serviceFiles) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($mapping in $propertyMappings) {
        if ($content -match $mapping.old) {
            $content = $content -replace $mapping.old, $mapping.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Cyan
    }
}

# Step 4: Update controller files
Write-Host "`nStep 4: Updating controller files..." -ForegroundColor Yellow

$controllerFiles = Get-ChildItem -Path "src\modules" -Include "*.controller.ts" -Recurse

foreach ($file in $controllerFiles) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($mapping in $propertyMappings) {
        if ($content -match $mapping.old) {
            $content = $content -replace $mapping.old, $mapping.new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Cyan
    }
}

Write-Host "`nProperty refactoring complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Update enum values for OrderStatus, TransferStatus, etc." -ForegroundColor White
Write-Host "  2. Create database migration for column renames" -ForegroundColor White
Write-Host "  3. Update interface definitions" -ForegroundColor White
Write-Host "  4. Test all modules" -ForegroundColor White