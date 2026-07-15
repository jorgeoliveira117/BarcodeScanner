export default {
  home: {
    title: 'Scanner Coduri de Bare',
    description:
      'Organizeaza scanarile in sesiuni. Creeaza, gestioneaza si urmareste activitatile de scanare.',
    sessionActiveLabel: 'Sesiune Activa',
    sessionCodeLabel: 'cod',
    sessionCodesLabel: 'coduri',
    sessionLastAccessedLabel: 'Ultima accesare:',
    sessionLastAccessedNow: 'Chiar acum',
    sessionLastAccessedHoursAgo: 'ore in urma',
    sessionLastAccessedYesterday: 'Ieri',
    sessionLastAccessedDaysAgo: 'zile in urma',
    scannerButtonResume: 'Reia Sesiunea',
    scannerButtonNone: 'Nicio Sesiune Activa',
    createSessionButton: 'Creeaza Sesiune',
    sessionsListButton: 'Toate Sesiunile',
    settingsButton: 'Setari',
    exitButton: 'Inchide Aplicatia',
  },
  settings: {
    title: 'Setari',
    cameraPermissionSuccessTitle: 'Succes',
    cameraPermissionSuccessMessage:
      'Permisiunea pentru camera a fost acordata!',
    cameraPermissionDeniedTitle: 'Permisiune Respinsa',
    cameraPermissionDeniedMessage: 'Permisiunea pentru camera a fost respinsa.',
    cameraPermissionBlockedTitle: 'Permisiune Blocata',
    cameraPermissionBlockedMessage:
      'Permisiunea pentru camera este blocata. Activeaz-o din setarile dispozitivului.',
    cameraPermissionErrorTitle: 'Eroare',
    cameraPermissionErrorMessage:
      'Nu s-a putut solicita permisiunea pentru camera.',
    storagePermissionSuccessTitle: 'Succes',
    storagePermissionSuccessMessage:
      'Permisiunea pentru stocare a fost acordata!',
    storagePermissionDeniedTitle: 'Permisiune Respinsa',
    storagePermissionDeniedMessage:
      'Permisiunea pentru stocare a fost respinsa.',
    storagePermissionBlockedTitle: 'Permisiune Blocata',
    storagePermissionBlockedMessage:
      'Permisiunea pentru stocare este blocata. Activeaz-o din setarile dispozitivului.',
    storagePermissionErrorTitle: 'Eroare',
    storagePermissionErrorMessage:
      'Nu s-a putut solicita permisiunea pentru stocare.',
    settingChangeErrorTitle: 'Eroare',
    settingChangeErrorMessage: 'Nu s-a putut actualiza setarea.',
    permissions: {
      granted: 'Acordata',
      denied: 'Respinsa',
      blocked: 'Blocata',
      unavailable: 'Indisponibila',
      unknown: 'Necunoscuta',
    },
    loading: 'Se incarca...',
    volumeLabel: 'Volum ',
    scanCooldownLabel: 'Interval scanare ',
    scanCooldownDescription: 'Timp intre scanari consecutive (500ms - 10s)',
    vibrationLabel: 'Vibratie',
    languageLabel: 'Limba',
    languageOptions: [
      {
        label: 'English',
        value: 'en',
      },
      {
        label: 'Italiano',
        value: 'it',
      },
      {
        label: 'Romana',
        value: 'ro',
      },
    ],
    permissionsLabel: 'Permisiuni',
    cameraPermissionLabel: 'Camera',
    storagePermissionLabel: 'Stocare',
    permissionsButtonRequest: 'Solicita',
    permissionsButtonGranted: 'Acordata',
  },
  history: {
    title: 'Istoric Sesiune',
    exportSuccessTitle: 'Export Reusit',
    exportSuccessMessage:
      'Fisiere create:\n\nCSV: {{csvPath}}\n\nJSON: {{jsonPath}}',
    exportShareCSV: 'Distribuie CSV',
    exportShareJSON: 'Distribuie JSON',
    exportErrorTitle: 'Eroare Export',
    exportErrorMessage: 'Nu s-au putut exporta fisierele.',
    deleteTitle: 'Sterge Codul de Bare',
    deleteMessage: 'Sigur vrei sa stergi acest cod de bare?',
    photoModalTitle: 'Poza Codului de Bare',
    photoModalMessage:
      'Poza pentru: {{barcodeValue}}\n\nSalvata la: {{photoPath}}',
    loading: 'Se incarca sesiunea...',
    progress: 'Progres: {{current}} / {{total}} coduri de bare',
    searchPlaceholder: 'Cauta coduri de bare...',
    searchResults: '{{count}} cod(uri) de bare gasite',
    searchNoResults: 'Niciun cod de bare nu corespunde cautarii',
    noBarcodesScanned:
      'Inca nu au fost scanate coduri de bare in aceasta sesiune',
    startScanning: 'Incepe Scanarea',
  },
  sessionList: {
    title: 'Lista Sesiuni',
    deleteSessionTitle: 'Sterge Sesiunea',
    deleteSessionMessage:
      'Sigur vrei sa stergi aceasta sesiune? Toate codurile de bare din sesiune vor fi pierdute.',
    openMaps: {
      noGPSTitle: 'Fara Locatie GPS',
      noGPSMessage: 'Aceasta sesiune nu are coordonate GPS setate.',
      openError:
        'Nu s-a putut deschide aplicatia de harti. Verifica daca ai Google Maps instalat.',
    },
    session: {
      barcodes: 'coduri de bare',
      barcodesExpected: 'Asteptate:',
      barcodesIgnored: 'Ignorate:',
      autoSave: 'Salvare automata',
      complete: 'Complet',
      inProgress: 'In curs',
      resume: 'Reia',
      viewHistory: 'Vezi Istoric',
    },
    sessionLabel: 'sesiune',
    sessionsLabel: 'sesiuni',
    noSessions: 'Nu exista sesiuni',
    createSession: 'Creeaza Prima Sesiune',
  },
  sessionForm: {
    createTitle: 'Creeaza Sesiune Noua',
    editTitle: 'Editeaza Sesiunea',
    sessionId: 'ID Sesiune',
    folderName: 'Nume Folder',
    barcodesScanned: 'Coduri de bare scanate',
    form: {
      sessionName: 'Nume sesiune*',
      sessionNamePlaceholder: 'ex. Depozit 4',
      location: 'Locatie*',
      locationPlaceholder: 'ex. Cladirea J, Etajul 4',
      expectedNumber: 'Numar asteptat de coduri de bare*',
      expectedNumberPlaceholder: 'ex. 100',
      expectedCodeTypes: 'Tipuri de coduri asteptate*',
      codesToIgnore: 'Coduri de ignorat (Optional)',
      codesToIgnoreDescription:
        'Selecteaza tipurile de coduri care trebuie ignorate in timpul scanarii. Acestea nu pot fi aceleasi cu tipurile asteptate.',
      codesToIgnoreEmpty:
        'Toate tipurile de coduri sunt setate ca asteptate. Schimba tipurile asteptate pentru a putea ignora unele tipuri.',
      savePictures: 'Salveaza automat poze',
      buttonCancel: 'Anuleaza',
      buttonSave: 'Salveaza Sesiunea',
      buttonCreate: 'Creeaza Sesiunea',
      gps: {
        label: 'Locatie GPS (Optional)',
        lat: 'Latitudine',
        lon: 'Longitudine',
        updated: 'Actualizat la',
        none: 'Nu este setata nicio locatie GPS. Apasa butonul de mai jos pentru locatia curenta.',
        getLocation: 'Obtine Locatia Curenta',
        gettingLocation: 'Se obtine locatia...',
        clearLocation: 'Sterge Locatia',
      },
    },
    errors: {
      name: 'Numele sesiunii este obligatoriu',
      location: 'Locatia este obligatorie',
      expectedCodes: 'Introdu un numar valid de coduri asteptate',
      expectedCodeTypes: 'Selecteaza cel putin un tip de cod',
      codesToIgnore: 'Nu poti ignora tipuri asteptate: {{conflicts}}',
    },
    locationPermission: {
      title: 'Permisiune Locatie',
      message:
        'Aplicatia are nevoie de acces la locatie pentru a seta coordonatele GPS pentru aceasta sesiune',
      askMeLater: 'Intreaba-ma mai tarziu',
      permissionDenied: 'Permisiune Respinsa',
      locationError: 'Eroare Locatie',
      locationErrorDescription:
        'Nu s-a putut obtine locatia curenta. Verifica setarile GPS si incearca din nou.',
      clearLocation: 'Sterge Locatia GPS',
      clearLocationDescription:
        'Sigur vrei sa elimini coordonatele GPS din aceasta sesiune?',
    },
    submit: {
      updatedTitle: 'Sesiune Actualizata',
      updatedDescription: 'Sesiunea {{name}} a fost actualizata cu succes!',
      createTitle: 'Sesiune Creata',
      createDescription: 'Sesiunea {{name}} a fost creata cu succes!',
      startScanning: 'Incepe Scanarea',
      goToSessions: 'Mergi la Sesiuni',
      updateError: 'Nu s-a putut actualiza sesiunea. Incearca din nou.',
      createError: 'Nu s-a putut crea sesiunea. Incearca din nou.',
    },
  },
  scanner: {
    barcodes: 'coduri de bare',
    latestScan: 'Ultima Scanare',
    delete: 'Sterge',
    back: 'Inapoi',
    viewHistory: 'Vezi Istoric',
    takeBackPicture: 'Fa Poza Spate',
    noSessionSelected: {
      title: 'Nicio Sesiune Selectata',
      message: 'Selecteaza o sesiune pentru a incepe scanarea.',
      goToSessions: 'Mergi la Sesiuni',
    },
    sessionNotFound: {
      title: 'Sesiune Negasita',
      message: 'Sesiunea selectata nu a putut fi gasita.',
      goToSessions: 'Mergi la Sesiuni',
    },
    addBarcodeAnyways: {
      success: '✅ Codul de bare a fost adaugat in sesiune!',
      error: '❌ Nu s-a putut adauga codul de bare in sesiune.',
    },
    deleteBarcode: {
      title: 'Sterge Codul de Bare',
      message:
        'Sigur vrei sa stergi acest cod de bare?\n\nTip: ${{type}}\nValoare: ${value}',
      success: '🗑️ Codul de bare a fost sters cu succes',
      error: '❌ Nu s-a putut sterge codul de bare.',
    },
    permissions: {
      storage: {
        title: 'Permisiune Stocare',
        message:
          'Aplicatia are nevoie de acces la stocare pentru a salva pozele codurilor scanate',
        askMeLater: 'Intreaba-ma mai tarziu',
        successTitle: 'Succes',
        successMessage:
          'Salvarea pozelor este activa! Pozele vor fi salvate la scanare.',
        denyTitle: 'Permisiune Respinsa',
        denyMessage:
          'Pozele nu vor fi salvate. Poti activa asta mai tarziu din setarile aplicatiei.',
        errorTitle: 'Eroare',
        errorMessage: 'Nu s-a putut solicita permisiunea pentru stocare',
      },
      camera: {
        grantedTitle: 'Camera Pregatita',
        grantedMessage:
          'Permisiunea pentru camera a fost acordata! Permisiunea pentru stocare a fost respinsa - poti scana coduri, dar pozele nu vor fi salvate.',
        deniedTitle: 'Permisiunea pentru Camera este Necesara',
        deniedMessage:
          'Permisiunea pentru camera este necesara pentru scanare.',
        requestTitle: 'Permisiunea pentru camera este necesara pentru scanare',
        requestMessage:
          'Camera: Necesara pentru scanare coduri de bare\nStocare: Optionala pentru salvarea pozelor',
        requestGrant: 'Acorda Permisiunea pentru Camera',
        goBack: 'Inapoi',
        noDevice: 'Nu a fost gasit niciun dispozitiv camera',
      },
    },
    duplicateBarcode: {
      title: '⚠️ Cod de bare duplicat gasit!',
      message:
        'Tip: {{type}}\nValoare: {{value}}\n\nAcesta a fost codul cu numarul {{position}} scanat in aceasta sesiune.',
      addAnyways: 'Adauga Oricum',
      ignore: 'Ignora Codul',
    },
    unexpectedBarcode: {
      title: '⚠️ Cod de bare neasteptat gasit!',
      message: 'Tip: {{type}}\nValoare: {{value}}',
      addAnyways: 'Adauga Oricum',
      ignore: 'Ignora Codul',
    },
    scannedBarcode: {
      photoSuccess: ' 📸',
      photoError: ' ⚠️ Salvare poza esuata',
      success: '✅ Cod de bare adaugat!',
      error: '❌ Nu s-a putut salva codul de bare. Incearca din nou.',
    },
  },
  alert: {
    cancel: 'Anuleaza',
    clear: 'Sterge',
    close: 'Inchide',
    delete: 'Sterge',
    error: 'Eroare',
    ok: 'OK',
    share: 'Distribuie',
  },
};
