export type SetRoutesForMiddleware = string | Record<string, string> | Record<string, string>[] | string[] | undefined;

export function setRoutesForMiddleware(routes: SetRoutesForMiddleware): string[] {
  if (Array.isArray(routes)) {
    return routes.map((route) => {
      if (typeof route === 'object' && Object.keys(route).includes('path')) {
        const { path } = route;
        return path;
      }
      return route;
    });
  }

  if (typeof routes === 'string') {
    return [...routes.split(',')];
  }

  if (typeof routes === 'object' && Object.keys(routes).includes('path')) {
    const { path } = routes;
    return [path];
  }

  return [];
}
