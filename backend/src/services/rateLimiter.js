// Simple in-memory store for login attempts
const loginAttempts = new Map();

const rateLimiter = {
  // Max attempts before increasing lockout time
  MAX_ATTEMPTS: 5,
  
  // Progressive lockout times in minutes
  LOCKOUT_TIMES: [1, 2, 5, 10, 15, 30, 60], // in minutes

  // Check if IP is locked
  isLocked(ip) {
    const attempt = loginAttempts.get(ip);
    if (!attempt) return false;

    // Check if lock time has expired
    if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
      return true;
    }

    // Reset if lock has expired
    if (attempt.lockUntil && attempt.lockUntil <= Date.now()) {
      // Keep the lockLevel but reset the count
      attempt.count = 0;
      attempt.lockUntil = null;
      loginAttempts.set(ip, attempt);
    }

    return false;
  },

  // Record failed attempt
  recordFailedAttempt(ip) {
    const attempt = loginAttempts.get(ip) || { 
      count: 0, 
      lockLevel: 0 // Track how many times this IP has been locked
    };
    
    attempt.count += 1;

    if (attempt.count >= this.MAX_ATTEMPTS) {
      // Get lockout time based on lock level
      const lockIndex = Math.min(attempt.lockLevel, this.LOCKOUT_TIMES.length - 1);
      const lockMinutes = this.LOCKOUT_TIMES[lockIndex];
      
      attempt.lockUntil = Date.now() + (lockMinutes * 60 * 1000);
      attempt.lockLevel += 1; // Increase lock level for next time
      attempt.count = 0; // Reset count
    }

    loginAttempts.set(ip, attempt);
    return this.MAX_ATTEMPTS - attempt.count;
  },

  // Reset attempts on successful login
  resetAttempts(ip) {
    const attempt = loginAttempts.get(ip);
    if (attempt) {
      // Reset count but keep lock level to maintain progressive lockout
      attempt.count = 0;
      attempt.lockUntil = null;
      loginAttempts.set(ip, attempt);
    }
  },

  // Get remaining attempts
  getRemainingAttempts(ip) {
    const attempt = loginAttempts.get(ip);
    if (!attempt) return this.MAX_ATTEMPTS;
    return Math.max(0, this.MAX_ATTEMPTS - attempt.count);
  },

  // Get lock time remaining in minutes
  getLockTimeRemaining(ip) {
    const attempt = loginAttempts.get(ip);
    if (!attempt || !attempt.lockUntil) return 0;
    return Math.ceil((attempt.lockUntil - Date.now()) / 1000 / 60);
  }
};

module.exports = rateLimiter; 