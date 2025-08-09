import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

const HomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Barcode Scanner</Title>
          <Paragraph>
            Scan barcodes and save them locally. Export your scanned barcodes as
            CSV files.
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Scanner')}
          style={styles.button}
          icon="camera"
        >
          Start Scanning
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('History')}
          style={styles.button}
          icon="history"
        >
          View History
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#050019',
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
});

export default HomeScreen;
