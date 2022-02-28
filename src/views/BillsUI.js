import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"
import { formatDate, formatStatus } from "../app/format.js"

import Actions from './Actions.js'

const row = (bill) => {
  bill
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td data-testid="date">${bill.date}</td>
      <td>${bill.amount} €</td>
      <td data-testid="status">${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

const rows = (data) => {
  if (data && data.length) {
    const regex = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
    const dataDateNotCorrupt = [...data].filter(e => e.date !== null && e.date.match(regex))
    
    const bills = dataDateNotCorrupt
      // Sort bills by date before format
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      // For each bill, the date format and the status format are change
      .concat([...data].filter(e => e.date === null || e.date.match(regex) === null))
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
    return bills.map(bill => row(bill)).join("")

  } else {
    return ""
  }
}

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" data-testid="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}