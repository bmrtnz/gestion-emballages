import { inject, isDevMode } from '@angular/core';
import { TranslocoService, provideTransloco, TranslocoModule } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';

export const translocoConfig = provideTransloco({
  config: {
    availableLangs: ['fr', 'en'],
    defaultLang: 'fr',
    // Remove this option if your application doesn't support changing language in runtime.
    reRenderOnLangChange: true,
    prodMode: !isDevMode(),
    fallbackLang: 'fr',
    missingHandler: {
      logMissingKey: true,
      useFallbackTranslation: true
    }
  },
  loader: TranslocoHttpLoader
});

export { TranslocoModule };