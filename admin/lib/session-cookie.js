function clearSessionCookie(res) {
  res.clearCookie('ngo_sid', { httpOnly: true, sameSite: 'lax' });
}

module.exports = { clearSessionCookie };
