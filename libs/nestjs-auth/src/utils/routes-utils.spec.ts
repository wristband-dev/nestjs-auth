import { setRoutesForMiddleware } from './routes-utils';

describe('setRoutesForMiddleware', () => {
  it('should handle an array of strings', () => {
    const routes = ['route1', 'route2'];
    const result = setRoutesForMiddleware(routes);
    expect(result).toEqual(routes);
  });

  it('should handle an array of objects with a path property', () => {
    const routes = [{ path: 'route1' }, { path: 'route2' }];
    const result = setRoutesForMiddleware(routes);
    expect(result).toEqual(['route1', 'route2']);
  });

  it('should handle a single string', () => {
    const routes = 'route1,route2';
    const result = setRoutesForMiddleware(routes);
    expect(result).toEqual(['route1', 'route2']);
  });

  it('should handle a single object with a path property', () => {
    const routes = { path: 'route1' };
    const result = setRoutesForMiddleware(routes);
    expect(result).toEqual(['route1']);
  });

  it('should return an empty array for undefined input', () => {
    const result = setRoutesForMiddleware(undefined);
    expect(result).toEqual([]);
  });

  it('should return an empty array for invalid input', () => {
    const routes = { invalid: 'route1' };
    const result = setRoutesForMiddleware(routes);
    expect(result).toEqual([]);
  });
});