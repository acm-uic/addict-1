module.exports = function encodePassword(password) {
  let newPassword = '';
  password = '"' + password + '"';
  for (let i = 0; i < password.length; i++) {
    newPassword += String.fromCharCode(
      password.charCodeAt(i) & 0xff,
      (password.charCodeAt(i) >>> 8) & 0xff
    );
  }
  return newPassword;
};
