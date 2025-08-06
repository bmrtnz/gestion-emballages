import { Injectable } from '@angular/core';
import { UserRole } from '@core/models/user.model';

export interface NavigationItem {
  name: string;
  href: string;
  icon: string; // Lucide icon name
  roles?: UserRole[];
  badge?: string;
}

export interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

@Injectable({
  providedIn: 'root'
})
export abstract class SidebarNavigationStrategy {
  abstract getNavigation(): NavigationSection[];
  abstract getEntityName(user: any): string | null;
  abstract getStockUrl(): string;
  abstract shouldShowSearch(): boolean;
  abstract shouldLoadShoppingCart(): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ManagerSidebarStrategy extends SidebarNavigationStrategy {
  getNavigation(): NavigationSection[] {
    return [
      {
        items: [
          {
            name: 'Tableau de bord',
            href: '/dashboard',
            icon: 'factory'
          },
          {
            name: 'Analyses',
            href: '#',
            icon: 'bar-chart-3'
          }
        ]
      },
      {
        title: 'GESTION',
        items: [
          {
            name: 'Commandes',
            href: '/commandes',
            icon: 'clipboard-list'
          },
          {
            name: 'Transferts',
            href: '/transferts',
            icon: 'arrow-left-right'
          },
          {
            name: 'Stocks des stations',
            href: '/stocks/stations-dashboard',
            icon: 'layers'
          },
          {
            name: 'Stocks des fournisseurs',
            href: '/stocks/suppliers-dashboard',
            icon: 'package'
          },
          {
            name: 'Prévisions',
            href: '/previsions',
            icon: 'trending-up'
          }
        ]
      },
      {
        title: 'PARAMETRES',
        items: [
          {
            name: 'Catalogue des articles',
            href: '/articles',
            icon: 'gallery-vertical-end'
          },
          {
            name: 'Fournisseurs',
            href: '/fournisseurs',
            icon: 'store'
          },
          {
            name: 'Stations',
            href: '/stations',
            icon: 'factory'
          },
          {
            name: 'Utilisateurs',
            href: '/users',
            icon: 'users'
          }
        ]
      }
    ];
  }

  getEntityName(user: any): string | null {
    return null; // Managers don't have entity names
  }

  getStockUrl(): string {
    return '/stocks/stations-dashboard';
  }

  shouldShowSearch(): boolean {
    return true;
  }

  shouldLoadShoppingCart(): boolean {
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GestionnaireSidebarStrategy extends SidebarNavigationStrategy {
  getNavigation(): NavigationSection[] {
    return [
      {
        items: [
          {
            name: 'Tableau de bord',
            href: '/dashboard',
            icon: 'factory'
          },
          {
            name: 'Analyses',
            href: '#',
            icon: 'bar-chart-3'
          }
        ]
      },
      {
        title: 'GESTION',
        items: [
          {
            name: 'Commandes',
            href: '/commandes',
            icon: 'clipboard-list'
          },
          {
            name: 'Transferts',
            href: '/transferts',
            icon: 'arrow-left-right'
          },
          {
            name: 'Stocks des stations',
            href: '/stocks/stations-dashboard',
            icon: 'layers'
          },
          {
            name: 'Stocks des fournisseurs',
            href: '/stocks/suppliers-dashboard',
            icon: 'package'
          },
          {
            name: 'Prévisions',
            href: '/previsions',
            icon: 'trending-up'
          }
        ]
      },
      {
        title: 'PARAMETRES',
        items: [
          {
            name: 'Catalogue des articles',
            href: '/articles',
            icon: 'gallery-vertical-end'
          },
          {
            name: 'Fournisseurs',
            href: '/fournisseurs',
            icon: 'store'
          },
          {
            name: 'Stations',
            href: '/stations',
            icon: 'factory'
          },
          {
            name: 'Utilisateurs',
            href: '/users',
            icon: 'users'
          }
        ]
      }
    ];
  }

  getEntityName(user: any): string | null {
    return null; // Gestionnaires don't have entity names
  }

  getStockUrl(): string {
    return '/stocks/stations-dashboard';
  }

  shouldShowSearch(): boolean {
    return true;
  }

  shouldLoadShoppingCart(): boolean {
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class StationSidebarStrategy extends SidebarNavigationStrategy {
  getNavigation(): NavigationSection[] {
    return [
      {
        items: [
          {
            name: 'Tableau de bord',
            href: '/dashboard',
            icon: 'factory'
          }
        ]
      },
      {
        title: 'GESTION',
        items: [
          {
            name: 'Ma liste d\'achat',
            href: '/liste-achat',
            icon: 'factory',
            badge: 'cart'
          },
          {
            name: 'Mes commandes',
            href: '/commandes',
            icon: 'clipboard-list'
          },
          {
            name: 'Mes transferts',
            href: '/transferts',
            icon: 'arrow-left-right'
          },
          {
            name: 'Mes stocks',
            href: '/stocks/station',
            icon: 'factory'
          }
        ]
      },
      {
        title: 'PARAMETRES',
        items: [
          {
            name: 'Catalogue des articles',
            href: '/articles',
            icon: 'gallery-vertical-end'
          },
          {
            name: 'Prévisions',
            href: '/previsions',
            icon: 'trending-up'
          }
        ]
      }
    ];
  }

  getEntityName(user: any): string | null {
    return user?.entiteDetails?.nom || null;
  }

  getStockUrl(): string {
    return '/stocks/station';
  }

  shouldShowSearch(): boolean {
    return true;
  }

  shouldLoadShoppingCart(): boolean {
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class FournisseurSidebarStrategy extends SidebarNavigationStrategy {
  getNavigation(): NavigationSection[] {
    return [
      {
        items: [
          {
            name: 'Tableau de bord',
            href: '/dashboard',
            icon: 'factory'
          }
        ]
      },
      {
        title: 'GESTION',
        items: [
          {
            name: 'Mes commandes',
            href: '/commandes',
            icon: 'clipboard-list'
          },
          {
            name: 'Mes stocks',
            href: '/stocks/supplier',
            icon: 'factory'
          }
        ]
      },
      {
        title: 'PARAMETRES',
        items: [
          {
            name: 'Catalogue des articles',
            href: '/articles',
            icon: 'gallery-vertical-end'
          },
          {
            name: 'Prévisions',
            href: '/previsions',
            icon: 'trending-up'
          }
        ]
      }
    ];
  }

  getEntityName(user: any): string | null {
    return user?.entiteDetails?.nom || null;
  }

  getStockUrl(): string {
    return '/stocks/supplier';
  }

  shouldShowSearch(): boolean {
    return true;
  }

  shouldLoadShoppingCart(): boolean {
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SidebarNavigationStrategyFactory {
  static createStrategy(userRole: UserRole | null): SidebarNavigationStrategy {
    switch (userRole) {
      case UserRole.MANAGER:
        return new ManagerSidebarStrategy();
      case UserRole.GESTIONNAIRE:
        return new GestionnaireSidebarStrategy();
      case UserRole.STATION:
        return new StationSidebarStrategy();
      case UserRole.FOURNISSEUR:
        return new FournisseurSidebarStrategy();
      default:
        return new ManagerSidebarStrategy(); // Default fallback
    }
  }
}