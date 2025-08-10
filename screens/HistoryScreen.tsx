import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Share } from 'react-native';
import {
  Button,
  Card,
  Text,
  FAB,
  Searchbar,
  IconButton,
} from 'react-native-paper';
import { getBarcodes, clearAllBarcodes, exportToCSV } from '../utils/storage';
import { format } from 'date-fns';

interface Barcode {
  id: string;
  value: string;
  type: string;
  timestamp: string;
  photoPath?: string;
}

const HistoryScreen = ({ navigation }: any) => {
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [filteredBarcodes, setFilteredBarcodes] = useState<Barcode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBarcodes();
  }, []);

  useEffect(() => {
    // Filter barcodes based on search query
    const filtered = barcodes.filter(
      barcode =>
        barcode.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barcode.type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredBarcodes(filtered);
  }, [searchQuery, barcodes]);

  const loadBarcodes = async () => {
    const savedBarcodes = await getBarcodes();
    setBarcodes(savedBarcodes);
  };

  const handleExport = async () => {
    try {
      const csvPath = await exportToCSV(barcodes);
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

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Barcodes',
      'Are you sure you want to delete all scanned barcodes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllBarcodes();
            setBarcodes([]);
          },
        },
      ],
    );
  };

  const renderBarcodeItem = ({ item }: { item: Barcode }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.barcodeType}>{item.type.toUpperCase()}</Text>
          <Text style={styles.timestamp}>
            {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
          </Text>
        </View>
        <Text style={styles.barcodeValue}>{item.value}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search barcodes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.header}>
        <Text style={styles.countText}>
          {filteredBarcodes.length} barcode(s) found
        </Text>
        <View style={styles.headerButtons}>
          <IconButton
            icon="export"
            mode="contained"
            onPress={handleExport}
            disabled={barcodes.length === 0}
          />
          <IconButton
            icon="delete"
            mode="contained"
            onPress={handleClearAll}
            disabled={barcodes.length === 0}
          />
        </View>
      </View>

      {filteredBarcodes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {barcodes.length === 0
              ? 'No barcodes scanned yet'
              : 'No barcodes match your search'}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Scanner')}
            style={styles.scanButton}
          >
            Start Scanning
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredBarcodes}
          renderItem={renderBarcodeItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}

      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        onPress={() => navigation.navigate('Scanner')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: '#666',
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
  barcodeType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ea',
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  barcodeValue: {
    fontSize: 16,
    fontFamily: 'monospace',
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
    color: '#666',
  },
  scanButton: {
    paddingVertical: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});

export default HistoryScreen;
