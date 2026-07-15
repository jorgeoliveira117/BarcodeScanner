import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, BackHandler } from 'react-native';
import { Button, Text, useTheme, Icon } from 'react-native-paper';
import { useActiveSession } from '../hooks/useActiveSession';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppScreenHeader from '../components/AppScreenHeader';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { activeSession, activeSessionData, loadActiveSession } =
    useActiveSession();

  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

  // Add focus listener to refresh active session when returning to home
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadActiveSession();
    });

    return unsubscribe;
  }, [navigation, loadActiveSession]);

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
      <AppScreenHeader
        title={t('home.title')}
        titleVariant="headlineMedium"
        showBackButton={false}
      />
      <View style={styles(theme).content}>
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
            onPress={() =>
              navigation.navigate('SessionForm', { mode: 'create' })
            }
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

          <Button
            mode="outlined"
            onPress={() => {
              // Exit the app
              if (Platform.OS === 'android') {
                BackHandler.exitApp();
              }
            }}
            style={styles(theme).button}
            icon="exit-to-app"
          >
            {t('home.exitButton')}
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    subtitle: {
      textAlign: 'center',
      color: theme.colors.text,
      marginBottom: 12,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
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
