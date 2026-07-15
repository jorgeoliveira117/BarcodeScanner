import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { format } from 'date-fns';

export interface HistoryBarcodeItemData {
  id: string;
  value: string;
  type: string;
  timestamp: string;
  photoPath?: string;
}

interface BarcodeHistoryItemProps {
  item: HistoryBarcodeItemData;
  onDelete: (barcodeId: string) => void;
  onShowPhoto: (photoPath?: string, barcodeValue?: string) => void;
}

const BarcodeHistoryItem = ({
  item,
  onDelete,
  onShowPhoto,
}: BarcodeHistoryItemProps) => {
  const theme = useTheme();

  return (
    <View style={styles(theme).card}>
      <View style={styles(theme).cardHeader}>
        <Text style={styles(theme).barcodeType}>{item.type.toUpperCase()}</Text>
        <View style={styles(theme).headerActions}>
          <Text style={styles(theme).timestamp}>
            {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
          </Text>
          <IconButton
            icon="delete"
            size={16}
            onPress={() => onDelete(item.id)}
          />
        </View>
      </View>
      <Text style={styles(theme).barcodeValue}>{item.value}</Text>
      {item.photoPath ? (
        <TouchableOpacity
          style={styles(theme).photoContainer}
          onPress={() => onShowPhoto(item.photoPath, item.value)}
        >
          <Image
            source={{ uri: `file://${item.photoPath}` }}
            style={styles(theme).thumbnail}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    card: {
      marginBottom: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      paddingHorizontal: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    barcodeType: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginRight: 4,
    },
    barcodeValue: {
      fontSize: 16,
      fontFamily: 'monospace',
      color: theme.colors.text,
      marginLeft: 2,
      marginBottom: 8,
    },
    photoContainer: {
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
    },
    thumbnail: {
      width: 100,
      height: 100,
      borderRadius: 8,
      marginBottom: 6,
    },
  });

export default BarcodeHistoryItem;
