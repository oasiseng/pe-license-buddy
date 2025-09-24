/**
 * @typedef {Object} LicenseRecord
 * @property {string} id
 * @property {string} firmName
 * @property {string} licenseNumber
 * @property {string} state
 * @property {string} status
 * @property {string} expirationDate
 * @property {number} ceuRequired
 * @property {number} ceuCompleted
 * @property {string} [holderName]
 * @property {string} [verificationUrl]
 */

/**
 * @typedef {LicenseRecord & {
 *   daysUntilExpiration: number | null,
 *   ceuRemaining: number | null,
 *   isExpired: boolean,
 *   isExpiringSoon: boolean
 * }} LicenseWithInsights
 */

module.exports = {};
