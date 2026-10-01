/**
 * @file testDataLoader.ts
 * @description
 * Unified Test Data Loader supporting JSON (`sample/booking.json`), Columnar Excel/CSV (`sample/booking.csv`),
 * Scenario-by-Scenario row lookups, Dynamic unique phone number generation, and Environment Variable overrides.
 *
 * Data Source Selection:
 * - Configured via `DATA_SOURCE` or `TEST_DATA_SOURCE` environment variable.
 * - Accepted values: "json" | "excel" | "csv" | "env" (Default: "json").
 *
 * Excel / CSV Table Columns:
 * - `Scenario,PatientType,FullName,Email,DOB,Gender,State,City,Pincode,MobileNumber,OTP,Doctor,Month,AppointmentDate,TimeSlot,CarePackage`
 *
 * Functions:
 * - `getTestData()`: Returns full `BookingTestData` object.
 * - `getScenarioData(scenarioId, options)`: Returns exact `ScenarioRecord` row from Excel/CSV/JSON.
 * - `generateUniquePhone()`: Generates a fresh unlinked 10-digit mobile number for reliable New Patient creation.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface ScenarioRecord {
  // Direct Excel Column Names
  Scenario: string;
  PatientType: string;
  FullName: string;
  Email: string;
  DOB: string;
  Gender: string;
  State: string;
  City: string;
  Pincode: string;
  MobileNumber: string;
  OTP: string;
  Doctor: string;
  Month: string;
  AppointmentDate: string;
  TimeSlot: string;
  CarePackage: string;

  // Convenient Aliases
  scenario: string;
  patientType: string;
  fullName: string;
  email: string;
  dob: string;
  gender: string;
  state: string;
  city: string;
  pincode: string;
  phone: string;
  otp: string;
  doctor: string;
  month: string;
  appointmentDate: string;
  timeSlot: string;
  carePackage: string;
}

export interface BookingTestData {
  application: {
    url: string;
    title: string;
    languages: {
      english: string;
      hindi: string;
      telugu: string;
    };
  };
  scenarios: {
    newPatient: {
      primary: {
        patientType: string;
        doctor: string;
        month: string;
        appointmentDate: string;
        timeSlot: string;
        carePackage: string;
        personalDetails: {
          fullName: string;
          email?: string;
          dob: string;
          gender: string;
          pincode: string;
          state: string;
          city: string;
          phone: string;
          otp: string;
        };
      };
      secondary: {
        patientType: string;
        doctor: string;
        month: string;
        appointmentDate: string;
        timeSlot: string;
        carePackage: string;
        personalDetails: {
          fullName: string;
          email?: string;
          dob: string;
          gender: string;
          pincode: string;
          state: string;
          city: string;
          phone: string;
          otp: string;
        };
      };
    };
    reschedule: {
      newDoctor: string;
      newMonth: string;
      newAppointmentDate: string;
      newTimeSlot: string;
      newCarePackage: string;
    };
    existingPatient: {
      registeredPhone: string;
      registered: {
        phone: string;
        alternatePhone: string;
        otp: string;
        patientSelection: number;
        secondPatientSelection: number;
        doctor: string;
        month: string;
        appointmentDate: string;
        timeSlot: string;
        carePackage: string;
      };
      unregistered: {
        phone: string;
        otp: string;
      };
      invalidOtp: {
        phone: string;
        otp: string;
      };
      reschedule: {
        newDoctor: string;
        newMonth: string;
        newAppointmentDate: string;
        newTimeSlot: string;
        newCarePackage: string;
      };
      boundaries: {
        blank: string;
        shortPhone: string;
        longPhone: string;
        specialCharPhone: string;
      };
    };
    carePackages: {
      silver: { name: string; price: string; desc: string };
      gold: { name: string; price: string; desc: string };
      platinum: { name: string; price: string; desc: string };
    };
    doctors: string[];
    boundaries: {
      name: { minLength: string; maxLength: string; whitespaceOnly: string; numericOnly: string };
      gender: { male: string; female: string };
      dob: { validPastDate: string; futureDate: string; currentYearDate: string };
      phone: {
        valid10Digits: string;
        shortLength: string;
        longLength: string;
        alphabetic: string;
        specialChars: string;
        invalidStartingDigit: string;
      };
      city: {
        validCity: string;
        alternateCity: string;
        numericCity: string;
        specialCharCity: string;
        unknownCity: string;
        longCity: string;
      };
      otp: { valid: string; short: string; invalid: string };
      pincode: { valid6Digits: string; validTirupati?: string; validHyderabad?: string };
    };
    expectedMessages: Record<string, string>;
    whatsapp?: {
      supportUrl: string;
      phone: string;
      defaultMessage: string;
    };
    chatbot?: {
      name: string;
      title: string;
      greeting: string;
      sampleQuestions: string[];
    };
  };
}

let phoneCounter = 1;

/**
 * Generates a clean 10-digit Indian mobile number with fresh base prefix (98492100xx)
 * where only the last 2 digits change cleanly (01 to 99) for each new patient test scenario,
 * safely avoiding previously registered numbers.
 */
export function generateUniquePhone(): string {
  const last2Digits = String((phoneCounter++ % 90) + 1).padStart(2, '0');
  return `98492100${last2Digits}`;
}

/**
 * Retrieves all scenario rows from the Excel/CSV file (`sample/booking.csv`).
 */
export function getAllScenarioRows(): ScenarioRecord[] {
  const rootDir = process.cwd();
  const csvPath = path.resolve(rootDir, 'sample', 'booking.csv');
  if (!fs.existsSync(csvPath)) return [];

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0 && !line.trim().startsWith('#'));
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const records: ScenarioRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    const fullName = row['fullname'] || 'Guna Sekhar';
    const email = row['email'] || 'test@example.com';
    const dob = row['dob'] || '1995-05-15';
    const gender = row['gender'] || 'Male';
    const state = row['state'] || 'Andhra Pradesh';
    const city = row['city'] || 'Tirupati';
    const pincode = row['pincode'] || '517541';
    const phone = row['mobilenumber'] || row['phone'] || '9849210001';
    const otp = row['otp'] || '123456';
    const doctor = row['doctor'] || 'Dr.KVNN.Santhosh Murthy';
    const month = row['month'] || 'October';
    const appointmentDate = row['appointmentdate'] || row['date'] || '3';
    const timeSlot = row['timeslot'] || row['slot'] || '6:30 PM';
    const carePackage = row['carepackage'] || row['package'] || 'Platinum';
    const scenario = row['scenario'] || `Row_${i}`;
    const patientType = row['patienttype'] || 'new';

    records.push({
      // Direct Excel Column Names
      Scenario: scenario,
      PatientType: patientType,
      FullName: fullName,
      Email: email,
      DOB: dob,
      Gender: gender,
      State: state,
      City: city,
      Pincode: pincode,
      MobileNumber: phone,
      OTP: otp,
      Doctor: doctor,
      Month: month,
      AppointmentDate: appointmentDate,
      TimeSlot: timeSlot,
      CarePackage: carePackage,

      // Convenient Aliases
      scenario,
      patientType,
      fullName,
      email,
      dob,
      gender,
      state,
      city,
      pincode,
      phone,
      otp,
      doctor,
      month,
      appointmentDate,
      timeSlot,
      carePackage,
    });
  }

  return records;
}

/**
 * Retrieves a single row of test data matching the given Scenario ID from Excel/CSV (or JSON).
 * Fields can be accessed directly by Excel column name (e.g. `data.FullName`, `data.MobileNumber`, `data.DOB`, `data.Doctor`).
 *
 * @param {string} scenarioId - The ID of the scenario (e.g. "SM-004", "SM-008", "NP-004", "E2E-NP-001")
 * @param {object} [options] - Optional settings
 * @param {boolean} [options.freshPhone=false] - If true, generates a fresh unique phone number to avoid duplicate links
 * @returns {ScenarioRecord} The parameterized row data
 */
export function getScenarioData(scenarioId: string, options?: { freshPhone?: boolean }): ScenarioRecord {
  const rows = getAllScenarioRows();
  const normalizedId = scenarioId.trim().toLowerCase();
  const matched = rows.find(r => r.scenario.trim().toLowerCase() === normalizedId);

  let record: ScenarioRecord;

  if (matched) {
    record = { ...matched };
  } else {
    // Fallback to primary JSON scenario
    const base = getTestData();
    const p = base.scenarios.newPatient.primary;
    const fullName = p.personalDetails.fullName;
    const email = p.personalDetails.email || '';
    const dob = p.personalDetails.dob;
    const gender = p.personalDetails.gender;
    const state = p.personalDetails.state;
    const city = p.personalDetails.city;
    const pincode = p.personalDetails.pincode;
    const phone = p.personalDetails.phone;
    const otp = p.personalDetails.otp;
    const doctor = p.doctor;
    const month = p.month;
    const appointmentDate = p.appointmentDate;
    const timeSlot = p.timeSlot;
    const carePackage = p.carePackage;
    const patientType = p.patientType;

    record = {
      Scenario: scenarioId,
      PatientType: patientType,
      FullName: fullName,
      Email: email,
      DOB: dob,
      Gender: gender,
      State: state,
      City: city,
      Pincode: pincode,
      MobileNumber: phone,
      OTP: otp,
      Doctor: doctor,
      Month: month,
      AppointmentDate: appointmentDate,
      TimeSlot: timeSlot,
      CarePackage: carePackage,

      scenario: scenarioId,
      patientType,
      fullName,
      email,
      dob,
      gender,
      state,
      city,
      pincode,
      phone,
      otp,
      doctor,
      month,
      appointmentDate,
      timeSlot,
      carePackage,
    };
  }

  // If freshPhone is requested, generate unique number
  if (options?.freshPhone && record.patientType === 'new') {
    const uniqueNumber = generateUniquePhone();
    record.phone = uniqueNumber;
    record.MobileNumber = uniqueNumber;
  }

  return record;
}

/** Alias for {@link getScenarioData}. Retrieve Excel data row by scenario name. */
export const getExcelData = getScenarioData;

/**
 * Retrieves a row from the Excel/CSV table by row number (1-based index).
 * Example: getExcelRowByIndex(1) returns the first data row.
 * Example: getExcelRowByIndex(3) returns the 3rd data row.
 *
 * @param {number} rowNumber - 1-based row number
 * @param {object} [options] - Optional settings
 * @returns {ScenarioRecord} The row data object
 */
export function getExcelRowByIndex(rowNumber: number, options?: { freshPhone?: boolean }): ScenarioRecord {
  const rows = getAllScenarioRows();
  const idx = rowNumber > 0 ? rowNumber - 1 : 0;
  const record = rows[idx] || rows[0];
  const copy = { ...record };
  if (options?.freshPhone && copy.patientType === 'new') {
    const uniqueNumber = generateUniquePhone();
    copy.phone = uniqueNumber;
    copy.MobileNumber = uniqueNumber;
  }
  return copy;
}

/** Alias for {@link getExcelRowByIndex}. */
export const getExcelRow = getExcelRowByIndex;

/**
 * Retrieves a row matching a given Mobile Number from the Excel/CSV table.
 *
 * @param {string} mobileNumber - 10-digit mobile number
 * @param {object} [options] - Optional settings
 * @returns {ScenarioRecord} The row data object
 */
export function getExcelDataByPhone(mobileNumber: string, options?: { freshPhone?: boolean }): ScenarioRecord {
  const rows = getAllScenarioRows();
  const matched = rows.find(r => r.phone === mobileNumber || r.MobileNumber === mobileNumber);
  const record = matched ? { ...matched } : getExcelRowByIndex(1);
  if (options?.freshPhone && record.patientType === 'new') {
    const uniqueNumber = generateUniquePhone();
    record.phone = uniqueNumber;
    record.MobileNumber = uniqueNumber;
  }
  return record;
}

/**
 * Retrieves a specific cell value directly by Scenario Name and Column Name.
 *
 * Examples:
 * - `getExcelValue('SM-004', 'FullName')` -> "Guna Sekhar"
 * - `getExcelValue('SM-004', 'MobileNumber')` -> "9849210004"
 * - `getExcelValue('SM-004', 'DOB')` -> "1995-05-15"
 * - `getExcelValue('SM-004', 'Doctor')` -> "Dr.KVNN.Santhosh Murthy"
 * - `getExcelValue('SM-004', 'CarePackage')` -> "Platinum"
 *
 * @param {string} scenarioName - The scenario name/ID (e.g. "SM-004")
 * @param {string} columnName - The column name (e.g. "MobileNumber", "FullName", "DOB", "Doctor")
 * @returns {string} Cell value string
 */
export function getExcelValue(scenarioName: string, columnName: string): string {
  const data = getScenarioData(scenarioName) as any;
  const normalized = columnName.trim().toLowerCase();
  for (const key of Object.keys(data)) {
    if (key.toLowerCase() === normalized) {
      return (data[key] ?? '').toString();
    }
  }
  return '';
}

/**
 * Retrieves a specific cell value by Row Number and Column (by 1-based Column index or Column Name).
 *
 * Examples:
 * - `getExcelCell(1, 3)` -> Returns 3rd Column (FullName) from Row 1
 * - `getExcelCell(1, 5)` -> Returns 5th Column (DOB) from Row 1
 * - `getExcelCell(2, 'MobileNumber')` -> Returns MobileNumber cell from Row 2
 *
 * @param {number} rowNumber - 1-based row index (1 = first data row)
 * @param {number | string} column - 1-based column number (e.g. 3, 5) or column header name
 * @returns {string} Cell value string
 */
export function getExcelCell(rowNumber: number, column: number | string): string {
  const rootDir = process.cwd();
  const csvPath = path.resolve(rootDir, 'sample', 'booking.csv');
  if (!fs.existsSync(csvPath)) return '';

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0 && !line.trim().startsWith('#'));
  if (lines.length < 2) return '';

  const headerLine = lines[0].split(',').map(h => h.trim().toLowerCase());
  const targetLine = lines[rowNumber] || lines[1];
  const cells = targetLine.split(',').map(v => v.trim());

  if (typeof column === 'number') {
    // 1-based column index (e.g. 3 for 3rd column, 5 for 5th column)
    const colIdx = column >= 1 ? column - 1 : column;
    return cells[colIdx] || '';
  } else {
    // Column header name (e.g. 'fullname', 'dob', 'mobilenumber')
    const colIdx = headerLine.indexOf(column.trim().toLowerCase());
    return colIdx >= 0 ? cells[colIdx] || '' : '';
  }
}

/**
 * Loads test data from the configured source (JSON or Excel/CSV).
 *
 * @returns {BookingTestData} Standardized booking test data object
 */
export function getTestData(): BookingTestData {
  const dataSource = (process.env.DATA_SOURCE || process.env.TEST_DATA_SOURCE || 'csv').toLowerCase();
  const rootDir = process.cwd();
  const jsonPath = path.resolve(rootDir, 'sample', 'booking.json');
  const csvPath = path.resolve(rootDir, 'sample', 'booking.csv');

  let data: BookingTestData;

  if ((dataSource === 'excel' || dataSource === 'csv') && fs.existsSync(csvPath)) {
    data = loadFromCsv(csvPath, jsonPath);
  } else {
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as BookingTestData;
  }

  return data;
}

/**
 * Helper to parse columnar row-wise CSV / Excel format test data into structured BookingTestData
 */
function loadFromCsv(csvFilePath: string, fallbackJsonPath: string): BookingTestData {
  const baseData = JSON.parse(fs.readFileSync(fallbackJsonPath, 'utf-8')) as BookingTestData;
  try {
    const rows = getAllScenarioRows();
    if (rows.length === 0) return baseData;

    rows.forEach(r => {
      const scenario = r.scenario.toLowerCase();
      if (scenario.includes('newpatient_primary') || scenario === 'primary' || scenario === 'sm-004') {
        baseData.scenarios.newPatient.primary.personalDetails.fullName = r.fullName;
        baseData.scenarios.newPatient.primary.personalDetails.phone = r.phone;
        baseData.scenarios.newPatient.primary.personalDetails.dob = r.dob;
        baseData.scenarios.newPatient.primary.personalDetails.gender = r.gender;
        baseData.scenarios.newPatient.primary.personalDetails.state = r.state;
        baseData.scenarios.newPatient.primary.personalDetails.city = r.city;
        baseData.scenarios.newPatient.primary.personalDetails.pincode = r.pincode;
        baseData.scenarios.newPatient.primary.personalDetails.otp = r.otp;
        baseData.scenarios.newPatient.primary.doctor = r.doctor;
        baseData.scenarios.newPatient.primary.month = r.month;
        baseData.scenarios.newPatient.primary.appointmentDate = r.appointmentDate;
        baseData.scenarios.newPatient.primary.timeSlot = r.timeSlot;
        baseData.scenarios.newPatient.primary.carePackage = r.carePackage;
      } else if (scenario.includes('newpatient_secondary') || scenario === 'secondary' || scenario === 'sm-009') {
        baseData.scenarios.newPatient.secondary.personalDetails.fullName = r.fullName;
        baseData.scenarios.newPatient.secondary.personalDetails.phone = r.phone;
      } else if (scenario.includes('existingpatient') || scenario === 'sm-006') {
        baseData.scenarios.existingPatient.registeredPhone = r.phone;
        baseData.scenarios.existingPatient.registered.phone = r.phone;
        baseData.scenarios.existingPatient.registered.otp = r.otp;
      }
    });
  } catch (err) {
    console.warn(`[DataLoader] Warning: Unable to parse CSV '${csvFilePath}', falling back to JSON data.`, err);
  }

  return baseData;
}
