import { errorResponse, CustomError } from './server-utils';

describe('errorResponse', () => {
  it('should return an instance of CustomError', () => {
    const error = errorResponse(404, 'Not Found');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CustomError);
  });

  it('should set the correct message and statusCode', () => {
    const status = 500;
    const message = 'Internal Server Error';
    const error = errorResponse(status, message);
    
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(status);
  });
});