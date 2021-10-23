import Api from './api'

export default {
  getAssessmentsForURL(headers) {
    return Api().get('/posts/assessments/urls', {
      withCredentials: true,
      headers: headers
    })
  },

  postAssessmentForURL(reqBody) {
    return Api().post('/posts/assessments/url', reqBody ,
    {
      withCredentials: true
    })
  },

  getQuestionsForURL(headers) {
    return Api().get('/posts/questions/urls', {
      withCredentials: true,
      headers: headers
    })
  }
}