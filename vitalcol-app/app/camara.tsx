import { Camera, useCameraPermissions, CameraView } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Camara() {
  const [facing, setFacing] = useState('front'); // Iniciar con la cámara frontal
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // 1. Manejo de permisos
  if (!permission) {
    // Los permisos de la cámara aún se están cargando.
    return <View />;
  }

  if (!permission.granted) {
    // Los permisos de la cámara no han sido concedidos.
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Necesitamos tu permiso para usar la cámara.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Función para girar la cámara
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // 3. Función para tomar la foto
  async function takePicture() {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      if (data && data.uri) {
        setPhoto(data.uri);
      }
    }
  }

  // Si se ha tomado una foto, mostrarla
  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.previewButtonContainer}>
            <TouchableOpacity onPress={() => setPhoto(null)} style={styles.previewButton}>
                <MaterialCommunityIcons name="camera-retake" size={28} color="#4285F4" />
                <Text style={styles.previewButtonText}>Tomar otra foto</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Vista principal de la cámara
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.controlsContainer}>
          {/* Botón para girar la cámara */}
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <MaterialCommunityIcons name="camera-flip" size={32} color="white" />
            <Text style={styles.controlText}>Girar</Text>
          </TouchableOpacity>
          
          {/* Botón para capturar la foto */}
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <MaterialCommunityIcons name="camera-iris" size={70} color="white" />
          </TouchableOpacity>

          {/* Espaciador para mantener el botón de captura centrado */}
          <View style={{ width: 80 }} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  controlButton: {
    alignItems: 'center',
    width: 80,
  },
  controlText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    padding: 20,
  },
  permissionText: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  permissionButtonText: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewButtonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
  },
  previewButtonText: {
    marginLeft: 10,
    color: '#4285F4',
    fontSize: 18,
    fontWeight: 'bold',
  }
});