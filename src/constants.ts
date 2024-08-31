const AUTH_ERRORS = {
  UNEXPECTED_ERROR:
    'An unexpected error occurred on our end.  Please try again later.',
  TOKEN_REFRESH_FAILED: 'Failed to refresh token due to error.',
  TOKEN_REVOKE_FAILED: 'Revoking token during logout failed.',
  CONFIGURATION_ERROR: 'Error creating Wristband Auth instance.',
};

const AUTH_MESSAGES = {
  errors: AUTH_ERRORS,
  auth: {},
};

export default AUTH_MESSAGES;
