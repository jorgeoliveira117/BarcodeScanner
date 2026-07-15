import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

interface PermissionStatusRowProps {
  label: string;
  statusText: string;
  statusColor: string;
  isGranted: boolean;
  onRequest: () => void;
  grantedLabel: string;
  requestLabel: string;
}

const PermissionStatusRow = ({
  label,
  statusText,
  statusColor,
  isGranted,
  onRequest,
  grantedLabel,
  requestLabel,
}: PermissionStatusRowProps) => {
  const theme = useTheme();

  return (
    <View style={styles(theme).permissionRow}>
      <View style={styles(theme).permissionInfo}>
        <Text style={styles(theme).permissionLabel}>{label}</Text>
        <Text style={[styles(theme).permissionStatus, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>
      <Button
        mode="outlined"
        onPress={onRequest}
        disabled={isGranted}
        style={styles(theme).permissionButton}
      >
        {isGranted ? grantedLabel : requestLabel}
      </Button>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    permissionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 8,
    },
    permissionInfo: {
      flex: 1,
    },
    permissionLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    permissionStatus: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 2,
    },
    permissionButton: {
      minWidth: 80,
    },
  });

export default PermissionStatusRow;
