export class AppConfigService {
  public readonly appName: string;
  private apiUrl: string;
  private services: { [key: string]: string };
  private servicesKeys: string[];
  public readonly loginUrl: string;
  public readonly logoutOnInactivitySeconds: number;

  constructor(config: any) {
    this.apiUrl = config.apiUrl;
    this.appName = config.appName;
    this.services = config.services;
    this.servicesKeys = !this.services ? null : Object.keys(this.services);
    this.loginUrl = config.loginUrl;
    this.logoutOnInactivitySeconds = config.logoutOnInactivitySeconds;
  }

  normalizeUrl(url: string): string {
    if (typeof url !== 'string') {
      return null;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = this.parseServiceIfNeeded(url);
    }

    url = this.normalizeUrlInternal(url);
    return url;
  }

  isApiUrl(url: string) {
    return url?.startsWith(this.apiUrl) ?? false;
  }

  private parseServiceIfNeeded(url: string) {
    const shouldParseApi = url.startsWith('~');
    if (shouldParseApi) {
      const recursiveFnAux = () => {
        let key: string = '';
        this.servicesKeys?.forEach((x: any) => {
          if (
            url.startsWith('~' + x) &&
            (!key || (key && key.length < x.length))
          ) {
            key = x;
          }
        });
        if (key) {
          url = url.replace('~' + key, this.services[key]);
        } else {
          url = url.replace('~', '');
        }

        if (url.startsWith('~')) {
          recursiveFnAux();
        }
      };

      recursiveFnAux();
    }

    if (
      shouldParseApi &&
      !url.startsWith('http://') &&
      !url.startsWith('https://')
    ) {
      url = this.apiUrl + '/' + url;
    }

    return url;
  }

  private normalizeUrlInternal(url: string) {
    let prefix: string;
    if (url.startsWith('http://')) {
      prefix = 'http://';
    } else if (url.startsWith('https://')) {
      prefix = 'https://';
    } else {
      prefix = '';
    }
    return (
      prefix +
      url
        .substr(prefix.length)
        .replace(/(\/\/)/g, '/')
        .replace(/(\/\/\/)/g, '/')
        .replace(/(\/\/)/g, '/')
        .replace(/(\/\/\/)/g, '/')
    );
  }
}
