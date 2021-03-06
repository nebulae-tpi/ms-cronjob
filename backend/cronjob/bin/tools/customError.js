/**
 * class to emcapsulute diferent errors.
 */
class CustomError extends Error {
    constructor(name, method, code, message) {
      super(message); 
      this.code = code;
      this.name = name;
      this.method = method;
    }
  
    getContent(){
      return {
        name: this.name,
        code: this.code,
        msg: this.message,      
        method: this.method,
        stack: this.stack
      }
    }
  };

  class DefaultError extends Error{
    constructor(message){
      super(message)
      this.code = 14001;
      this.msg = message;
    }
  }

  module.exports =  { 
    CustomError,
    DefaultError
  } 