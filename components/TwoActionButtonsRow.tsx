import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

interface ActionButtonConfig {
  label: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  icon?: string;
  textColor?: string;
  buttonColor?: string;
  loading?: boolean;
  disabled?: boolean;
}

interface TwoActionButtonsRowProps {
  left: ActionButtonConfig;
  right: ActionButtonConfig;
}

const TwoActionButtonsRow = ({ left, right }: TwoActionButtonsRowProps) => {
  return (
    <View style={styles.buttonContainer}>
      <Button
        mode={left.mode || 'outlined'}
        onPress={left.onPress}
        style={styles.button}
        icon={left.icon}
        textColor={left.textColor}
        buttonColor={left.buttonColor}
        loading={left.loading}
        disabled={left.disabled}
      >
        {left.label}
      </Button>
      <Button
        mode={right.mode || 'contained'}
        onPress={right.onPress}
        style={styles.button}
        icon={right.icon}
        textColor={right.textColor}
        buttonColor={right.buttonColor}
        loading={right.loading}
        disabled={right.disabled}
      >
        {right.label}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default TwoActionButtonsRow;
