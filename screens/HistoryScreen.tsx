import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Share,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  Button,
  Card,
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
  getSessionById,
  Session,
} from '../utils/storage';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Barcode {
  id: string;
  value: string;
  type: string;
  timestamp: string;
  photoPath?: string;
}

const HistoryScreen = ({ route, navigation }: any) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { sessionId } = route.params || {};
  const [session, setSession] = useState<Session | null>(null);
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [filteredBarcodes, setFilteredBarcodes] = useState<Barcode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (sessionId) {
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
    if (!sessionId) return;

    const sessionData = await getSessionById(sessionId);
    setSession(sessionData);

    if (sessionData) {
      const sessionBarcodes = await getBarcodesFromSession(sessionId);
      setBarcodes(sessionBarcodes);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleExport = async () => {
    if (!sessionId) return;

    try {
      const csvPath = await exportSessionToCSV(sessionId);
      Alert.alert(
        t('history.exportSuccessTitle'),
        `${t('history.exportSuccessMessage')} ${csvPath}`,
        [
          {
            text: t('alert.share'),
            onPress: () => Share.share({ url: `file://${csvPath}` }),
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
          if (sessionId) {
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

  const renderBarcodeItem = ({ item }: { item: Barcode }) => (
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
            onPress={() => handleDeleteBarcode(item.id)}
          />
        </View>
      </View>
      <Text style={styles(theme).barcodeValue}>{item.value}</Text>
      {/* Add photo display */}
      {item.photoPath && (
        <TouchableOpacity
          style={styles(theme).photoContainer}
          onPress={() => showPhotoModal(item.photoPath, item.value)}
        >
          <Image
            source={{ uri: `file://${item.photoPath}` }}
            style={styles(theme).thumbnail}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
    </View>
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
      <View style={styles(theme).header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#F7F7FF"
          onPress={handleGoBack}
          style={styles(theme).backButton}
        />
        <Text style={styles(theme).headerTitle} variant="headlineSmall">
          {t('history.title')}
        </Text>
        <View style={styles(theme).headerSpacer} />
      </View>
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
    photoLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
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
