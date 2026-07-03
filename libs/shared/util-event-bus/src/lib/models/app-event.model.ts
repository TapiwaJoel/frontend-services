export interface AppEvent {
  type: string;
  payload: any;
  source?: string;
  timestamp?: number;
}
