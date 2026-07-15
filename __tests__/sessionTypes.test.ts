import { validateSessionCodes } from '../services/storage/types';

describe('validateSessionCodes', () => {
  it('returns valid when ignored and expected code types do not overlap', () => {
    const result = validateSessionCodes(['code-128', 'qr'], ['ean-13']);

    expect(result.isValid).toBe(true);
    expect(result.conflicts).toEqual([]);
  });

  it('returns conflicts when ignored code types overlap expected code types', () => {
    const result = validateSessionCodes(
      ['code-128', 'qr', 'data-matrix'],
      ['qr', 'ean-13', 'data-matrix'],
    );

    expect(result.isValid).toBe(false);
    expect(result.conflicts).toEqual(['qr', 'data-matrix']);
  });
});
