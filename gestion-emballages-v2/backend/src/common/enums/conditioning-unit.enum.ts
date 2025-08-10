export enum ConditioningUnit {
  // Basic units
  PIECE = 'piece',
  UNIT = 'unit',

  // Packaging units
  BOX_OF_25 = 'box_of_25',
  BOX_OF_50 = 'box_of_50',
  BOX_OF_100 = 'box_of_100',
  BOX_OF_200 = 'box_of_200',
  BOX_OF_250 = 'box_of_250',
  BOX_OF_500 = 'box_of_500',
  BOX_OF_1000 = 'box_of_1000',

  // Pallets
  PALLET_OF_20 = 'pallet_of_20',
  PALLET_OF_25 = 'pallet_of_25',
  PALLET_OF_50 = 'pallet_of_50',
  PALLET_OF_100 = 'pallet_of_100',

  // Rolls
  ROLL = 'roll',
  ROLL_OF_100M = 'roll_of_100m',
  ROLL_OF_200M = 'roll_of_200m',
  ROLL_OF_500M = 'roll_of_500m',

  // Bundles
  BUNDLE = 'bundle',
  BUNDLE_OF_10 = 'bundle_of_10',
  BUNDLE_OF_25 = 'bundle_of_25',
  BUNDLE_OF_50 = 'bundle_of_50',

  // Weight-based
  KG = 'kg',
  BAG_OF_5KG = 'bag_of_5kg',
  BAG_OF_10KG = 'bag_of_10kg',
  BAG_OF_25KG = 'bag_of_25kg',

  // Other
  SET = 'set',
  PAIR = 'pair',
  DOZEN = 'dozen',
}
