/**
 * @file HmsEndpoints.ts
 * @description
 * REST API route path definitions and dynamic parameterized URI builder functions for the HMS Core API service.
 * Standardizes URI paths across all HMS domain entities (Patients, Doctors, Availability, Bookings,
 * Queue, Departments, Roles, Organizations, and Audit).
 *
 * Responsibilities:
 * - Define static URL routes for all HMS Core REST endpoints.
 * - Provide dynamic path-builder functions for parameterized resource URIs (e.g. `/api/v1/patients/${id}`).
 * - Link each endpoint group to its corresponding OpenAPI/Swagger documentation schema.
 *
 * Major Objects:
 * - {@link HMS} - Frozen dictionary containing endpoint strings and URI builder functions.
 *
 * Dependencies:
 * - None (pure constants and string functions).
 *
 * Assumptions:
 * - The HMS Core API service is hosted at base port 3000 (e.g. `http://13.205.179.0:3000`).
 * - Swagger documentation is accessible at `/api/docs`.
 *
 * Side Effects:
 * - None. All properties are immutable route path strings or pure helper functions.
 *
 * Usage Considerations:
 * - Always use `HMS` endpoint constants in API tests rather than hardcoding route strings.
 */

/**
 * HMS Core API — Endpoint Route Paths and Dynamic URI Builders.
 * Base URL: http://13.205.179.0:3000
 * Swagger Docs: http://13.205.179.0:3000/api/docs
 */
export const HMS = {

  // ── Health ─────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Health
  /** Health check endpoint */
  HEALTH: '/health',
  /** Readiness probe endpoint */
  READINESS: '/readiness',

  // ── Auth ───────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Auth
  /** Get active authentication state */
  AUTH_STATE: '/auth/state',
  /** User login and JWT retrieval */
  AUTH_LOGIN: '/auth/login',
  /** OAuth callback handler */
  AUTH_CALLBACK: '/auth/callback',
  /** Forgot password trigger */
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  /** Reset password confirmation */
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  /** User provisioning endpoint */
  AUTH_PROVISION: '/auth/provision',

  // ── Roles ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Roles
  /** List roles */
  ROLES: '/api/v1/roles',
  /** Get role by ID */
  ROLE_BY_ID: (id: string): string => `/api/v1/roles/${id}`,
  /** Get permissions assigned to a role */
  ROLE_PERMISSIONS: (id: string): string => `/api/v1/roles/${id}/permissions`,

  // ── Permissions ────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Permissions
  /** List permissions */
  PERMISSIONS: '/api/v1/permissions',
  /** Get permissions for a specific user ID */
  USER_PERMISSIONS: (userId: string): string => `/api/v1/permissions/users/${userId}`,

  // ── Bookings ───────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Bookings
  /** Bookings collection */
  BOOKINGS: '/api/v1/bookings',
  /** Get or update booking by ID */
  BOOKING_BY_ID: (id: string): string => `/api/v1/bookings/${id}`,
  /** Get booking source details */
  BOOKING_SOURCE: (id: string): string => `/api/v1/bookings/${id}/source`,
  /** Update booking handover status */
  BOOKING_HANDOVER: (id: string): string => `/api/v1/bookings/${id}/handover-status`,
  /** Reschedule an existing booking */
  BOOKING_RESCHEDULE: (id: string): string => `/api/v1/bookings/${id}/reschedule`,
  /** Check in patient for booking */
  BOOKING_CHECKIN: (id: string): string => `/api/v1/bookings/${id}/check-in`,
  /** Mark booking as completed */
  BOOKING_COMPLETE: (id: string): string => `/api/v1/bookings/${id}/complete`,
  /** Mark booking as attended */
  BOOKING_ATTENDED: (id: string): string => `/api/v1/bookings/${id}/attended`,
  /** Mark booking as no-show */
  BOOKING_NOSHOW: (id: string): string => `/api/v1/bookings/${id}/no-show`,

  // ── Availability ───────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Availability
  /** List doctor availability time slots */
  AVAILABILITY_SLOTS: '/api/v1/availability/slots',
  /** Retrieve next available time slot */
  AVAILABILITY_NEXT_SLOT: '/api/v1/availability/next-slot',
  /** List availability schedules */
  AVAILABILITY_SCHEDULES: '/api/v1/availability/schedules',
  /** Get availability schedule by schedule ID */
  AVAILABILITY_SCHEDULE_BY_ID: (id: string): string => `/api/v1/availability/schedules/${id}`,
  /** Get rules for a schedule */
  AVAILABILITY_RULES: (id: string): string => `/api/v1/availability/schedules/${id}/rules`,
  /** Get specific schedule rule */
  AVAILABILITY_RULE: (id: string, ruleId: string): string => `/api/v1/availability/schedules/${id}/rules/${ruleId}`,
  /** List availability overrides */
  AVAILABILITY_OVERRIDES: '/api/v1/availability/overrides',
  /** Get availability override by ID */
  AVAILABILITY_OVERRIDE_BY_ID: (id: string): string => `/api/v1/availability/overrides/${id}`,

  // ── Published Availability ─────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Published%20Availability
  /** Publicly accessible open availability slots */
  PUBLIC_AVAILABILITY_SLOTS: '/api/v1/public/availability/slots',

  // ── Calendar ───────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Calendar
  /** Calendar overview */
  CALENDAR: '/api/v1/calendar',

  // ── Walk-in ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Walk-in
  /** Walk-in appointment registration */
  WALK_IN: '/api/v1/walk-in',

  // ── Queue ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Queue
  /** Hospital queue management */
  QUEUE: '/api/v1/queue',
  /** Call next queue patient */
  QUEUE_NEXT: '/api/v1/queue/next',
  /** Call specific queue item by ID */
  QUEUE_CALL: (id: string): string => `/api/v1/queue/${id}/call`,
  /** Skip specific queue item by ID */
  QUEUE_SKIP: (id: string): string => `/api/v1/queue/${id}/skip`,
  /** Mark queue item as done by ID */
  QUEUE_DONE: (id: string): string => `/api/v1/queue/${id}/done`,

  // ── Reception ──────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Reception
  /** Reception desk calendar */
  RECEPTION_CALENDAR: '/api/v1/reception/calendar',

  // ── Doctor Schedule ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Doctor%20Schedule
  /** Current logged-in doctor schedule */
  DOCTOR_MY_SCHEDULE: '/api/v1/doctors/me/schedule',

  // ── Stats ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Stats
  /** Hospital utilization statistics */
  STATS_UTILIZATION: '/api/v1/stats/utilization',

  // ── Reports ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Reports
  /** Daily activity report */
  REPORTS_DAILY: '/api/v1/reports/daily',
  /** Doctor utilization reports */
  REPORTS_DOCTORS: '/api/v1/reports/doctors',
  /** Booking channels report */
  REPORTS_CHANNELS: '/api/v1/reports/channels',
  /** No-show analysis report */
  REPORTS_NO_SHOWS: '/api/v1/reports/no-shows',
  /** Patient wait time report */
  REPORTS_WAIT_TIME: '/api/v1/reports/wait-time',
  /** Export report data */
  REPORTS_EXPORT: '/api/v1/reports/export',

  // ── Audit ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Audit
  /** System audit logs */
  AUDIT: '/api/v1/audit',

  // ── Notifications ──────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Notifications
  /** Notification channels list */
  NOTIFICATION_CHANNELS: '/api/v1/notifications/channels',
  /** Specific notification channel by name */
  NOTIFICATION_CHANNEL: (channel: string): string => `/api/v1/notifications/channels/${channel}`,
  /** Notification rules list */
  NOTIFICATION_RULES: '/api/v1/notifications/rules',
  /** Notification rule by event type and channel */
  NOTIFICATION_RULE: (eventType: string, channel: string): string => `/api/v1/notifications/rules/${eventType}/${channel}`,
  /** Send notification via channel */
  NOTIFY: (channel: string): string => `/notify/${channel}`,
  /** Send bulk notifications */
  NOTIFY_BULK: (channel: string): string => `/notify/${channel}/bulk`,
  /** Schedule future notification */
  NOTIFY_SCHEDULE: (channel: string): string => `/notify/${channel}/schedule`,

  // ── Templates ──────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Templates
  /** Notification templates list */
  NOTIFICATION_TEMPLATES: '/api/v1/notification-templates',
  /** Notification template by ID */
  NOTIFICATION_TEMPLATE_BY_ID: (id: string): string => `/api/v1/notification-templates/${id}`,

  // ── Schedulers ─────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Schedulers
  /** Background scheduler jobs */
  SCHEDULERS: '/api/v1/schedulers',
  /** Scheduler job by ID */
  SCHEDULER_BY_ID: (id: string): string => `/api/v1/schedulers/${id}`,

  // ── Doctors ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Doctors
  /** Doctors collection */
  DOCTORS: '/api/v1/doctors',
  /** Doctor by ID */
  DOCTOR_BY_ID: (id: string): string => `/api/v1/doctors/${id}`,
  /** Doctor leave schedule list */
  DOCTOR_LEAVE: (doctorId: string): string => `/api/v1/doctors/${doctorId}/leave`,
  /** Doctor leave by leave group ID */
  DOCTOR_LEAVE_BY_ID: (doctorId: string, leaveGroupId: string): string => `/api/v1/doctors/${doctorId}/leave/${leaveGroupId}`,

  // ── Departments ────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Departments
  /** Hospital departments collection */
  DEPARTMENTS: '/api/v1/departments',
  /** Department by ID */
  DEPARTMENT_BY_ID: (id: string): string => `/api/v1/departments/${id}`,

  // ── Search ─────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Search
  /** Global entity search */
  SEARCH: '/api/v1/search',

  // ── Enquiries ──────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Enquiries
  /** Patient enquiries */
  ENQUIRIES: '/api/v1/enquiries',

  // ── Operating Hours ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Operating%20Hours
  /** Hospital location operating hours */
  OPERATING_HOURS: (locationId: string): string => `/api/v1/locations/${locationId}/operating-hours`,
  /** Hospital closures */
  CLOSURES: (locationId: string): string => `/api/v1/locations/${locationId}/closures`,
  /** Hospital closure by closure ID */
  CLOSURE_BY_ID: (locationId: string, closureId: string): string => `/api/v1/locations/${locationId}/closures/${closureId}`,

  // ── Consultation Services ──────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Consultation%20Services
  /** Consultation services collection */
  CONSULTATION_SERVICES: '/api/v1/consultation-services',
  /** Consultation service by ID */
  CONSULTATION_SERVICE_BY_ID: (id: string): string => `/api/v1/consultation-services/${id}`,

  // ── Patients ───────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Patients
  /** Patients collection */
  PATIENTS: '/api/v1/patients',
  /** Patient by ID */
  PATIENT_BY_ID: (id: string): string => `/api/v1/patients/${id}`,
  /** Search patients by query */
  PATIENT_SEARCH: '/api/v1/patients/search',
  /** Check for duplicate patient accounts */
  PATIENT_CHECK_DUPLICATES: '/api/v1/patients/check-duplicates',
  /** Get upcoming appointments for a patient */
  PATIENT_UPCOMING_APPTS: (id: string): string => `/api/v1/patients/${id}/appointments/upcoming`,
  /** Get appointment history for a patient */
  PATIENT_APPT_HISTORY: (id: string): string => `/api/v1/patients/${id}/appointments`,

  // ── Patient Verification ───────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Patient%20Verification
  /** Send verification OTP to patient */
  PATIENT_VERIFY_SEND: (patientId: string): string => `/api/v1/patients/${patientId}/verify/send`,
  /** Confirm verification OTP for patient */
  PATIENT_VERIFY_CONFIRM: (patientId: string): string => `/api/v1/patients/${patientId}/verify/confirm`,
  /** Standalone OTP send */
  OTP_SEND: '/api/v1/otp/send',
  /** Standalone OTP verify */
  OTP_VERIFY: '/api/v1/otp/verify',

  // ── Patient Consent ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Patient%20Consent
  /** Patient consents */
  PATIENT_CONSENTS: (patientId: string): string => `/api/v1/patients/${patientId}/consents`,
  /** Patient communication preferences */
  PATIENT_COMM_PREFS: (patientId: string): string => `/api/v1/patients/${patientId}/communication-preferences`,

  // ── Packages ───────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Packages
  /** Care packages collection */
  PACKAGES: '/api/v1/packages',
  /** Care package by ID */
  PACKAGE_BY_ID: (id: string): string => `/api/v1/packages/${id}`,

  // ── Organizations ──────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Organizations
  /** Organizations collection */
  ORGANIZATIONS: '/api/v1/organizations',
  /** Current organization profile */
  ORG_ME: '/api/v1/organizations/me',
  /** Organization member list */
  ORG_MEMBERS: '/api/v1/organizations/me/members',
  /** Organization member by role ID */
  ORG_MEMBER: (userRoleId: string): string => `/api/v1/organizations/me/members/${userRoleId}`,
  /** Organization member role update */
  ORG_MEMBER_ROLE: (userRoleId: string): string => `/api/v1/organizations/me/members/${userRoleId}/role`,
  /** Organization onboarding setup status */
  ORG_SETUP_STATUS: '/api/v1/organizations/setup/status',

  // ── Users ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Users
  /** Hospital users collection */
  USERS: '/api/v1/users',
  /** User by ID */
  USER_BY_ID: (id: string): string => `/api/v1/users/${id}`,
  /** User role update */
  USER_ROLE: (id: string): string => `/api/v1/users/${id}/role`,

  // ── Admin ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Admin
  /** Admin platform statistics */
  ADMIN_STATS: '/api/v1/admin/stats',
  /** Admin organizations list */
  ADMIN_ORGS: '/api/v1/admin/organizations',
  /** Admin organization by ID */
  ADMIN_ORG_BY_ID: (id: string): string => `/api/v1/admin/organizations/${id}`,
  /** List organization administrators */
  ADMIN_ORG_ADMINS: (orgId: string): string => `/api/v1/admin/organizations/${orgId}/admins`,
  /** Specific organization administrator by user ID */
  ADMIN_ORG_ADMIN: (orgId: string, userId: string): string => `/api/v1/admin/organizations/${orgId}/admins/${userId}`,
  /** Organization feature flags */
  ADMIN_ORG_FLAGS: (orgId: string): string => `/api/v1/admin/organizations/${orgId}/feature-flags`,
  /** Specific organization feature flag by key */
  ADMIN_ORG_FLAG: (orgId: string, key: string): string => `/api/v1/admin/organizations/${orgId}/feature-flags/${key}`,

  // ── Feature Flags ──────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Feature%20Flags
  /** System feature flags */
  FEATURE_FLAGS: '/api/v1/feature-flags',
  /** System feature flag by key */
  FEATURE_FLAG: (key: string): string => `/api/v1/feature-flags/${key}`,

  // ── Invites ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Invites
  /** Organization invites list */
  INVITES: '/api/v1/organizations/me/invites',
  /** Organization invite by ID */
  INVITE_BY_ID: (id: string): string => `/api/v1/organizations/me/invites/${id}`,
  /** Expire organization invite */
  INVITE_EXPIRE: (id: string): string => `/api/v1/organizations/me/invites/${id}/expire`,
  /** Preview invite token details */
  INVITE_PREVIEW: (token: string): string => `/api/v1/invites/${token}`,
  /** Accept organization invite */
  INVITE_ACCEPT: (token: string): string => `/api/v1/invites/${token}/accept`,
};
