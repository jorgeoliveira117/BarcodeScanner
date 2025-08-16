import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme, Icon } from 'react-native-paper';
import { getSessions, Session, getSessionById } from '../utils/storage';
import {
  getActiveSessionData,
  ActiveSessionData,
} from '../utils/activeSession';
import { useTranslation } from 'react-i18next';

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeSessionData, setActiveSessionData] =
    useState<ActiveSessionData | null>(null);

  useEffect(() => {
    loadActiveSession();
  }, []);

  // Add focus listener to refresh active session when returning to home
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadActiveSession();
    });

    return unsubscribe;
  }, [navigation]);

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
      return t('home.sessionLastAccessedNow');
    } else if (diffHours < 24) {
      return `${diffHours} ${t('home.sessionLastAccessedHoursAgo')}`;
    } else if (diffDays === 1) {
      return t('home.sessionLastAccessedYesterday');
    } else {
      return `${diffDays} ${t('home.sessionLastAccessedDaysAgo')}`;
    }
  };

  return (
    <View style={styles(theme).container}>
      <Text variant="displaySmall" style={styles(theme).title}>
        {t('home.title')}
      </Text>
      <Text variant="bodyMedium" style={styles(theme).subtitle}>
        {t('home.description')}
      </Text>
      {activeSession && activeSessionData && (
        <View style={styles(theme).activeSessionContainer}>
          <Text style={styles(theme).activeSessionLabel}>
            {t('home.sessionActiveLabel')}
          </Text>
          <Text style={styles(theme).activeSessionName}>
            {activeSession.name}
          </Text>
          <View style={styles(theme).activeSessionDetails}>
            <View style={styles(theme).detailItem}>
              <Icon source="map-marker" size={16} />
              <Text>{activeSession.location}</Text>
            </View>
            <View style={styles(theme).detailItem}>
              <Icon source="counter" size={16} />
              <Text>
                {activeSession.barcodes.length}{' '}
                {activeSession.barcodes.length === 1
                  ? t('home.sessionCodeLabel')
                  : t('home.sessionCodesLabel')}
              </Text>
            </View>
          </View>
          <Text style={styles(theme).lastAccessedText}>
            {t('home.sessionLastAccessedLabel')}{' '}
            {formatLastAccessed(activeSessionData.lastAccessed)}
          </Text>
        </View>
      )}

      <View style={styles(theme).buttonContainer}>
        <Button
          mode="contained"
          onPress={handleResumeSession}
          style={[
            styles(theme).button,
            activeSession
              ? styles(theme).resumeButtonActive
              : styles(theme).resumeButtonInactive,
          ]}
          icon={activeSession ? 'play' : 'view-list'}
          disabled={!activeSession}
        >
          {activeSession
            ? t('home.scannerButtonResume')
            : t('home.scannerButtonNone')}
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('SessionForm', { mode: 'create' })}
          style={styles(theme).button}
          icon="plus"
        >
          {t('home.createSessionButton')}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('SessionsList')}
          style={styles(theme).button}
          icon="view-list"
        >
          {t('home.sessionsListButton')}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Settings')}
          style={styles(theme).button}
          icon="cog"
        >
          {t('home.settingsButton')}
        </Button>
      </View>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    title: {
      textAlign: 'center',
      color: theme.colors.text,
    },
    subtitle: {
      textAlign: 'center',
      color: theme.colors.text,
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
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
      backgroundColor: theme.colors.success,
    },
    resumeButtonInactive: {
      backgroundColor: '#2F4858',
    },
    activeSessionContainer: {
      marginTop: 15,
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    activeSessionLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    activeSessionName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.background,
      marginTop: 2,
    },
    activeSessionDetails: {
      fontSize: 14,
      color: theme.colors.background,
      marginTop: 4,
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    lastAccessedText: {
      fontSize: 11,
      color: theme.colors.background,
      marginTop: 4,
      fontStyle: 'italic',
    },
    activeSessionText: {
      marginTop: 10,
      fontStyle: 'italic',
      color: theme.colors.primary,
    },
  });

export default HomeScreen;
