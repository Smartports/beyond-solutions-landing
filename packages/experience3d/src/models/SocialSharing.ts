import { ExportSystem, ScreenshotOptions } from './ExportSystem';

/**
 * Plataformas sociales soportadas
 */
export enum SocialPlatform {
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  COPY_LINK = 'copy_link',
}

/**
 * Opciones para compartir en redes sociales
 */
export interface SocialShareOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  hashtags?: string[];
  via?: string;
  includeScreenshot?: boolean;
  screenshotOptions?: ScreenshotOptions;
}

/**
 * Sistema para compartir en redes sociales
 */
export class SocialSharing {
  private exportSystem: ExportSystem;
  private defaultOptions: SocialShareOptions = {
    title: 'Mi proyecto inmobiliario en Beyond Solutions',
    description: 'Mira mi proyecto inmobiliario creado con la calculadora de Beyond Solutions.',
    hashtags: ['BeyondSolutions', 'RealEstate', 'Inmobiliaria'],
    includeScreenshot: true,
  };

  constructor(exportSystem: ExportSystem) {
    this.exportSystem = exportSystem;
  }

  /**
   * Establece las opciones por defecto
   * @param options Opciones por defecto
   */
  public setDefaultOptions(options: SocialShareOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Comparte en una plataforma social
   * @param platform Plataforma social
   * @param options Opciones de compartición
   * @returns Promise que se resuelve cuando se completa la acción
   */
  public async share(platform: SocialPlatform, options: SocialShareOptions = {}): Promise<boolean> {
    try {
      // Combinar opciones con las por defecto
      const shareOptions = { ...this.defaultOptions, ...options };

      // Obtener URL a compartir
      const shareUrl = shareOptions.url || this.exportSystem.generateShareURL();

      // Si se debe incluir captura de pantalla, tomarla
      if (shareOptions.includeScreenshot && !shareOptions.image) {
        try {
          shareOptions.image = await this.exportSystem.takeScreenshot(
            shareOptions.screenshotOptions,
          );
        } catch (error) {
          console.warn('Failed to take screenshot for sharing:', error);
        }
      }

      // Compartir según la plataforma
      switch (platform) {
        case SocialPlatform.FACEBOOK:
          return this.shareOnFacebook(shareUrl, shareOptions);

        case SocialPlatform.TWITTER:
          return this.shareOnTwitter(shareUrl, shareOptions);

        case SocialPlatform.LINKEDIN:
          return this.shareOnLinkedIn(shareUrl, shareOptions);

        case SocialPlatform.WHATSAPP:
          return this.shareOnWhatsApp(shareUrl, shareOptions);

        case SocialPlatform.TELEGRAM:
          return this.shareOnTelegram(shareUrl, shareOptions);

        case SocialPlatform.EMAIL:
          return this.shareViaEmail(shareUrl, shareOptions);

        case SocialPlatform.COPY_LINK:
          return this.copyLinkToClipboard(shareUrl);

        default:
          throw new Error(`Unsupported social platform: ${platform}`);
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      return false;
    }
  }

  /**
   * Comparte en Facebook
   */
  private shareOnFacebook(url: string, _options: SocialShareOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

      // Abrir ventana de compartir
      this.openShareWindow(shareUrl, 'Facebook');
      resolve(true);
    });
  }

  /**
   * Comparte en Twitter
   */
  private shareOnTwitter(url: string, options: SocialShareOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;

      if (options.title) {
        shareUrl += `&text=${encodeURIComponent(options.title)}`;
      }

      if (options.hashtags && options.hashtags.length > 0) {
        shareUrl += `&hashtags=${options.hashtags.join(',')}`;
      }

      if (options.via) {
        shareUrl += `&via=${encodeURIComponent(options.via)}`;
      }

      // Abrir ventana de compartir
      this.openShareWindow(shareUrl, 'Twitter');
      resolve(true);
    });
  }

  /**
   * Comparte en LinkedIn
   */
  private shareOnLinkedIn(url: string, _options: SocialShareOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

      // Abrir ventana de compartir
      this.openShareWindow(shareUrl, 'LinkedIn');
      resolve(true);
    });
  }

  /**
   * Comparte en WhatsApp
   */
  private shareOnWhatsApp(url: string, options: SocialShareOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let text = url;

      if (options.title) {
        text = `${options.title} ${url}`;
      }

      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

      // Abrir ventana de compartir
      this.openShareWindow(shareUrl, 'WhatsApp');
      resolve(true);
    });
  }

  /**
   * Comparte en Telegram
   */
  private shareOnTelegram(url: string, options: SocialShareOptions): Promise<boolean> {
    const text = options.title ? `${options.title} ${url}` : url;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    return new Promise<boolean>((resolve) => {
      // Abrir ventana de compartir
      this.openShareWindow(shareUrl, 'Telegram');
      resolve(true);
    });
  }

  /**
   * Comparte vía email
   */
  private shareViaEmail(url: string, options: SocialShareOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const subject = encodeURIComponent(options.title || 'Compartiendo mi proyecto inmobiliario');
      const body = encodeURIComponent(`${options.description || ''}\n\n${url}`);

      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

      // Abrir cliente de correo
      window.location.href = mailtoUrl;
      resolve(true);
    });
  }

  /**
   * Copia el enlace al portapapeles
   */
  private copyLinkToClipboard(url: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        // Usar API moderna de portapapeles si está disponible
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(url)
            .then(() => resolve(true))
            .catch((error) => {
              console.error('Error copying to clipboard:', error);
              this.fallbackCopyToClipboard(url);
              resolve(true);
            });
        } else {
          // Método alternativo
          this.fallbackCopyToClipboard(url);
          resolve(true);
        }
      } catch (error) {
        console.error('Error copying link to clipboard:', error);
        reject(error);
      }
    });
  }

  /**
   * Método alternativo para copiar al portapapeles
   */
  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Hacer que el elemento sea invisible
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Could not copy text: ', err);
    }

    document.body.removeChild(textArea);
  }

  /**
   * Abre una ventana para compartir
   */
  private openShareWindow(url: string, title: string): void {
    const width = 600;
    const height = 400;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    window.open(
      url,
      `share_${title}`,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`,
    );
  }

  /**
   * Genera un QR code para compartir
   * @returns Promise con la URL de la imagen del QR
   */
  public async generateQRCode(): Promise<string> {
    return this.exportSystem.generateQRCode();
  }
}
