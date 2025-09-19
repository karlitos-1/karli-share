
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

// This component is no longer used since authentication has been removed
// Keeping it as a placeholder in case it's imported somewhere
export default function AuthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Authentication removed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
});
