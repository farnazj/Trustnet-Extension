
function hashCode(s) {
    return s.split("").reduce(function(a,b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a&a },
      0);              
  }
  
  /*
  changes curly quotes to their non-curly counterparts
  */
  function uncurlify(s) {
    return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
  }
  
  export default {
    hashCode,
    uncurlify
  }