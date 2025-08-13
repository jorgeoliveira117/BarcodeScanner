import React, { useState, useEffect } from 'react';
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
import { BARCODE_TYPES, modifySession, Session } from '../utils/storage';
import { Code, CodeType } from 'react-native-vision-camera';

const EditSessionScreen = ({ route, navigation }: any) => {
  const { session }: { session: Session } = route.params;

  const [name, setName] = useState(session.name);
  const [location, setLocation] = useState(session.location);
  const [expectedCodes, setExpectedCodes] = useState(
    session.expectedCodes.toString(),
  );
  const [expectedCodeTypes, setExpectedCodeTypes] = useState<CodeType[]>(
    session.expectedCodeTypes,
  );
  const [autosavePictures, setAutosavePictures] = useState(
    session.autosavePictures,
  );
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

  const handleSaveSession = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await modifySession(session.id, {
        name: name.trim(),
        location: location.trim(),
        expectedCodeTypes,
        expectedCodes: parseInt(expectedCodes),
        autosavePictures,
      });

      Alert.alert(
        'Session Updated',
        `Session "${name}" has been updated successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update session. Please try again.');
      console.error('Error updating session:', error);
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
          <Text style={styles.title}>Edit Session</Text>

          <View style={styles.readOnlyContainer}>
            <Text style={styles.readOnlyLabel}>Session ID:</Text>
            <Text style={styles.readOnlyValue}>{session.id}</Text>
          </View>

          <View style={styles.readOnlyContainer}>
            <Text style={styles.readOnlyLabel}>Folder Name:</Text>
            <Text style={styles.readOnlyValue}>{session.folderName}</Text>
          </View>

          <View style={styles.readOnlyContainer}>
            <Text style={styles.readOnlyLabel}>Barcodes Scanned:</Text>
            <Text style={styles.readOnlyValue}>{session.barcodes.length}</Text>
          </View>

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
              onPress={handleSaveSession}
              style={styles.saveButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Save Changes
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
  readOnlyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginBottom: 8,
  },
  readOnlyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  readOnlyValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  input: {
    marginBottom: 8,
    marginTop: 8,
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
  saveButton: {
    flex: 1,
  },
});

export default EditSessionScreen;
