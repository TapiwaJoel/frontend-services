import { Theme } from '../models/theme.model';

export const THEMES: Record<string, Theme> = {
  default: {
    name: 'default',
    primaryColor: '#1976d2',
    accentColor: '#ff4081',
    backgroundColor: '#ffffff',
  },
  app1: {
    name: 'app1',
    primaryColor: '#e91e63',
    accentColor: '#9c27b0',
    backgroundColor: '#fafafa',
  },
  app2: {
    name: 'app2',
    primaryColor: '#4caf50',
    accentColor: '#ff9800',
    backgroundColor: '#f5f5f5',
  },
};
