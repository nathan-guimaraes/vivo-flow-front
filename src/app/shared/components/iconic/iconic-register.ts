import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import isBase64 from 'is-base64';

export enum IconType {
  Css,
  Svg,
  Image,
}

export interface Icon {
  src: string;
  type: IconType;
}

interface IconCfg extends Icon {
  resolved: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class IconicRegister {
  private _basePath: string;
  private _iconsMap = new Map<string, IconCfg>();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  setBasePath(basepath: string) {
    this._basePath = basepath;
    return this;
  }

  addRange(items: { icon: string; src: string; type?: IconType }[]) {
    for (const item of items) {
      this.add(item.icon, item.src, item.type);
    }

    return this;
  }

  add(icon: string, src: string, type?: IconType) {
    this._iconsMap.set(icon, {
      src,
      type,
      resolved: type !== undefined && type !== null,
    });

    return this;
  }

  resolve(icon: string): Icon {
    icon = String(icon);
    const iconCfg = this._iconsMap.get(icon);

    let src: string;
    let type: IconType;
    if (iconCfg) {
      src = iconCfg.src;
      type = iconCfg.type;
    }

    src ??= icon;

    if (!iconCfg?.resolved) {
      if (isBase64(src, { mimeRequired: true })) {
        if (src.startsWith('data:image/svg')) {
          type = IconType.Svg;
        } else {
          type = IconType.Image;
        }
      } else if (!src.includes('.')) {
        type = IconType.Css;
      } else {
        const basePath = this._basePath ?? '';
        let baseUrl: string;

        if (basePath.startsWith('http://') || basePath.startsWith('https://')) {
          baseUrl = basePath;
        } else {
          baseUrl = new URL(
            basePath,
            this.document.head.querySelector('base')?.href ?? location.origin
          ).toString();
        }

        src = new URL(src, baseUrl).toString();

        if (src.endsWith('.svg')) {
          type = IconType.Svg;
        } else {
          type = IconType.Image;
        }
      }

      this._iconsMap.set(icon, { src, type, resolved: true });
    }

    return { src, type };
  }
}
