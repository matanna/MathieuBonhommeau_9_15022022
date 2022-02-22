import { ROUTES_PATH } from '../constants/routes.js'

export default class Logout {
  constructor({ document, onNavigate, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.localStorage = localStorage
    // Get the button for disconnect
    $('#layout-disconnect').click(this.handleClick)
  }
  // callback function for the diconnect button
  handleClick = (e) => {
    this.localStorage.clear()
    this.onNavigate(ROUTES_PATH['Login'])
  }
} 