import Api from './api'

export default {
    logUserInteraction(reqBody) {
        return Api().post('/extension-study-log', reqBody, {
            withCredentials: true
        })
    }
}