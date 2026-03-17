export const DEFAULT_PORT_MAP = {
  "1234": "Parcel",
  "3000": "React",
  "3001": "Node / API",
  "4000": "Phoenix",
  "4200": "Angular",
  "5000": "Flask",
  "5173": "Vite",
  "8000": "Django / FastAPI",
  "8080": "Spring Boot",
  "8888": "Jupyter",
  "9000": "Webpack"
};

/** Default emoji per port (Story 3.8). Fallback is ⚡. */
export const DEFAULT_EMOJI_MAP = {
  "3000": "⚛️",
  "3001": "🟢",
  "4000": "🐦",
  "5173": "🚀",
  "8000": "🐍",
  "8080": "📦"
};

const DEFAULT_EMOJI = "⚡";

/**
 * Returns the default emoji for a port (from DEFAULT_EMOJI_MAP or ⚡).
 * @param {string} port - Port number as string
 * @returns {string} Single emoji (1–2 chars)
 */
export function getDefaultEmoji(port) {
  return DEFAULT_EMOJI_MAP[port] ?? DEFAULT_EMOJI;
}
