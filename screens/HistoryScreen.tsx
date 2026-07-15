import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Share } from 'react-native';
import {
  Button,
  Text,
  FAB,
  Searchbar,
  IconButton,
  useTheme,
  Icon,
} from 'react-native-paper';
import {
  getBarcodesFromSession,
  removeBarcodeFromSession,
  exportSessionToCSV,
  exportSessionToJSON,
  Session,
} from '../utils/storage';
import { useTranslation } from 'react-i18next';
import { useSession } from '../hooks/useSession';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import BarcodeHistoryItem, {
  HistoryBarcodeItemData,
} from '../components/BarcodeHistoryItem';
import AppScreenHeader from '../components/AppScreenHeader';

type HistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'History'>;

const HistoryScreen = ({ route, navigation }: HistoryScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { sessionId } = route.params || {};
  const { session, loadSession } = useSession();
  const [barcodes, setBarcodes] = useState<HistoryBarcodeItemData[]>([]);
  const [filteredBarcodes, setFilteredBarcodes] = useState<
    HistoryBarcodeItemData[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (sessionId !== null && sessionId !== undefined) {
      loadSessionData();
    } else {
      // If no sessionId provided, redirect to sessions list
      navigation.replace('SessionsList');
    }
  }, [sessionId]);

  useEffect(() => {
    // Filter barcodes based on search query
    const filtered = barcodes.filter(
      barcode =>
        barcode.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barcode.type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredBarcodes(filtered);
  }, [searchQuery, barcodes]);

  const loadSessionData = async () => {
    if (sessionId === null || sessionId === undefined) return;

    const sessionData = await loadSession(sessionId);

    if (sessionData) {
      const sessionBarcodes = await getBarcodesFromSession(sessionId);
      setBarcodes(sessionBarcodes);
    }
  };

  const handleExport = async () => {
    if (sessionId === null || sessionId === undefined) return;

    try {
      // Export both CSV and JSON simultaneously
      const [csvPath, jsonPath] = await Promise.all([
        exportSessionToCSV(sessionId),
        exportSessionToJSON(sessionId),
      ]);

      Alert.alert(
        t('history.exportSuccessTitle'),
        t('history.exportSuccessMessage', { csvPath, jsonPath }),
        [
          {
            text: t('history.exportShareCSV'),
            onPress: () => Share.share({ url: `file://${csvPath}` }),
          },
          {
            text: t('history.exportShareJSON'),
            onPress: () => Share.share({ url: `file://${jsonPath}` }),
          },
          { text: t('alert.ok') },
        ],
      );
    } catch (error) {
      Alert.alert(
        t('history.exportErrorTitle'),
        t('history.exportErrorMessage'),
      );
      console.error('Export error:', error);
    }
  };

  const handleDeleteBarcode = (barcodeId: string) => {
    Alert.alert(t('history.deleteTitle'), t('history.deleteMessage'), [
      { text: t('alert.cancel'), style: 'cancel' },
      {
        text: t('alert.delete'),
        style: 'destructive',
        onPress: async () => {
          if (sessionId !== null && sessionId !== undefined) {
            await removeBarcodeFromSession(sessionId, barcodeId);
            loadSessionData();
          }
        },
      },
    ]);
  };

  const showPhotoModal = (photoPath?: string, barcodeValue?: string) => {
    if (!photoPath) return;

    Alert.alert(
      t('history.photoModalTitle'),
      t('history.photoModalMessage', { barcodeValue, photoPath }),
      [
        {
          text: t('alert.share'),
          onPress: () => Share.share({ url: `file://${photoPath}` }),
        },
        { text: t('alert.close') },
      ],
    );
  };

  const renderBarcodeItem = ({ item }: { item: HistoryBarcodeItemData }) => (
    <BarcodeHistoryItem
      item={item}
      onDelete={handleDeleteBarcode}
      onShowPhoto={showPhotoModal}
    />
  );

  if (!session) {
    return (
      <View style={styles(theme).loadingContainer}>
        <Text>{t('history.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <AppScreenHeader
        title={t('history.title')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles(theme).sessionCard}>
        <Text style={styles(theme).sessionTitle}>{session.name}</Text>
        <Text style={styles(theme).sessionLocation}>
          <Icon source="map-marker" size={16} color="#F7F7FF" />{' '}
          {session.location}
        </Text>
        <Text style={styles(theme).sessionProgress}>
          {t('history.progress', {
            current: barcodes.length,
            total: session.expectedCodes,
          })}
        </Text>
      </View>

      <Searchbar
        placeholder={t('history.searchPlaceholder')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles(theme).searchbar}
      />

      <View style={styles(theme).countContainer}>
        <Text style={styles(theme).countText}>
          {t('history.searchResults', { count: filteredBarcodes.length })}
        </Text>
        <IconButton
          icon="export"
          onPress={handleExport}
          disabled={barcodes.length === 0}
          iconColor="#F7F7FF"
        />
      </View>

      {filteredBarcodes.length === 0 ? (
        <View style={styles(theme).emptyContainer}>
          <Text style={styles(theme).emptyText}>
            {barcodes.length === 0
              ? t('history.noBarcodesScanned')
              : t('history.searchNoResults')}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Scanner', { sessionId })}
            style={styles(theme).scanButton}
          >
            {t('history.startScanning')}
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredBarcodes}
          renderItem={renderBarcodeItem}
          keyExtractor={item => item.id}
          style={styles(theme).list}
        />
      )}

      <FAB
        icon="qrcode-scan"
        style={styles(theme).fab}
        onPress={() => navigation.navigate('Scanner', { sessionId })}
      />
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sessionCard: {
      margin: 16,
      marginBottom: 0,
    },
    sessionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.colors.text,
    },
    sessionLocation: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    sessionProgress: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    searchbar: {
      margin: 16,
    },
    countContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    countText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    list: {
      flex: 1,
      paddingHorizontal: 16,
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
      color: theme.colors.onSurfaceVariant,
    },
    scanButton: {
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

export default HistoryScreen;
