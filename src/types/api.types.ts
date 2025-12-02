// API Types for Backend Integration

// ============================================================================
// BASE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    statusCode?: number;
    details?: any;
  };
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// KAFKA TOPICS
// ============================================================================

export enum KafkaTopic {
  // Children/Apadrinamiento
  CHILDREN_CREATE = 'apadrinamiento_children_create',
  CHILDREN_UPDATE = 'apadrinamiento_children_update',
  CHILDREN_DELETE = 'apadrinamiento_children_delete',
  CHILDREN_LIST = 'apadrinamiento_children_list',
  CHILDREN_GET = 'apadrinamiento_children_get',
  
  // Sponsorship
  SPONSORSHIP_CREATE = 'sponsorship_create',
  SPONSORSHIP_END = 'sponsorship_end',
  SPONSORSHIP_LIST = 'sponsorship_list',
  
  // Sponsorship Requests (Nuevos)
  SPONSORSHIP_REQUEST_CREATE = 'apadrinamiento_sponsorships_create_request',
  SPONSORSHIP_REQUEST_APPROVE = 'apadrinamiento_sponsorships_approve_request',
  SPONSORSHIP_REQUEST_REJECT = 'apadrinamiento_sponsorships_reject_request',
  SPONSORSHIP_GET_PENDING_REQUESTS = 'apadrinamiento_sponsorships_get_pending_requests',
  SPONSORSHIP_GET_MY_SPONSORSHIPS = 'apadrinamiento_sponsorships_get_my_sponsorships',
  SPONSORSHIP_GET_DETAILS = 'apadrinamiento_sponsorships_get_details',
  SPONSORSHIP_CANCEL = 'apadrinamiento_sponsorships_cancel',
  SPONSORSHIP_GET_HISTORY = 'apadrinamiento_sponsorships_get_history',
  
  // Messages
  MESSAGE_SEND = 'message_send',
  MESSAGE_LIST = 'message_list',
  MESSAGE_MARK_READ = 'message_mark_read',
  
  // Activity Logs
  ACTIVITY_LOG_CREATE = 'apadrinamiento_activity_logs_create',
  ACTIVITY_LOG_GET_BY_CHILD = 'apadrinamiento_activity_logs_get_by_child',
  ACTIVITY_LOG_GET_BY_SPONSORSHIP = 'apadrinamiento_activity_logs_get_by_sponsorship',
  ACTIVITY_LOG_GET_RECENT = 'apadrinamiento_activity_logs_get_recent',
  
  // Projects
  PROJECT_CREATE = 'apadrinamiento_projects_create',
  PROJECT_UPDATE = 'apadrinamiento_projects_update',
  PROJECT_DELETE = 'apadrinamiento_projects_delete',
  PROJECT_LIST = 'apadrinamiento_projects_list',
  PROJECT_GET_BY_ID = 'apadrinamiento_projects_get_by_id',
  PROJECT_ADD_CHILD = 'apadrinamiento_projects_add_child',
  PROJECT_REMOVE_CHILD = 'apadrinamiento_projects_remove_child',
  PROJECT_UPDATE_STATUS = 'apadrinamiento_projects_update_status',
  
  // Volunteers
  VOLUNTEER_REGISTER = 'volunteer_register',
  VOLUNTEER_UPDATE = 'volunteer_update',
  VOLUNTEER_LIST = 'volunteer_list',
  
  // Donations
  DONATION_CREATE = 'donation_create',
  DONATION_UPDATE = 'donation_update',
  DONATION_LIST = 'donation_list',
  IN_KIND_DONATION_CREATE = 'in_kind_donation_create',
  
  // News
  NEWS_CREATE = 'news_create',
  NEWS_UPDATE = 'news_update',
  NEWS_DELETE = 'news_delete',
  NEWS_LIST = 'news_list',
  
  // Volunteering Applications
  VOLUNTEERING_APPLICATION_CREATE = 'volunteering_application_create',
  VOLUNTEERING_APPLICATION_UPDATE = 'volunteering_application_update',
  VOLUNTEERING_APPLICATION_LIST = 'volunteering_application_list',
  
  // Bitacora
  BITACORA_ENTRY_CREATE = 'bitacora_entry_create',
  BITACORA_ENTRY_UPDATE = 'bitacora_entry_update',
  BITACORA_ENTRY_DELETE = 'bitacora_entry_delete',
  BITACORA_ENTRY_LIST = 'bitacora_entry_list',
}

// ============================================================================
// AUTHENTICATION & USERS
// ============================================================================

export type UserRole = 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

// ============================================================================
// AUTH DTOs (Request/Response)
// ============================================================================

/**
 * POST /auth/register
 * Request body para registro de padrinos
 */
export interface RegisterDTO {
  name: string;        // min 3, max 100
  email: string;       // email válido
  password: string;    // min 8, debe contener minúscula, mayúscula y número
  phone: string;       // min 7, max 20
  documentId: string;  // min 5, max 20
  address: string;     // min 5, max 200
}

/**
 * Alias para mantener compatibilidad
 */
export type RegisterPadrinoDTO = RegisterDTO;

/**
 * Response de POST /auth/register
 */
export interface RegisterResponse {
  message: string;
  userId: number;
}

/**
 * POST /auth/login
 * Request body para inicio de sesión
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Response de POST /auth/login
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

/**
 * User Response - Estructura completa del usuario
 */
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  emailVerified: boolean;
  phone?: string;
  documentId?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

/**
 * POST /auth/verify-email
 */
export interface VerifyEmailDTO {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

/**
 * POST /auth/password/request-reset
 */
export interface RequestPasswordResetDTO {
  email: string;
}

export interface RequestPasswordResetResponse {
  message: string;
}

/**
 * POST /auth/password/reset
 */
export interface ResetPasswordDTO {
  token: string;
  newPassword: string; // min 8, incluye mayúscula/minúscula/número
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * POST /auth/refresh
 */
export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * POST /auth/logout
 */
export interface LogoutDTO {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

/**
 * PATCH /auth/profile
 * Update profile (solo PADRINO)
 */
export interface UpdateProfileDTO {
  phone?: string;   // min 7, max 20
  address?: string; // min 5, max 200
  avatar?: string;  // URL
}

/**
 * POST /auth/admins
 * Create admin (solo SUPER_ADMIN)
 */
export interface CreateAdminDTO {
  name: string;     // min 3, max 100
  email: string;    // email válido
  password: string; // min 8, contiene mayúsc/minúsc/número
  role: 'ADMIN' | 'SUPER_ADMIN';
}

/**
 * PATCH /auth/admins/:adminId
 * Update admin (solo SUPER_ADMIN)
 */
export interface UpdateAdminDTO {
  name?: string;   // min 3, max 100
  status?: UserStatus;
}

/**
 * GET /auth/admins
 * Response para lista de administradores
 */
export interface AdminListItemResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminListResponse {
  admins: AdminListItemResponse[];
}

/**
 * GET /auth/test
 */
export interface AuthTestResponse {
  message: string;
  timestamp: string;
}

// ============================================================================
// APADRINAMIENTO (CHILDREN)
// ============================================================================

export type Gender = 'MALE' | 'FEMALE';

export interface CreateChildDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  municipality: string;
  shortDescription: string;
  fullStory: string;
  ethnicity?: string;
  specialCondition?: string;
  address?: string;
  photo?: string;
  photos?: string[];
  needs?: string[];
  institution?: string;
  grade?: string;
  schedule?: string;
}

export interface UpdateChildDTO extends Partial<CreateChildDTO> {
  id: number;
}

export interface CreateChildRequest {
  dto: CreateChildDTO;
  userId: number;
}

export interface UpdateChildRequest {
  dto: UpdateChildDTO;
  userId: number;
}

export interface ChildResponse {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  municipality: string;
  shortDescription: string;
  fullStory: string;
  ethnicity?: string;
  specialCondition?: string;
  address?: string;
  photo?: string;
  photos?: string[];
  institution?: string;
  grade?: string;
  schedule?: string;
  sponsorshipStatus?: 'available' | 'sponsored';
  sponsorId?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SPONSORSHIP
// ============================================================================

// Crear solicitud de apadrinamiento
export interface CreateSponsorshipRequestDTO {
  childId: number;
  userId: number;
  reason?: string;
}

export interface SponsorshipRequestResponse {
  id: number;
  childId: number;
  userId: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewerId?: number;
  rejectionReason?: string;
}

// Aprobar solicitud
export interface ApproveSponsorshipRequestDTO {
  requestId: number;
  reviewerId: number;
}

// Rechazar solicitud
export interface RejectSponsorshipRequestDTO {
  requestId: number;
  reviewerId: number;
  rejectionReason: string;
}

// Obtener solicitudes pendientes
export interface GetPendingRequestsParams {
  page?: number;
  limit?: number;
}

export interface PendingRequestsResponse {
  data: SponsorshipRequestResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Obtener mis apadrinamientos
export interface GetMySponsorshipsParams {
  padrinoId: number;
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}

export interface MySponsorshipsResponse {
  data: SponsorshipDetailResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Detalles de apadrinamiento
export interface GetSponsorshipDetailsParams {
  sponsorshipId: number;
  userId: number;
  userRole: 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface SponsorshipDetailResponse {
  id: number;
  childId: number;
  childName: string;
  childPhoto?: string;
  sponsorId: number;
  sponsorName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Cancelar apadrinamiento
export interface CancelSponsorshipDTO {
  sponsorshipId: number;
  userId: number;
  userRole: 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN';
  cancellationReason: string;
}

// Historial de apadrinamientos
export interface GetSponsorshipHistoryParams {
  page?: number;
  limit?: number;
}

export interface SponsorshipHistoryResponse {
  data: SponsorshipDetailResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Legacy types (mantener compatibilidad)
export interface CreateSponsorshipDTO {
  childId: number;
  sponsorId: number;
  startDate: string;
}

export interface EndSponsorshipDTO {
  sponsorshipId: number;
  endDate: string;
  reason: string;
}

export interface SponsorshipResponse {
  id: number;
  childId: number;
  sponsorId: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MESSAGES
// ============================================================================

export interface SendMessageDTO {
  sponsorshipId: number;
  senderId: number;
  message: string;
}

export interface MessageResponse {
  id: number;
  sponsorshipId: number;
  senderId: number;
  senderName: string;
  senderRole: 'sponsor' | 'admin';
  message: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
}

// ============================================================================
// CHAT & CONVERSATIONS
// ============================================================================

export interface CreateConversationDTO {
  sponsorshipId: number;
}

export interface ConversationResponse {
  id: number;
  sponsorshipId: number;
  sponsorshipDetails?: {
    childName: string;
    sponsorName: string;
    childPhoto?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    id: number;
    content: string;
    senderId: number;
    senderName: string;
    timestamp: string;
  };
}

export interface GetConversationsParams {
  page?: number;
  limit?: number;
}

export interface SendChatMessageDTO {
  conversationId: number;
  content: string;
}

export interface ChatMessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN';
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesParams {
  conversationId: number;
  page?: number;
  limit?: number;
}

export interface MarkMessagesAsReadDTO {
  conversationId: number;
}

// ============================================================================
// VOLUNTEERS
// ============================================================================

export interface RegisterVolunteerDTO {
  projectId: number;
  fullName: string;
  email: string;
  phone: string;
  documentId?: string;
  birthDate?: string;
  city?: string;
  skills: string[];
  previousExperience?: string;
  motivation: string;
  availability: string[];
  timeCommitment: string;
  acceptedTerms: boolean;
  newsletterOptIn: boolean;
}

export interface VolunteerResponse extends RegisterVolunteerDTO {
  id: number;
  projectTitle: string;
  status: 'pending' | 'contacted' | 'active' | 'inactive';
  registrationDate: string;
  notes?: string;
}

// ============================================================================
// DONATIONS
// ============================================================================

export interface CreateDonationDTO {
  amount: number;
  currency: string;
  donorName: string;
  donorIdType: string;
  donorIdNumber: string;
  donorEmail: string;
  donorPhone?: string;
  donorCountry: string;
  isAnonymous: boolean;
  destination?: string;
  isRecurring: boolean;
  paymentMethod: 'pse' | 'transfer' | 'cash' | 'check' | 'other';
  pseReference?: string;
  pseBank?: string;
}

export interface DonationResponse extends CreateDonationDTO {
  id: number;
  transactionId: string;
  donorId?: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  receiptUrl?: string;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInKindDonationDTO {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donationType: string;
  description: string;
  estimatedValue?: number;
  requiresPickup: boolean;
  pickupAddress?: string;
  preferredDate?: string;
}

export interface InKindDonationResponse extends CreateInKindDonationDTO {
  id: number;
  status: 'requested' | 'coordinated' | 'received' | 'processed';
  createdAt: string;
}

// ============================================================================
// NEWS
// ============================================================================

export interface CreateNewsDTO {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  primaryCategory: string;
  additionalCategories?: string[];
  tags: string[];
  metaDescription: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publishedAt?: string;
  scheduledFor?: string;
  visibility: 'public' | 'private' | 'protected';
  isFeatured: boolean;
  allowComments: boolean;
}

export interface UpdateNewsDTO extends Partial<CreateNewsDTO> {
  id: number;
}

export interface NewsResponse extends CreateNewsDTO {
  id: number;
  slug: string;
  authorId: number;
  authorName: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// VOLUNTEERING APPLICATIONS
// ============================================================================

export interface CreateVolunteeringApplicationDTO {
  fullName: string;
  email: string;
  phone: string;
  areas: string[];
  experience?: string;
  motivation: string;
  availability: string[];
  references?: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
  }[];
  hasWorkPermit: boolean;
  acceptedTerms: boolean;
  privacyConsent: boolean;
}

export interface VolunteeringApplicationResponse extends CreateVolunteeringApplicationDTO {
  id: number;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'in_training' | 'active' | 'inactive';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// ============================================================================
// BITACORA
// ============================================================================

export interface CreateBitacoraEntryDTO {
  childId: number;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  description: string;
  activityDate: string;
  category: string;
  tags: string[];
  visibility: 'public' | 'internal';
  duration?: number;
  size: number;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

export interface UpdateBitacoraEntryDTO extends Partial<CreateBitacoraEntryDTO> {
  id: number;
}

export interface BitacoraEntryResponse extends CreateBitacoraEntryDTO {
  id: number;
  publishedAt: string;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export enum ActivityType {
  CHILD_UPDATE = 'CHILD_UPDATE',
  SPONSORSHIP_CREATED = 'SPONSORSHIP_CREATED',
  SPONSORSHIP_CANCELLED = 'SPONSORSHIP_CANCELLED',
  SPONSORSHIP_COMPLETED = 'SPONSORSHIP_COMPLETED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  BITACORA_ENTRY_ADDED = 'BITACORA_ENTRY_ADDED',
  CHILD_REGISTERED = 'CHILD_REGISTERED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  GENERAL_UPDATE = 'GENERAL_UPDATE',
}

// Crear registro de actividad
export interface CreateActivityLogDTO {
  type: ActivityType;
  title: string;
  description: string;
  childId?: number;
  sponsorshipId?: number;
  metadata?: Record<string, any>;
  performedBy?: number;
}

// Respuesta de actividad
export interface ActivityLogResponse {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  childId?: number;
  childName?: string;
  sponsorshipId?: number;
  metadata?: Record<string, any>;
  performedBy?: number;
  performedByName?: string;
  createdAt: string;
  updatedAt: string;
}

// Obtener actividades de un niño
export interface GetActivitiesByChildParams {
  childId: number;
  page?: number;
  limit?: number;
}

export interface ActivitiesResponse {
  data: ActivityLogResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Obtener actividades de un apadrinamiento
export interface GetActivitiesBySponsorshipParams {
  sponsorshipId: number;
  userId: number;
  userRole: 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN';
  page?: number;
  limit?: number;
}

// Obtener actividades recientes
export interface GetRecentActivitiesParams {
  page?: number;
  limit?: number;
  type?: ActivityType;
}

// ============================================================================
// PROJECTS (PROYECTOS)
// ============================================================================

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export enum ProjectType {
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  NUTRITION = 'NUTRITION',
  RECREATION = 'RECREATION',
  OTHER = 'OTHER',
}

// Crear proyecto
export interface CreateProjectDTO {
  name: string;
  description: string;
  type: ProjectType;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  location?: string;
  objectives?: string[];
  childrenIds?: number[];
  metadata?: Record<string, any>;
}

// Actualizar proyecto
export interface UpdateProjectDTO {
  id: number;
  name?: string;
  description?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  location?: string;
  objectives?: string[];
  metadata?: Record<string, any>;
}

// Respuesta de proyecto
export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  location?: string;
  objectives?: string[];
  childrenCount?: number;
  childrenIds?: number[];
  children?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    photo?: string;
  }>;
  createdBy?: number;
  createdByName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Listar proyectos
export interface ListProjectsParams {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  type?: ProjectType;
}

export interface ProjectsListResponse {
  data: ProjectResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Agregar niño a proyecto
export interface AddChildToProjectDTO {
  projectId: number;
  childId: number;
  userId: number;
}

// Remover niño de proyecto
export interface RemoveChildFromProjectDTO {
  projectId: number;
  childId: number;
  userId: number;
}

// Actualizar estado del proyecto
export interface UpdateProjectStatusDTO {
  projectId: number;
  status: ProjectStatus;
  userId: number;
  reason?: string;
}

// Eliminar proyecto
export interface DeleteProjectDTO {
  projectId: number;
  userId: number;
}

// ============================================================================
// EVENTS MODULE - 11 Endpoints
// ============================================================================

// Event Status
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// 1. POST /events - Crear evento
export interface CreateEventDTO {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  capacity: number;
  coverImage?: string;
  images?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
  createdBy: number;
}

export interface EventResponse {
  id: number;
  title: string;
  slug: string;
  description?: string;
  eventDate: string;
  location?: string;
  capacity: number;
  status: EventStatus;
  coverImage?: string;
  images?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
  registrationCount?: number;
  viewCount?: number;
  availableSpots?: number;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

// 2. PUT /events/:id - Actualizar evento
export interface UpdateEventDTO {
  title?: string;
  description?: string;
  eventDate?: string;
  location?: string;
  capacity?: number;
  coverImage?: string;
  images?: string[];
  status?: EventStatus;
  metaDescription?: string;
  metaKeywords?: string[];
  updatedBy: number;
}

// 3. POST /events/:id/publish - Publicar evento
export interface PublishEventResponse {
  id: number;
  status: EventStatus;
  publishedAt: string;
}

// 4. DELETE /events/:id - Eliminar evento
export interface DeleteEventResponse {
  message: string;
}

// 5. GET /events/admin/all - Obtener todos los eventos (Admin)
export interface GetEventsQueryDTO {
  status?: EventStatus;
  skip?: number;
  take?: number;
  orderBy?: 'createdAt' | 'publishedAt' | 'eventDate' | 'viewCount';
  orderDirection?: 'asc' | 'desc';
}

export interface AdminEventsListResponse {
  data: EventResponse[];
  total: number;
  skip: number;
  take: number;
}

// 6. GET /events/published - Obtener eventos publicados (Público)
export interface GetPublishedEventsQueryDTO {
  skip?: number;
  take?: number;
  orderBy?: 'publishedAt' | 'eventDate' | 'viewCount';
  orderDirection?: 'asc' | 'desc';
  searchTerm?: string;
  isUpcoming?: boolean;
}

export interface PublishedEventsListResponse {
  data: EventResponse[];
  total: number;
}

// 7. GET /events/:slug - Obtener detalle de evento (Público)
// Usa EventResponse

// 8. POST /events/register - Inscribirse a evento
export interface RegisterToEventDTO {
  eventId: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfCompanions?: number;
  message?: string;
}

export interface EventRegistrationResponse {
  id: number;
  eventId: number;
  fullName: string;
  email: string;
  numberOfCompanions?: number;
  registeredAt: string;
  confirmationCode: string;
}

// 9. GET /events/:id/registrations - Obtener inscritos (Admin)
export interface GetRegistrationsQueryDTO {
  eventId: number;
  checkedIn?: boolean;
  skip?: number;
  take?: number;
  orderBy?: 'registeredAt' | 'fullName';
  orderDirection?: 'asc' | 'desc';
}

export interface EventRegistration {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfCompanions?: number;
  checkedIn: boolean;
  registeredAt: string;
  checkedInAt?: string;
}

export interface EventRegistrationsListResponse {
  data: EventRegistration[];
  total: number;
  checkedInCount: number;
}

// 10. POST /events/registrations/:id/check-in - Check-in (Admin)
export interface CheckInDTO {
  checkedInBy: number;
}

export interface CheckInResponse {
  id: number;
  checkedIn: boolean;
  checkedInAt: string;
  checkedInBy: number;
}

// 11. GET /events/:id/statistics - Estadísticas (Admin)
export interface EventStatisticsResponse {
  eventId: number;
  totalRegistrations: number;
  totalCompanions: number;
  totalAttendees: number;
  checkedInCount: number;
  capacity: number;
  availableSpots: number;
  viewCount: number;
}

// ============================================================================
// CHAT MODULE - 6 Endpoints
// ============================================================================

export type SenderRole = 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN';

// 1. POST /chat/conversations - Crear conversación
export interface CreateConversationDTO {
  sponsorshipId: number;
}

export interface ConversationResponse {
  id: number;
  sponsorshipId: number;
  padrinoId: number;
  childName: string;
  padrinoName?: string;
  createdAt: string;
  lastMessageAt?: string;
  lastMessage?: {
    content: string;
    sentAt: string;
    senderRole: SenderRole;
  };
  unreadCount?: number;
}

// 2. GET /chat/conversations - Obtener mis conversaciones
export interface PaginationDTO {
  page?: number;
  limit?: number;
}

export interface ConversationsListResponse {
  data: ConversationResponse[];
  total: number;
  page: number;
  limit: number;
}

// 3. GET /chat/conversations/:conversationId/messages - Obtener mensajes
export interface ChatMessage {
  id: number;
  conversationId: number;
  content: string;
  senderId: number;
  senderRole: SenderRole;
  senderName: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface MessagesListResponse {
  data: ChatMessage[];
  total: number;
  page: number;
  limit: number;
}

// 4. POST /chat/messages - Enviar mensaje
export interface SendMessageDTO {
  conversationId: number;
  content: string;
}

export interface SendMessageResponse {
  id: number;
  conversationId: number;
  content: string;
  senderId: number;
  senderRole: SenderRole;
  sentAt: string;
}

// 5. POST /chat/conversations/:conversationId/read - Marcar como leído
export interface MarkAsReadResponse {
  conversationId: number;
  messagesMarkedAsRead: number;
  message: string;
}

// 6. GET /chat/unread-count - Conteo de no leídos
export interface UnreadCountResponse {
  unreadCount: number;
  conversationsWithUnread: number;
}

// ============================================================================
// CHILDREN MODULE - 7 Endpoints
// ============================================================================

export type Gender = 'MALE' | 'FEMALE';
export type ChildStatus = 'AVAILABLE' | 'PENDING' | 'SPONSORED';

// 1. POST /children - Crear niño
export interface CreateChildDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  ethnicity?: string;
  specialCondition?: string;
  municipality: string;
  address?: string;
  photo?: string;
  photos?: string[];
  shortDescription?: string;
  fullStory?: string;
  needs?: string[];
}

export interface ChildResponse {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  age: number;
  gender: Gender;
  ethnicity?: string;
  specialCondition?: string;
  municipality: string;
  address?: string;
  photo?: string;
  photos?: string[];
  shortDescription?: string;
  fullStory?: string;
  needs?: string[];
  status: ChildStatus;
  createdAt: string;
  updatedAt?: string;
}

// 2. GET /children/available - Niños disponibles (Público)
export interface AvailableChildrenResponse {
  data: ChildResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 3. GET /children/filter - Filtrar niños
export interface FilterChildrenDTO {
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
  municipality?: string;
  page?: number;
  limit?: number;
}

export interface FilteredChildrenResponse {
  data: ChildResponse[];
  total: number;
  page: number;
  limit: number;
  filters: {
    gender?: Gender;
    minAge?: number;
    maxAge?: number;
    municipality?: string;
  };
}

// 4. GET /children - Todos los niños (Admin)
export interface AllChildrenResponse {
  data: ChildResponse[];
  total: number;
  page: number;
  limit: number;
}

// 5. GET /children/:id - Detalle de niño
// Usa ChildResponse

// 6. PATCH /children/:id - Actualizar niño
export interface UpdateChildDTO {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  ethnicity?: string;
  specialCondition?: string;
  municipality?: string;
  address?: string;
  photo?: string;
  photos?: string[];
  shortDescription?: string;
  fullStory?: string;
  needs?: string[];
}

// 7. DELETE /children/:id - Eliminar niño
// Retorna 204 No Content

// ============================================================================
// DONATIONS MODULE - 12 Endpoints
// ============================================================================

export type DonationType = 'MONETARY' | 'IN_KIND';
export type DonationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'CC' | 'CE' | 'NIT' | 'TI' | 'PP';

// 1. POST /donations/monetary - Donación monetaria (PSE)
export interface CreateMonetaryDonationDTO {
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorDocumentType: DocumentType;
  donorDocument: string;
  donorUserId?: number;
  projectId?: number;
  projectName?: string;
  message?: string;
  isAnonymous?: boolean;
}

export interface MonetaryDonationResponse {
  id: number;
  type: DonationType;
  amount: number;
  donorName: string;
  donorEmail: string;
  status: DonationStatus;
  transactionId: string;
  paymentUrl: string;
  createdAt: string;
}

// 2. POST /donations/in-kind - Donación en especie
export interface CreateInKindDonationDTO {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  description: string;
  estimatedValue?: number;
  message?: string;
}

export interface InKindDonationResponse {
  id: number;
  type: DonationType;
  donorName: string;
  donorEmail: string;
  description: string;
  estimatedValue?: number;
  status: DonationStatus;
  createdAt: string;
}

// 3. GET /donations/admin/all - Todas las donaciones (Admin)
export interface GetDonationsQueryDTO {
  type?: DonationType;
  status?: DonationStatus;
  skip?: number;
  take?: number;
}

export interface DonationListItem {
  id: number;
  type: DonationType;
  amount?: number;
  donorName: string;
  description?: string;
  status: DonationStatus;
  createdAt: string;
  projectName?: string;
  message?: string;
}

export interface AllDonationsResponse {
  data: DonationListItem[];
  total: number;
  skip: number;
  take: number;
}

// 4. GET /donations/my-donations - Mis donaciones
export interface MyDonationsResponse {
  data: DonationListItem[];
  total: number;
}

// 5. POST /donations/:id/approve - Aprobar donación
export interface ApproveDonationResponse {
  id: number;
  status: DonationStatus;
  approvedAt: string;
  approvedBy: number;
  message: string;
}

// 6. GET /donations/info - Información pública
export interface DonationInfoResponse {
  id: number;
  title: string;
  description: string;
  importance: string;
  destination: string;
  modalities: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  neededItems: string[];
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  scheduleInfo: string;
  statistics: {
    totalDonations: number;
    totalDonors: number;
    childrenBenefited: number;
  };
}

// 7. POST /donations/admin/info - Crear información
export interface CreateDonationInfoDTO {
  title: string;
  description: string;
  importance: string;
  destination: string;
  modalities: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  neededItems: string[];
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  scheduleInfo: string;
}

export interface CreateDonationInfoResponse {
  id: number;
  title: string;
  createdBy: number;
  createdAt: string;
}

// 8. PUT /donations/admin/info/:id - Actualizar información
export interface UpdateDonationInfoDTO {
  title?: string;
  description?: string;
  importance?: string;
  destination?: string;
  modalities?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  neededItems?: string[];
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  scheduleInfo?: string;
}

export interface UpdateDonationInfoResponse {
  id: number;
  title?: string;
  ctaButtonText?: string;
  updatedAt: string;
}

// 9. GET /donations/testimonials - Testimonios publicados (Público)
export interface Testimonial {
  id: number;
  donorName: string;
  testimonial: string;
  avatar?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface TestimonialsResponse {
  data: Testimonial[];
  total: number;
}

// 10. GET /donations/admin/testimonials - Todos los testimonios (Admin)
export interface AllTestimonialsResponse {
  data: Testimonial[];
  total: number;
  skip: number;
  take: number;
}

// 11. POST /donations/admin/testimonials - Crear testimonio
export interface CreateTestimonialDTO {
  donorName: string;
  testimonial: string;
  avatar?: string;
  isPublished?: boolean;
}

export interface CreateTestimonialResponse {
  id: number;
  donorName: string;
  testimonial: string;
  isPublished: boolean;
  createdBy: number;
  createdAt: string;
}

// 12. PUT /donations/admin/testimonials/:id - Actualizar testimonio
export interface UpdateTestimonialDTO {
  donorName?: string;
  testimonial?: string;
  avatar?: string;
  isPublished?: boolean;
}

export interface UpdateTestimonialResponse {
  id: number;
  isPublished?: boolean;
  updatedAt: string;
}
