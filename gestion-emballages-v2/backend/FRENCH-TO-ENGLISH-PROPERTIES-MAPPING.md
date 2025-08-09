# French to English Properties Mapping

## Global Properties (Common across entities)

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `nom` | `name` | `name` | Entity name |
| `adresse` | `address` | `address` | Address object |
| `rue` | `street` | `street` | Street address |
| `ville` | `city` | `city` | City |
| `codePostal` | `postalCode` | `postal_code` | Postal code |
| `pays` | `country` | `country` | Country |
| `telephone` | `phone` | `phone` | Phone number |
| `email` | `email` | `email` | Email (already English) |
| `isActive` | `isActive` | `is_active` | Active status (already English) |
| `createdById` | `createdById` | `created_by` | Created by user ID (already English) |
| `updatedById` | `updatedById` | `updated_by` | Updated by user ID (already English) |

## Supplier Entity Properties

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `nom` | `name` | `name` | Supplier name |
| `siret` | `siret` | `siret` | SIRET number (French business ID, keep as is) |
| `type` | `type` | `type` | Supplier type (already English) |
| `specialites` | `specialties` | `specialties` | Specialization areas |
| `fournisseurId` | `supplierId` | `supplier_id` | Supplier foreign key |

## Contact Entity Properties (All contact types)

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `nomComplet` | `fullName` | `full_name` | Full contact name |
| `poste` | `position` | `position` | Job position/title |
| `estPrincipal` | `isPrincipal` | `is_principal` | Is principal contact flag |

## Station Entity Properties

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `nom` | `name` | `name` | Station name |
| `identifiantInterne` | `internalId` | `internal_id` | Internal identifier |
| `adresse` | `address` | `address` | Address object |
| `groupeId` | `groupId` | `group_id` | Group foreign key |
| `contactPrincipal` | `mainContact` | `main_contact` | Main contact object (legacy) |

## Order Entity Properties

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `numeroCommande` | `orderNumber` | `order_number` | Order number |
| `commandeGlobaleId` | `globalOrderId` | `global_order_id` | Global order foreign key |
| `stationId` | `stationId` | `station_id` | Station foreign key (already English) |
| `fournisseurId` | `supplierId` | `supplier_id` | Supplier foreign key |
| `platformId` | `platformId` | `platform_id` | Platform foreign key (already English) |
| `statut` | `status` | `status` | Order status |
| `montantTotalHt` | `totalAmountExcludingTax` | `total_amount_excluding_tax` | Total amount excl. tax |
| `dateLivraisonPrevue` | `expectedDeliveryDate` | `expected_delivery_date` | Expected delivery date |
| `dateLivraisonReelle` | `actualDeliveryDate` | `actual_delivery_date` | Actual delivery date |
| `dateCommande` | `orderDate` | `order_date` | Order date |
| `commentaires` | `comments` | `comments` | Comments |
| `adresseLivraison` | `deliveryAddress` | `delivery_address` | Delivery address |

## Product Entity Properties

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `codeArticle` | `productCode` | `product_code` | Product code |
| `designation` | `description` | `description` | Product description |
| `categorie` | `category` | `category` | Product category |

## Shopping Cart Entity Properties

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `stationId` | `stationId` | `station_id` | Station foreign key (already English) |
| `dateCreation` | `creationDate` | `creation_date` | Creation date |
| `statut` | `status` | `status` | Cart status |

## Transfer Request Entity Properties

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `numeroDemandeTransfert` | `transferRequestNumber` | `transfer_request_number` | Transfer request number |
| `stationDemandeuse` | `requestingStation` | `requesting_station_id` | Requesting station |
| `stationSource` | `sourceStation` | `source_station_id` | Source station |
| `dateDemande` | `requestDate` | `request_date` | Request date |
| `dateTraitement` | `processDate` | `process_date` | Processing date |
| `statut` | `status` | `status` | Transfer status |
| `quantiteDemandee` | `requestedQuantity` | `requested_quantity` | Requested quantity |
| `quantiteApprouvee` | `approvedQuantity` | `approved_quantity` | Approved quantity |
| `quantiteLivree` | `deliveredQuantity` | `delivered_quantity` | Delivered quantity |

## Stock Entity Properties

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `quantiteStock` | `stockQuantity` | `stock_quantity` | Stock quantity |
| `quantiteReservee` | `reservedQuantity` | `reserved_quantity` | Reserved quantity |
| `quantiteMinimale` | `minimumQuantity` | `minimum_quantity` | Minimum quantity |
| `prixUnitaire` | `unitPrice` | `unit_price` | Unit price |
| `dateInventaire` | `inventoryDate` | `inventory_date` | Inventory date |

## Forecast Entity Properties

| **French Property** | **English Property** | **Column Name** | **Description** |
|---------------------|---------------------|-----------------|-----------------|
| `annee` | `year` | `year` | Forecast year |
| `semaine` | `week` | `week` | Week number |
| `quantitePrevue` | `forecastQuantity` | `forecast_quantity` | Forecast quantity |
| `quantiteReelle` | `actualQuantity` | `actual_quantity` | Actual quantity |

## Enum Updates Required

### OrderStatus Enum
| **French Value** | **English Value** |
|------------------|-------------------|
| `ENREGISTREE` | `REGISTERED` |
| `CONFIRMEE` | `CONFIRMED` |
| `EXPEDIEE` | `SHIPPED` |
| `RECEPTIONNEE` | `RECEIVED` |
| `CLOTUREE` | `CLOSED` |
| `FACTUREE` | `INVOICED` |
| `ARCHIVEE` | `ARCHIVED` |

### TransferStatus Enum
| **French Value** | **English Value** |
|------------------|-------------------|
| `ENREGISTREE` | `REGISTERED` |
| `CONFIRMEE` | `CONFIRMED` |
| `REJETEE` | `REJECTED` |
| `TRAITEE_LOGISTIQUE` | `LOGISTICS_PROCESSED` |
| `EXPEDIEE` | `SHIPPED` |
| `RECEPTIONNEE` | `RECEIVED` |
| `CLOTUREE` | `CLOSED` |
| `TRAITEE_COMPTABILITE` | `ACCOUNTING_PROCESSED` |
| `ARCHIVEE` | `ARCHIVED` |

### ProductCategory Enum
| **French Value** | **English Value** |
|------------------|-------------------|
| `BARQUETTE` | `TRAY` |
| `CAGETTE` | `CRATE` |
| `PLATEAU` | `PLATTER` |
| `FILM_PLASTIQUE` | `PLASTIC_FILM` |
| `CARTON` | `CARDBOARD` |

## Virtual Properties to Update

| **French Property** | **English Property** | **Description** |
|---------------------|---------------------|-----------------|
| `contactPrincipalFromContacts` | `principalContactFromContacts` | Get principal contact |
| `contactsActifs` | `activeContacts` | Get active contacts |
| `hasContacts` | `hasContacts` | Check if has contacts (already English) |
| `nomCompletAvecGroupe` | `fullNameWithGroup` | Name with group |
| `hasGroupe` | `hasGroup` | Has group flag |
| `typeStation` | `stationType` | Station type |

## Relationship Property Names to Update

| **French Property** | **English Property** | **Description** |
|---------------------|---------------------|-----------------|
| `articleFournisseurs` | `productSuppliers` | Product-supplier relationships |
| `commandes` | `orders` | Orders relationship |
| `previsions` | `forecasts` | Forecasts relationship |
| `listesAchat` | `shoppingCarts` | Shopping carts relationship |
| `demandesTransfertEmises` | `outgoingTransferRequests` | Outgoing transfer requests |
| `demandesTransfertRecues` | `incomingTransferRequests` | Incoming transfer requests |