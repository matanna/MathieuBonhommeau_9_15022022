/**
 * Function for check if response of fetch call is ok
 * @param {Promise} response 
 * @returns json
 */
const jsonOrThrowIfError = async (response) => {
  if(!response.ok) throw new Error((await response.json()).message)
  return response.json()
}

/**
 * Call the api - Crud methods avaibles
 */
class Api {
  constructor({baseUrl}) {
    this.baseUrl = baseUrl;
  }
  // Retrieve datas
  async get({url, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'GET'}))
  }
  // Add datas
  async post({url, data, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'POST', body: data}))
  }
  // Delete datas
  async delete({url, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'DELETE'}))
  }
  // Update datas
  async patch({url, data, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'PATCH', body: data}))
  }
}

/**
 * Adapt headers and bearer token
 */
const getHeaders = (headers) => {
  const h = { }
  if (!headers.noContentType) h['Content-Type'] = 'application/json'
  const jwt = localStorage.getItem('jwt')
  if (jwt && !headers.noAuthorization) h['Authorization'] = `Bearer ${jwt}`
  return {...h, ...headers}
}

/**
 * Call the good method of API object for retrieve datas
 */
class ApiEntity {
  constructor({key, api}) {
    this.key = key;
    this.api = api;
  }
  // Retrieve one data of key
  async select({selector, headers = {}}) {
    return await (this.api.get({url: `/${this.key}/${selector}`, headers: getHeaders(headers)}))
  }
  // Retrieve all datas of key
  async list({headers = {}} = {}) {
    return await (this.api.get({url: `/${this.key}`, headers: getHeaders(headers)}))
  }
  // Update one data of key
  async update({data, selector, headers = {}}) {
    return await (this.api.patch({url: `/${this.key}/${selector}`, headers: getHeaders(headers), data}))
  }
  // Create one data of key
  async create({data, headers = {}}) {
    return await (this.api.post({url: `/${this.key}`, headers: getHeaders(headers), data}))
  }
  // Delete one data of key
  async delete({selector, headers = {}}) {
    return await (this.api.delete({url: `/${this.key}/${selector}`, headers: getHeaders(headers)}))
  }
}

/**
 * Call the others methods for retrieve datas from the api
 * It's this method which is called by the rest of the app
 */
class Store {
  constructor() {
    this.api = new Api({baseUrl: 'http://localhost:5678'})
  }

  user = uid => (new ApiEntity({key: 'users', api: this.api})).select({selector: uid})
  users = () => new ApiEntity({key: 'users', api: this.api})
  login = (data) => this.api.post({url: '/auth/login', data, headers: getHeaders({noAuthorization: true})})

  ref = (path) => this.store.doc(path)

  bill = bid => (new ApiEntity({key: 'bills', api: this.api})).select({selector: bid})
  bills = () => new ApiEntity({key: 'bills', api: this.api})
}

export default new Store()