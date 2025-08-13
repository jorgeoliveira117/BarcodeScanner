import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Button,
  TextInput,
  Text,
  Card,
  Chip,
  Switch,
  HelperText,
} from 'react-native-paper';
import { BARCODE_TYPES, createSession } from '../utils/storage';
import { CodeType } from 'react-native-vision-camera';

const CreateSessionScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [expectedCodes, setExpectedCodes] = useState('');
  const [expectedCodeTypes, setExpectedCodeTypes] = useState<CodeType[]>([]);
  const [autosavePictures, setAutosavePictures] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    location: '',
    expectedCodes: '',
    expectedCodeTypes: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      location: '',
      expectedCodes: '',
      expectedCodeTypes: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Session name is required';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    const codesNum = parseInt(expectedCodes);
    if (!expectedCodes || isNaN(codesNum) || codesNum <= 0) {
      newErrors.expectedCodes = 'Please enter a valid number of expected codes';
    }

    if (expectedCodeTypes.length === 0) {
      newErrors.expectedCodeTypes = 'Please select at least one barcode type';
    }

    setErrors(newErrors);

    return Object.values(newErrors).every(error => error === '');
  };

  const handleCreateSession = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const newSession = await createSession({
        name: name.trim(),
        folderName: '', // This will be auto-generated
        location: location.trim(),
        expectedCodeTypes,
        expectedCodes: parseInt(expectedCodes),
        autosavePictures,
      });

      Alert.alert(
        'Session Created',
        `Session "${newSession.name}" has been created successfully!`,
        [
          {
            text: 'Start Scanning',
            onPress: () =>
              navigation.navigate('Scanner', { sessionId: newSession.id }),
          },
          {
            text: 'Go to Sessions',
            onPress: () => navigation.navigate('SessionsList'),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create session. Please try again.');
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCodeType = (type: CodeType) => {
    setExpectedCodeTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Create New Session</Text>

          <TextInput
            label="Session Name *"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            placeholder="e.g., Warehouse Audit 2025"
            error={!!errors.name}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            label="Location *"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
            mode="outlined"
            placeholder="e.g., Building A, Floor 2"
            error={!!errors.location}
          />
          <HelperText type="error" visible={!!errors.location}>
            {errors.location}
          </HelperText>

          <TextInput
            label="Expected Number of Codes *"
            value={expectedCodes}
            onChangeText={setExpectedCodes}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            placeholder="e.g., 100"
            error={!!errors.expectedCodes}
          />
          <HelperText type="error" visible={!!errors.expectedCodes}>
            {errors.expectedCodes}
          </HelperText>

          <Text style={styles.sectionTitle}>Expected Barcode Types *</Text>
          <View style={styles.chipsContainer}>
            {BARCODE_TYPES.map(type => (
              <Chip
                key={type}
                mode={expectedCodeTypes.includes(type) ? 'flat' : 'outlined'}
                selected={expectedCodeTypes.includes(type)}
                onPress={() => toggleCodeType(type)}
                style={styles.chip}
              >
                {type}
              </Chip>
            ))}
          </View>
          <HelperText type="error" visible={!!errors.expectedCodeTypes}>
            {errors.expectedCodeTypes}
          </HelperText>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Auto-save Pictures</Text>
              <Text style={styles.switchDescription}>
                Automatically save a photo with each scanned barcode
              </Text>
            </View>
            <Switch
              value={autosavePictures}
              onValueChange={setAutosavePictures}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateSession}
              style={styles.createButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Create Session
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
});

export default CreateSessionScreen;
