import Api from './api'

export default {
    logUserInteraction(reqBody) {
        return Api().post('/log-interaction', reqBody, {
            withCredentials: true
        })
    }
}