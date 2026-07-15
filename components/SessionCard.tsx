import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Button,
  Chip,
  Icon,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';

import { Session } from '../utils/storage';

interface SessionCardProps {
  session: Session;
  onOpenMaps: (session: Session) => void;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: number) => void;
  onResume: (session: Session) => void;
  onViewHistory: (session: Session) => void;
  t: (key: string) => string;
}

const SessionCard = ({
  session,
  onOpenMaps,
  onEdit,
  onDelete,
  onResume,
  onViewHistory,
  t,
}: SessionCardProps) => {
  const theme = useTheme();

  return (
    <View style={styles(theme).card}>
      <View style={styles(theme).cardHeader}>
        <Text style={styles(theme).sessionName} variant="titleLarge">
          {session.name}
        </Text>
        <View style={styles(theme).headerActions}>
          {session.gpsLocation && (
            <IconButton
              icon="map-marker"
              size={20}
              onPress={() => onOpenMaps(session)}
              iconColor="#F7F7FF"
            />
          )}
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(session)}
            iconColor="#F7F7FF"
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => onDelete(session.id)}
            iconColor="#F7F7FF"
          />
        </View>
      </View>

      <Text style={styles(theme).location}>
        <Icon source="map-marker" size={16} color="#F7F7FF" />{' '}
        {session.location}
      </Text>

      <View style={styles(theme).statsContainer}>
        <Text style={styles(theme).statText}>
          {session.barcodes.length} / {session.expectedCodes}{' '}
          {t('sessionList.session.barcodes')}
        </Text>
        {session.expectedCodeTypes && session.expectedCodeTypes.length > 0 && (
          <Text style={styles(theme).statText}>
            {t('sessionList.session.barcodesExpected')}{' '}
            {session.expectedCodeTypes.join(', ').toUpperCase()}
          </Text>
        )}
        {session.codesToIgnore && session.codesToIgnore.length > 0 && (
          <Text style={styles(theme).statText}>
            {t('sessionList.session.barcodesIgnored')}{' '}
            {session.codesToIgnore.join(', ').toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles(theme).chipsContainer}>
        {session.autosavePictures && (
          <Chip
            mode="outlined"
            style={styles(theme).chip}
            textStyle={styles(theme).chipText}
          >
            <View style={styles(theme).chipContent}>
              <Icon source="camera" size={16} color={theme.colors.background} />
              <Text style={styles(theme).chipText}>
                {t('sessionList.session.autoSave')}
              </Text>
            </View>
          </Chip>
        )}
        <Chip
          mode="outlined"
          style={[
            styles(theme).chip,
            session.barcodes.length >= session.expectedCodes
              ? styles(theme).completeChip
              : styles(theme).incompleteChip,
          ]}
        >
          {session.barcodes.length >= session.expectedCodes ? (
            <View style={styles(theme).chipContent}>
              <Icon source="check" size={16} color="#F7F7FF" />
              <Text style={styles(theme).completeChipText}>
                {t('sessionList.session.complete')}
              </Text>
            </View>
          ) : (
            <View style={styles(theme).chipContent}>
              <Icon
                source="timer-sand"
                size={16}
                color={theme.colors.background}
              />
              <Text style={styles(theme).incompleteChipText}>
                {t('sessionList.session.inProgress')}
              </Text>
            </View>
          )}
        </Chip>
      </View>

      <View style={styles(theme).buttonContainer}>
        <Button
          mode="contained"
          onPress={() => onResume(session)}
          style={styles(theme).actionButton}
          icon="play"
        >
          {t('sessionList.session.resume')}
        </Button>
        <Button
          mode="outlined"
          onPress={() => onViewHistory(session)}
          style={styles(theme).actionButton}
          icon="history"
        >
          {t('sessionList.session.viewHistory')}
        </Button>
      </View>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
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
  });

export default SessionCard;
