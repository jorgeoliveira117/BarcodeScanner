import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import {
  Button,
  Text,
  FAB,
  IconButton,
  Chip,
  useTheme,
  Icon,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Session } from '../utils/storage';
import { setActiveSession } from '../utils/activeSession';
import { useTranslation } from 'react-i18next';
import { useSessions } from '../hooks/useSessions';
import SessionCard from '../components/SessionCard';
import { RootStackParamList } from '../navigation/types';

type SessionsListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SessionsList'
>;

const SessionsListScreen = ({ navigation }: SessionsListScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { sessions, loadSessions, deleteAndRefreshSession } = useSessions();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSessions();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDeleteSession = (sessionId: number) => {
    Alert.alert(
      t('sessionList.deleteSessionTitle'),
      t('sessionList.deleteSessionMessage'),
      [
        { text: t('alert.cancel'), style: 'cancel' },
        {
          text: t('alert.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteAndRefreshSession(sessionId);
          },
        },
      ],
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleResumeSession = async (session: Session) => {
    console.log('🎯 Resuming session:', session.id);
    try {
      // Set the active session immediately
      await setActiveSession(session.id);
      console.log('✅ Active session set successfully');
      // Navigate to scanner with session ID
      navigation.navigate('Scanner', { sessionId: session.id });
    } catch (error) {
      console.error('❌ Error setting active session:', error);
      // Still navigate, let the scanner handle it
      navigation.navigate('Scanner', { sessionId: session.id });
    }
  };

  const handleViewHistory = (session: Session) => {
    navigation.navigate('History', { sessionId: session.id });
  };

  const handleEditSession = (session: Session) => {
    navigation.navigate('SessionForm', { session, mode: 'edit' });
  };

  const openGoogleMaps = async (session: Session) => {
    if (!session.gpsLocation) {
      Alert.alert(
        t('sessionList.openMaps.noGPSTitle'),
        t('sessionList.openMaps.noGPSMessage'),
      );
      return;
    }

    const { latitude, longitude } = session.gpsLocation;
    const label = encodeURIComponent(session.name);

    // Create Google Maps URL
    const googleMapsUrl = Platform.select({
      ios: `maps://maps.google.com/maps?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=16&t=m`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})&z=16`,
    });

    // Fallback to web Google Maps if native apps aren't available
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;

    try {
      const canOpen = await Linking.canOpenURL(googleMapsUrl!);
      if (canOpen) {
        await Linking.openURL(googleMapsUrl!);
      } else {
        // Try web fallback
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert(t('alert.error'), t('sessionList.openMaps.openError'));
    }
  };

  const renderSessionItem = ({ item }: { item: Session }) => (
    <SessionCard
      session={item}
      onOpenMaps={openGoogleMaps}
      onEdit={handleEditSession}
      onDelete={handleDeleteSession}
      onResume={handleResumeSession}
      onViewHistory={handleViewHistory}
      t={t}
    />
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
          {t('sessionList.title')}
        </Text>
        <View style={styles(theme).headerSpacer} />
      </View>
      {sessions.length > 0 && (
        <Text style={styles(theme).countText}>
          {sessions.length}{' '}
          {sessions.length === 1
            ? t('sessionList.sessionLabel')
            : t('sessionList.sessionsLabel')}
        </Text>
      )}
      {sessions.length === 0 ? (
        <View style={styles(theme).emptyContainer}>
          <Text style={styles(theme).emptyText}>
            {t('sessionList.noSessions')}
          </Text>
          <Button
            mode="contained"
            onPress={() =>
              navigation.navigate('SessionForm', { mode: 'create' })
            }
            style={styles(theme).createButton}
          >
            {t('sessionList.createSession')}
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
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.outlineVariant,
      borderBottomWidth: 1,
      paddingBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sessionName: {
      fontWeight: 'bold',
      flex: 1,
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
    },
    location: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 8,
    },
    statsContainer: {
      marginBottom: 12,
    },
    statText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
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
      borderWidth: 0,
    },
    chipText: {
      color: theme.colors.background,
    },
    chipContent: {
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
      flex: 1,
    },
    completeChip: {
      backgroundColor: theme.colors.success,
    },
    completeChipText: {
      color: theme.colors.text,
    },
    incompleteChip: {
      backgroundColor: theme.colors.tertiary,
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
