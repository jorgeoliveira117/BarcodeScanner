import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph, Text } from 'react-native-paper';
import { getSessions, Session } from '../utils/storage';

const HomeScreen = ({ navigation }: any) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const allSessions = await getSessions();
    setSessions(allSessions);
    // For now, just get the most recent session as "active"
    if (allSessions.length > 0) {
      setActiveSession(allSessions[0]);
    }
  };

  const handleResumeSession = () => {
    if (activeSession) {
      navigation.navigate('Scanner', { sessionId: activeSession.id });
    } else {
      navigation.navigate('SessionsList');
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
          {activeSession && (
            <Text style={styles.activeSessionText}>
              Active Session: {activeSession.name}
            </Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleResumeSession}
          style={styles.button}
          icon="play"
          disabled={!activeSession}
        >
          {activeSession ? 'Resume Session' : 'No Active Session'}
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateSession')}
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
          Check Sessions
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
  activeSessionText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#6200ea',
  },
});

export default HomeScreen;
