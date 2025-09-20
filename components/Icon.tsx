
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: object;
  color?: string;
}

export default function Icon({ name, size = 24, style, color = '#000000' }: IconProps) {
  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
