import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, KeyboardEvent, Animated, Easing } from 'react-native';

interface UseKeyboardAnimationOptions {
  initialBottom?: number;
}

export function useKeyboardAnimation(options: UseKeyboardAnimationOptions = {}) {
  const { initialBottom = 0 } = options;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const initialBottomRef = useRef(initialBottom);
  initialBottomRef.current = initialBottom;

  const animatedHeight = useRef(new Animated.Value(initialBottom)).current;

  useEffect(() => {
    if (!isKeyboardVisible) {
      animatedHeight.setValue(initialBottom);
    }
  }, [initialBottom, isKeyboardVisible]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleShow = (e: KeyboardEvent) => {
      const height = e.endCoordinates.height;
      const duration = e.duration && e.duration > 0 ? e.duration : Platform.OS === 'ios' ? 250 : 180;
      setIsKeyboardVisible(true);
      setKeyboardHeight(height);

      Animated.timing(animatedHeight, {
        toValue: height,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    };

    const handleHide = (e: KeyboardEvent) => {
      const duration = e?.duration && e.duration > 0 ? e.duration : Platform.OS === 'ios' ? 220 : 150;
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);

      Animated.timing(animatedHeight, {
        toValue: initialBottomRef.current,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);

    let didShowSub: any;
    let didHideSub: any;
    if (Platform.OS === 'ios') {
      didShowSub = Keyboard.addListener('keyboardDidShow', (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        animatedHeight.setValue(e.endCoordinates.height);
      });
      didHideSub = Keyboard.addListener('keyboardDidHide', () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        animatedHeight.setValue(initialBottomRef.current);
      });
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      didShowSub?.remove();
      didHideSub?.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return {
    isKeyboardVisible,
    keyboardHeight,
    animatedHeight,
    dismissKeyboard,
  };
}
