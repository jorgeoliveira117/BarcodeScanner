export default {
  home: {
    title: 'Scanner di Codici a Barre',
    description:
      'Organizza le tue scansioni in sessioni. Crea, gestisci e monitora le tue attività di scansione codici a barre.',
    sessionActiveLabel: 'Sessione Attiva',
    sessionCodeLabel: 'codice',
    sessionCodesLabel: 'codici',
    sessionLastAccessedLabel: 'Ultimo Accesso:',
    sessionLastAccessedNow: 'Proprio ora',
    sessionLastAccessedHoursAgo: 'ore fa',
    sessionLastAccessedYesterday: 'Ieri',
    sessionLastAccessedDaysAgo: 'giorni fa',
    scannerButtonResume: 'Riprendi Sessione',
    scannerButtonNone: 'Nessuna Sessione Attiva',
    createSessionButton: 'Crea Sessione',
    sessionsListButton: 'Tutte le Sessioni',
    settingsButton: 'Impostazioni',
  },
  settings: {
    title: 'Impostazioni',
    cameraPermissionSuccessTitle: 'Successo',
    cameraPermissionSuccessMessage: 'Permesso fotocamera concesso!',
    cameraPermissionDeniedTitle: 'Permesso Negato',
    cameraPermissionDeniedMessage:
      'Il permesso della fotocamera è stato negato.',
    cameraPermissionBlockedTitle: 'Permesso Bloccato',
    cameraPermissionBlockedMessage:
      'Il permesso della fotocamera è bloccato. Per favore abilitalo nelle impostazioni del dispositivo.',
    cameraPermissionErrorTitle: 'Errore',
    cameraPermissionErrorMessage:
      'Errore nel richiedere il permesso della fotocamera.',
    storagePermissionSuccessTitle: 'Successo',
    storagePermissionSuccessMessage: 'Permesso di archiviazione concesso!',
    storagePermissionDeniedTitle: 'Permesso Negato',
    storagePermissionDeniedMessage:
      'Il permesso di archiviazione è stato negato.',
    storagePermissionBlockedTitle: 'Permesso Bloccato',
    storagePermissionBlockedMessage:
      'Il permesso di archiviazione è bloccato. Per favore abilitalo nelle impostazioni del dispositivo.',
    storagePermissionErrorTitle: 'Errore',
    storagePermissionErrorMessage:
      'Errore nel richiedere il permesso di archiviazione.',
    settingChangeErrorTitle: 'Errore',
    settingChangeErrorMessage: "Errore nell'aggiornamento dell'impostazione.",
    permissions: {
      granted: 'Concesso',
      denied: 'Negato',
      blocked: 'Bloccato',
      unavailable: 'Non Disponibile',
      unknown: 'Sconosciuto',
    },
    loading: 'Caricamento...',
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
    exportSuccessMessage: 'File CSV creato in: ',
    exportErrorTitle: 'Errore Esportazione',
    exportErrorMessage: "Errore nell'esportazione del file CSV.",
    deleteTitle: 'Elimina Codice a Barre',
    deleteMessage: 'Sei sicuro di voler eliminare questo codice a barre?',
    photoModalTitle: 'Foto Codice a Barre',
    photoModalMessage:
      'Foto per: {{barcodeValue}}\n\nSalvata in: {{photoPath}}',
    loading: 'Caricamento sessione...',
    progress: 'Progresso: {{current}} / {{total}} codici a barre',
    searchPlaceholder: 'Cerca codici a barre...',
    searchResults: '{{count}} codice/i a barre trovato/i',
    searchNoResults: 'Nessun codice a barre corrisponde alla tua ricerca',
    noBarcodesScanned:
      'Nessun codice a barre scansionato ancora in questa sessione',
    startScanning: 'Inizia Scansione',
  },
  sessionList: {
    title: 'Lista Sessioni',
    deleteSessionTitle: 'Elimina Sessione',
    deleteSessionMessage:
      'Sei sicuro di voler eliminare questa sessione? Tutti i codici a barre in questa sessione andranno persi.',
    openMaps: {
      noGPSTitle: 'Nessuna Posizione GPS',
      noGPSMessage: 'Questa sessione non ha coordinate GPS impostate.',
      openError:
        "Impossibile aprire l'applicazione mappe. Assicurati di avere Google Maps installato.",
    },
    session: {
      barcodes: 'codici a barre',
      barcodesExpected: 'Previsti:',
      barcodesIgnored: 'Ignorati:',
      autoSave: 'Salvataggio automatico',
      complete: 'Completa',
      inProgress: 'In Corso',
      resume: 'Riprendi',
      viewHistory: 'Visualizza Cronologia',
    },
    sessionLabel: 'sessione',
    sessionsLabel: 'sessioni',
    noSessions: 'Nessuna sessione disponibile',
    createSession: 'Crea la Tua Prima Sessione',
  },
  sessionForm: {
    createTitle: 'Crea Nuova Sessione',
    editTitle: 'Modifica Sessione',
    sessionId: 'ID Sessione',
    folderName: 'Nome Cartella',
    barcodesScanned: 'Codici a Barre Scansionati',
    form: {
      sessionName: 'Nome Sessione*',
      sessionNamePlaceholder: 'es. Magazzino 4',
      location: 'Posizione*',
      locationPlaceholder: 'es. Edificio J, Piano 4',
      expectedNumber: 'Numero Previsto di Codici a Barre*',
      expectedNumberPlaceholder: 'es. 100',
      expectedCodeTypes: 'Tipi di Codici a Barre Previsti*',
      codesToIgnore: 'Codici da Ignorare (Opzionale)',
      codesToIgnoreDescription:
        'Seleziona i tipi di codici a barre che dovrebbero essere ignorati durante la scansione. Questi non possono essere gli stessi dei tipi previsti.',
      codesToIgnoreEmpty:
        "Tutti i tipi di codici a barre sono impostati come previsti. Cambia i tipi previsti sopra per abilitare l'ignorare tipi specifici.",
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
        gettingLocation: 'Ottenendo Posizione...',
        clearLocation: 'Cancella Posizione',
      },
    },
    errors: {
      name: 'Il nome della sessione è richiesto',
      location: 'La posizione è richiesta',
      expectedCodes: 'Per favore inserisci un numero valido di codici previsti',
      expectedCodeTypes:
        'Per favore seleziona almeno un tipo di codice a barre',
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
      goToSessions: 'Vai alle Sessioni',
      updateError: "Errore nell'aggiornamento della sessione. Riprova.",
      createError: 'Errore nella creazione della sessione. Riprova.',
    },
  },
  scanner: {
    barcodes: 'codici a barre',
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
      success: '✅ Codice a barre aggiunto alla sessione!',
      error: "❌ Errore nell'aggiungere il codice a barre alla sessione.",
    },
    deleteBarcode: {
      title: 'Elimina Codice a Barre',
      message:
        'Sei sicuro di voler eliminare questo codice a barre?\n\nTipo: ${{type}}\nValore: ${value}',
      success: '🗑️ Codice a barre eliminato con successo',
      error: "❌ Errore nell'eliminazione del codice a barre.",
    },
    permissions: {
      storage: {
        title: 'Permesso Archiviazione',
        message:
          "Questa app ha bisogno dell'accesso all'archiviazione per salvare le foto dei codici a barre scansionati",
        askMeLater: 'Chiedimelo Dopo',
        successTitle: 'Successo',
        successMessage:
          'Salvataggio foto abilitato! Le foto verranno ora salvate quando si scansionano i codici a barre.',
        denyTitle: 'Permesso Negato',
        denyMessage:
          "Le foto non verranno salvate. Puoi abilitare questo in seguito nelle impostazioni dell'app.",
        errorTitle: 'Errore',
        errorMessage: 'Errore nel richiedere il permesso di archiviazione',
      },
      camera: {
        grantedTitle: 'Fotocamera Pronta',
        grantedMessage:
          'Permesso fotocamera concesso! Il permesso di archiviazione è stato negato - puoi scansionare i codici a barre ma le foto non verranno salvate.',
        deniedTitle: 'Permesso Fotocamera Richiesto',
        deniedMessage:
          'Il permesso della fotocamera è richiesto per scansionare i codici a barre.',
        requestTitle:
          'Il permesso della fotocamera è richiesto per scansionare i codici a barre',
        requestMessage:
          'Fotocamera: Richiesta per la scansione dei codici a barre\nArchiviazione: Opzionale per salvare le foto',
        requestGrant: 'Concedi Permesso Fotocamera',
        goBack: 'Torna Indietro',
        noDevice: 'Nessun Dispositivo Fotocamera Trovato',
      },
    },
    duplicateBarcode: {
      title: '⚠️ Codice a barre duplicato trovato!',
      message: 'Tipo: {{type}}\nValore: {{value}}',
      addAnyways: 'Aggiungi Comunque',
      ignore: 'Ignora Codice',
    },
    unexpectedBarcode: {
      title: '⚠️ Codice a barre inaspettato trovato!',
      message: 'Tipo: {{type}}\nValore: {{value}}',
      addAnyways: 'Aggiungi Comunque',
      ignore: 'Ignora Codice',
    },
    scannedBarcode: {
      photoSuccess: ' 📸',
      photoError: ' ⚠️ Foto fallita',
      success: '✅ Codice a barre aggiunto!',
      error: '❌ Errore nel salvare il codice a barre. Riprova.',
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
