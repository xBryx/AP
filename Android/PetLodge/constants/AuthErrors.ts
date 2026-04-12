export const AUTH_ERRORS: Record<string, string> = {
  AUTH_FULLNAME_REQUIRED: "Por favor ingresa tu nombre completo.",
  AUTH_IDENTIFICATION_REQUIRED: "La cédula es requerida.",
  AUTH_IDENTIFICATION_DUPLICATE:
    "Ya existe una cuenta registrada con esa cédula.",
  AUTH_ROLE_NOT_FOUND: "Error de configuración. Contacta soporte.",
  AUTH_INTERNAL_ERROR: "Ocurrió un error inesperado. Intenta de nuevo.",
  weak_password: "La contraseña es mínimo 6 caracteres.",
  email_address_invalid: "El formato del correo no es válido.",
  email_exists: "Este correo ya está registrado.",
  "User already registered": "Este correo ya se encuentra registrado.",
  "Database error saving new user":
    "Ya existe una cuenta con esa cédula (u ocurrió un error en la base de datos).",
  over_email_send_rate_limit: "Demasiados intentos. Espera unos minutos.",
  invalid_credentials: "Correo o contraseña incorrectos.",
};

export const getAuthErrorMessage = (error: any): string => {
  const code = error?.error_code || error?.code || "";
  const msg = error?.message || "";

  if (AUTH_ERRORS[code]) {
    return AUTH_ERRORS[code];
  }

  for (const key of Object.keys(AUTH_ERRORS)) {
    if (msg.includes(key)) {
      return AUTH_ERRORS[key];
    }
  }

  // default to msg or internal
  return msg || AUTH_ERRORS["AUTH_INTERNAL_ERROR"];
};
