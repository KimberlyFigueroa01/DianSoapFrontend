import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Factura {
  id: number;
  numeroFactura: string;
  fechaEmision: string;
  nombreVendedor: string;
  nombreCliente: string;
  productoVendido: string;
  cantidadVendida: number;
  precioUnitario: number;
  subtotal: number;
  iva: number;
  total: number;
  estado: string;
}

interface Stats {
  totalFacturas: number;
  totalVentas: number;
  facturasHoy: number;
  totalVendedores: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private API = 'http://localhost:8080/api/dashboard';

  facturas: Factura[] = [];
  stats: Stats = { totalFacturas: 0, totalVentas: 0, facturasHoy: 0, totalVendedores: 0 };
  buscar = '';
  cargando = false;
  error = '';

  // Paginación
  pagina = 1;
  porPagina = 5;

  constructor(private http: HttpClient, private router: Router) {
  // Recarga datos cada vez que navegas a esta ruta
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    this.cargarStats();
    this.cargarFacturas();
  });
}

  ngOnInit(): void {
    this.cargarStats();
    this.cargarFacturas();
  }

  cargarStats(): void {
    this.http.get<Stats>(`${this.API}/stats`).subscribe({
      next: data => this.stats = data,
      error: () => {}
    });
  }

  cargarFacturas(): void {
    this.cargando = true;
    this.error = '';
    let params = new HttpParams();
    if (this.buscar.trim()) params = params.set('buscar', this.buscar.trim());

    this.http.get<Factura[]>(`${this.API}/facturas`, { params }).subscribe({
      next: data => { this.facturas = data; this.pagina = 1; this.cargando = false; },
      error: () => { this.error = 'No se pudo conectar con el servidor.'; this.cargando = false; }
    });
  }

  descargarPdf(factura: Factura): void {
    const url = `${this.API}/facturas/${factura.id}/pdf`;
    window.open(url, '_blank');
}

  get facturasPaginadas(): Factura[] {
    const inicio = (this.pagina - 1) * this.porPagina;
    return this.facturas.slice(inicio, inicio + this.porPagina);
  }

  get totalPaginas(): number[] {
    return Array.from({ length: Math.ceil(this.facturas.length / this.porPagina) }, (_, i) => i + 1);
  }

  formatCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}