// API Types for Backend Integration

// ============================================================================
// BASE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  success: boolean;
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
  
  // Projects
  PROJECT_CREATE = 'project_create',
  PROJECT_UPDATE = 'project_update',
  PROJECT_DELETE = 'project_delete',
  PROJECT_LIST = 'project_list',
  
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
// PROJECTS
// ============================================================================

export interface CreateProjectDTO {
  title: string;
  shortDescription: string;
  fullDescription: string;
  mainGoal: string;
  specificObjectives: string[];
  beneficiaries: {
    count: number;
    description: string;
  };
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  mainImage: string;
  gallery?: { url: string; caption?: string }[];
  needsVolunteers: boolean;
  volunteersNeeded?: number;
  requiredSkills: string[];
  location: string[];
  tags: string[];
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {
  id: number;
}

export interface ProjectResponse extends CreateProjectDTO {
  id: number;
  slug: string;
  volunteersRegistered: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
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
