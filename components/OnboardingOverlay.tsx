
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { BlurView } from 'expo-blur';
import Icon from './Icon';

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: 'Bienvenue sur Karli\'Share',
    description: 'Partagez vos fichiers rapidement et en toute sécurité avec vos proches.',
    icon: 'share-outline' as const,
  },
  {
    title: 'Transfert Sécurisé',
    description: 'Tous vos fichiers sont chiffrés de bout en bout pour une sécurité maximale.',
    icon: 'shield-checkmark-outline' as const,
  },
  {
    title: 'Plusieurs Options',
    description: 'Partagez via QR Code, Wi-Fi Direct ou Internet selon vos besoins.',
    icon: 'options-outline' as const,
  },
  {
    title: 'Suivi en Temps Réel',
    description: 'Suivez le progrès de vos transferts avec des notifications en temps réel.',
    icon: 'pulse-outline' as const,
  },
];

export default function OnboardingOverlay({ visible, onComplete }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!visible) return null;

  const step = onboardingSteps[currentStep];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={80} style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name={step.icon} size={64} color={colors.primary} />
            </View>
            
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
            
            <View style={styles.pagination}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>
                {currentStep === onboardingSteps.length - 1 ? 'Commencer' : 'Suivant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
    elevation: 10,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.grey,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    color: colors.background,
    fontWeight: '600',
  },
});
