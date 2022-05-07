const validationErrorDetails = (key, message) => {
  return [{
    message,
    context: {
      key,
    }
  }]
}

module.exports = {
  validationErrorDetails
}
