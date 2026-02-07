import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getBackendUrl = () => {
  // Cuando usas Expo Go con Tunnel/LAN, necesitas la IP real de tu máquina
  // NO uses localhost ni 127.0.0.1 porque eso es el celular mismo.
  const LOCAL_IP = '192.168.1.95';
  const PORT = '54321';

  // Usamos la IP local para todo (iOS y Android) cuando estamos en Expo Go
  // Esto asegura que el celular encuentre a tu computadora en la red.
  const url = `http://${LOCAL_IP}:${PORT}`;

  console.log('🔗 Backend URL:', url);
  return url;
};
