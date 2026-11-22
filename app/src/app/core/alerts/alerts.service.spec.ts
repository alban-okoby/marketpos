import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AlertsService } from './alerts.service';

describe('AlertsService', () => {
  let alerts: AlertsService;

  beforeEach(() => {
    localStorage.removeItem('marketpos.alertes');
    TestBed.configureTestingModule({});
    alerts = TestBed.inject(AlertsService);
  });

  it('keeps an alert open until it is acknowledged', () => {
    const alert = alerts.raise('stock-negatif', 'Stock négatif : Sucre (-2)');
    expect(alerts.open().map((a) => a.id)).toEqual([alert.id]);

    alerts.acknowledge(alert.id);
    expect(alerts.open()).toHaveLength(0);
    expect(alerts.all()).toHaveLength(1);
  });

  it('saves alerts so they survive a reload', () => {
    alerts.raise('synchronisation', 'Aucun serveur de synchronisation configuré.');
    expect(JSON.parse(localStorage.getItem('marketpos.alertes') ?? '[]')).toHaveLength(1);
  });
});
