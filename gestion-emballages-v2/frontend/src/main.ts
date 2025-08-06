import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { 
  LucideAngularModule, 
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  ArrowLeftRight,
  Warehouse,
  Package,
  Package2,
  TrendingUp,
  Store,
  Building,
  Users,
  ShoppingCart,
  Factory,
  Layers,
  GalleryVerticalEnd,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-angular';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { loadingInterceptor } from './app/core/interceptors/loading.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loadingInterceptor,
        errorInterceptor
      ])
    ),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard,
        BarChart3,
        ClipboardList,
        ArrowLeftRight,
        Warehouse,
        Package,
        Package2,
        TrendingUp,
        Store,
        Building,
        Users,
        ShoppingCart,
        Factory,
        Layers,
        GalleryVerticalEnd,
        Search,
        LogOut,
        ChevronLeft,
        ChevronRight,
        X
      })
    )
  ]
}).catch(err => console.error(err));