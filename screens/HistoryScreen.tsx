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
} from 'react-native-paper';
import {
  getBarcodesFromSession,
  removeBarcodeFromSession,
  exportSessionToCSV,
  getSessionById,
  Session,
} from '../utils/storage';
import { format } from 'date-fns';

interface Barcode {
  id: string;
  value: string;
  type: string;
  timestamp: string;
  photoPath?: string;
}

const HistoryScreen = ({ route, navigation }: any) => {
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
      Alert.alert('Export Successful', `CSV file created at: ${csvPath}`, [
        {
          text: 'Share',
          onPress: () => Share.share({ url: `file://${csvPath}` }),
        },
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export CSV file');
      console.error('Export error:', error);
    }
  };

  const handleDeleteBarcode = (barcodeId: string) => {
    Alert.alert(
      'Delete Barcode',
      'Are you sure you want to delete this barcode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (sessionId) {
              await removeBarcodeFromSession(sessionId, barcodeId);
              loadSessionData();
            }
          },
        },
      ],
    );
  };

  const showPhotoModal = (photoPath?: string, barcodeValue?: string) => {
    if (!photoPath) return;

    Alert.alert(
      'Barcode Photo',
      `Photo for: ${barcodeValue}\n\nSaved at: ${photoPath}`,
      [
        {
          text: 'Share Photo',
          onPress: () => Share.share({ url: `file://${photoPath}` }),
        },
        { text: 'Close' },
      ],
    );
  };

  const renderBarcodeItem = ({ item }: { item: Barcode }) => (
    <Card style={styles(theme).card}>
      <Card.Content>
        <View style={styles(theme).cardHeader}>
          <Text style={styles(theme).barcodeType}>
            {item.type.toUpperCase()}
          </Text>
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
            <Text style={styles(theme).photoLabel}>📷 Tap to view photo</Text>
          </TouchableOpacity>
        )}
      </Card.Content>
    </Card>
  );

  if (!session) {
    return (
      <View style={styles(theme).loadingContainer}>
        <Text>Loading session...</Text>
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
          Session History
        </Text>
        <View style={styles(theme).headerSpacer} />
      </View>
      <Card style={styles(theme).sessionCard}>
        <Card.Content>
          <Text style={styles(theme).sessionTitle}>{session.name}</Text>
          <Text style={styles(theme).sessionLocation}>
            📍 {session.location}
          </Text>
          <Text style={styles(theme).sessionProgress}>
            Progress: {barcodes.length} / {session.expectedCodes} barcodes
          </Text>
        </Card.Content>
      </Card>

      <Searchbar
        placeholder="Search barcodes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles(theme).searchbar}
      />

      <View style={styles(theme).header}>
        <Text style={styles(theme).countText}>
          {filteredBarcodes.length} barcode(s) found
        </Text>
        <View style={styles(theme).headerButtons}>
          <IconButton
            icon="export"
            mode="contained"
            onPress={handleExport}
            disabled={barcodes.length === 0}
          />
        </View>
      </View>

      {filteredBarcodes.length === 0 ? (
        <View style={styles(theme).emptyContainer}>
          <Text style={styles(theme).emptyText}>
            {barcodes.length === 0
              ? 'No barcodes scanned yet in this session'
              : 'No barcodes match your search'}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Scanner', { sessionId })}
            style={styles(theme).scanButton}
          >
            Start Scanning
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
      marginBottom: 8,
    },
    sessionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
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
    countText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    headerButtons: {
      flexDirection: 'row',
    },
    list: {
      flex: 1,
      paddingHorizontal: 16,
    },
    card: {
      marginBottom: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    barcodeType: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.primary,
      backgroundColor: theme.colors.onSurfaceVariant,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginRight: 4,
    },
    barcodeValue: {
      fontSize: 16,
      fontFamily: 'monospace',
    },
    photoContainer: {
      marginTop: 10,
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
    },
    thumbnail: {
      width: 100,
      height: 100,
      borderRadius: 8,
      marginBottom: 5,
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
