import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
    StatusBar,
    Dimensions,
    Platform,
    Easing
} from 'react-native';

// Intentamos importar el gradiente solo si no es Web
let LinearGradient;
if (Platform.OS !== 'web') {
    try {
        LinearGradient = require('react-native-linear-gradient').default;
    } catch (e) {
        console.log("LinearGradient no disponible");
    }
}

// RUTAS CORREGIDAS SEGÚN TU EXPLORER:
// Para llegar a assets desde src/screens: subir dos niveles (../..)
const logoImg = require('../../assets/images/logo_vantage.png');
// Para llegar a themes desde src/screens: subir un nivel (../)
// Nota: En tu imagen dice "themes" (en plural), asegúrate que el archivo se llame colors.js
import { Colors } from '../themes/colors';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const lineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        }).start();

        // Animación infinita para la línea (de un lado al otro)
        Animated.loop(
            Animated.sequence([
                Animated.timing(lineAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(lineAnim, {
                    toValue: -1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [fadeAnim, lineAnim]);

    // Cálculo del rango de movimiento (para que no se salga del contenedor)
    const containerWidth = width * 0.35;
    const lineWidth = containerWidth * 0.6;
    const movementRange = (containerWidth - lineWidth) / 2;

    const lineTranslateX = lineAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-movementRange, movementRange],
    });

    // Selección de contenedor (View para Web, LinearGradient para Móvil)
    const isWeb = Platform.OS === 'web';
    const Container = isWeb || !LinearGradient ? View : LinearGradient;

    const containerProps = isWeb || !LinearGradient
        ? { style: [styles.container, styles.webBackground] }
        : { colors: [Colors.primary, '#000000'], style: styles.container };

    return (
        <Container {...containerProps}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
                {/* Isotipo */}
                <Image
                    source={logoImg}
                    style={styles.logoIsotipo}
                    resizeMode="contain"
                />

                {/* Nombre */}
                <Text style={styles.brandName}>VANTAGE</Text>

                {/* Separador */}
                <View style={styles.dividerContainer}>
                    <Animated.View 
                        style={[
                            styles.line, 
                            { transform: [{ translateX: lineTranslateX }] }
                        ]} 
                    />
                </View>

                {/* Taglines */}
                <Text style={styles.tagline}>La cima de las subastas digitales.</Text>
                <Text style={styles.subTagline}>FINE AUCTIONS</Text>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    ESTABLECIDO EN MMXIV — <Text style={styles.prestigio}>PRESTIGIO DIGITAL</Text>
                </Text>
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    webBackground: {
        backgroundColor: '#0A192F',
        // Gradiente CSS para que en Web no se vea negro liso
        backgroundImage: 'linear-gradient(180deg, #0A192F 0%, #000000 100%)',
    },
    mainContent: {
        alignItems: 'center',
        width: '100%',
        marginTop: -40,
    },
    logoIsotipo: {
        width: width * 0.22,
        height: width * 0.22,
        marginBottom: 20,
    },
    brandName: {
        fontSize: 40,
        color: Colors.tertiary || '#D4AF37',
        letterSpacing: 8,
        fontFamily: 'NotoSerif-Regular', // Asegúrate de tener las fuentes en assets/fonts
    },
    dividerContainer: {
        width: width * 0.35,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    line: {
        height: 1,
        width: '60%',
        backgroundColor: Colors.secondary || '#C5A059',
        opacity: 0.6,
    },
    tagline: {
        fontSize: 16,
        color: Colors.neutral || '#F5F5F7',
        fontFamily: 'Manrope-Light',
        opacity: 0.8,
    },
    subTagline: {
        fontSize: 11,
        color: Colors.secondary || '#C5A059',
        letterSpacing: 3,
        marginTop: 8,
        fontFamily: 'Manrope-Bold',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    footerText: {
        fontSize: 10,
        color: Colors.secondary || '#C5A059',
        letterSpacing: 1,
        opacity: 0.6,
        fontFamily: 'Manrope-Light',
    },
    prestigio: {
        fontWeight: 'bold',
    }
});

export default SplashScreen;