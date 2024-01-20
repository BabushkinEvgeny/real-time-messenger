// useAuthFormValidation.js

export const useAuthFormValidation = () => {
    const loginRegex = /^[A-Za-z][A-Za-z0-9._-]{5,19}$/;
  
    const validateLogin = (value:any) => {
      if (!loginRegex.test(value)) {
        return false
      }
      return true;
    };
  
    const validatePassword = (value:any) => {
      if (!loginRegex.test(value)) {
return false;
      }
      return true;
    };
  
    const validatePasswordMatch = (password:any, confirmPassword:any) => {
      return password === confirmPassword;
    };
  
    return { validateLogin, validatePassword, validatePasswordMatch };
  };
  