import { ROUTES_PATH } from "../constants/routes.js"
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    // Get the form of newBill
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    )
    // Listener on the newBill submit button
    formNewBill.addEventListener("submit", this.handleSubmit)
    // Get the input files
    const file = this.document.querySelector(`input[data-testid="file"]`)
    // Listener on the input file
    file.addEventListener("change", this.handleChangeFile)
    this.formData = new FormData()
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  /**
   * Callback function for listener on input files
   * @param {Event} e
   */
  handleChangeFile = (e) => {
    e.preventDefault()

    // Get the object with the file which is just load in the input (.files[0])
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0]
    const extensionsAut = ["image/png", "image/jpeg"]

    if (file && extensionsAut.includes(file.type)) {
      // Split the path (C:\ggggg\hhhhh.jpg) with split(\)
      const filePath = e.target.value.split(/\\/g)
      // Retrieve the last item of filePath[] which contains the file name
      this.fileName = filePath[filePath.length - 1]

      // Create an object FormData with datas of user stored in localStorage
      const email = JSON.parse(localStorage.getItem("user")).email
      this.formData.append("file", file)
      this.formData.append("email", email)
    } else {
      this.document.querySelector(`input[data-testid="file"]`).value = ""
      console.error("This type is not allowed")
    }
  }

  /**
   * Callbach for listener submit newBill form
   * @param {Event} e
   */
  handleSubmit = (e) => {
    e.preventDefault()
    // Call api for create a bill for the good user - formData is send with the request
    this.store
      .bills()
      .create({
        data: this.formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        this.billId = key
        this.fileUrl = fileUrl
        const email = JSON.parse(localStorage.getItem("user")).email
        const bill = {
          email,
          type: e.target.querySelector(`select[data-testid="expense-type"]`)
            .value,
          name: e.target.querySelector(`input[data-testid="expense-name"]`)
            .value,
          amount: parseInt(
            e.target.querySelector(`input[data-testid="amount"]`).value
          ),
          date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
          vat: e.target.querySelector(`input[data-testid="vat"]`).value,
          pct:
            parseInt(
              e.target.querySelector(`input[data-testid="pct"]`).value
            ) || 20,
          commentary: e.target.querySelector(
            `textarea[data-testid="commentary"]`
          ).value,
          fileUrl: this.fileUrl,
          fileName: this.fileName,
          status: "pending",
        }
        this.updateBill(bill)
        this.onNavigate(ROUTES_PATH["Bills"])
      })
      .catch((error) => {
        this.onNavigate(ROUTES_PATH["NewBill"])
        console.error(error)
      })
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"])
        })
        .catch((error) => {
          this.onNavigate(ROUTES_PATH["NewBill"])
          console.error(error)
        })
    }
  }
}
