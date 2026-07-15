export default {
  home: {
    title: 'Scanner seriali Pannelli FTV',
    description:
      'Organizza le tue scansioni in sessioni. Crea, gestisci e monitora le tue attività di scansione seriali pannelli FTV.',
    sessionActiveLabel: 'Sessione Attiva',
    sessionCodeLabel: 'codice',
    sessionCodesLabel: 'codici',
    sessionLastAccessedLabel: 'Ultimo Accesso:',
    sessionLastAccessedNow: 'Un secondo fa',
    sessionLastAccessedHoursAgo: 'ore fa',
    sessionLastAccessedYesterday: 'Ieri',
    sessionLastAccessedDaysAgo: 'giorni fa',
    scannerButtonResume: 'Riprendi Sessione',
    scannerButtonNone: 'Nessuna Sessione Attiva',
    createSessionButton: 'Crea Sessione',
    sessionsListButton: 'Tutte le Sessioni',
    settingsButton: 'Impostazioni',
    exitButton: 'Esci App',
  },
  settings: {
    title: 'Impostazioni',
    cameraPermissionSuccessTitle: 'Accesso confermato',
    cameraPermissionSuccessMessage: 'Permesso fotocamera concesso!',
    cameraPermissionDeniedTitle: 'Permesso Negato',
    cameraPermissionDeniedMessage:
      'Il permesso di accesso della fotocamera è stato negato.',
    cameraPermissionBlockedTitle: 'Permesso Bloccato',
    cameraPermissionBlockedMessage:
      'Il permesso della fotocamera è bloccato. Per favore abilitalo nelle impostazioni del dispositivo.',
    cameraPermissionErrorTitle: 'Errore',
    cameraPermissionErrorMessage:
      'Errore nel richiedere il permesso della fotocamera.',
    storagePermissionSuccessTitle: 'Esito positivo',
    storagePermissionSuccessMessage:
      'Permesso di accesso alla archiviazione concesso!',
    storagePermissionDeniedTitle: 'Permesso Negato',
    storagePermissionDeniedMessage:
      'Il permesso di archiviazione è stato negato.',
    storagePermissionBlockedTitle: 'Permesso bloccato',
    storagePermissionBlockedMessage:
      'Il permesso di accesso alla archiviazione è bloccato. Per favore abilitalo nelle impostazioni del dispositivo.',
    storagePermissionErrorTitle: 'Errore',
    storagePermissionErrorMessage:
      'Errore nel richiedere il permesso di archiviazione.',
    settingChangeErrorTitle: 'Errore',
    settingChangeErrorMessage: "Errore nell'aggiornamento dell'impostazione.",
    permissions: {
      granted: 'Concesso',
      denied: 'Negato',
      blocked: 'Bloccato',
      unavailable: 'Non disponibile',
      unknown: 'Sconosciuto',
    },
    loading: 'Caricamento in corso...',
    volumeLabel: 'Volume ',
    scanCooldownLabel: 'Tempo di Attesa ',
    scanCooldownDescription: 'Tempo tra scansioni consecutive (500ms - 10s)',
    vibrationLabel: 'Vibrazione',
    languageLabel: 'Lingua',
    languageOptions: [
      {
        label: 'English',
        value: 'en',
      },
      {
        label: 'Italiano',
        value: 'it',
      },
    ],
    permissionsLabel: 'Permessi',
    cameraPermissionLabel: 'Fotocamera',
    storagePermissionLabel: 'Archiviazione',
    permissionsButtonRequest: 'Richiedi',
    permissionsButtonGranted: 'Concesso',
  },
  history: {
    title: 'Cronologia Sessione',
    exportSuccessTitle: 'Esportazione Riuscita',
    exportSuccessMessage:
      'File creati:\n\nCSV: {{csvPath}}\n\nJSON: {{jsonPath}}',
    exportShareCSV: 'Condividi CSV',
    exportShareJSON: 'Condividi JSON',
    exportErrorTitle: 'Errore Esportazione',
    exportErrorMessage: 'Impossibile esportare i file.',
    deleteTitle: 'Elimina seriale',
    deleteMessage: 'Sei sicuro di voler eliminare questo seriale?',
    photoModalTitle: 'Foto seriale',
    photoModalMessage:
      'Foto per: {{barcodeValue}}\n\nSalvata in: {{photoPath}}',
    loading: 'Caricamento sessione...',
    progress: 'Progresso: {{current}} / {{total}} seriale',
    searchPlaceholder: 'Cerca seriale...',
    searchResults: '{{count}} codice/i seriale trovato/i',
    searchNoResults: 'Nessun codice seriale corrisponde alla tua ricerca',
    noBarcodesScanned:
      'Nessun seriale è stato ancora scansionato in questa sessione',
    startScanning: 'Inizia Scansione',
  },
  sessionList: {
    title: 'Lista Sessioni',
    deleteSessionTitle: 'Elimina Sessione',
    deleteSessionMessage:
      'Sei sicuro di voler eliminare questa sessione? Tutti i seriali in questa sessione andranno persi.',
    openMaps: {
      noGPSTitle: 'Nessuna Posizione GPS',
      noGPSMessage: 'Questa sessione non ha coordinate GPS impostate.',
      openError:
        'Impossibile aprire Maps. Assicurati di avere Google Maps installato.',
    },
    session: {
      barcodes: 'codici seriali',
      barcodesExpected: 'Previsti:',
      barcodesIgnored: 'Ignorati:',
      autoSave: 'Salvataggio automatico',
      complete: 'Completo',
      inProgress: 'In Corso',
      resume: 'Riprendi',
      viewHistory: 'Visualizza cronologia',
    },
    sessionLabel: 'sessione',
    sessionsLabel: 'sessioni',
    noSessions: 'Nessuna sessione disponibile',
    createSession: 'Crea la Tua prima Sessione',
  },
  sessionForm: {
    createTitle: 'Crea Nuova Sessione',
    editTitle: 'Modifica Sessione',
    sessionId: 'ID Sessione',
    folderName: 'Nome Cartella',
    barcodesScanned: 'Codici seriali Scansionati',
    form: {
      sessionName: 'Nome Sessione*',
      sessionNamePlaceholder: 'es. Azienda Agricola xyz 4',
      location: 'Posizione*',
      locationPlaceholder: 'es. Edificio J, Piano 4',
      expectedNumber: 'Numero Previsto di codici seriali*',
      expectedNumberPlaceholder: 'es. 100',
      expectedCodeTypes: 'Tipi di seriali Previsti*',
      codesToIgnore: 'Codici da Ignorare (Opzionale)',
      codesToIgnoreDescription:
        'Seleziona i tipi di seriali che dovrebbero essere ignorati durante la scansione. Questi non possono essere gli stessi di quelli previsti.',
      codesToIgnoreEmpty:
        'Tutti i tipi di seriali sono impostati come previsti. Rimuovi i tipi non previsti sopra per poterli ignorare.',
      savePictures: 'Salvataggio Automatico Foto',
      buttonCancel: 'Annulla',
      buttonSave: 'Salva Sessione',
      buttonCreate: 'Crea Sessione',
      gps: {
        label: 'Posizione GPS (Opzionale)',
        lat: 'Latitudine',
        lon: 'Longitudine',
        updated: 'Aggiornato il',
        none: 'Nessuna posizione GPS impostata. Tocca il pulsante sotto per ottenere la posizione attuale.',
        getLocation: 'Ottieni Posizione Attuale',
        gettingLocation: 'Cercando Posizione...',
        clearLocation: 'Cancella Posizione',
      },
    },
    errors: {
      name: 'Il nome della sessione è richiesto',
      location: 'La posizione è richiesta',
      expectedCodes: 'Per favore inserisci un numero valido di codici previsti',
      expectedCodeTypes:
        'Per favore seleziona almeno un tipo di codice seriale',
      codesToIgnore:
        'Impossibile ignorare i tipi di codici previsti: {{conflicts}}',
    },
    locationPermission: {
      title: 'Permesso Posizione',
      message:
        "Questa app ha bisogno dell'accesso alla posizione per impostare le coordinate GPS per questa sessione",
      askMeLater: 'Chiedimelo Dopo',
      permissionDenied: 'Permesso Negato',
      locationError: 'Errore Posizione',
      locationErrorDescription:
        "Errore nell'ottenere la posizione attuale. Controlla le impostazioni GPS e riprova.",
      clearLocation: 'Cancella Posizione GPS',
      clearLocationDescription:
        'Sei sicuro di voler rimuovere le coordinate GPS da questa sessione?',
    },
    submit: {
      updatedTitle: 'Sessione Aggiornata',
      updatedDescription:
        'La sessione {{name}} è stata aggiornata con successo!',
      createTitle: 'Sessione Creata',
      createDescription: 'La sessione {{name}} è stata creata con successo!',
      startScanning: 'Inizia Scansione',
      goToSessions: 'Vai a tutte le sessioni',
      updateError: "Errore nell'aggiornamento della sessione. Riprova.",
      createError: 'Errore nella creazione della sessione. Riprova.',
    },
  },
  scanner: {
    barcodes: 'codici seriali',
    latestScan: 'Ultima Scansione',
    delete: 'Elimina',
    back: 'Indietro',
    viewHistory: 'Visualizza Cronologia',
    noSessionSelected: {
      title: 'Nessuna Sessione Selezionata',
      message: 'Per favore seleziona una sessione per iniziare la scansione.',
      goToSessions: 'Vai alle Sessioni',
    },
    sessionNotFound: {
      title: 'Sessione Non Trovata',
      message: 'La sessione selezionata non è stata trovata.',
      goToSessions: 'Vai alle Sessioni',
    },
    addBarcodeAnyways: {
      success: '✅ Codice seriale aggiunto alla sessione!',
      error: "❌ Errore nell'aggiungere il codice seriale alla sessione.",
    },
    deleteBarcode: {
      title: 'Elimina Codice seriale',
      message:
        'Sei sicuro di voler eliminare questo seriale?\n\nTipo: ${{type}}\nValore: ${value}',
      success: '🗑️ Codice seriale eliminato con successo',
      error: "❌ Errore nell'eliminazione del codice seriale.",
    },
    permissions: {
      storage: {
        title: 'Permesso Archiviazione',
        message:
          "Questa app ha bisogno dell'accesso all'archiviazione per salvare le foto dei codici seriali scansionati",
        askMeLater: 'Chiedimelo Dopo',
        successTitle: 'Confermato',
        successMessage:
          'Salvataggio foto abilitato! Le foto verranno ora salvate quando si scansionano i codici seriali.',
        denyTitle: 'Permesso Negato',
        denyMessage:
          "Le foto non verranno salvate. Puoi abilitare questo in seguito nelle impostazioni dell'app.",
        errorTitle: 'Errore',
        errorMessage: 'Errore nel richiedere il permesso di archiviazione',
      },
      camera: {
        grantedTitle: 'Fotocamera Pronta',
        grantedMessage:
          'Permesso fotocamera concesso! Il permesso di archiviazione è stato negato - puoi scansionare i codici seriali ma le foto non verranno salvate.',
        deniedTitle: 'Permesso Fotocamera Richiesto',
        deniedMessage:
          'Il permesso della fotocamera è richiesto per scansionare i codici seriali.',
        requestTitle:
          'Il permesso della fotocamera è richiesto per scansionare i codici seriali',
        requestMessage:
          'Fotocamera: Richiesta per la scansione dei codici seriali\nArchiviazione: Opzionale per salvare le foto',
        requestGrant: 'Concedi Permesso alla Fotocamera',
        goBack: 'Torna Indietro',
        noDevice: 'Nessun Dispositivo Fotocamera Trovato',
      },
    },
    duplicateBarcode: {
      title: '⚠️ Codice seriale duplicato trovato!',
      message:
        'Tipo: {{type}}\nValore: {{value}}\n\nQuesto era il codice seriale #{{position}} scansionato in questa sessione.',
      addAnyways: 'Aggiungi Comunque',
      ignore: 'Ignora Codice',
    },
    unexpectedBarcode: {
      title: '⚠️ Codice seriale inaspettato trovato!',
      message: 'Tipo: {{type}}\nValore: {{value}}',
      addAnyways: 'Aggiungi Comunque',
      ignore: 'Ignora Codice',
    },
    scannedBarcode: {
      photoSuccess: ' 📸',
      photoError: ' ⚠️ Foto fallita',
      success: '✅ Codice seriale aggiunto!',
      error: '❌ Errore nel salvare il codice seriale. Riprova.',
    },
  },
  alert: {
    cancel: 'Annulla',
    clear: 'Cancella',
    close: 'Chiudi',
    delete: 'Elimina',
    error: 'Errore',
    ok: 'OK',
    share: 'Condividi',
  },
};
