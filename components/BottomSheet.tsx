
import {
  View,
  Text,
  StyleSheet,
  Button,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { colors } from '../styles/commonStyles';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_POINTS = [0, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.9];

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.3,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
});

export default function SimpleBottomSheet({
  children,
  isVisible = false,
  onClose,
}: SimpleBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [gestureTranslateY] = useState(new Animated.Value(0));

  const snapToPoint = useCallback((point: number) => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: point,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: point === SCREEN_HEIGHT ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (point === SCREEN_HEIGHT && onClose) {
        onClose();
      }
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (isVisible) {
      snapToPoint(SNAP_POINTS[1]);
    } else {
      snapToPoint(SCREEN_HEIGHT);
    }
  }, [isVisible, snapToPoint]);

  const handleBackdropPress = () => {
    snapToPoint(SCREEN_HEIGHT);
  };

  const getClosestSnapPoint = (currentY: number, velocityY: number) => {
    const threshold = 50;
    
    if (velocityY > threshold) {
      return SCREEN_HEIGHT;
    }
    
    if (velocityY < -threshold) {
      return SNAP_POINTS[0];
    }
    
    let closest = SNAP_POINTS[0];
    let minDistance = Math.abs(currentY - SNAP_POINTS[0]);
    
    SNAP_POINTS.forEach(point => {
      const distance = Math.abs(currentY - point);
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    });
    
    return closest;
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: gestureTranslateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      const currentY = SNAP_POINTS[1] + translationY;
      const targetPoint = getClosestSnapPoint(currentY, velocityY);
      
      gestureTranslateY.setValue(0);
      snapToPoint(targetPoint);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback>
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View
                style={[
                  styles.container,
                  {
                    transform: [
                      { translateY: translateY },
                      { translateY: gestureTranslateY },
                    ],
                  },
                ]}
              >
                <View style={styles.handle} />
                <View style={styles.content}>
                  {children}
                </View>
              </Animated.View>
            </PanGestureHandler>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
