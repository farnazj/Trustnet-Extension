import Api from './api'

export default {
  getAssessmentsForURL(headers) {
    return Api().get('/posts/assessments/url', {
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
}