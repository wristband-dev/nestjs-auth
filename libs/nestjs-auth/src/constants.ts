const AUTH_ERRORS = {
  UNEXPECTED_ERROR:
    'An unexpected error occurred on our end.  Please try again later.',
  TOKEN_REFRESH_FAILED: 'Failed to refresh token due to error.',
  TOKEN_REVOKE_FAILED: 'Revoking token during logout failed.',
};

const AUTH_MESSAGES = {
  errors: AUTH_ERRORS,
};

export default AUTH_MESSAGES;
