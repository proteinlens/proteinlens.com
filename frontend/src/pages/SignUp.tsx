import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Legacy SignUp page - redirects to new SignupPage
 * Kept for backwards compatibility with old links
 */
export function SignUp() {
  return <Navigate to="/signup" replace />;
}

export default SignUp;
