class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorResponse = (status: number, message: string) => {
  return new CustomError(message, status);
};

export { errorResponse };
