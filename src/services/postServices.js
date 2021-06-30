import Api from './api'

export default {
  getArticleByUrl(headers) {
      return Api().get(`/posts/url`, {
        withCredentials: true,
        headers: headers
      })
  },
  boostArticle(reqBody) {
    return Api().post('/boosts',
    reqBody, { withCredentials: true })
  },
  getBoostByPostId(params, headers) {
    return Api().get(`/boosts/posts/${params.postId}`, {
      withCredentials: true,
      headers: headers
    })
  }
}