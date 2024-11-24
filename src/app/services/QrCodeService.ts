import { Injectable } from '@angular/core';
import QRCode from 'qrcode';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {
  private readonly defaultOptions = {
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 200,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  } as const;

  /**
   * Generates a base64 QR code image from a URL
   * @param url The URL to encode in the QR code
   * @param options Optional QR code generation options
   * @returns Observable<string> Base64 encoded image
   */
  generateQrCode(url: string, options?: QRCode.QRCodeToDataURLOptions): Observable<string> {
    const qrOptions = {
      ...this.defaultOptions,
      ...options
    };

    return from(QRCode.toDataURL(url, qrOptions)).pipe(
      catchError(error => {
        throw new Error(`Failed to generate QR code: ${error.message}`);
      })
    );
  }
}
