import Api from './api'

export default {
  getAssessmentsForURL(headers) {
    return Api().get('/posts/assessments/url', {
      withCredentials: true,
      headers: headers
    })
  }
}