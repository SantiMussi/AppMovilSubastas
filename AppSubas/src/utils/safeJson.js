/**
* Analiza de forma segura el cuerpo de una respuesta de la API Fetch como JSON.
* Usar después de las llamadas a fetch cuando el backend pueda devolver un cuerpo vacío, inválido o que no sea JSON; 
    quienes realicen la llamada recibirán null en lugar de un error de análisis.
    
* Parámetros:
* - response: Objeto de respuesta de la API Fetch cuyo cuerpo debe analizarse con response.json().
* Devuelve la carga útil JSON analizada o null si el análisis falla.
*/

export async function safeJson(response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}
