import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface InvoiceRequest {
  identificacionVendedor: string;
  nombreVendedor: string;
  actividadProductiva: string;
  telefonoVendedor: string;
  correoVendedor: string;
  productoVendido: string;
  codigoProducto: string;
  precioUnitario: number;
  cantidadVendida: number;
  nombreCliente: string;
  identificacionCliente: string;
  telefonoCliente: string;
  correoCliente: string;
}

export interface InvoiceResponse {
  status: string;
  message: string;
  invoiceNumber: string;
  pdfBase64: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private url = 'http://localhost:8080/ws';

  constructor(private http: HttpClient) { }

  sendInvoice(req: InvoiceRequest): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml',
      'Accept': 'text/xml'
    });

    const body = `
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:fac="http://dian.soap/Factura">
  <soapenv:Header/>
  <soapenv:Body>
    <fac:InvoiceRequest>
      <IdentificacionVendedor>${req.identificacionVendedor}</IdentificacionVendedor>
      <NombreVendedor>${req.nombreVendedor}</NombreVendedor>
      <ActividadProductiva>${req.actividadProductiva}</ActividadProductiva>
      <TelefonoVendedor>${req.telefonoVendedor}</TelefonoVendedor>
      <CorreoVendedor>${req.correoVendedor}</CorreoVendedor>
      <ProductoVendido>${req.productoVendido}</ProductoVendido>
      <CodigoProducto>${req.codigoProducto}</CodigoProducto>
      <PrecioUnitario>${req.precioUnitario}</PrecioUnitario>
      <CantidadVendida>${req.cantidadVendida}</CantidadVendida>
      <NombreCliente>${req.nombreCliente}</NombreCliente>
      <IdentificacionCliente>${req.identificacionCliente}</IdentificacionCliente>
      <TelefonoCliente>${req.telefonoCliente}</TelefonoCliente>
      <CorreoCliente>${req.correoCliente}</CorreoCliente>
    </fac:InvoiceRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

    return this.http.post(this.url, body, {
      headers,
      responseType: 'text'
    }).pipe(
      tap(xml => console.log('XML recibido:', xml))
    );
  }

  parseResponse(xml: string): InvoiceResponse {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const get = (tag: string) =>
      doc.getElementsByTagNameNS('*', tag)[0]?.textContent ?? '';

    return {
      status: get('Status'),
      message: get('Message'),
      invoiceNumber: get('InvoiceNumber'),
      pdfBase64: get('PdfBase64'),
    };
  }
}