/**
 * Shared React Types
 * Common type definitions for React components and hooks
 */

export type VoidCallback = () => void;
export type AsyncCallback = () => Promise<void> | Promise<void>;

export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;

export interface LoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
}

export interface ErrorState {
  error: Error | null;
  hasError: boolean;
}

export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface ScreenProps<T = unknown> {
  route: {
    params?: T;
  };
  navigation: any;
}

export type ButtonProps = {
  onPress: EventHandler | AsyncEventHandler;
  disabled?: boolean;
  loading?: boolean;
};

export interface SelectableItem {
  id: string;
  selected: boolean;
}

export interface FormFieldProps<T> {
  value: T;
  onChange: (value: T) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface ListItemProps<T> {
  item: T;
  index: number;
  onPress?: (item: T, index: number) => void;
  onLongPress?: (item: T, index: number) => void;
}

export interface SearchState {
  query: string;
  results: unknown[];
  isSearching: boolean;
}

export interface TabItem {
  id: string;
  title: string;
  icon?: string;
  badge?: number | string;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}
