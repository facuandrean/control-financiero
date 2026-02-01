export const getUser = () => {
  const user = localStorage.getItem('user');

  return {
    username: JSON.parse(user || '{}').name || 'Usuario',
    email: JSON.parse(user || '{}').email || 'Email del usuario',
  };
};