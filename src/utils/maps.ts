/** Link de busca do Google Maps. No celular, abre o app do Maps se estiver instalado. */
export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
