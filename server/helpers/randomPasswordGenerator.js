function generateRandomPassword (min, max) {
  var passwordChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#@!%&()/'
  var randPwLen = Math.floor(Math.random() * (max - min + 1)) + min
  var randPassword = Array(randPwLen)
    .fill(passwordChars)
    .map(function (x) { return x[Math.floor(Math.random() * x.length)] })
    .join('')
  return randPassword
}

export default { generateRandomPassword }
