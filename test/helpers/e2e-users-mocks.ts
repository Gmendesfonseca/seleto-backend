export const createUsersServiceMock = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  activate: jest.fn(),
  changeEmail: jest.fn(),
  updateUsername: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface RequestFactory {
  authenticatedRequest(method: HttpMethod, endpoint: string): { request: any };
}

// Every route of the users controller sits behind the global AuthGuard, so these specs send a valid token by default.
export const signedRequest = (authHelper: RequestFactory, method: HttpMethod, endpoint: string) =>
  authHelper.authenticatedRequest(method, endpoint).request;
