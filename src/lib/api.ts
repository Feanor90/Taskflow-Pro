/**
 * Función helper para realizar peticiones fetch con timeout y manejo mejorado de errores
 */

const DEFAULT_TIMEOUT = 30000; // 30 segundos

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Realiza una petición fetch con timeout configurable
 * @param url - URL a la que hacer la petición
 * @param options - Opciones de fetch, incluyendo timeout personalizado
 * @returns Promise con la respuesta
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  // Crear un AbortController para el timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      credentials: 'include', // Asegurar que las cookies se incluyan
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`La petición tardó demasiado (timeout de ${timeout}ms)`);
    }
    
    throw error;
  }
}

/**
 * Realiza una petición fetch y parsea la respuesta JSON de forma segura
 * @param url - URL a la que hacer la petición
 * @param options - Opciones de fetch
 * @returns Promise con los datos parseados
 */
export async function fetchJSON<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithTimeout(url, options);

  // Verificar si la respuesta es exitosa
  if (!response.ok) {
    // Intentar parsear el error como JSON o texto
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      const text = await response.text();
      if (text && text.trim()) {
        // Intentar parsear como JSON primero
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Si no es JSON, usar el texto directamente
          errorMessage = text;
        }
      }
    } catch (parseError) {
      // Si falla el parseo, usar el mensaje por defecto
      console.error('Error al parsear respuesta de error:', parseError);
    }

    throw new Error(errorMessage);
  }

  // Parsear JSON de forma segura
  // Leer el texto de la respuesta solo una vez
  try {
    const text = await response.text();
    
    // Si la respuesta está vacía, retornar objeto vacío
    if (!text || text.trim() === '') {
      return {} as T;
    }
    
    // Intentar parsear como JSON
    return JSON.parse(text) as T;
  } catch (parseError) {
    console.error('Error al parsear JSON:', parseError);
    // Si la respuesta no es JSON pero está vacía, retornar objeto vacío
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }
    throw new Error('La respuesta del servidor no es válida (no es JSON)');
  }
}

