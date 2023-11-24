// CredentialValidation.js

// Regular expressions for validation
const usernameRegex = /^[a-zA-Z0-9](?!.*?[._]{2})[a-zA-Z0-9._]{1,18}[a-zA-Z0-9]$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
// const phoneRegex = /^(\+)?\d{10,}$/;
// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validator = require('validator')

// Function to validate the username
export function validateUsername(username) {
  return usernameRegex.test(username);
}

// Function to validate the password
export function validatePassword(password) {
  return passwordRegex.test(password);
}

// Function to validate the phone number
export function validatePhoneNumber(phoneNumber) {
//   return phoneRegex.test(phoneNumber);
    return validator.isMobilePhone(phoneNumber, undefined);
}

// Function to validate the email
export function validateEmail(email) {
 // return emailRegex.test(email);
 return validator.isEmail(email);
}
