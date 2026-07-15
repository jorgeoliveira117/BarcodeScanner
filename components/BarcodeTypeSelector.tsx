import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, HelperText, Text, useTheme } from 'react-native-paper';
import { CodeType } from 'react-native-vision-camera';

interface BarcodeTypeSelectorProps {
  title: string;
  types: CodeType[];
  selectedTypes: CodeType[];
  onToggle: (type: CodeType) => void;
  helperError?: string;
  description?: string;
  emptyText?: string;
  variant?: 'expected' | 'ignore';
}

const BarcodeTypeSelector = ({
  title,
  types,
  selectedTypes,
  onToggle,
  helperError,
  description,
  emptyText,
  variant = 'expected',
}: BarcodeTypeSelectorProps) => {
  const theme = useTheme();

  const selectedChipStyle =
    variant === 'ignore'
      ? styles(theme).ignoreChip
      : styles(theme).expectedChip;
  const selectedChipTextStyle =
    variant === 'ignore'
      ? styles(theme).ignoreChipText
      : styles(theme).expectedChipText;

  return (
    <>
      <Text style={styles(theme).sectionTitle}>{title}</Text>
      {description ? (
        <Text style={styles(theme).sectionDescription}>{description}</Text>
      ) : null}
      <View style={styles(theme).chipsContainer}>
        {types.map(type => (
          <Chip
            key={`${variant}-${type}`}
            mode={selectedTypes.includes(type) ? 'flat' : 'outlined'}
            selected={selectedTypes.includes(type)}
            onPress={() => onToggle(type)}
            style={[
              styles(theme).chip,
              selectedTypes.includes(type) && selectedChipStyle,
            ]}
            textStyle={[
              styles(theme).chipText,
              selectedTypes.includes(type) && selectedChipTextStyle,
            ]}
          >
            {type.toUpperCase()}
          </Chip>
        ))}
      </View>
      {types.length === 0 && emptyText ? (
        <Text style={styles(theme).noTypesText}>{emptyText}</Text>
      ) : null}
      <HelperText type="error" visible={!!helperError}>
        {helperError}
      </HelperText>
    </>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.colors.text,
    },
    sectionDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.background,
    },
    chipText: {
      color: theme.colors.text,
    },
    ignoreChip: {
      backgroundColor: theme.colors.error,
    },
    ignoreChipText: {
      color: theme.colors.background,
    },
    expectedChip: {
      backgroundColor: theme.colors.success,
    },
    expectedChipText: {
      color: theme.colors.background,
    },
    noTypesText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: 8,
    },
  });

export default BarcodeTypeSelector;
