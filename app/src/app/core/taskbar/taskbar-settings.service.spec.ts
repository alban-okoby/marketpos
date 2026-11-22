import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_TASKBAR_SETTINGS, TaskbarSettingsService, parseTaskbarSettings } from './taskbar-settings.service';

describe('parseTaskbarSettings', () => {
  it('returns the defaults for missing or non-object values', () => {
    expect(parseTaskbarSettings(null)).toEqual(DEFAULT_TASKBAR_SETTINGS);
    expect(parseTaskbarSettings('left')).toEqual(DEFAULT_TASKBAR_SETTINGS);
  });

  it('keeps valid values and replaces invalid ones field by field', () => {
    expect(parseTaskbarSettings({ position: 'right', alignment: 'nope', autoHide: true })).toEqual({
      position: 'right',
      alignment: 'center',
      autoHide: true,
    });
  });
});

describe('TaskbarSettingsService', () => {
  let settings: TaskbarSettingsService;

  beforeEach(() => {
    localStorage.removeItem('marketpos.taskbar');
    TestBed.configureTestingModule({});
    settings = TestBed.inject(TaskbarSettingsService);
    settings.update(DEFAULT_TASKBAR_SETTINGS);
  });

  it('reserves space only on the side where the bar sits', () => {
    settings.update({ position: 'left' });
    expect(settings.reserves()).toEqual({ top: '0px', bottom: '0px', left: 'var(--taskbar-space)', right: '0px' });
  });

  it('reserves no space when the bar hides itself', () => {
    settings.update({ position: 'top', autoHide: true });
    expect(settings.reserves()).toEqual({ top: '0px', bottom: '0px', left: '0px', right: '0px' });
  });

  it('saves changes so they survive a reload', () => {
    settings.update({ position: 'right', alignment: 'start' });
    expect(JSON.parse(localStorage.getItem('marketpos.taskbar') ?? '{}')).toMatchObject({
      position: 'right',
      alignment: 'start',
    });
  });
});
