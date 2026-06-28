/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MailSettings {
  gmailAddress: string;
  gmailAppPassword: string;
}

export interface EmailForm {
  toEmail: string;
  subject: string;
  htmlContent: string;
}

export interface SentEmailItem {
  id: string;
  toEmail: string;
  subject: string;
  timestamp: string;
  status: 'success' | 'error';
  errorMessage?: string;
  htmlContent: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
}
