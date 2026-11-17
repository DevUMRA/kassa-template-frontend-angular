import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG, readAppConfig } from './app-config';

describe('readAppConfig', () => {
  it('trims the URL and removes trailing slashes', () => {
    expect(readAppConfig({ apiUrl: ' https://api.example.kz// ' })).toEqual({
      apiUrl: 'https://api.example.kz',
    });
  });

  it('falls back to same origin when config is missing or invalid', () => {
    expect(readAppConfig(undefined)).toEqual({ apiUrl: '' });
    expect(readAppConfig({})).toEqual({ apiUrl: '' });
    expect(readAppConfig({ apiUrl: 42 as unknown as string })).toEqual({ apiUrl: '' });
  });
});

describe('APP_CONFIG', () => {
  afterEach(() => {
    delete window.__APP_CONFIG__;
  });

  it('reads window.__APP_CONFIG__ written by /config.js', () => {
    window.__APP_CONFIG__ = { apiUrl: 'https://backend.test/' };
    TestBed.configureTestingModule({});
    expect(TestBed.inject(DOCUMENT).defaultView).toBe(window);
    expect(TestBed.inject(APP_CONFIG).apiUrl).toBe('https://backend.test');
  });
});
