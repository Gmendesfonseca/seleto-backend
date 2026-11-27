import { toLogLevels } from './log-levels';

describe('toLogLevels', () => {
  it('splits a comma-separated env value into levels', () => {
    expect(toLogLevels('log, error,warn')).toEqual(['log', 'error', 'warn']);
  });

  it('keeps an already parsed array', () => {
    expect(toLogLevels(['debug'])).toEqual(['debug']);
  });

  it('returns undefined when the variable is not set', () => {
    expect(toLogLevels(undefined)).toBeUndefined();
  });
});
