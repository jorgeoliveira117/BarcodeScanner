import { Session } from '../utils/storage';

export type RootStackParamList = {
  Home: undefined;
  Scanner: { sessionId?: number } | undefined;
  History: { sessionId: number };
  SessionsList: undefined;
  SessionForm: { session?: Session; mode: 'create' | 'edit' };
  Settings: undefined;
};
