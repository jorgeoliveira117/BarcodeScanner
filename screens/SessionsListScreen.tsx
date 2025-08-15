import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Button,
  Card,
  Text,
  FAB,
  IconButton,
  Chip,
  useTheme,
  Icon,
} from 'react-native-paper';
import { getSessions, deleteSession, Session } from '../utils/storage';

const SessionsListScreen = ({ navigation }: any) => {
  const theme = useTheme();
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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleResumeSession = (session: Session) => {
    navigation.navigate('Scanner', { sessionId: session.id });
  };

  const handleViewHistory = (session: Session) => {
    navigation.navigate('History', { sessionId: session.id });
  };

  const handleEditSession = (session: Session) => {
    navigation.navigate('SessionForm', { session, mode: 'edit' });
  };

  const renderSessionItem = ({ item }: { item: Session }) => (
    <Card style={styles(theme).card}>
      <Card.Content>
        <View style={styles(theme).cardHeader}>
          <Text style={styles(theme).sessionName}>{item.name}</Text>
          <View style={styles(theme).headerActions}>
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

        <Text style={styles(theme).location}>📍 {item.location}</Text>

        <View style={styles(theme).statsContainer}>
          <Text style={styles(theme).statText}>
            {item.barcodes.length} / {item.expectedCodes} barcodes
          </Text>
          <Text style={styles(theme).statText}>
            Expected: {item.expectedCodeTypes.join(', ')}
          </Text>
        </View>

        <View style={styles(theme).chipsContainer}>
          {item.autosavePictures && (
            <Chip mode="outlined" style={styles(theme).chip}>
              📷 Auto-save Photos
            </Chip>
          )}
          <Chip
            mode="outlined"
            style={[
              styles(theme).chip,
              item.barcodes.length >= item.expectedCodes
                ? styles(theme).completeChip
                : styles(theme).incompleteChip,
            ]}
          >
            {item.barcodes.length >= item.expectedCodes ? (
              <View style={styles(theme).chipContent}>
                <Icon source="check" size={16} color="#F7F7FF" />
                <Text style={styles(theme).completeChipText}>Complete</Text>
              </View>
            ) : (
              <View style={styles(theme).chipContent}>
                <Icon
                  source="timer-sand"
                  size={16}
                  color={theme.colors.background}
                />
                <Text style={styles(theme).incompleteChipText}>
                  In Progress
                </Text>
              </View>
            )}
          </Chip>
        </View>

        <View style={styles(theme).buttonContainer}>
          <Button
            mode="contained"
            onPress={() => handleResumeSession(item)}
            style={styles(theme).actionButton}
            icon="play"
          >
            Resume
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleViewHistory(item)}
            style={styles(theme).actionButton}
            icon="history"
          >
            View History
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#F7F7FF"
          onPress={handleGoBack}
          style={styles(theme).backButton}
        />
        <Text style={styles(theme).headerTitle} variant="headlineSmall">
          Session List
        </Text>
        <View style={styles(theme).headerSpacer} />
      </View>
      <ScrollView style={styles(theme).scrollView}>
        {sessions.length > 0 && (
          <Text style={styles(theme).countText}>
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
          </Text>
        )}
        {sessions.length === 0 ? (
          <View style={styles(theme).emptyContainer}>
            <Text style={styles(theme).emptyText}>No sessions created yet</Text>
            <Button
              mode="contained"
              onPress={() =>
                navigation.navigate('SessionForm', { mode: 'create' })
              }
              style={styles(theme).createButton}
            >
              Create Your First Session
            </Button>
          </View>
        ) : (
          <FlatList
            data={sessions}
            renderItem={renderSessionItem}
            keyExtractor={item => item.id.toString()}
            style={styles(theme).list}
          />
        )}
      </ScrollView>
      {sessions.length > 0 && (
        <FAB
          icon="plus"
          style={styles(theme).fab}
          onPress={() => navigation.navigate('SessionForm', { mode: 'create' })}
        />
      )}
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 12,
      paddingTop: Platform.OS === 'ios' ? 50 : 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    backButton: {
      margin: 0,
    },
    headerTitle: {
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 40, // Same width as back button to center the title
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      position: 'relative',
    },
    countText: {
      fontSize: 14,
      color: theme.colors.text,
      paddingHorizontal: 16,
      paddingVertical: 8,
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
      color: theme.colors.outlineVariant,
      marginBottom: 8,
    },
    statsContainer: {
      marginBottom: 12,
    },
    statText: {
      fontSize: 12,
      color: theme.colors.outlineVariant,
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
    chipContent: {
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
      flex: 1,
    },
    completeChip: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    completeChipText: {
      color: theme.colors.text,
    },
    incompleteChip: {
      backgroundColor: theme.colors.tertiary,
      borderColor: theme.colors.tertiary,
    },
    incompleteChipText: {
      color: theme.colors.background,
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
      color: theme.colors.text,
    },
    createButton: {
      paddingVertical: 5,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
  });

export default SessionsListScreen;
