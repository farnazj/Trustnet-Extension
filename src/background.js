import authServices from './services/authServices'
import relationServices from './services/relationServices'
import preferencesServices from './services/preferencesServices'
import assessmentServices from './services/assessmentServices'
import sourceListServices from './services/sourceListServices'
import postServices from './services/postServices'
import studyServices from './services/studyServices'

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Hello from the background')

  // browser.tabs.executeScript({
  //   file: 'content-script.js',
  // });

  if (request.type == 'login') {
    return new Promise((resolve, reject) => {
      authServices.login(request.data.reqBody)
      .then(res => {
        localStorage.setItem('trustnetAuthToken', JSON.stringify(res.data.user));
        resolve(res)
      })
      .catch(err => {
        console.log(err.response.data.message)
        reject({ message: err.response.data.message });
      })
    })
  }
  else if (request.type == 'logout') {
    return new Promise((resolve, reject) => {

      authServices.logout()
        .then(res => {
          localStorage.removeItem('trustnetAuthToken');
          resolve(res)
        })
        .catch(err => {
          reject({message: err});
        })
    })
  }
  else if (request.type == 'get_user') {
    return new Promise((resolve, reject) => {
      resolve(JSON.parse(localStorage.getItem('trustnetAuthToken')));
    })
  }
  else if (request.type == 'get_follows') {
    return new Promise((resolve, reject) => {
      relationServices.getFollows()
        .then(response => {
          resolve(response.data);
        })
    })
  }
  else if (request.type == 'get_trusteds') {
    return new Promise((resolve, reject) => {
      relationServices.getTrusteds()
        .then(response => {
          resolve(response.data);
        })
    })
  }
  else if (request.type == 'get_followers') {
    return new Promise((resolve, reject) => {
      let authUsername = JSON.parse(localStorage.getItem('trustnetAuthToken')).userName;
      console.log(authUsername, 'auth user name is ')
      relationServices.getFollowers({ username: authUsername })
      .then(response => {
        resolve(response.data);
      })
    })
  }
  else if (request.type == 'follow_source') {
    return new Promise((resolve, reject) => {
      relationServices.follow(request.data.reqBody)
      .then(response => {
        resolve(response.data);
      })
    })
  }
  else if (request.type == 'get_preferences') {
    return new Promise((resolve, reject) => {
      preferencesServices.getPreferences()
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'set_preferences') {
    return new Promise((resolve, reject) => {
      preferencesServices.setPreferences(request.data.reqBody)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'get_assessments') {

    return new Promise((resolve, reject) => {
      assessmentServices.getAssessmentsForURL(request.data.headers)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })

  }
  else if (request.type == 'post_assessment') {
    return new Promise((resolve, reject) => {
      assessmentServices.postAssessmentForURL(request.data.reqBody)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'get_questions') {
    return new Promise((resolve, reject) => {
      assessmentServices.getQuestionsForURL(request.data.headers)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'get_unfollowed_assessors') {
    return new Promise((resolve, reject) => {
      assessmentServices.getAssessmentsAndQuestionsFromStrangers(request.data.headers)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'follow_redirects') {
    return new Promise((resolve, reject) => {
      assessmentServices.followRedirects(request.data.headers)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'schedule_redirects') {
    return new Promise((resolve, reject) => {
      assessmentServices.scheduleRedirects(request.data.reqBody)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'get_redirects') {
    return new Promise((resolve, reject) => {
      assessmentServices.getRedirects(request.data.headers)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'send_redirects') {
    return new Promise((resolve, reject) => {
      assessmentServices.updateRedirects(request.data.reqBody)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'get_lists') {
    return new Promise((resolve, reject) => {
      sourceListServices.getLists({})
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'get_post_by_url') {
    return new Promise((resolve, reject) => {
      postServices.getArticleByUrl(request.data.headers)
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'boost_article') {
    return new Promise((resolve, reject) => {
      postServices.boostArticle(request.data.reqBody)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'log_interaction') {
    return new Promise((resolve, reject) => {
      studyServices.logUserInteraction({...request.interaction, 
        client: 'extension'})
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'new_tab') {
    console.log(request.data.url)
    chrome.tabs.create({ url: request.data.url });
  }

})
