import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

interface AppScreenHeaderProps {
  title: string;
  onBack: () => void;
  titleVariant?: 'headlineSmall' | 'headlineMedium';
}

const AppScreenHeader = ({
  title,
  onBack,
  titleVariant = 'headlineSmall',
}: AppScreenHeaderProps) => {
  const theme = useTheme();

  return (
    <View style={styles(theme).header}>
      <IconButton
        icon="arrow-left"
        size={24}
        iconColor="#F7F7FF"
        onPress={onBack}
        style={styles(theme).backButton}
      />
      <Text style={styles(theme).headerTitle} variant={titleVariant}>
        {title}
      </Text>
      <View style={styles(theme).headerSpacer} />
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
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
      width: 40,
    },
  });

export default AppScreenHeader;
