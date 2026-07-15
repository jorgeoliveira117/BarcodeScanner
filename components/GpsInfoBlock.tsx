import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { GPSLocation } from '../utils/storage';

interface GpsInfoBlockProps {
  gpsLocation: GPSLocation | null;
  isGettingLocation: boolean;
  onGetLocation: () => void;
  onClearLocation: () => void;
  t: (key: string) => string;
}

const GpsInfoBlock = ({
  gpsLocation,
  isGettingLocation,
  onGetLocation,
  onClearLocation,
  t,
}: GpsInfoBlockProps) => {
  const theme = useTheme();

  return (
    <View style={styles(theme).gpsContainer}>
      {gpsLocation ? (
        <View style={styles(theme).gpsInfoContainer}>
          <View style={styles(theme).gpsInfo}>
            <Text style={styles(theme).gpsLabel}>
              {t('sessionForm.form.gps.lat')}:
            </Text>
            <Text style={styles(theme).gpsValue}>
              {gpsLocation.latitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles(theme).gpsInfo}>
            <Text style={styles(theme).gpsLabel}>
              {t('sessionForm.form.gps.lon')}:
            </Text>
            <Text style={styles(theme).gpsValue}>
              {gpsLocation.longitude.toFixed(6)}
            </Text>
          </View>
          <Text style={styles(theme).gpsTimestamp}>
            {t('sessionForm.form.gps.updated')}{' '}
            {new Date(gpsLocation.timestamp).toLocaleString()}
          </Text>
        </View>
      ) : (
        <Text style={styles(theme).noGpsText}>
          {t('sessionForm.form.gps.none')}
        </Text>
      )}

      <View style={styles(theme).gpsButtonContainer}>
        <Button
          mode="outlined"
          onPress={onGetLocation}
          style={styles(theme).gpsButton}
          loading={isGettingLocation}
          disabled={isGettingLocation}
          icon="crosshairs-gps"
        >
          {isGettingLocation
            ? t('sessionForm.form.gps.gettingLocation')
            : t('sessionForm.form.gps.getLocation')}
        </Button>
        {gpsLocation ? (
          <Button
            mode="text"
            onPress={onClearLocation}
            style={styles(theme).clearGpsButton}
            textColor={theme.colors.error}
            icon="delete"
          >
            {t('sessionForm.form.gps.clearLocation')}
          </Button>
        ) : null}
      </View>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    gpsContainer: {
      marginBottom: 20,
    },
    gpsInfoContainer: {
      marginBottom: 12,
    },
    gpsInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    gpsLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
    gpsValue: {
      fontSize: 14,
      fontFamily: 'monospace',
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    gpsTimestamp: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
    noGpsText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      marginBottom: 12,
    },
    gpsButtonContainer: {
      gap: 8,
    },
    gpsButton: {
      flex: 1,
    },
    clearGpsButton: {
      flex: 0.5,
    },
  });

export default GpsInfoBlock;
