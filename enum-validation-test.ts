/**
 * ENUM VALIDATION TEST
 * Tests to validate that migration enums match TypeScript enums
 * Run this after fixing the enum mismatches
 */

import { UserRole, EntityType } from './gestion-emballages-v2/backend/src/common/enums/user-role.enum';
import { ProductCategory } from './gestion-emballages-v2/backend/src/common/enums/product-category.enum';
import { ConditioningUnit } from './gestion-emballages-v2/backend/src/common/enums/conditioning-unit.enum';
import { TransferStatus } from './gestion-emballages-v2/backend/src/common/enums/transfer-status.enum';

// Expected migration enum values
const MIGRATION_ENUMS = {
  user_role: ['ADMIN', 'MANAGER', 'HANDLER', 'STATION', 'SUPPLIER'],
  entity_type: ['STATION', 'SUPPLIER'],
  product_category: ['Tray', 'Crate', 'Platter', 'Plastic Film', 'Cardboard', 'Plastic Bag', 'Paper Bag', 'Isothermal Packaging', 'Label', 'Other'],
  conditioning_unit: ['piece', 'unit', 'box_of_25', 'box_of_50', 'box_of_100', 'box_of_200', 'box_of_250', 'box_of_500', 'box_of_1000', 'pallet_of_20', 'pallet_of_25', 'pallet_of_50', 'pallet_of_100', 'roll', 'roll_of_100m', 'roll_of_200m', 'roll_of_500m', 'bundle', 'bundle_of_10', 'bundle_of_25', 'bundle_of_50', 'kg', 'bag_of_5kg', 'bag_of_10kg', 'bag_of_25kg', 'set', 'pair', 'dozen'],
  transfer_status: ['Enregistrée', 'Confirmée', 'Rejetée', 'Traitée logistique', 'Expédiée', 'Réceptionnée', 'Clôturée', 'Traitée comptabilité', 'Archivée']
};

function validateEnumAlignment() {
  const errors: string[] = [];

  // Test UserRole
  const userRoleValues = Object.values(UserRole);
  const missingUserRoles = MIGRATION_ENUMS.user_role.filter(v => !userRoleValues.includes(v as any));
  const extraUserRoles = userRoleValues.filter(v => !MIGRATION_ENUMS.user_role.includes(v));
  
  if (missingUserRoles.length > 0) {
    errors.push(`UserRole missing in code: ${missingUserRoles.join(', ')}`);
  }
  if (extraUserRoles.length > 0) {
    errors.push(`UserRole extra in code: ${extraUserRoles.join(', ')}`);
  }

  // Test EntityType
  const entityTypeValues = Object.values(EntityType);
  const missingEntityTypes = MIGRATION_ENUMS.entity_type.filter(v => !entityTypeValues.includes(v as any));
  const extraEntityTypes = entityTypeValues.filter(v => !MIGRATION_ENUMS.entity_type.includes(v));
  
  if (missingEntityTypes.length > 0) {
    errors.push(`EntityType missing in code: ${missingEntityTypes.join(', ')}`);
  }
  if (extraEntityTypes.length > 0) {
    errors.push(`EntityType extra in code: ${extraEntityTypes.join(', ')}`);
  }

  // Test ProductCategory
  const productCategoryValues = Object.values(ProductCategory);
  const missingProductCategories = MIGRATION_ENUMS.product_category.filter(v => !productCategoryValues.includes(v as any));
  const extraProductCategories = productCategoryValues.filter(v => !MIGRATION_ENUMS.product_category.includes(v));
  
  if (missingProductCategories.length > 0) {
    errors.push(`ProductCategory missing in code: ${missingProductCategories.join(', ')}`);
  }
  if (extraProductCategories.length > 0) {
    errors.push(`ProductCategory extra in code: ${extraProductCategories.join(', ')}`);
  }

  // Test ConditioningUnit  
  const conditioningUnitValues = Object.values(ConditioningUnit);
  const missingConditioningUnits = MIGRATION_ENUMS.conditioning_unit.filter(v => !conditioningUnitValues.includes(v as any));
  const extraConditioningUnits = conditioningUnitValues.filter(v => !MIGRATION_ENUMS.conditioning_unit.includes(v));
  
  if (missingConditioningUnits.length > 0) {
    errors.push(`ConditioningUnit missing in code: ${missingConditioningUnits.join(', ')}`);
  }
  if (extraConditioningUnits.length > 0) {
    errors.push(`ConditioningUnit extra in code: ${extraConditioningUnits.join(', ')}`);
  }

  // Test TransferStatus
  const transferStatusValues = Object.values(TransferStatus);
  const missingTransferStatuses = MIGRATION_ENUMS.transfer_status.filter(v => !transferStatusValues.includes(v as any));
  const extraTransferStatuses = transferStatusValues.filter(v => !MIGRATION_ENUMS.transfer_status.includes(v));
  
  if (missingTransferStatuses.length > 0) {
    errors.push(`TransferStatus missing in code: ${missingTransferStatuses.join(', ')}`);
  }
  if (extraTransferStatuses.length > 0) {
    errors.push(`TransferStatus extra in code: ${extraTransferStatuses.join(', ')}`);
  }

  return errors;
}

// Run validation
console.log('🔍 Running Enum Validation Test...\n');

const validationErrors = validateEnumAlignment();

if (validationErrors.length === 0) {
  console.log('✅ SUCCESS: All enums are properly aligned between migration and code!');
  console.log('\n📋 Validated Enums:');
  console.log('- UserRole: ✅ Aligned');
  console.log('- EntityType: ✅ Aligned');  
  console.log('- ProductCategory: ✅ Aligned');
  console.log('- ConditioningUnit: ✅ Aligned');
  console.log('- TransferStatus: ✅ Aligned');
} else {
  console.log('❌ VALIDATION ERRORS FOUND:');
  validationErrors.forEach(error => console.log(`  - ${error}`));
  console.log('\n🔧 Please fix these enum mismatches before deploying.');
}

console.log('\n🎯 Next Steps:');
console.log('1. Run database migration: npm run migration:run');
console.log('2. Test application startup');
console.log('3. Verify enum-dependent features work correctly');