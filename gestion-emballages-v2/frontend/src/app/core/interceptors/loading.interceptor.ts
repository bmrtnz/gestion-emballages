import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip loading indicator for specific endpoints
  const skipLoading = req.headers.has('X-Skip-Loading') || 
                      req.url.includes('/auth/refresh') ||
                      req.url.includes('/assets/') ||
                      req.url.includes('/i18n/') ||
                      req.url.includes('.json') ||
                      req.url.includes('.css') ||
                      req.url.includes('.js') ||
                      req.url.includes('.png') ||
                      req.url.includes('.jpg') ||
                      req.url.includes('.jpeg') ||
                      req.url.includes('.gif') ||
                      req.url.includes('.svg') ||
                      req.url.includes('.ico') ||
                      req.url.includes('.woff') ||
                      req.url.includes('.woff2') ||
                      req.url.includes('.ttf') ||
                      (req.method === 'GET' && req.url.includes('/profile'));

  if (!skipLoading) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        loadingService.hide();
      }
    })
  );
};