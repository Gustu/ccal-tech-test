export interface NotificationService {
  notify(payload: { id: string; fieldName: string }): Promise<void>;
}
