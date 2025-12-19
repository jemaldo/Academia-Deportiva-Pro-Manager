
import { BaseEntity } from '../types';

/**
 * Fusiona dos listas de objetos por ID, manteniendo siempre la versión con el `updatedAt` más reciente.
 */
export function mergeDataLists<T extends BaseEntity>(local: T[], remote: T[]): T[] {
  const mergedMap = new Map<string, T>();

  // Primero mapeamos los locales
  local.forEach(item => mergedMap.set(item.id, item));

  // Luego comparamos con los remotos
  remote.forEach(remoteItem => {
    const localItem = mergedMap.get(remoteItem.id);
    if (!localItem || remoteItem.updatedAt > localItem.updatedAt) {
      mergedMap.set(remoteItem.id, remoteItem);
    }
  });

  return Array.from(mergedMap.values());
}

/**
 * Simula la interacción con la API de Google Drive
 */
export async function fetchDriveData(): Promise<any | null> {
  // En una implementación real con gapi:
  // const response = await gapi.client.drive.files.get({...});
  await new Promise(r => setTimeout(r, 800));
  const savedCloudData = localStorage.getItem('__mock_drive_file__');
  return savedCloudData ? JSON.parse(savedCloudData) : null;
}

export async function saveDriveData(data: any): Promise<void> {
  await new Promise(r => setTimeout(r, 1000));
  localStorage.setItem('__mock_drive_file__', JSON.stringify(data));
}

/**
 * Limpia la sesión actual para permitir cambiar de cuenta de correo
 */
export function logoutFromDrive(): void {
  // En una implementación real:
  // google.accounts.oauth2.revoke(accessToken);
  localStorage.removeItem('google_access_token');
  console.log("Sesión de Google Drive cerrada localmente");
}
