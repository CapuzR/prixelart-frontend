import { ObjectId } from "mongodb";

export interface TermsAndConditions {
  termsAndConditions: string;
}

export interface CarouselItem {
  _id?: ObjectId;
  position: number;
  type: "desktop" | "mobile";
  imageURL: string;
}

export interface Announcement {
  _id?: ObjectId;
  name: string;
  isActive: boolean;

  content: {
    title?: string;
    body?: string;
    imageUrl?: string;
    layout: 'image-top' | 'image-left' | 'image-right' | 'image-bottom' | 'text-only';
  };

  // Configuración del botón de Call-To-Action (CTA)
  ctaButton: {
    isEnabled: boolean; // Controla si el botón se muestra o no
    text: string; // Ej: "Ver más", "Comprar ahora"
    actionType: 'link' | 'dismiss'; // El 'link' abre una URL, 'dismiss' solo cierra
    actionValue: string; // La URL a la que se dirigirá
  };

  // Reglas de cuándo debe aparecer
  triggers: {
    pages: string[]; // Rutas donde puede aparecer, ej: ['/', '/productos', '/carrito']
    delaySeconds?: number; // Retraso en segundos después de cargar la página
  };

  // Reglas de a quién se le debe mostrar
  targeting: {
    isLoggedIn?: boolean | null; // true: solo logueados, false: solo visitantes, null: todos
    userRoles?: string[]; // Para qué roles de usuario, ej: ['prixer', 'consumer']
  };

  // Control de frecuencia
  frequency: {
    showOnce: boolean; // Si es true, solo se muestra una vez por usuario
  };
  
  expiresAt?: Date; // Fecha de expiración para que el modal deje de mostrarse
  createdOn: Date;
}