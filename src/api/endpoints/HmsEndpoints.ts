/**
 * HMS Core API — Endpoint Constants
 * Base URL: http://13.205.179.0:3000
 * Swagger Docs: http://13.205.179.0:3000/api/docs
 *
 * Every endpoint has a Swagger doc link for traceability.
 */
export const HMS = {

  // ── Health ─────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Health
  HEALTH: '/health',
  READINESS: '/readiness',

  // ── Auth ───────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Auth
  AUTH_STATE: '/auth/state',
  AUTH_LOGIN: '/auth/login',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_PROVISION: '/auth/provision',

  // ── Roles ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Roles
  ROLES: '/api/v1/roles',
  ROLE_BY_ID: (id: string) => `/api/v1/roles/${id}`,
  ROLE_PERMISSIONS: (id: string) => `/api/v1/roles/${id}/permissions`,

  // ── Permissions ────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Permissions
  PERMISSIONS: '/api/v1/permissions',
  USER_PERMISSIONS: (userId: string) => `/api/v1/permissions/users/${userId}`,

  // ── Bookings ───────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Bookings
  BOOKINGS: '/api/v1/bookings',
  BOOKING_BY_ID: (id: string) => `/api/v1/bookings/${id}`,
  BOOKING_SOURCE: (id: string) => `/api/v1/bookings/${id}/source`,
  BOOKING_HANDOVER: (id: string) => `/api/v1/bookings/${id}/handover-status`,
  BOOKING_RESCHEDULE: (id: string) => `/api/v1/bookings/${id}/reschedule`,
  BOOKING_CHECKIN: (id: string) => `/api/v1/bookings/${id}/check-in`,
  BOOKING_COMPLETE: (id: string) => `/api/v1/bookings/${id}/complete`,
  BOOKING_ATTENDED: (id: string) => `/api/v1/bookings/${id}/attended`,
  BOOKING_NOSHOW: (id: string) => `/api/v1/bookings/${id}/no-show`,

  // ── Availability ───────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Availability
  AVAILABILITY_SLOTS: '/api/v1/availability/slots',
  AVAILABILITY_NEXT_SLOT: '/api/v1/availability/next-slot',
  AVAILABILITY_SCHEDULES: '/api/v1/availability/schedules',
  AVAILABILITY_SCHEDULE_BY_ID: (id: string) => `/api/v1/availability/schedules/${id}`,
  AVAILABILITY_RULES: (id: string) => `/api/v1/availability/schedules/${id}/rules`,
  AVAILABILITY_RULE: (id: string, ruleId: string) => `/api/v1/availability/schedules/${id}/rules/${ruleId}`,
  AVAILABILITY_OVERRIDES: '/api/v1/availability/overrides',
  AVAILABILITY_OVERRIDE_BY_ID: (id: string) => `/api/v1/availability/overrides/${id}`,

  // ── Published Availability ─────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Published%20Availability
  PUBLIC_AVAILABILITY_SLOTS: '/api/v1/public/availability/slots',

  // ── Calendar ───────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Calendar
  CALENDAR: '/api/v1/calendar',

  // ── Walk-in ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Walk-in
  WALK_IN: '/api/v1/walk-in',

  // ── Queue ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Queue
  QUEUE: '/api/v1/queue',
  QUEUE_NEXT: '/api/v1/queue/next',
  QUEUE_CALL: (id: string) => `/api/v1/queue/${id}/call`,
  QUEUE_SKIP: (id: string) => `/api/v1/queue/${id}/skip`,
  QUEUE_DONE: (id: string) => `/api/v1/queue/${id}/done`,

  // ── Reception ──────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Reception
  RECEPTION_CALENDAR: '/api/v1/reception/calendar',

  // ── Doctor Schedule ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Doctor%20Schedule
  DOCTOR_MY_SCHEDULE: '/api/v1/doctors/me/schedule',

  // ── Stats ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Stats
  STATS_UTILIZATION: '/api/v1/stats/utilization',

  // ── Reports ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Reports
  REPORTS_DAILY: '/api/v1/reports/daily',
  REPORTS_DOCTORS: '/api/v1/reports/doctors',
  REPORTS_CHANNELS: '/api/v1/reports/channels',
  REPORTS_NO_SHOWS: '/api/v1/reports/no-shows',
  REPORTS_WAIT_TIME: '/api/v1/reports/wait-time',
  REPORTS_EXPORT: '/api/v1/reports/export',

  // ── Audit ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Audit
  AUDIT: '/api/v1/audit',

  // ── Notifications ──────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Notifications
  NOTIFICATION_CHANNELS: '/api/v1/notifications/channels',
  NOTIFICATION_CHANNEL: (channel: string) => `/api/v1/notifications/channels/${channel}`,
  NOTIFICATION_RULES: '/api/v1/notifications/rules',
  NOTIFICATION_RULE: (eventType: string, channel: string) => `/api/v1/notifications/rules/${eventType}/${channel}`,
  NOTIFY: (channel: string) => `/notify/${channel}`,
  NOTIFY_BULK: (channel: string) => `/notify/${channel}/bulk`,
  NOTIFY_SCHEDULE: (channel: string) => `/notify/${channel}/schedule`,

  // ── Templates ──────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Templates
  NOTIFICATION_TEMPLATES: '/api/v1/notification-templates',
  NOTIFICATION_TEMPLATE_BY_ID: (id: string) => `/api/v1/notification-templates/${id}`,

  // ── Schedulers ─────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Schedulers
  SCHEDULERS: '/api/v1/schedulers',
  SCHEDULER_BY_ID: (id: string) => `/api/v1/schedulers/${id}`,

  // ── Doctors ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Doctors
  DOCTORS: '/api/v1/doctors',
  DOCTOR_BY_ID: (id: string) => `/api/v1/doctors/${id}`,
  DOCTOR_LEAVE: (doctorId: string) => `/api/v1/doctors/${doctorId}/leave`,
  DOCTOR_LEAVE_BY_ID: (doctorId: string, leaveGroupId: string) => `/api/v1/doctors/${doctorId}/leave/${leaveGroupId}`,

  // ── Departments ────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Departments
  DEPARTMENTS: '/api/v1/departments',
  DEPARTMENT_BY_ID: (id: string) => `/api/v1/departments/${id}`,

  // ── Search ─────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Search
  SEARCH: '/api/v1/search',

  // ── Enquiries ──────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Enquiries
  ENQUIRIES: '/api/v1/enquiries',

  // ── Operating Hours ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Operating%20Hours
  OPERATING_HOURS: (locationId: string) => `/api/v1/locations/${locationId}/operating-hours`,
  CLOSURES: (locationId: string) => `/api/v1/locations/${locationId}/closures`,
  CLOSURE_BY_ID: (locationId: string, closureId: string) => `/api/v1/locations/${locationId}/closures/${closureId}`,

  // ── Consultation Services ──────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Consultation%20Services
  CONSULTATION_SERVICES: '/api/v1/consultation-services',
  CONSULTATION_SERVICE_BY_ID: (id: string) => `/api/v1/consultation-services/${id}`,

  // ── Patients ───────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Patients
  PATIENTS: '/api/v1/patients',
  PATIENT_BY_ID: (id: string) => `/api/v1/patients/${id}`,
  PATIENT_SEARCH: '/api/v1/patients/search',
  PATIENT_CHECK_DUPLICATES: '/api/v1/patients/check-duplicates',
  PATIENT_UPCOMING_APPTS: (id: string) => `/api/v1/patients/${id}/appointments/upcoming`,
  PATIENT_APPT_HISTORY: (id: string) => `/api/v1/patients/${id}/appointments`,

  // ── Patient Verification ───────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Patient%20Verification
  PATIENT_VERIFY_SEND: (patientId: string) => `/api/v1/patients/${patientId}/verify/send`,
  PATIENT_VERIFY_CONFIRM: (patientId: string) => `/api/v1/patients/${patientId}/verify/confirm`,
  OTP_SEND: '/api/v1/otp/send',
  OTP_VERIFY: '/api/v1/otp/verify',

  // ── Patient Consent ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Patient%20Consent
  PATIENT_CONSENTS: (patientId: string) => `/api/v1/patients/${patientId}/consents`,
  PATIENT_COMM_PREFS: (patientId: string) => `/api/v1/patients/${patientId}/communication-preferences`,

  // ── Packages ───────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Packages
  PACKAGES: '/api/v1/packages',
  PACKAGE_BY_ID: (id: string) => `/api/v1/packages/${id}`,

  // ── Organizations ──────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Organizations
  ORGANIZATIONS: '/api/v1/organizations',
  ORG_ME: '/api/v1/organizations/me',
  ORG_MEMBERS: '/api/v1/organizations/me/members',
  ORG_MEMBER: (userRoleId: string) => `/api/v1/organizations/me/members/${userRoleId}`,
  ORG_MEMBER_ROLE: (userRoleId: string) => `/api/v1/organizations/me/members/${userRoleId}/role`,
  ORG_SETUP_STATUS: '/api/v1/organizations/setup/status',

  // ── Users ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Users
  USERS: '/api/v1/users',
  USER_BY_ID: (id: string) => `/api/v1/users/${id}`,
  USER_ROLE: (id: string) => `/api/v1/users/${id}/role`,

  // ── Admin ──────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Admin
  ADMIN_STATS: '/api/v1/admin/stats',
  ADMIN_ORGS: '/api/v1/admin/organizations',
  ADMIN_ORG_BY_ID: (id: string) => `/api/v1/admin/organizations/${id}`,
  ADMIN_ORG_ADMINS: (orgId: string) => `/api/v1/admin/organizations/${orgId}/admins`,
  ADMIN_ORG_ADMIN: (orgId: string, userId: string) => `/api/v1/admin/organizations/${orgId}/admins/${userId}`,
  ADMIN_ORG_FLAGS: (orgId: string) => `/api/v1/admin/organizations/${orgId}/feature-flags`,
  ADMIN_ORG_FLAG: (orgId: string, key: string) => `/api/v1/admin/organizations/${orgId}/feature-flags/${key}`,

  // ── Feature Flags ──────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Feature%20Flags
  FEATURE_FLAGS: '/api/v1/feature-flags',
  FEATURE_FLAG: (key: string) => `/api/v1/feature-flags/${key}`,

  // ── Invites ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3000/api/docs#/Invites
  INVITES: '/api/v1/organizations/me/invites',
  INVITE_BY_ID: (id: string) => `/api/v1/organizations/me/invites/${id}`,
  INVITE_EXPIRE: (id: string) => `/api/v1/organizations/me/invites/${id}/expire`,
  INVITE_PREVIEW: (token: string) => `/api/v1/invites/${token}`,
  INVITE_ACCEPT: (token: string) => `/api/v1/invites/${token}/accept`,
};
