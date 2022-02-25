import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    // Get the newBill button
    console.log(document)
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    // Listener for newBill button
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    // Get the eye-icon button
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    // Loop on icon-eye if at least once bill is display and add a listener on each icon
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
    
  }

  // Callback function for listener of newBill button
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  // Callback function for listener eye-icon button - display the bill image when click
  handleClickIconEye = async (icon) => {
    // Get the url of the image which is store on the server / api
    console.log($('#modaleFile')[0])
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  // Get bills from api
  getBills = () => {
    // If store exist (= if the backend is run / if the connection with api is ok)
    if (this.store) {
      return this.store
      // Call login methods (api calls)!mpoikj u
      .bills()
      .list()
      .then(bills => bills)
    }
  }
}
