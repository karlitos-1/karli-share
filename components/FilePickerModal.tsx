
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { colors } from '../styles/commonStyles';
import { BlurView } from 'expo-blur';
import Icon from './Icon';

interface FilePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onPickVideo: () => void;
  onPickDocument: () => void;
}

const { width } = Dimensions.get('window');

export default function FilePickerModal({
  visible,
  onClose,
  onPickImage,
  onPickVideo,
  onPickDocument,
}: FilePickerModalProps) {
  const options = [
    {
      title: 'Images',
      description: 'Photos et images',
      icon: 'image-outline' as const,
      onPress: onPickImage,
      color: colors.success,
    },
    {
      title: 'Vidéos',
      description: 'Fichiers vidéo',
      icon: 'videocam-outline' as const,
      onPress: onPickVideo,
      color: colors.error,
    },
    {
      title: 'Documents',
      description: 'PDF, Word, Excel, etc.',
      icon: 'document-outline' as const,
      onPress: onPickDocument,
      color: colors.primary,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={80} style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choisir un fichier</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                  <Icon name={option.icon} size={32} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  options: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
