import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Button, Card, Text, FAB, IconButton, Chip } from 'react-native-paper';
import { getSessions, deleteSession, Session } from '../utils/storage';

const SessionsListScreen = ({ navigation }: any) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSessions();
    });

    return unsubscribe;
  }, [navigation]);

  const loadSessions = async () => {
    const allSessions = await getSessions();
    setSessions(allSessions);
  };

  const handleDeleteSession = (sessionId: number) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? All barcodes in this session will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(sessionId);
            loadSessions();
          },
        },
      ],
    );
  };

  const handleResumeSession = (session: Session) => {
    navigation.navigate('Scanner', { sessionId: session.id });
  };

  const handleViewHistory = (session: Session) => {
    navigation.navigate('History', { sessionId: session.id });
  };

  const handleEditSession = (session: Session) => {
    navigation.navigate('EditSession', { session });
  };

  const renderSessionItem = ({ item }: { item: Session }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.sessionName}>{item.name}</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => handleEditSession(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteSession(item.id)}
            />
          </View>
        </View>

        <Text style={styles.location}>📍 {item.location}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            {item.barcodes.length} / {item.expectedCodes} barcodes
          </Text>
          <Text style={styles.statText}>
            Expected: {item.expectedCodeTypes.join(', ')}
          </Text>
        </View>

        <View style={styles.chipsContainer}>
          {item.autosavePictures && (
            <Chip mode="outlined" style={styles.chip}>
              📷 Auto-save Photos
            </Chip>
          )}
          <Chip
            mode="outlined"
            style={[
              styles.chip,
              item.barcodes.length >= item.expectedCodes
                ? styles.completeChip
                : styles.incompleteChip,
            ]}
          >
            {item.barcodes.length >= item.expectedCodes
              ? '✅ Complete'
              : '⏳ In Progress'}
          </Chip>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => handleResumeSession(item)}
            style={styles.actionButton}
            icon="play"
          >
            Resume
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleViewHistory(item)}
            style={styles.actionButton}
            icon="history"
          >
            View History
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.countText}>{sessions.length} session(s)</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sessions created yet</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateSession')}
            style={styles.createButton}
          >
            Create Your First Session
          </Button>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateSession')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  completeChip: {
    backgroundColor: '#e8f5e8',
  },
  incompleteChip: {
    backgroundColor: '#fff3e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  createButton: {
    paddingVertical: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});

export default SessionsListScreen;
