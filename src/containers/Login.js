
import { ROUTES_PATH } from '../constants/routes.js'
export let PREVIOUS_LOCATION = ''

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document
    this.localStorage = localStorage
    this.onNavigate = onNavigate
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION
    this.store = store
    // Get the form of employee
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`)
    // Listener on the submit button
    formEmployee.addEventListener("submit", this.handleSubmitEmployee)
    // Get the admin form
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`)
    // Listener on the submit button
    formAdmin.addEventListener("submit", this.handleSubmitAdmin)
  }

  /**
   * Callback function for submit employee action
   * @param {Event} e 
   */
  handleSubmitEmployee = e => {
    e.preventDefault()
    
    // Create a user object with form datas which are just submit
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected"
    }
    // Save the user object in localStorage
    this.localStorage.setItem("user", JSON.stringify(user))

    // Logged the user
    this.login(user)
      // if login give an error (bad credentials or api connection failed), call createUser()
      .catch(
        (err) => this.createUser(user)
      )
      // If is ok, redirect on bills route and save the PREVIOUS_LOCATION
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        this.document.body.style.backgroundColor="#fff"
      })

  }

  /**
   * Callback function for submit admin action
   * @param {Event} e 
   */
  handleSubmitAdmin = e => {
    e.preventDefault()

    // Create a user object with form datas which are just submit
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
      status: "connected"
    }
    // Save the user object in localStorage
    this.localStorage.setItem("user", JSON.stringify(user))
    this.login(user)
      // if login give an error (bad credentials or api connection failed), call createUser()
      .catch(
        (err) => this.createUser(user)
      )
      // If is ok, redirect on bills route and save the PREVIOUS_LOCATION
      .then(() => {
        this.onNavigate(ROUTES_PATH['Dashboard'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        document.body.style.backgroundColor="#fff"
      })
  }

  // not need to cover this function by tests
  // Function for login a user
  login = (user) => {
    // If store exist (= if the backend is run / if the connection with api is ok)
    if (this.store) {
      return this.store
      // Call login method (api call)
      .login(JSON.stringify({
        email: user.email,
        password: user.password,
      // Retrieve jwt and save it in local storage
      })).then(({jwt}) => {
        localStorage.setItem('jwt', jwt)
      })
    } else {
      return null
    }
  }

  // not need to cover this function by tests
  // Create a user when the user who want to connect doesn't exist
  createUser = (user) => {
    if (this.store) {
      return this.store
      .users()
      .create({data:JSON.stringify({
        type: user.type,
        name: user.email.split('@')[0],
        email: user.email,
        password: user.password,
      })})
      .then(() => {
        console.log(`User with ${user.email} is created`)
        return this.login(user)
      })
    } else {
      return null
    }
  }
}
