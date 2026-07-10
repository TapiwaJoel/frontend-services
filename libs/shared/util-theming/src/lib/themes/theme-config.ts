import { Theme } from '../models/theme.model';

export const THEMES: Record<string, Theme> = {
  default: {
    name: 'default',
    primaryColor: '#1976d2',
    accentColor: '#ff4081',
    backgroundColor: '#ffffff',
  },
  umdzidzisi: {
    name: 'umdzidzisi',
    primaryColor: '#e91e63',
    accentColor: '#9c27b0',
    backgroundColor: '#fafafa',
  },
  umtengesi: {
    name: 'umtengesi',
    primaryColor: '#4caf50',
    accentColor: '#ff9800',
    backgroundColor: '#f5f5f5',
  },
};
