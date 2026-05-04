import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import SplashScreen from './src/screens/SplashScreen'; // Asegúrate de que la ruta sea correcta

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos una carga de 3 segundos para que puedas ver el resultado
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center' }}>
      {/* Aquí iría tu Home o el resto de tu App */}
      <View style={{ width: 50, height: 50, backgroundColor: '#D4AF37' }} />
    </View>
  );
};

export default App;
