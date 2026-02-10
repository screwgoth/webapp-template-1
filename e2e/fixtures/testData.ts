export const testData = {
  validUser: {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
  },
  existingUser: {
    email: 'existing@example.com',
    password: 'ExistingPassword123!',
  },
  invalidCredentials: {
    email: 'invalid@example.com',
    password: 'WrongPassword123!',
  },
  weakPassword: 'weak',
  strongPassword: 'StrongPassword123!',
};

export const generateUniqueEmail = () => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
};
