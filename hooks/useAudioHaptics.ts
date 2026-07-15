import { useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Sound from 'react-native-sound';

import { AppSettings } from '../utils/settings';

export const useAudioHaptics = (settings: AppSettings) => {
  const successSoundRef = useRef<Sound | null>(null);
  const errorSoundRef = useRef<Sound | null>(null);

  const initializeSounds = () => {
    Sound.setCategory('Playback');

    try {
      successSoundRef.current = new Sound(
        'success.wav',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.log('Success sound not found, using system default');
            successSoundRef.current = null;
          }
        },
      );
    } catch (error) {
      console.log('Failed to initialize success sound:', error);
      successSoundRef.current = null;
    }

    try {
      errorSoundRef.current = new Sound(
        'error.wav',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.log('Error sound not found, using system default');
            errorSoundRef.current = null;
          }
        },
      );
    } catch (error) {
      console.log('Failed to initialize error sound:', error);
      errorSoundRef.current = null;
    }
  };

  const playSound = (isError = false) => {
    const soundRef = isError ? errorSoundRef.current : successSoundRef.current;

    if (soundRef && settings.volume > 0) {
      soundRef.setVolume(settings.volume);
      soundRef.play(success => {
        if (!success) {
          console.log('Sound playback failed');
        }
      });
    }
  };

  const triggerFeedback = (isError = false) => {
    playSound(isError);

    if (settings.vibrationEnabled) {
      const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };

      if (isError) {
        ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
      } else {
        ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
      }

      if (Platform.OS === 'android') {
        Vibration.vibrate(isError ? 500 : 200);
      }
    }
  };

  useEffect(() => {
    return () => {
      successSoundRef.current?.release();
      errorSoundRef.current?.release();
      successSoundRef.current = null;
      errorSoundRef.current = null;
    };
  }, []);

  return {
    initializeSounds,
    triggerFeedback,
  };
};
