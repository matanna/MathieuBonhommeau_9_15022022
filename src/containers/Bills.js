import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    // Get the newBill button
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
  handleClickIconEye = (icon) => {
    // Get the url of the image which is store on the server / api
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
      // Call login methods (api calls)
      .bills()
      .list()
      .then(snapshot => {
        // For each bill, the date format and the status format are change
        const bills = snapshot
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            // If an error with change formats
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('length', bills.length)
        return bills
      })
    }
  }
}
