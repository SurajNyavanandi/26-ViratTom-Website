import { useContext } from 'react';
import { AuthContext } from '../context/authContextInstance';

/**
 * Hook to access authentication session context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
