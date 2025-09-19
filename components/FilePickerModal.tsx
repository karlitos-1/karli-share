
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
import { LinearGradient } from 'expo-linear-gradient';
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
      colors: [colors.success, '#059669'],
    },
    {
      title: 'Vidéos',
      description: 'Fichiers vidéo',
      icon: 'videocam-outline' as const,
      onPress: onPickVideo,
      colors: [colors.error, '#DC2626'],
    },
    {
      title: 'Documents',
      description: 'PDF, Word, Excel, etc.',
      icon: 'document-outline' as const,
      onPress: onPickDocument,
      colors: [colors.primary, colors.secondary],
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
                <LinearGradient
                  colors={option.colors}
                  style={styles.optionGradient}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.iconContainer}>
                      <Icon name={option.icon} size={32} color={colors.background} />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={colors.background} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Sélectionnez le type de fichier que vous souhaitez partager
            </Text>
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
    maxHeight: '60%',
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
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  optionGradient: {
    padding: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.background + 'CC',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
