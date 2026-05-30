import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService, InvoiceRequest, InvoiceResponse } from './invoice.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  loading = false;
  response: InvoiceResponse | null = null;
  errorMsg = '';

  form: InvoiceRequest = {
    identificacionVendedor: '',
    nombreVendedor: '',
    actividadProductiva: '',
    telefonoVendedor: '',
    correoVendedor: '',
    productoVendido: '',
    codigoProducto: '',
    precioUnitario: 0,
    cantidadVendida: 1,
    nombreCliente: '',
    identificacionCliente: '',
    telefonoCliente: '',
    correoCliente: ''
  };

  constructor(private invoiceService: InvoiceService) { }

  onSubmit() {
    this.loading = true;
    this.response = null;
    this.errorMsg = '';

    this.invoiceService.sendInvoice(this.form).subscribe({
      next: (xml: string) => {
        this.response = this.invoiceService.parseResponse(xml);
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.message ?? 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  descargarPdf() {
    if (!this.response?.pdfBase64) return;
    const binary = atob(this.response.pdfBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.response.invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
}