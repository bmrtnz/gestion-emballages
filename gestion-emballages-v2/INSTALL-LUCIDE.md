# Install Lucide Angular Icons

To complete the Lucide Angular icon implementation, run:

```bash
cd frontend
npm install lucide-angular@^0.344.0
```

## Usage

Lucide Angular uses the `<lucide-icon>` component with a `name` attribute:

```html
<!-- Basic usage -->
<lucide-icon name="layout-dashboard" class="h-6 w-6"></lucide-icon>

<!-- Dynamic icon name -->
<lucide-icon [name]="item.icon" [class]="iconClasses"></lucide-icon>
```

## Icons Used

The sidebar now uses the following Lucide icons:

### Navigation Icons:
- `layout-dashboard` - Dashboard/Home
- `bar-chart-3` - Analytics/Charts  
- `clipboard-list` - Orders/Commands
- `arrow-left-right` - Transfers
- `warehouse` - Stock/Inventory
- `package` - Packages/Products (Supplier stocks)
- `package-2` - Catalog/Articles
- `trending-up` - Forecasts/Trends
- `store` - Suppliers/Stores
- `building` - Stations/Buildings
- `users` - Users/People
- `shopping-cart` - Shopping Cart

### UI Icons:
- `search` - Search functionality
- `log-out` - Logout button
- `chevron-left` - Collapse sidebar
- `chevron-right` - Expand sidebar  
- `x` - Close mobile sidebar

## Benefits

✅ **Modern Icon System**: Tree-shakeable, only used icons are bundled
✅ **Consistent Design**: All icons from same design system
✅ **Performance**: Smaller bundle size than inline SVG paths
✅ **Maintainable**: Easy to add/change icons
✅ **TypeScript Support**: Full type safety
✅ **Angular Native**: Built specifically for Angular

## Matching Vue.js Icons

The Lucide icons closely match the Heroicons used in the Vue.js version:

| Vue.js (Heroicons) | Angular (Lucide) | Purpose |
|-------------------|------------------|---------|
| `HomeIcon` | `layout-dashboard` | Dashboard |
| `ChartBarIcon` | `bar-chart-3` | Analytics |
| `ClipboardDocumentCheckIcon` | `clipboard-list` | Orders |
| `ArrowsRightLeftIcon` | `arrow-left-right` | Transfers |
| `CircleStackIcon` | `warehouse` | Stocks |
| `CubeIcon` | `package` | Products |
| `RectangleStackIcon` | `package-2` | Catalog |
| `DocumentChartBarIcon` | `trending-up` | Forecasts |
| `BuildingStorefrontIcon` | `store` | Suppliers |
| `HomeModernIcon` | `building` | Stations |
| `UsersIcon` | `users` | Users |
| `ShoppingCartIcon` | `shopping-cart` | Cart |