import React from 'react';
import { View } from 'react-native';

import { styles } from '../styles/registerStyles';

/*
* Contenedor de contenido redondeado para agrupar secciones o resúmenes de formularios de registro.
* Usar cuando una pantalla necesite la superficie, el relleno y los estados de énfasis opcionales de una tarjeta estándar.
* Propiedades:
* - children: Nodos de React renderizados dentro de la tarjeta.
* - roomy: Valor booleano opcional para el mayor espaciado de la tarjeta utilizado en las pantallas de confirmación.
* - dimmed: Valor booleano opcional para el estado atenuado de la tarjeta utilizado detrás de superposiciones/modales.
*/


export function Card({ children, roomy, dimmed }) {
  return <View style={[styles.card, roomy && styles.roomyCard, dimmed && styles.dimmed]}>{children}</View>;
}
