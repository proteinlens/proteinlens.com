/**
 * Session Management Page
 * 
 * Feature: 013-self-managed-auth (US7: Session Management)
 * Task: T048
 * 
 * Allows users to view and revoke their active sessions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { API_ENDPOINTS } from '../config';
import './SessionManagement.css';

interface Session {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt: string;
  isCurrent: boolean;
}

interface SessionsResponse {
  sessions: Session[];
}

export const SessionManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      const token = await getAccessToken();
      
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(API_ENDPOINTS.AUTH_SESSIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/signin');
          return;
        }
        throw new Error('Failed to load sessions');
      }

      const data: SessionsResponse = await response.json();
      setSessions(data.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, navigate]);

  // Load sessions on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    } else {
      navigate('/signin');
    }
  }, [isAuthenticated, fetchSessions, navigate]);

  // Revoke a session
  const handleRevoke = async (sessionId: string) => {
    if (revokingId) return; // Already revoking
    
    setRevokingId(sessionId);
    setError(null);

    try {
      const token = await getAccessToken();
      
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.AUTH_SESSIONS}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/signin');
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke session');
      }

      // Remove the session from the list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  // Parse device info for display
  const parseDeviceInfo = (deviceInfo: string | null): { browser: string; os: string } => {
    if (!deviceInfo) {
      return { browser: 'Unknown Browser', os: 'Unknown Device' };
    }

    // Simple parsing - in real app, use a user-agent parser library
    let browser = 'Unknown Browser';
    let os = 'Unknown Device';

    if (deviceInfo.includes('Chrome')) browser = 'Chrome';
    else if (deviceInfo.includes('Firefox')) browser = 'Firefox';
    else if (deviceInfo.includes('Safari')) browser = 'Safari';
    else if (deviceInfo.includes('Edge')) browser = 'Edge';

    if (deviceInfo.includes('Windows')) os = 'Windows';
    else if (deviceInfo.includes('Mac')) os = 'macOS';
    else if (deviceInfo.includes('Linux')) os = 'Linux';
    else if (deviceInfo.includes('iPhone') || deviceInfo.includes('iPad')) os = 'iOS';
    else if (deviceInfo.includes('Android')) os = 'Android';

    return { browser, os };
  };

  return (
    <div className="session-management">
      <div className="session-management__container">
        <div className="session-management__header">
          <Link to="/settings" className="session-management__back">
            ← Back to Settings
          </Link>
          <h1 className="session-management__title">Active Sessions</h1>
          <p className="session-management__description">
            These are the devices that are currently logged into your account.
            You can revoke any session to sign out that device.
          </p>
        </div>

        {error && (
          <div className="session-management__error">
            {error}
            <button 
              className="session-management__error-dismiss"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="session-management__loading">
            <div className="session-management__spinner">⏳</div>
            <p>Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="session-management__empty">
            <p>No active sessions found.</p>
          </div>
        ) : (
          <div className="session-management__list">
            {sessions.map((session) => {
              const device = parseDeviceInfo(session.deviceInfo);
              return (
                <div 
                  key={session.id} 
                  className={`session-card ${session.isCurrent ? 'session-card--current' : ''}`}
                >
                  <div className="session-card__info">
                    <div className="session-card__device">
                      <span className="session-card__icon">
                        {device.os === 'iOS' || device.os === 'Android' ? '📱' : '💻'}
                      </span>
                      <div className="session-card__details">
                        <span className="session-card__browser">{device.browser}</span>
                        <span className="session-card__os">on {device.os}</span>
                      </div>
                    </div>
                    
                    <div className="session-card__meta">
                      {session.ipAddress && (
                        <span className="session-card__ip">
                          IP: {session.ipAddress}
                        </span>
                      )}
                      <span className="session-card__date">
                        Signed in: {formatDate(session.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="session-card__actions">
                    {session.isCurrent ? (
                      <span className="session-card__current-badge">
                        This device
                      </span>
                    ) : (
                      <button
                        className="session-card__revoke-button"
                        onClick={() => handleRevoke(session.id)}
                        disabled={revokingId === session.id}
                      >
                        {revokingId === session.id ? (
                          <>⏳ Revoking...</>
                        ) : (
                          <>🚫 Revoke</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="session-management__footer">
          <p className="session-management__note">
            💡 If you see a session you don't recognize, revoke it immediately
            and consider changing your password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
