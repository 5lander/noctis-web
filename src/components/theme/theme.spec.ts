import { describe, expect, it } from 'vitest';

import { THEME_MODES, isThemeMode, oppositeOf } from './theme';

describe('contrato del modo', () => {
  it('solo hay dos modos', () => {
    expect(THEME_MODES).toEqual(['dark', 'light']);
  });

  it('reconoce los válidos y rechaza el resto', () => {
    expect(isThemeMode('dark')).toBe(true);
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('azul')).toBe(false);
    expect(isThemeMode(null)).toBe(false);
    expect(isThemeMode(undefined)).toBe(false);
  });

  it('el contrario del contrario es el mismo', () => {
    expect(oppositeOf('dark')).toBe('light');
    expect(oppositeOf(oppositeOf('dark'))).toBe('dark');
  });
});
