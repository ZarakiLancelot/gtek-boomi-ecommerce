function formatDateTime(datetimeString) {
  // Extraer las partes de la fecha y hora
  const datePart = datetimeString.substring(0, 8);
  const timePart = datetimeString.substring(9, 18);

  // Formatear la fecha
  const year = datePart.substring(0, 4);
  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);

  // Formatear la hora
  const hour = timePart.substring(0, 2);
  const minute = timePart.substring(2, 4);
  const second = timePart.substring(4, 6);
  const millisecond = timePart.substring(7, 10);

  // Crear la fecha y hora formateada
  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`;
}
