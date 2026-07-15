import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import {
  addBarcodeToSession,
  getSessionById,
  removeBarcodeFromSession,
} from '../utils/storage';
import { Session } from '../services/storage/types';

interface ScannerBarcodeData {
  value: string;
  type: string;
  photoPath?: string;
}

interface UseScannerBarcodeProcessorOptions {
  currentSessionId: number | null;
  session: Session | null;
  scanCooldown: number;
  language: string;
  capturePhoto: (namePart?: string) => Promise<string | null>;
  triggerFeedback: (isError?: boolean) => void;
  showNotification: (
    message: string,
    type?: 'success' | 'warning' | 'error',
  ) => void;
  refreshSession: () => Promise<Session | null>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const getOrdinalNumber = (num: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

export const useScannerBarcodeProcessor = ({
  currentSessionId,
  session,
  scanCooldown,
  language,
  capturePhoto,
  triggerFeedback,
  showNotification,
  refreshSession,
  t,
}: UseScannerBarcodeProcessorOptions) => {
  const [isScanningActive, setIsScanningActive] = useState(true);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const startScanCooldown = useCallback(() => {
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
    }

    cooldownRef.current = setTimeout(() => {
      setIsScanningActive(true);
      cooldownRef.current = null;
    }, scanCooldown);
  }, [scanCooldown]);

  const showTimedNotification = useCallback(
    (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
      showNotification(message, type);
      startScanCooldown();
    },
    [showNotification, startScanCooldown],
  );

  const checkForDuplicateBarcode = useCallback(
    async (
      value: string,
    ): Promise<{ isDuplicate: boolean; position?: number }> => {
      if (currentSessionId === null || currentSessionId === undefined) {
        return { isDuplicate: false };
      }

      const currentSession = await getSessionById(currentSessionId);
      if (!currentSession) {
        return { isDuplicate: false };
      }

      const duplicateIndex = currentSession.barcodes.findIndex(
        barcode => barcode.value === value,
      );

      if (duplicateIndex !== -1) {
        return { isDuplicate: true, position: duplicateIndex + 1 };
      }

      return { isDuplicate: false };
    },
    [currentSessionId],
  );

  const addBarcodeWithFeedback = useCallback(
    async (barcodeData: ScannerBarcodeData, successMessage: string) => {
      if (currentSessionId === null || currentSessionId === undefined) {
        startScanCooldown();
        return;
      }

      try {
        triggerFeedback();

        await addBarcodeToSession(currentSessionId, {
          value: barcodeData.value,
          type: barcodeData.type as any,
          timestamp: new Date().toISOString(),
          photoPath: barcodeData.photoPath,
        });

        await refreshSession();

        const updatedSession = await getSessionById(currentSessionId);
        const photoStatus = updatedSession?.autosavePictures
          ? barcodeData.photoPath
            ? ` ${t('scanner.scannedBarcode.photoSuccess')}`
            : ` ${t('scanner.scannedBarcode.photoError')}`
          : '';

        showTimedNotification(`${successMessage}${photoStatus}`, 'success');
      } catch (error) {
        triggerFeedback(true);
        console.error('Error adding barcode to session:', error);
        showTimedNotification(t('scanner.scannedBarcode.error'), 'error');
      }
    },
    [
      currentSessionId,
      refreshSession,
      showTimedNotification,
      startScanCooldown,
      t,
      triggerFeedback,
    ],
  );

  const handleDeleteLatestBarcode = useCallback(async () => {
    if (
      !session ||
      currentSessionId === null ||
      currentSessionId === undefined ||
      session.barcodes.length === 0
    ) {
      return;
    }

    const latestBarcode = session.barcodes[0];

    Alert.alert(
      t('scanner.deleteBarcode.title'),
      t('scanner.deleteBarcode.message', {
        type: latestBarcode.type,
        value: latestBarcode.value,
      }),
      [
        {
          text: t('alert.cancel'),
          style: 'cancel',
        },
        {
          text: t('alert.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBarcodeFromSession(
                currentSessionId,
                latestBarcode.id,
              );
              await refreshSession();
              showNotification(t('scanner.deleteBarcode.success'), 'success');
            } catch (error) {
              console.error('Error deleting barcode:', error);
              showNotification(t('scanner.deleteBarcode.error'), 'error');
            }
          },
        },
      ],
    );
  }, [currentSessionId, refreshSession, session, showNotification, t]);

  const onCodeScanned = useCallback(
    async (codes: Array<{ value?: string; type?: string }>) => {
      if (
        !isScanningActive ||
        !session ||
        currentSessionId === null ||
        currentSessionId === undefined
      ) {
        return;
      }

      if (codes.length === 0) {
        return;
      }

      const scannedCode = codes[0];
      setIsScanningActive(false);

      const barcodeValue = scannedCode.value || '';
      const barcodeType = scannedCode.type || 'unknown';

      const duplicateResult = await checkForDuplicateBarcode(barcodeValue);

      const currentSession = await getSessionById(currentSessionId);
      if (!currentSession) {
        startScanCooldown();
        return;
      }

      const isExpectedType =
        barcodeType !== 'unknown' &&
        currentSession.expectedCodeTypes.includes(barcodeType as any);

      let photoPath = null;
      if (currentSession.autosavePictures) {
        photoPath = await capturePhoto(barcodeValue);
      }

      if (duplicateResult.isDuplicate) {
        const currentBarcodeData = {
          value: barcodeValue,
          type: barcodeType,
          photoPath: photoPath || undefined,
        };
        triggerFeedback(true);

        Alert.alert(
          t('scanner.duplicateBarcode.title'),
          t('scanner.duplicateBarcode.message', {
            value: barcodeValue,
            type: scannedCode.type,
            position:
              language === 'en'
                ? getOrdinalNumber(duplicateResult.position || 0)
                : duplicateResult.position || 0,
          }),
          [
            {
              text: t('scanner.duplicateBarcode.addAnyways'),
              onPress: () => {
                addBarcodeWithFeedback(
                  currentBarcodeData,
                  t('scanner.addBarcodeAnyways.success'),
                );
              },
            },
            {
              text: t('scanner.duplicateBarcode.ignore'),
              onPress: () => startScanCooldown(),
            },
          ],
        );
        return;
      }

      if (!isExpectedType) {
        const currentBarcodeData = {
          value: barcodeValue,
          type: barcodeType,
          photoPath: photoPath || undefined,
        };
        triggerFeedback(true);

        Alert.alert(
          t('scanner.unexpectedBarcode.title'),
          t('scanner.unexpectedBarcode.message', {
            type: scannedCode.type,
            value: scannedCode.value,
          }),
          [
            {
              text: t('scanner.unexpectedBarcode.addAnyways'),
              onPress: () => {
                addBarcodeWithFeedback(
                  currentBarcodeData,
                  t('scanner.addBarcodeAnyways.success'),
                );
              },
            },
            {
              text: t('scanner.unexpectedBarcode.ignore'),
              onPress: () => startScanCooldown(),
            },
          ],
        );
        return;
      }

      await addBarcodeWithFeedback(
        {
          value: barcodeValue,
          type: barcodeType,
          photoPath: photoPath || undefined,
        },
        `${t('scanner.scannedBarcode.success')} ${barcodeType}`,
      );
    },
    [
      addBarcodeWithFeedback,
      capturePhoto,
      checkForDuplicateBarcode,
      currentSessionId,
      isScanningActive,
      language,
      session,
      startScanCooldown,
      t,
      triggerFeedback,
    ],
  );

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, []);

  return {
    isScanningActive,
    onCodeScanned,
    handleDeleteLatestBarcode,
    startScanCooldown,
  };
};
