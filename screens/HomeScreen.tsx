import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph, Text } from 'react-native-paper';
import { getSessions, Session, getSessionById } from '../utils/storage';
import {
  getActiveSessionId,
  getActiveSessionData,
  ActiveSessionData,
} from '../utils/activeSession';

const HomeScreen = ({ navigation }: any) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeSessionData, setActiveSessionData] =
    useState<ActiveSessionData | null>(null);

  useEffect(() => {
    loadSessions();
    loadActiveSession();
  }, []);

  // Add focus listener to refresh active session when returning to home
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadActiveSession();
    });

    return unsubscribe;
  }, [navigation]);

  const loadSessions = async () => {
    const allSessions = await getSessions();
    setSessions(allSessions);
  };

  const loadActiveSession = async () => {
    try {
      const activeSessionData = await getActiveSessionData();

      if (activeSessionData) {
        // Get the full session data
        const session = await getSessionById(activeSessionData.sessionId);

        if (session) {
          setActiveSession(session);
          setActiveSessionData(activeSessionData);
        } else {
          // Session doesn't exist anymore, clear active session
          setActiveSession(null);
          setActiveSessionData(null);
        }
      } else {
        setActiveSession(null);
        setActiveSessionData(null);
      }
    } catch (error) {
      console.error('Error loading active session:', error);
      setActiveSession(null);
      setActiveSessionData(null);
    }
  };

  const handleResumeSession = () => {
    if (activeSession) {
      navigation.navigate('Scanner', { sessionId: activeSession.id });
    } else {
      navigation.navigate('SessionsList');
    }
  };

  const formatLastAccessed = (lastAccessed: string) => {
    const date = new Date(lastAccessed);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Barcode Scanner</Title>
          <Paragraph>
            Organize your scans into sessions. Create, manage, and track your
            barcode scanning activities.
          </Paragraph>

          {activeSession && activeSessionData && (
            <View style={styles.activeSessionContainer}>
              <Text style={styles.activeSessionLabel}>Active Session:</Text>
              <Text style={styles.activeSessionName}>{activeSession.name}</Text>
              <Text style={styles.activeSessionDetails}>
                📍 {activeSession.location} • 📊 {activeSession.barcodes.length}{' '}
                codes
              </Text>
              <Text style={styles.lastAccessedText}>
                Last accessed:{' '}
                {formatLastAccessed(activeSessionData.lastAccessed)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleResumeSession}
          style={[
            styles.button,
            activeSession
              ? styles.resumeButtonActive
              : styles.resumeButtonInactive,
          ]}
          icon={activeSession ? 'play' : 'view-list'}
          disabled={!activeSession}
        >
          {activeSession ? 'Resume Session' : 'No Active Session'}
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('SessionForm', { mode: 'create' })}
          style={styles.button}
          icon="plus"
        >
          Create Session
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('SessionsList')}
          style={styles.button}
          icon="view-list"
        >
          All Sessions
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Settings')}
          style={styles.button}
          icon="cog"
        >
          Settings
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#050019',
  },
  card: {
    marginBottom: 30,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginVertical: 10,
    paddingVertical: 5,
  },
  resumeButtonActive: {
    backgroundColor: '#2e7d32', // Green for active session
  },
  resumeButtonInactive: {
    backgroundColor: '#757575', // Gray for no active session
  },
  activeSessionContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ea',
  },
  activeSessionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ea',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeSessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  activeSessionDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  lastAccessedText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  activeSessionText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#6200ea',
  },
});

export default HomeScreen;
