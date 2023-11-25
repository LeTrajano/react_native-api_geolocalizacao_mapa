import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles.js';
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, watchPositionAsync, LocationAccuracy } from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function requestLocationPermission() {
    const { granted } = await requestForegroundPermissionsAsync();

    if (granted) {
      try {
        const currentPosition = await getCurrentPositionAsync();
        setLocation(currentPosition);
      } catch (error) {
        setErrorMessage('Erro ao obter a localização atual.');
      }
    } else {
      setErrorMessage('A permissão de localização não foi concedida.');
    }
  }

  useEffect(() => {
    requestLocationPermission();
    const watchLocation = async () => {
      try {
        const subscription = await watchPositionAsync(
          {
            accuracy: LocationAccuracy.Highest,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (response) => {
            setLocation(response);
          }
        );
        return () => subscription.remove();
      } catch (error) {
        setErrorMessage('Erro ao assistir a mudanças na localização.');
      }
    };
    watchLocation();
  }, []);

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
            />
          </MapView>
        )
      )}
    </View>
  );
}
