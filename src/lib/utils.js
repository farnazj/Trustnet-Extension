import store from '@/store'

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

  function isTrusted(source) {

    let trustedIds = store.getters['relatedSources/trustedIds'];
  
    if (trustedIds.includes(source.id))
      return true;
    else
      return false;
  }
  
  function isFollowed(source) {
  
   let followedIds = store.getters['relatedSources/followedIds'];
  
   if (followedIds.includes(source.id))
     return true;
   else
     return false;
  }
  
  export default {
    isTrusted,
    isFollowed,
    hashCode,
    uncurlify
  }